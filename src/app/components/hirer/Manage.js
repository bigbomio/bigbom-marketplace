import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Select from 'react-select';

import Utils from '../../_utils/utils';
import settingsApi from '../../_services/settingsApi';
import abiConfig from '../../_services/abiConfig';

const categories = settingsApi.getCategories();

let jobs = [];

class HirerDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterStatus: {
                started: false,
                completed: false,
                bidAccepted: false,
                expired: false,
                bidding: false,
            },
            all: true,
            allDisabled: true,
            isLoading: false,
            Jobs: [],
            stt: { err: false, text: null },
        };
    }

    componentDidMount() {
        const { isConnected } = this.props;
        const { isLoading } = this.state;
        if (isConnected) {
            if (!isLoading) {
                this.getJobs();
            }
        }
    }

    getJobs = async () => {
        const { web3 } = this.props;
        this.setState({ isLoading: true, Jobs: [] });
        jobs = [];
        abiConfig.getPastSingleEvent(
            web3,
            'BBFreelancerJob',
            'JobCreated',
            { owner: web3.eth.defaultAccount },
            this.JobCreatedInit
        );
    };

    // get all categories
    async getCategories() {
        let allCategories = [];
        for (let category of categories) {
            allCategories.push(category.value);
        }
        return allCategories;
    }

    getBiddingStt(stts) {
        if (stts[3]) {
            return false;
        } else if (Number(stts[1].toString()) <= Math.floor(Date.now() / 1000) ? true : false) {
            return false;
        } else if (stts[5] !== '0x0000000000000000000000000000000000000000') {
            return false;
        }
        return true;
    }

    JobCreatedInit = async eventLog => {
        const { web3 } = this.props;
        const event = eventLog.data;
        if (!eventLog.data) {
            this.setState({ stt: { err: true, text: 'You have no any job!' }, isLoading: false });
            return;
        }
        const jobHash = Utils.toAscii(event.args.jobHash);
        // get job status
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const [err, jobStatusLog] = await Utils.callMethod(jobInstance.instance.getJob)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            return console.log(err);
        } else {
            // [owner, expired, budget, cancel, status, freelancer]
            const jobStatus = {
                started: Number(jobStatusLog[4].toString()) === 1,
                completed: Number(jobStatusLog[4].toString()) === 2,
                claimed: Number(jobStatusLog[4].toString()) === 5,
                reject: Number(jobStatusLog[4].toString()) === 4,
                acceptedPayment: Number(jobStatusLog[4].toString()) === 9,
                canceled: jobStatusLog[3],
                bidAccepted: jobStatusLog[5] !== '0x0000000000000000000000000000000000000000',
                bidding: this.getBiddingStt(jobStatusLog),
                expired: Number(jobStatusLog[1].toString()) <= Math.floor(Date.now() / 1000) ? true : false,
            };
            // get detail from ipfs
            const URl = abiConfig.getIpfsLink() + jobHash;
            const jobTpl = {
                id: event.args.jobHash,
                owner: event.args.owner,
                jobHash: jobHash,
                category: Utils.toAscii(event.args.category),
                expired: event.args.expired.toString(),
                status: jobStatus,
                bid: [],
            };
            fetch(URl)
                .then(res => res.json())
                .then(
                    result => {
                        jobTpl.title = result.title;
                        jobTpl.skills = result.skills;
                        jobTpl.description = result.description;
                        jobTpl.currency = result.currency;
                        jobTpl.budget = result.budget;
                        this.BidCreatedInit(jobTpl);
                    },
                    error => {
                        console.log(error);
                        jobTpl.err = 'Can not fetch data from server';
                        this.BidCreatedInit(jobTpl);
                    }
                );
        }
    };

    BidCreatedInit = async job => {
        const { web3 } = this.props;
        abiConfig.getPastEventsMerge(
            web3,
            'BBFreelancerBid',
            'BidCreated',
            { jobHash: web3.sha3(job.jobHash) },
            job,
            this.BidAcceptedInit
        );
    };

    BidAcceptedInit = async jobData => {
        const { web3 } = this.props;
        abiConfig.getPastEventsBidAccepted(
            web3,
            'BBFreelancerBid',
            'BidAccepted',
            { jobHash: web3.sha3(jobData.data.jobHash) },
            jobData.data,
            this.JobsInit
        );
    };

    JobsInit = jobData => {
        jobs.push(jobData.data);
        this.setState({ Jobs: jobs, isLoading: false });
    };

    unCheckAll(filterStatus) {
        for (let stt of Object.values(filterStatus)) {
            if (stt) {
                return false;
            }
        }
        return true;
    }

    jobsFilterByCategory(filterData) {
        let jobsFilter = [];
        const { filterStatus } = this.state;
        if (filterData) {
            if (filterData.length > 0) {
                for (let category of filterData) {
                    const jobsFilterSelected = jobs.filter(job => job.category === category.value);
                    jobsFilter = [...jobsFilter, ...jobsFilterSelected];
                    this.setState({ Jobs: jobsFilter, jobsFiltered: jobsFilter });
                }
            } else {
                this.setState({ Jobs: jobs, jobsFiltered: jobs });
            }
        }
        setTimeout(() => {
            if (!this.unCheckAll(filterStatus)) {
                this.jobsFilterByStatus(false);
            } else {
                this.jobsFilterByStatus(true);
            }
        }, 200);
    }

    jobsFilterByStatus(allCheck) {
        let jobsFilter = [];
        const { filterStatus, jobsFiltered } = this.state;
        let jobFilterData = jobs;
        if (jobsFiltered) {
            jobFilterData = jobsFiltered;
        }
        if (!allCheck) {
            if (!this.unCheckAll(filterStatus)) {
                Object.entries(filterStatus).forEach(([key, value]) => {
                    if (value) {
                        const jobsFilterSelected = jobFilterData.filter(job => job.status[key] === true);
                        jobsFilter = [...jobsFilter, ...jobsFilterSelected];
                        this.setState({ Jobs: jobsFilter, allDisabled: false });
                    }
                });
            } else {
                this.setState({ Jobs: jobFilterData, all: true, allDisabled: true });
            }
        } else {
            this.setState({ Jobs: jobsFiltered });
        }
    }

    createAction = () => {
        const { history } = this.props;
        history.push('/hirer');
    };

    handleChange = name => event => {
        const { filterStatus } = this.state;
        filterStatus[name] = event.target.checked;
        this.setState({ filterStatus: filterStatus, all: false });
        this.jobsFilterByStatus(false);
    };

    handleChangeAll = name => event => {
        const { filterStatus } = this.state;
        Object.entries(filterStatus).forEach(([key]) => {
            filterStatus[key] = false;
        });
        this.setState({ filterStatus: filterStatus, [name]: event.target.checked, allDisabled: true });
        this.jobsFilterByStatus(true);
    };

    handleChangeCategory = selectedOption => {
        this.setState({ selectedCategory: selectedOption });
        this.jobsFilterByCategory(selectedOption);
    };

    jobsRender = () => {
        const { match } = this.props;
        const { Jobs, stt } = this.state;
        console.log(Jobs);
        if (Jobs) {
            return !stt.err ? (
                <Grid container className="list-body">
                    {Jobs.map(job => {
                        return !job.err ? (
                            <Grid key={job.id} container className="list-body-row">
                                <Grid item xs={7} className="title">
                                    <Link to={`${match.url}/${Utils.toAscii(job.id)}`}>{job.title}</Link>
                                </Grid>
                                <Grid item xs={2}>
                                    {job.budget && (
                                        <span className="bold">
                                            {job.budget.min_sum}
                                            {' ( ' + job.currency.label + ' ) '}
                                        </span>
                                    )}
                                </Grid>
                                <Grid item xs={1}>
                                    {job.bid.length}
                                </Grid>
                                <Grid item xs={2}>
                                    {Utils.getStatusJob(job.status)}
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid key={job.id} container className="list-body-row">
                                <Grid item xs={7} className="title">
                                    <span className="err">{Utils.toAscii(job.id)}</span>
                                </Grid>
                                <Grid item xs={2}>
                                    ---
                                </Grid>
                                <Grid item xs={1}>
                                    ---
                                </Grid>
                                <Grid item xs={2}>
                                    ---
                                </Grid>
                            </Grid>
                        );
                    })}
                </Grid>
            ) : (
                <Grid container className="no-data">
                    {stt.text}
                </Grid>
            );
        } else {
            return null;
        }
    };

    render() {
        const { selectedCategory, isLoading } = this.state;
        return (
            <div id="hirer" className="container-wrp">
                <div className="container-wrp full-top-wrp">
                    <div className="container wrapper">
                        <Grid container className="main-intro">
                            <Grid item xs={8}>
                                <h1>Your Jobs</h1>
                            </Grid>
                            <Grid item xs={4} className="main-intro-right">
                                <ButtonBase onClick={this.createAction} className="btn btn-normal btn-white btn-create">
                                    <FontAwesomeIcon icon="plus" /> Create A New Job
                                </ButtonBase>
                            </Grid>
                        </Grid>
                    </div>
                </div>
                <div className="container-wrp main-ct">
                    <div className="container wrapper">
                        <Grid className="top-actions">
                            <Grid className="action">
                                <ButtonBase className="btn btn-normal btn-green" onClick={this.getJobs}>
                                    <FontAwesomeIcon icon="sync-alt" />
                                    Refresh
                                </ButtonBase>
                            </Grid>
                            <Grid className="action filter">
                                <Select
                                    value={selectedCategory}
                                    onChange={this.handleChangeCategory}
                                    options={categories}
                                    isMulti
                                    placeholder="Select category..."
                                />
                            </Grid>
                        </Grid>
                        {!isLoading ? (
                            <Grid container className="single-body">
                                <fieldset className="list-filter">
                                    <legend>Filter:</legend>
                                    <Grid container className="list-filter-body">
                                        <Grid item xs={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        disabled={this.state.allDisabled}
                                                        className={this.state.allDisabled ? 'allDisabled' : ''}
                                                        checked={this.state.all}
                                                        onChange={this.handleChangeAll('all')}
                                                        value="all"
                                                    />
                                                }
                                                label="All"
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.filterStatus.bidding}
                                                        onChange={this.handleChange('bidding')}
                                                        value="bidding"
                                                    />
                                                }
                                                label="Bidding"
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.filterStatus.started}
                                                        onChange={this.handleChange('started')}
                                                        value="started"
                                                    />
                                                }
                                                label="Started"
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.filterStatus.completed}
                                                        onChange={this.handleChange('completed')}
                                                        value="completed"
                                                    />
                                                }
                                                label="Completed"
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.filterStatus.bidAccepted}
                                                        onChange={this.handleChange('bidAccepted')}
                                                        value="bidAccepted"
                                                    />
                                                }
                                                label="Bid Accepted"
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.filterStatus.expired}
                                                        onChange={this.handleChange('expired')}
                                                        value="expired"
                                                    />
                                                }
                                                label="Expired"
                                            />
                                        </Grid>
                                    </Grid>
                                </fieldset>
                                <Grid container className="list-container">
                                    <Grid container className="list-header">
                                        <Grid item xs={7}>
                                            Job title
                                        </Grid>
                                        <Grid item xs={2}>
                                            Budget
                                        </Grid>
                                        <Grid item xs={1}>
                                            Bid
                                        </Grid>
                                        <Grid item xs={2}>
                                            Status
                                        </Grid>
                                    </Grid>
                                    {this.jobsRender()}
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid container className="single-body">
                                <div className="loading">
                                    <CircularProgress size={50} color="secondary" />
                                    <span>Loading...</span>
                                </div>
                            </Grid>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

HirerDashboard.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    web3: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
    };
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HirerDashboard);
