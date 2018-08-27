import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';

import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';

import Countdown from '../common/countdown';
import DialogPopup from '../common/dialog';

let myAddress;

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
            actStt: { err: false, text: null },
            dialogLoading: false,
            dialogData: {
                title: null,
                actionText: null,
                actions: null,
            },
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

    actions() {
        const { web3 } = this.props;
        const { bidAccepted, bidStt, isOwner, checkedBid, bidDone, cancelBidDone, startJobDone, jobData } = this.state;
        const mybid = jobData.bid.filter(bid => bid.address === web3.eth.defaultAccount);
        if (!bidAccepted) {
            if (bidStt) {
                if (mybid[0].canceled) {
                    return (
                        <span className="note">
                            <span className="bold">Sorry, you have canceled this job</span>, you can not bid again
                        </span>
                    );
                }
                return (
                    <span className="note">
                        <FontAwesomeIcon icon="check-circle" /> <span className="bold">You have bid this job</span>, please waiting acceptance from
                        job owner.
                        <ButtonBase className="btn btn-normal btn-red btn-bid" onClick={this.confirmCancelBid} disabled={cancelBidDone}>
                            Cancel Bid
                        </ButtonBase>
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
                    {!jobData.status.started ? (
                        <ButtonBase className="btn btn-normal btn-green btn-back btn-bid" onClick={this.confirmStartJob} disabled={startJobDone}>
                            Start Job
                        </ButtonBase>
                    ) : (
                        <ButtonBase className="btn btn-normal btn-blue btn-back btn-bid">Complete</ButtonBase>
                    )}
                    <ButtonBase className="btn btn-normal btn-orange btn-back btn-bid">Claim Payment</ButtonBase>
                </span>
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
                bidding: Utils.getBiddingStt(jobStatusLog),
                expired: false,
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

    back = () => {
        const { history } = this.props;
        history.goBack();
    };

    createAction = () => {
        const { history } = this.props;
        history.push('/hirer');
    };

    createBid = async () => {
        const { time, jobHash, award } = this.state;
        const { web3 } = this.props;
        const instanceBid = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerBid');
        const [err, jobLog] = await Utils.callMethod(instanceBid.instance.createBid)(jobHash, award, time, {
            from: instanceBid.defaultAccount,
            gasPrice: +instanceBid.gasPrice.toString(10),
        });
        if (err) {
            this.setState({
                bidDone: false,
                dialogLoading: false,
                actStt: { err: true, text: 'Can not create bid! :(' },
            });
            console.log(err);
            return;
        }
        this.setState({
            bidDone: true,
            dialogLoading: false,
            actStt: { err: true, text: 'Bid created!' },
        });
        console.log('joblog bid: ', jobLog);
    };

    cancelBid = async () => {
        const { jobHash } = this.state;
        const { web3 } = this.props;
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerBid');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.cancelBid)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            this.setState({
                cancelBidDone: false,
                dialogLoading: false,
                actStt: { err: true, text: 'Can not cancel bid! :(' },
            });
            console.log(err);
            return;
        }
        this.setState({
            cancelBidDone: true,
            dialogLoading: false,
            actStt: { err: true, text: 'Your bid has been canceled' },
        });
        console.log('joblog cancel bid: ', jobLog);
    };

    startJob = async () => {
        const { jobHash } = this.state;
        const { web3 } = this.props;
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.startJob)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            this.setState({
                startJobDone: false,
                dialogLoading: false,
                actStt: { err: true, text: 'Can not start job! :(' },
            });
            console.log(err);
            return;
        }
        this.setState({
            startJobDone: true,
            dialogLoading: false,
            actStt: { err: true, text: 'This job has been started' },
        });
        console.log('joblog start: ', jobLog);
    };

    confirmBid = () => {
        const { time, award } = this.state;
        const timeValid = this.validate(time, 'time');
        const awardValid = this.validate(award, 'award');
        if (timeValid && awardValid) {
            this.setState({
                open: true,
                dialogData: {
                    title: 'Do you want to bid this job?',
                    actionText: 'Bid',
                    actions: this.createBid,
                },
            });
        }
    };

    confirmCancelBid = () => {
        this.setState({
            open: true,
            dialogData: {
                title: 'Do you want to cancel bid this job?',
                actionText: 'Cancel',
                actions: this.cancelBid,
            },
        });
    };

    confirmStartJob = () => {
        this.setState({
            open: true,
            dialogData: {
                title: 'Do you want to start this job?',
                actionText: 'Start',
                actions: this.startJob,
            },
        });
    };

    validate = (val, field) => {
        const { jobData } = this.state;
        const avg = Utils.avgBid(jobData);
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
        this.setState({ open: false, checkedBid: false });
    };

    render() {
        const { jobData, isLoading, stt, bidAccepted, checkedBid, timeErr, awardErr, dialogLoading, open, actStt, dialogData } = this.state;
        console.log(jobData);
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
                                                <ButtonBase className="btn btn-normal btn-blue e-left" onClick={() => this.confirmBid()}>
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
                                        <Grid item xs={10}>
                                            <Grid container>
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Bid</div>
                                                    <div className="ct">{jobData.bid.length}</div>
                                                </Grid>
                                                {this.getMyBid()}
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Avg Bid ({jobData.currency.label})</div>
                                                    <div className="ct">${Utils.avgBid(jobData)}</div>
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
                                        <Grid item xs={2}>
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
                                                                        {freelancer.canceled && <span className="bold">&nbsp;(canceled)</span>}
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
                <DialogPopup
                    dialogLoading={dialogLoading}
                    open={open}
                    stt={actStt}
                    actions={dialogData.actions}
                    title={dialogData.title}
                    actionText={dialogData.actionText}
                    actClose={this.handleClose}
                />
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
