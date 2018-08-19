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

let jobs = [];

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
                started: false, // ???
                completed: false, // ???
                claimed: false, // ???
                canceled: jobStatusLog[3],
                status: jobStatusLog[4].toString(), // ==> ??????
                accepted: jobStatusLog[5] !== '0x0000000000000000000000000000000000000000' ? true : false,
                expired: Number(jobStatusLog[1].toString()) <= Math.floor(Date.now() / 1000) ? true : false,
            };
            ipfs.catJSON(jobHash, (err, data) => {
                const jobTpl = {
                    id: event.args.jobHash,
                    jobHash: jobHash,
                    category: event.args.category,
                    expired: event.args.expired.toString(),
                    transactionHash: event.transactionHash,
                    status: jobStatus,
                    bid: [],
                };
                if (err) {
                    console.log(err);
                    jobTpl.err = 'Can not fetch data from server';
                } else {
                    jobTpl.title = data.title;
                    jobTpl.description = data.description;
                    jobTpl.currency = data.currency;
                    jobTpl.budget = data.budget;
                }
                this.BidCreatedInit(jobTpl);
            });
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
        console.log(jobs);
    };

    jobsFilter(filterData, filterBy) {
        let jobsFilter = [];
        if (filterBy === 'category') {
            if (filterData) {
                if (filterData.length > 0) {
                    for (let category of filterData) {
                        const jobsFilterSelected = jobs.filter(job => job.category === category.value);
                        jobsFilter = [...jobsFilter, ...jobsFilterSelected];
                        this.setState({ Jobs: jobsFilter });
                    }
                } else {
                    this.setState({ Jobs: jobs });
                }
            }
        }
    }

    createAction = () => {
        const { history } = this.props;
        history.push('/hirer');
    };

    handleChange = name => event => {
        this.setState({ [name]: event.target.checked });
    };

    handleChangeCategory = selectedOption => {
        this.setState({ selectedCategory: selectedOption });
        this.jobsFilter(selectedOption, 'category');
    };

    jobsRender = () => {
        const { match, web3 } = this.props;
        const { Jobs } = this.state;

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
                        <div className="top-actions">
                            <ButtonBase className="btn btn-normal btn-green" onClick={this.getJobs}>
                                <FontAwesomeIcon icon="sync-alt" />
                                Refresh
                            </ButtonBase>
                        </div>
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
