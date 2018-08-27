import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Fade from '@material-ui/core/Fade';

import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';

import Countdown from '../common/countdown';

let myAddress;

const avgBid = job => {
    const bids = job.bid;
    let total = 0;
    if (bids.length > 0) {
        for (let b of bids) {
            total += b.award;
        }
        if (!Number.isInteger(total / bids.length)) {
            return (total / bids.length).toFixed(2);
        }
        return total / bids.length;
    } else {
        return NaN;
    }
};

const skillShow = job => {
    const jobSkills = job.skills;
    return (
        <div className="skill">
            <span className="bold">Skill required</span>
            {jobSkills.map((skill, i) => {
                return (
                    <span className="tag" key={i}>
                        {skill.label}
                    </span>
                );
            })}
        </div>
    );
};

class JobDetailBid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bidAccepted: false,
            bidStt: false,
            stt: { err: false, text: null },
            isOwner: false,
            checkedBid: false,
            time: 0,
            award: 0,
            open: false,
        };
    }

    componentDidMount() {
        const { isConnected, web3 } = this.props;
        const { isLoading } = this.state;
        myAddress = web3.eth.defaultAccount;
        if (isConnected) {
            if (!isLoading) {
                this.jobDataInit();
            }
        }
    }

    getMyBid() {
        const { jobData } = this.state;
        if (jobData.bid.length > 0) {
            for (let freelancer of jobData.bid) {
                if (freelancer.address === myAddress) {
                    return (
                        <Grid item className="job-detail-col">
                            <div className="name">Your Bid ({jobData.currency.label})</div>
                            <div className="ct">${freelancer.award}</div>
                        </Grid>
                    );
                }
            }
        } else {
            return (
                <Grid item className="job-detail-col">
                    <div className="name">Your Bid ({jobData.currency.label})</div>
                    <div className="ct">$NaN</div>
                </Grid>
            );
        }
    }

    jobDataInit = async () => {
        const { match, web3 } = this.props;
        const jobHash = match.params.jobId;
        this.setState({ isLoading: true, jobHash: jobHash });
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
                paymentAccepted: Number(jobStatusLog[4].toString()) === 9,
                canceled: jobStatusLog[3],
                bidAccepted: jobStatusLog[5] !== '0x0000000000000000000000000000000000000000',
                bidding: jobStatusLog[5] === '0x0000000000000000000000000000000000000000',
                expired: Number(jobStatusLog[1].toString()) <= Math.floor(Date.now() / 1000) ? true : false,
            };
            // get detail from ipfs
            const URl = abiConfig.getIpfsLink() + jobHash;
            const jobTpl = {
                id: jobHash,
                owner: jobStatusLog[0],
                jobHash: jobHash,
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
                        jobTpl.category = result.category;
                        jobTpl.estimatedTime = result.estimatedTime;
                        jobTpl.expiredTime = result.expiredTime;
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
        abiConfig.getPastEventsMerge(web3, 'BBFreelancerBid', 'BidCreated', { jobHash: web3.sha3(job.jobHash) }, job, this.BidAcceptedInit);
    };

    BidAcceptedInit = async jobData => {
        const { web3 } = this.props;
        abiConfig.getPastEventsBidAccepted(web3, 'BBFreelancerBid', 'BidAccepted', { jobHash: jobData.jobHash }, jobData.data, this.JobsInit);
    };

    JobsInit = jobData => {
        const { web3 } = this.props;
        let bidStt = false;
        for (let freelancer of jobData.data.bid) {
            if (freelancer.address === myAddress) {
                bidStt = true;
            }
        }
        this.setState({
            bidAccepted: jobData.data.status.bidAccepted,
            jobData: jobData.data,
            bidStt,
            isOwner: web3.eth.defaultAccount === jobData.data.owner,
            isLoading: false,
        });
    };

    bidSwitched = open => {
        this.setState({ checkedBid: open });
    };

    actions() {
        const { bidAccepted, bidStt, isOwner, checkedBid, bidDone } = this.state;
        if (!bidAccepted) {
            if (bidStt) {
                return (
                    <span className="note">
                        <FontAwesomeIcon icon="check-circle" /> <span className="bold">You have bid this job</span>, please waiting acceptance from
                        job owner.
                    </span>
                );
            } else {
                if (isOwner) {
                    return null;
                } else {
                    return (
                        <ButtonBase
                            className="btn btn-normal btn-green btn-back btn-bid"
                            onClick={() => this.bidSwitched(true)}
                            aria-label="Collapse"
                            checked={checkedBid}
                            disabled={bidDone}
                        >
                            Bid On This Job
                        </ButtonBase>
                    );
                }
            }
        } else {
            return (
                <span>
                    <ButtonBase className="btn btn-normal btn-red btn-back btn-bid">Cancel</ButtonBase>
                    <ButtonBase className="btn btn-normal btn-blue btn-back btn-bid">Complete</ButtonBase>
                    <ButtonBase className="btn btn-normal btn-green btn-back btn-bid">Start Job</ButtonBase>
                    <ButtonBase className="btn btn-normal btn-orange btn-back btn-bid">Claim Payment</ButtonBase>
                </span>
            );
        }
    }

    dialog = () => {
        const { bidLoading, open, stt } = this.state;
        return (
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
                <DialogTitle id="alert-dialog-title">Bid job:</DialogTitle>
                <DialogContent>
                    {bidLoading ? (
                        <div className="loading">
                            <CircularProgress size={50} color="secondary" />
                            <span>Waiting...</span>
                        </div>
                    ) : (
                        <div className="alert-dialog-description">
                            {stt && (
                                <div className="dialog-result">
                                    {stt.err ? (
                                        <div className="err">{stt.text}</div>
                                    ) : (
                                        <div className="success">
                                            <FontAwesomeIcon className="icon" icon="check" />
                                            {stt.text}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    {!bidLoading && (
                        <ButtonBase onClick={this.handleClose} className="btn btn-normal btn-default">
                            Close
                        </ButtonBase>
                    )}
                </DialogActions>
            </Dialog>
        );
    };

    back = () => {
        const { history } = this.props;
        history.goBack();
    };

    createAction = () => {
        const { history } = this.props;
        history.push('/hirer');
    };

    async createBid() {
        const { time, jobHash, award } = this.state;
        const { web3 } = this.props;
        const timeValid = this.validate(time, 'time');
        const awardValid = this.validate(award, 'award');
        if (timeValid && awardValid) {
            this.setState({ bidLoading: true, open: true });
            const instanceBid = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerBid');
            const [err, jobLog] = await Utils.callMethod(instanceBid.instance.createBid)(jobHash, award, time, {
                from: instanceBid.defaultAccount,
                gasPrice: +instanceBid.gasPrice.toString(10),
            });
            if (err) {
                this.setState({
                    bidLoading: false,
                    stt: { err: true, text: 'something went wrong! Can not create bid! :(' },
                    bidDone: false,
                });
                console.log(err);
                return;
            }
            // check  logs
            this.setState({
                bidLoading: false,
                stt: { err: false, text: 'Bid created!' },
                bidDone: true,
                checkedBid: false,
            });
            console.log('joblog bid: ', jobLog);
        }
    }

    validate = (val, field) => {
        const { jobData } = this.state;
        const avg = avgBid(jobData);
        let min = 1;
        let max = jobData.estimatedTime; // need set to totaltime of job jobData.totalTime
        if (field === 'time') {
            if (val < min) {
                this.setState({ timeErr: 'Please enter your estimate time at least 1 hour' });
                return false;
            } else if (val > max) {
                this.setState({ timeErr: 'Please do not enter longer job period' });
                return false;
            }
            return true;
        } else if (field === 'award') {
            if (avg) {
                max = Number(jobData.budget.max_sum); // job budget
                min = avg / 2; // 50% of avg bid
            } else {
                max = Number(jobData.budget.max_sum); // job budget
                min = max / 10; // 10% of budget
            }
            if (val < min) {
                if (val <= 0) {
                    this.setState({ awardErr: 'Please enter your bid' });
                    return false;
                } else {
                    this.setState({
                        awardErr: 'You enter your bid too low, your bid may not be accepted by this cause',
                    });
                    return true;
                }
            } else if (val > max) {
                this.setState({ awardErr: 'Please do not enter more than job estimated budget' });
                return false;
            }
            return true;
        }
    };

    inputOnChange = (e, field) => {
        const val = Number(e.target.value);
        if (field === 'time') {
            if (!this.validate(val, 'time')) {
                return;
            }
            this.setState({ time: val, timeErr: null });
        } else if (field === 'award') {
            if (!this.validate(val, 'award')) {
                return;
            }
            this.setState({ award: val, awardErr: null });
        }
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    render() {
        const { jobData, isLoading, stt, bidAccepted, checkedBid, timeErr, awardErr } = this.state;
        let jobTplRender;
        if (!isLoading) {
            if (stt.err) {
                jobTplRender = () => <h2> Sorry. {stt.text} </h2>;
            } else {
                if (jobData) {
                    jobTplRender = () => {
                        return (
                            <Grid container className="single-body">
                                <Grid container>
                                    <div className="top-action">
                                        <ButtonBase onClick={this.back} className="btn btn-normal btn-default btn-back e-left">
                                            <FontAwesomeIcon icon="angle-left" />
                                            Back
                                        </ButtonBase>
                                        <ButtonBase className="btn btn-normal btn-green btn-back" onClick={this.jobDataInit}>
                                            <FontAwesomeIcon icon="sync-alt" />
                                            Refresh
                                        </ButtonBase>
                                        {this.actions()}
                                    </div>

                                    <Fade in={checkedBid}>
                                        <Grid container elevation={4} className={checkedBid ? 'bid-form show-block' : 'bid-form hide'}>
                                            <Grid container className="mkp-form-row">
                                                <Grid item xs={5} className="mkp-form-row-sub left">
                                                    <span className="mkp-form-row-label">Time (Hour unit)</span>
                                                    <span className="mkp-form-row-description">Time to complete this job</span>
                                                    <input
                                                        className={timeErr ? 'input-err' : ''}
                                                        type="number"
                                                        id="time"
                                                        name="time"
                                                        min="1"
                                                        onChange={e => this.inputOnChange(e, 'time')}
                                                    />
                                                    {timeErr && <span className="err">{timeErr}</span>}
                                                </Grid>
                                                <Grid item xs={4} className="mkp-form-row-sub">
                                                    <span className="mkp-form-row-label">Award ({jobData.currency.label})</span>
                                                    <span className="mkp-form-row-description">Your bid for this job</span>
                                                    <input
                                                        className={awardErr ? 'input-err' : ''}
                                                        type="number"
                                                        id="award"
                                                        name="award"
                                                        min="1"
                                                        onChange={e => this.inputOnChange(e, 'award')}
                                                    />
                                                    {awardErr && <span className="err">{awardErr}</span>}
                                                </Grid>
                                            </Grid>
                                            <Grid container className="mkp-form-row">
                                                <ButtonBase className="btn btn-normal btn-blue e-left" onClick={() => this.createBid()}>
                                                    <FontAwesomeIcon icon="check" /> Bid
                                                </ButtonBase>
                                                <ButtonBase className="btn btn-normal btn-red" onClick={() => this.bidSwitched(false)}>
                                                    <FontAwesomeIcon icon="times" />
                                                    Cancel
                                                </ButtonBase>
                                            </Grid>
                                        </Grid>
                                    </Fade>
                                    <Grid container className="job-detail-row">
                                        <Grid item xs={11}>
                                            <Grid container>
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Bid</div>
                                                    <div className="ct">{jobData.bid.length}</div>
                                                </Grid>
                                                {this.getMyBid()}
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Avg Bid ({jobData.currency.label})</div>
                                                    <div className="ct">${avgBid(jobData)}</div>
                                                </Grid>
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Job budget ({jobData.currency.label})</div>
                                                    <div className="ct">${jobData.budget.max_sum}</div>
                                                </Grid>
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Estimate time</div>
                                                    <div className="ct">
                                                        {jobData.estimatedTime < 24
                                                            ? jobData.estimatedTime + ' H'
                                                            : Number.isInteger(jobData.estimatedTime / 24)
                                                                ? jobData.estimatedTime / 24 + ' Days'
                                                                : (jobData.estimatedTime / 24).toFixed(2) + ' Days'}
                                                    </div>
                                                </Grid>
                                                <Countdown expiredTime={jobData.expiredTime} />
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Grid item xs className="job-detail-col status">
                                                <div className="name">Status</div>
                                                <div className="ct">{Utils.getStatusJob(jobData.status)}</div>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid container className="job-detail-description">
                                        <Grid item xs={12} className="name">
                                            Job description
                                        </Grid>
                                        <Grid item xs={12} className="ct">
                                            {jobData.description}
                                            {skillShow(jobData)}
                                        </Grid>
                                    </Grid>
                                    {!bidAccepted && (
                                        <Grid container className="freelancer-bidding">
                                            <h2>Freelancer bidding</h2>
                                            <Grid container className="list-container">
                                                <Grid container className="list-header">
                                                    <Grid item xs={8}>
                                                        Bid Address
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        Awarded Bid
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        Time
                                                    </Grid>
                                                </Grid>
                                                {jobData.bid.length > 0 ? (
                                                    <Grid container className="list-body">
                                                        {jobData.bid.map(freelancer => {
                                                            return (
                                                                <Grid key={freelancer.address} container className="list-body-row">
                                                                    <Grid item xs={8} className="title">
                                                                        <span className="avatar">
                                                                            <FontAwesomeIcon icon="user-circle" />
                                                                        </span>
                                                                        {freelancer.address}
                                                                    </Grid>
                                                                    <Grid item xs={2}>
                                                                        <span className="bold">
                                                                            {freelancer.award}
                                                                            &nbsp;
                                                                        </span>
                                                                        {jobData.currency.label}
                                                                    </Grid>

                                                                    <Grid item xs={2}>
                                                                        {freelancer.timeDone <= 24
                                                                            ? freelancer.timeDone + ' H'
                                                                            : Number.isInteger(freelancer.timeDone / 24)
                                                                                ? freelancer.timeDone / 24 + ' Days'
                                                                                : (freelancer.timeDone / 24).toFixed(2) + ' Days'}
                                                                    </Grid>
                                                                </Grid>
                                                            );
                                                        })}
                                                    </Grid>
                                                ) : (
                                                    <Grid container className="no-data">
                                                        This job have no anyone bid yet
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                        );
                    };
                } else {
                    jobTplRender = () => <h2> Sorry. Job does not exist </h2>;
                }
            }
        } else {
            return (
                <Grid container className="single-body">
                    <div className="loading">
                        <CircularProgress size={50} color="secondary" />
                        <span>Loading...</span>
                    </div>
                </Grid>
            );
        }
        return (
            <Grid container className="job-detail">
                {this.dialog()}
                <div id="freelancer" className="container-wrp">
                    <div className="container-wrp full-top-wrp">
                        <div className="container wrapper">
                            <Grid container className="main-intro">
                                <Grid item xs={8}>
                                    {jobData && <h1>{jobData.title}</h1>}
                                </Grid>
                                <Grid item xs={4} className="main-intro-right">
                                    <ButtonBase onClick={this.createAction} className="btn btn-normal btn-white btn-create">
                                        <FontAwesomeIcon icon="plus" /> Create A Job Like This
                                    </ButtonBase>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                    <div className="container-wrp main-ct">
                        <div className="container wrapper">{jobTplRender()}</div>
                    </div>
                </div>
            </Grid>
        );
    }
}

JobDetailBid.propTypes = {
    web3: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
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
)(JobDetailBid);
