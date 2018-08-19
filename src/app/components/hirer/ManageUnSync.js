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

const ipfs = abiConfig.getIpfs();

const categories = settingsApi.getCategories();

let jobs, bids, acceptedBids, watchDataID;

class HirerDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedStarted: true,
            checkedCompleted: true,
            checkedBidding: true,
            checkedExpired: false,
            isLoading: false,
            open: false,
            Jobs: [],
        };
    }

    componentDidMount() {
        const { isConnected } = this.props;
        this.resetData();
        if (isConnected) {
            this.getJobs(null, 0);
        }
    }

    getJobs = async (jobEvents, step) => {
        console.log('---------getJobs: ', step);
        const { web3 } = this.props;
        const _categories = await this.getCategories();
        if (step === 0) {
            this.setState({ isLoading: true });
            Utils.getPastEvents(web3, 'BBFreelancerJob', 'JobCreated', _categories, this.getJobs, 1);
        } else if (step === 1) {
            this.JobsDataInit(jobEvents, step);
            Utils.getPastEvents(web3, 'BBFreelancerBid', 'BidAccepted', _categories, this.getJobs, 2);
        } else if (step === 2) {
            this.JobsDataInit(jobEvents, step);
            Utils.getPastEvents(web3, 'BBFreelancerBid', 'BidCreated', _categories, this.getJobs, 3);
        } else if (step === 3) {
            this.JobsDataInit(jobEvents, step);
        } else if (step === 4) {
            const _jobs = await this.JobInfoInit();
            const jobData = await this.AllJobDataMap(_jobs, bids);
            watchDataID = setInterval(() => {
                this.watchData(jobData);
            }, 300);
        }
    };

    // get all categories
    async getCategories() {
        let allCategories = [];
        for (let category of categories) {
            allCategories.push(category.value);
        }
        return allCategories;
    }

    getDataIPFS = async job => {
        const { web3 } = this.props;
        const jobHash = web3.toAscii(job.id);
        await ipfs.catJSON(jobHash, (err, data) => {
            if (err) {
                console.log(err);
                job.err = 'Can not fetch data from server';
            } else {
                job.title = data.title;
                job.description = data.description;
                job.currency = data.currency;
                job.budget = data.budget;
                job.status = {
                    started: false,
                    canceled: false,
                    completed: false,
                    claimed: false,
                    expired: false,
                };
            }
        });
    };

    resetData() {
        jobs = null;
        bids = null;
        acceptedBids = null;
        watchDataID = null;
        this.setState({ Jobs: null });
    }

    // check data init
    watchData = _jobData => {
        const len = _jobData.length - 1;
        for (let i in _jobData) {
            if (Number(i) === Number(len)) {
                if (!_jobData[i].err) {
                    if (_jobData[i].budget) {
                        this.setState({ Jobs: _jobData, isLoading: false });
                        clearInterval(watchDataID);
                    }
                } else {
                    this.setState({ Jobs: _jobData, isLoading: false });
                    clearInterval(watchDataID);
                }
            }
        }
    };

    // map job detail info from IPFS
    JobInfoInit = async () => {
        jobs.map(async job => {
            Utils.callMethodWithReject(this.getDataIPFS)(job);
            return job;
        });
        return jobs;
    };

    // map all data
    AllJobDataMap = (_jobs, _bids) => {
        for (let job of _jobs) {
            if (!job.err) {
                job.bid = [];
                if (_bids.length > 0) {
                    for (let bid of _bids) {
                        if (bid.id === job.id) {
                            job.bid.push(bid);
                        }
                    }
                }
            }
        }
        return _jobs;
    };

    JobsDataInit = (jobEvents, step) => {
        if (step === 1) {
            // receive jobs list from JobCreated
            jobs = [];
            for (let jobEvent of jobEvents.data) {
                const jobTpl = {
                    id: jobEvent.args.jobHash,
                    category: jobEvent.args.category,
                    expired: jobEvent.args.expired.toString(),
                    transactionHash: jobEvent.transactionHash,
                };
                jobs.push(jobTpl);
            }
        } else if (step === 2) {
            // receive accepted bids list from BidAccepted
            acceptedBids = [];
            for (let jobEvent of jobEvents.data) {
                const bidTpl = {
                    address: jobEvent.args.freelancer,
                    jobHash: jobEvent.args.jobHash,
                };
                acceptedBids.push(bidTpl);
            }
        } else if (step === 3) {
            // receive bids list from BidCreated and map with acceptedBids
            const { web3 } = this.props;
            bids = [];
            for (let jobEvent of jobEvents.data) {
                const bidTpl = {
                    address: jobEvent.args.owner,
                    award: web3.fromWei(jobEvent.args.bid.toString(), 'ether'),
                    created: jobEvent.args.created.toString(),
                    id: jobEvent.args.jobHash,
                    accepted: false,
                };
                if (acceptedBids) {
                    if (acceptedBids.length > 0) {
                        for (let bid of acceptedBids) {
                            if (bid.jobHash === jobEvent.args.jobHash && jobEvent.args.owner === bid.address) {
                                bidTpl.accepted = true;
                            }
                        }
                    }
                }
                bids.push(bidTpl);
            }
            this.getJobs(null, 4);
        }
    };

    createAction = () => {
        const { history } = this.props;
        history.push('/hirer');
    };

    handleChange = name => event => {
        this.setState({ [name]: event.target.checked });
    };

    handleChangeCategory = selectedOption => {
        this.setState({ selectedCategory: selectedOption });
    };

    jobsRender = () => {
        const { match, web3 } = this.props;
        const { Jobs } = this.state;

        if (Jobs) {
            return (
                <Grid container className="list-body">
                    {Jobs.map(job => {
                        //console.log(job.status);
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
                                    {Utils.getStatusJobOpen(job.bid) ? 'Bidding' : Utils.getStatusJob(job.status)}
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
                        {!isLoading ? (
                            <Grid container className="single-body">
                                <fieldset className="list-filter">
                                    <legend>Filter:</legend>
                                    <Grid container className="list-filter-body">
                                        <Grid item xs={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.checkedStarted}
                                                        onChange={this.handleChange('checkedStarted')}
                                                        value="checkedStarted"
                                                    />
                                                }
                                                label="Started"
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.checkedCompleted}
                                                        onChange={this.handleChange('checkedCompleted')}
                                                        value="checkedCompleted"
                                                    />
                                                }
                                                label="Completed"
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.checkedBidding}
                                                        onChange={this.handleChange('checkedBidding')}
                                                        value="checkedBidding"
                                                    />
                                                }
                                                label="Bidding"
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.checkedExpired}
                                                        onChange={this.handleChange('checkedExpired')}
                                                        value="checkedExpired"
                                                    />
                                                }
                                                label="Expired"
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Select
                                                value={selectedCategory}
                                                onChange={this.handleChangeCategory}
                                                options={categories}
                                                isMulti
                                                placeholder="Select category..."
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
