import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Select from 'react-select';

import Utils from '../../_utils/utils';
import configs from '../../_services/configs';
import abiConfig, { fromBlock } from '../../_services/abiConfig';
import services from '../../_services/services';

import { setReload } from '../../actions/commonActions';
import { saveJobs } from '../../actions/clientActions';
import contractApis from '../../_services/contractApis';

const categories = configs.getCategories();

let jobs = [];

class YourBids extends Component {
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
                this.mounted = true;
            }
            this.checkMetamaskID = setInterval(() => {
                this.checkAccount();
            }, 1000);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        clearInterval(this.checkMetamaskID);
    }

    getJobs = async () => {
        this.setState({ isLoading: true, Jobs: [] });
        jobs = [];
        const events = await contractApis.getPastSingleEvent('BBFreelancerJob', 'JobCreated', {});
        if (events.length > 0) {
            for (let event of events) {
                this.JobCreatedInit(event);
            }
        }
        // time out 20s
        setTimeout(() => {
            if (jobs.length <= 0) {
                this.setState({ isLoading: false });
                return;
            }
        }, 15000);
    };

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
        if (!eventLog) {
            this.setState({ stt: { err: true, text: 'You have no any bid!' }, isLoading: false });
            return;
        }
        const jobHash = Utils.toAscii(eventLog.args.jobHash);
        const jobID = eventLog.args.jobID.toString();
        // get job status
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const bidInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerBid');
        const filter = { jobID, owner: web3.eth.defaultAccount };
        bidInstance.instance.BidCreated(
            filter,
            {
                fromBlock, // should use recent number
                toBlock: 'latest',
            },
            async (error, eventResult) => {
                if (eventResult) {
                    const [err, jobStatusLog] = await Utils.callMethod(jobInstance.instance.getJob)(jobID, {
                        from: jobInstance.defaultAccount,
                        gasPrice: +jobInstance.gasPrice.toString(10),
                    });
                    if (err) {
                        return console.log(err);
                    } else {
                        const jobStatus = Utils.getStatus(jobStatusLog);
                        // get detail from ipfs
                        const URl = abiConfig.getIpfsLink() + jobHash;
                        const employerInfo = await services.getUserByWallet(eventLog.args.owner);
                        let employer = {
                            fullName: eventLog.args.owner,
                            walletAddress: eventLog.args.owner,
                            email: '',
                        };
                        if (employerInfo !== undefined) {
                            employer = {
                                fullName: employerInfo.userInfo.firstName
                                    ? employerInfo.userInfo.firstName + ' '
                                    : 'N/A' + employerInfo.userInfo.lastName
                                    ? employerInfo.userInfo.lastName
                                    : null,
                                walletAddress: eventLog.args.owner,
                                email: employerInfo.userInfo.email,
                            };
                        }
                        const jobTpl = {
                            jobID,
                            id: eventLog.args.jobHash,
                            owner: eventLog.args.owner,
                            ownerInfo: employer,
                            jobHash: jobHash,
                            category: Utils.toAscii(eventLog.args.category),
                            expired: eventLog.args.expired.toString(),
                            status: jobStatus,
                            jobBlockNumber: eventLog.blockNumber,
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
                                    jobTpl.estimatedTime = result.estimatedTime;
                                    jobTpl.expiredTime = result.expiredTime;
                                    jobTpl.created = result.created;
                                    this.BidCreatedInit(jobTpl);
                                },
                                error => {
                                    console.log(error);
                                    jobTpl.err = 'Can not fetch data from server';
                                    this.BidCreatedInit(jobTpl);
                                }
                            );
                    }
                }
            }
        );
    };

    checkAccount = () => {
        const { reload, setReload } = this.props;
        const { isLoading } = this.state;
        if (!isLoading) {
            if (reload) {
                this.getJobs();
                setReload(false);
            }
        }
    };

    BidCreatedInit = async job => {
        const { web3 } = this.props;
        const jobsMergedBid = await contractApis.mergeBidToJob(
            'BBFreelancerBid',
            'BidCreated',
            { jobID: job.jobID, owner: web3.eth.defaultAccount },
            job
        );
        this.BidAcceptedInit(jobsMergedBid);
    };

    BidAcceptedInit = async jobData => {
        const bidAcceptedData = await contractApis.getBidAccepted({ jobID: jobData.data.jobID }, jobData.data);
        this.JobsInit(bidAcceptedData);
    };

    JobsInit = jobData => {
        const { web3, saveJobs } = this.props;
        for (let freelancer of jobData.data.bid) {
            if (freelancer.address === web3.eth.defaultAccount) {
                jobs.push(jobData.data);
            }
        }
        const uqJobs = Utils.removeDuplicates(jobs, 'id'); // fix duplicate data
        if (this.mounted) {
            saveJobs(uqJobs);
            this.setState({ Jobs: uqJobs, isLoading: false });
        }
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
            this.setState({ Jobs: jobFilterData });
        }
    }

    createAction = () => {
        const { history } = this.props;
        history.push('/client');
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
        const { Jobs, stt } = this.state;
        if (Jobs.length > 0) {
            return !stt.err ? (
                <Grid container className="list-body">
                    {Jobs.map(job => {
                        return !job.err ? (
                            <Grid key={job.id} container className="list-body-row">
                                <Grid item xs={7} className="title">
                                    <Link to={`jobs/${job.jobID}`}>{job.title}</Link>
                                </Grid>
                                <Grid item xs={2}>
                                    {job.budget && (
                                        <span className="bold">
                                            {Utils.currencyFormat(job.budget.max_sum)}
                                            {' ( ' + job.currency.label + ' ) '}
                                        </span>
                                    )}
                                </Grid>
                                <Grid item xs={1}>
                                    {job.bid.length}
                                </Grid>
                                <Grid item xs={2} className="status">
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
            return (
                <Grid container className="no-data">
                    You have no any bid!
                </Grid>
            );
        }
    };

    render() {
        const { selectedCategory, isLoading } = this.state;
        return (
            <div className="container-wrp">
                <div className="container-wrp full-top-wrp">
                    <div className="container wrapper">
                        <Grid container className="main-intro">
                            <Grid item xs={8}>
                                <h1>Your bids</h1>
                            </Grid>
                            <Grid item xs={4} className="main-intro-right">
                                <ButtonBase onClick={this.createAction} className="btn btn-normal btn-white btn-create">
                                    <i className="fas fa-plus" /> Create A New Job
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
                                    <i className="fas fa-sync-alt" />
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
                                                label="In Progress"
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

YourBids.propTypes = {
    history: PropTypes.object.isRequired,
    web3: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
    saveJobs: PropTypes.func.isRequired,
    reload: PropTypes.bool.isRequired,
    setReload: PropTypes.func.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.HomeReducer.web3,
        reload: state.CommonReducer.reload,
        isConnected: state.HomeReducer.isConnected,
    };
};

const mapDispatchToProps = { saveJobs, setReload };

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(YourBids);
