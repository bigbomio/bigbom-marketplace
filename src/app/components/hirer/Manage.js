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

import Jobs from '../../_services/jobData';

const ipfs = abiConfig.getIpfs();

const categories = settingsApi.getCategories();

// {
//     id: 'wwkrjhfs',
//     title: 'Design some banner ad',
//     description:
//         'New member will create their account by filling the basic details like – Name, Email, Mobile, Password, City, State and Country. After the account creation there will be 2 more form to fill up. Any ID proof can be uploaded for verification also. Those form will have optional fields like bank details, personal details, business details, relatives detail any kind of details. Members will be able to view and modify their details. Member can pay online for joining the community or pay later. He will be able to buy advertisement space on website for their business display. Member will be able to share their question answers on website and also able to share the pictures. He will be able give feedback on topics. Members can also see the details in the website which is only eligible for members. Every Member will have their Unique ID. Members will be able to upload the images through the mobile as well.',
//     budget: {
//         min_sum: '5000',
//         max_sum: '10000',
//     },
//     bid: [
//         {
//             address: '0xb10ca39DFa4903AE057E8C26E39377cfb4989551',
//             award: 1000,
//             time: '10 days',
//             accepted: false,
//         },
//         {
//             address: '0x6D02c7ac101F4e909A233d149022fb85e4939a68',
//             award: 500,
//             time: '10 days',
//             accepted: false,
//         },
//         {
//             address: '0x6D02c7ac101F4e909A233d1549022fbb5e4939a68',
//             award: 520,
//             time: '20 days',
//             accepted: false,
//         },
//         {
//             address: '0x6D02c7ac201F4e909A233d149022fbb5e4939a68',
//             award: 520,
//             time: '20 days',
//             accepted: false,
//         },
//     ],
//     currency: 'USD',
//     status: {
//         started: false,
//         canceled: false,
//         completed: false,
//         claimed: false,
//         expired: false,
//     },
//     category: ['banner', 'design', 'artist'],
// }

let jobs, bids, acceptedBids;

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
        this.setState({ isLoading: true });
        const _categories = await this.getCategories();
        await Utils.getPastEvents(web3, 'BBFreelancerJob', 'JobCreated', _categories, this.JobCreatedDataInit);
        await Utils.getPastEvents(web3, 'BBFreelancerBid', 'BidAccepted', _categories, this.BidAcceptedDataInit);
        await Utils.getPastEvents(web3, 'BBFreelancerBid', 'BidCreated', _categories, this.BidCreatedDataInit);
        if (jobs) {
            let _jobs = this.JobInfoInit();
            this.AllJobDataMap(_jobs, bids);
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

    // map job detail info from IPFS
    JobInfoInit = () => {
        const { web3 } = this.props;
        return jobs.map(job => {
            const jobHash = web3.toAscii(job.id);
            console.log('jobHash: ', jobHash);
            ipfs.catJSON(jobHash, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
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
            });
            return job;
        });
    };

    // map all data
    AllJobDataMap = (_jobs, _bids) => {
        for (let job of _jobs) {
            job.bid = [];
            for (let bid of _bids) {
                if (bid.id === job.id) {
                    job.bid.push(bid);
                }
            }
        }
        this.setState({ jobs: _jobs, isLoading: false });
    };

    // receive jobs list from JobCreated
    JobCreatedDataInit = async jobEvents => {
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
    };

    // receive bids list from BidCreated and map with acceptedBids
    BidCreatedDataInit = async jobEvents => {
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
            if (acceptedBids.length > 0) {
                for (let bid of acceptedBids) {
                    if (bid.jobHash === jobEvent.args.jobHash && jobEvent.args.owner === bid.address) {
                        bidTpl.accepted = true;
                    }
                }
            }
            bids.push(bidTpl);
        }
    };

    // receive accepted bids list from BidAccepted
    BidAcceptedDataInit = async jobEvents => {
        acceptedBids = [];
        for (let jobEvent of jobEvents.data) {
            const bidTpl = {
                address: jobEvent.args.freelancer,
                jobHash: jobEvent.args.jobHash,
            };
            acceptedBids.push(bidTpl);
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

    render() {
        const { match } = this.props;
        const { selectedCategory, status, open, isLoading, jobs } = this.state;
        const categories = settingsApi.getCategories();
        console.log(jobs);
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

                                {Jobs.length && (
                                    <Grid container className="list-body">
                                        {Jobs.map(job => {
                                            return (
                                                <Grid key={job.id} container className="list-body-row">
                                                    <Grid item xs={5} className="title">
                                                        <Link to={`${match.url}/${job.id}`}>{job.title}</Link>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <span className="bold">
                                                            {job.budget.min_sum} - {job.budget.max_sum}
                                                            {' ( ' + job.currency + ' ) '}
                                                        </span>
                                                    </Grid>
                                                    <Grid item xs={1}>
                                                        {job.bid.length}
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        {Utils.getStatusJobOpen(job.bid)
                                                            ? 'Bidding'
                                                            : Utils.getStatusJob(job.status)}
                                                    </Grid>
                                                    <Grid item xs={2} className="action">
                                                        <ButtonBase
                                                            aria-label="Cancel"
                                                            className="btn btn-small btn-red"
                                                        >
                                                            <FontAwesomeIcon icon="minus-circle" />
                                                            Cancel
                                                        </ButtonBase>
                                                    </Grid>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
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
