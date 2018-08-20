import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
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
            open: false,
            Jobs: [],
        };
    }

    componentDidMount() {
        const { isConnected } = this.props;
        if (isConnected) {
            this.getJobs();
        }
    }

    getJobs = async () => {
        const { web3 } = this.props;
        const _categories = await this.getCategories();
        this.setState({ isLoading: true, Jobs: [] });
        jobs = [];
        abiConfig.getPastSingleEvent(web3, 'BBFreelancerJob', 'JobCreated', _categories, this.JobCreatedInit);
    };

    // get all categories
    async getCategories() {
        let allCategories = [];
        for (let category of categories) {
            allCategories.push(category.value);
        }
        return allCategories;
    }

    JobCreatedInit = async eventLog => {
        const { web3 } = this.props;
        const event = eventLog.data;
        const jobHash = web3.toAscii(event.args.jobHash);
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
                claimed: Number(jobStatusLog[4].toString()) === 5, // ???
                reject: Number(jobStatusLog[4].toString()) === 4,
                acceptedPayment: Number(jobStatusLog[4].toString()) === 9,
                canceled: jobStatusLog[3],
                bidAccepted: jobStatusLog[5] !== '0x0000000000000000000000000000000000000000' ? true : false,
                bidding: jobStatusLog[5] !== '0x0000000000000000000000000000000000000000' ? false : true,
                expired: Number(jobStatusLog[1].toString()) <= Math.floor(Date.now() / 1000) ? true : false,
            };
            // get detail from ipfs
            const URl = abiConfig.getIpfsLink() + jobHash;
            const jobTpl = {
                id: event.args.jobHash,
                jobHash: jobHash,
                category: event.args.category,
                expired: event.args.expired.toString(),
                transactionHash: event.transactionHash,
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
        const _categories = await this.getCategories();
        abiConfig.getPastEventsMerge(web3, 'BBFreelancerBid', 'BidCreated', _categories, job, this.BidAcceptedInit);
    };

    BidAcceptedInit = async jobData => {
        const { web3 } = this.props;
        const _categories = await this.getCategories();
        abiConfig.getPastEventsBidAccepted(
            web3,
            'BBFreelancerBid',
            'BidAccepted',
            _categories,
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
        const { match, web3 } = this.props;
        const { Jobs } = this.state;
        console.log(Jobs);
        if (Jobs) {
            return (
                <Grid container className="list-body">
                    {Jobs.map(job => {
                        return !job.err ? (
                            <Grid key={job.id} container className="list-body-row">
                                <Grid item xs={5} className="title">
                                    <Link to={`${match.url}/${web3.toAscii(job.id)}`}>{job.title}</Link>
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
                                <Grid item xs={2} className="action">
                                    <ButtonBase aria-label="Cancel" className="btn btn-small btn-red">
                                        <FontAwesomeIcon icon="minus-circle" />
                                        Cancel
                                    </ButtonBase>
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid key={job.id} container className="list-body-row">
                                <Grid item xs={5} className="title">
                                    <span className="err">{web3.toAscii(job.id)}</span>
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
                                <Grid item xs={2} className="action">
                                    ---
                                </Grid>
                            </Grid>
                        );
                    })}
                </Grid>
            );
        } else {
            return null;
        }
    };

    render() {
        const { selectedCategory, status, open, isLoading } = this.state;
        const categories = settingsApi.getCategories();
        return (
            <div id="hirer" className="container-wrp">
                <Dialog
                    open={open}
                    onClose={this.handleClose}
                    maxWidth="sm"
                    fullWidth
                    className="dialog"
                    disableBackdropClick
                    disableEscapeKeyDown
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Create New Job:</DialogTitle>
                    <DialogContent>
                        {isLoading ? (
                            <div className="loading">
                                <CircularProgress size={50} color="secondary" />
                                <span>Waiting...</span>
                            </div>
                        ) : (
                            <div className="alert-dialog-description">
                                {status && (
                                    <div className="dialog-result">
                                        {status.err ? (
                                            <div className="err">{status.text}</div>
                                        ) : (
                                            <div className="success">
                                                {status.text}
                                                <p>success</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        {!isLoading && (
                            <ButtonBase onClick={this.handleClose} className="btn btn-normal btn-default">
                                Close
                            </ButtonBase>
                        )}
                    </DialogActions>
                </Dialog>
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
                                        <Grid item xs={5}>
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
                                        <Grid item xs={2}>
                                            Action
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
