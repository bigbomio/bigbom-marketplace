import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CircularProgress from '@material-ui/core/CircularProgress';

import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';
import Countdown from '../common/countdown';
import DialogPopup from '../common/dialog';

const skillShow = jobSkills => {
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

class JobDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            stt: { err: false, text: null },
            actStt: { err: false, text: null },
            dialogLoading: false,
            open: false,
            dialogData: {
                title: null,
                actionText: null,
                actions: null,
            },
            btnStt: false,
        };
    }

    componentDidMount() {
        const { isConnected } = this.props;
        const { isLoading } = this.state;
        if (isConnected) {
            if (!isLoading) {
                this.mounted = true;
                this.jobDataInit();
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    async getAllowance() {
        const { web3 } = this.props;
        const BBOinstance = await abiConfig.contractInstanceGenerator(web3, 'BigbomTokenExtended');
        const [err, result] = await Utils.callMethod(BBOinstance.instance.allowance)(BBOinstance.defaultAccount, BBOinstance.address);
        if (err) {
            this.setState({
                acceptDone: false,
                dialogLoading: false,
                actStt: { err: true, text: 'Can not accept bid! :(' },
            });
            console.log('err allowance: ', err);
            return;
        }
        return result;
    }

    jobDataInit = async () => {
        const { match, web3 } = this.props;
        const jobHash = match.params.jobId;
        this.setState({ isLoading: true, jobHash });
        // get job status
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const [err, jobStatusLog] = await Utils.callMethod(jobInstance.instance.getJob)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            console.log(err);
            return;
        } else {
            if (jobStatusLog[0] !== web3.eth.defaultAccount) {
                this.setState({
                    stt: { err: true, text: 'You are not permission to view this page' },
                    isLoading: false,
                });
                return;
            }
            const jobStatus = Utils.getStatus(jobStatusLog);
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
                        jobTpl.created = result.created;
                        this.BidCreatedInit(jobTpl);
                    },
                    error => {
                        console.log(error);
                        this.setState({
                            stt: { err: true, text: 'Can not fetch data from server' },
                            isLoading: false,
                            jobData: null,
                        });
                        return;
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
        if (this.mounted) {
            this.setState({ jobData: jobData.data, isLoading: false });
        }
    };

    async approve(value) {
        const { web3 } = this.props;
        const BBOinstance = await abiConfig.contractInstanceGenerator(web3, 'BigbomTokenExtended');
        const BidInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerBid');
        const [errApprove, approve] = await Utils.callMethod(BBOinstance.instance.approve)(BidInstance.address, value, {
            from: BBOinstance.defaultAccount,
            gasPrice: +BBOinstance.gasPrice.toString(10),
        });
        if (errApprove) {
            this.setState({
                acceptDone: false,
                dialogLoading: false,
                actStt: { err: true, text: 'Can not accept bid! :(' },
            });
            console.log('errApprove: ', errApprove);
            return;
        }
        console.log('approve: ', approve);
    }

    acceptBid = async () => {
        const { jobHash, bidAddress } = this.state;
        const { web3 } = this.props;
        const BidInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerBid');
        const [errAccept, jobLogAccept] = await Utils.callMethod(BidInstance.instance.acceptBid)(jobHash, bidAddress, {
            from: BidInstance.defaultAccount,
            gasPrice: +BidInstance.gasPrice.toString(10),
        });
        if (errAccept) {
            this.setState({
                acceptDone: false,
                dialogLoading: false,
                actStt: { err: true, text: 'Can not accept bid! :(' },
            });
            console.log('errAccept', errAccept);
            return;
        }
        console.log('jobLogAccept: ', jobLogAccept);
    };

    acceptBidInit = async () => {
        const { bidValue } = this.state;
        this.setState({ dialogLoading: true });
        const allowance = await this.getAllowance();
        if (allowance === 0) {
            await this.approve(Math.pow(2, 255));
            await this.acceptBid();
        } else if (allowance > bidValue) {
            await this.acceptBid();
        } else {
            await this.approve(0);
            await this.approve(Math.pow(2, 255));
            await this.acceptBid();
        }
        this.setState({
            actStt: { err: false, text: 'Your job has been accepted! Please waiting for confirm from your network.' },
            acceptDone: true,
            dialogLoading: false,
            btnStt: true,
        });
    };

    cancelJob = async () => {
        const { jobHash } = this.state;
        const { web3 } = this.props;
        this.setState({ dialogLoading: true });
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const [cancelErr, cancelLog] = await Utils.callMethod(jobInstance.instance.cancelJob)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (cancelErr) {
            this.setState({
                dialogLoading: false,
                cancelDone: false,
                actStt: { err: true, text: 'Can not cancel job! :(' },
            });
            console.log(cancelErr);
            return;
        }
        this.setState({
            actStt: { err: false, text: 'Your job has been canceled! Please waiting for confirm from your network.' },
            cancelDone: true,
            dialogLoading: false,
            btnStt: true,
        });
        console.log('jobLog cancel: ', cancelLog);
    };

    payment = async () => {
        const { jobHash } = this.state;
        const { web3 } = this.props;
        this.setState({ dialogLoading: true });
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        const [err, paymentLog] = await Utils.callMethod(jobInstance.instance.acceptPayment)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            this.setState({
                dialogLoading: false,
                paymentDone: false,
                actStt: { err: true, text: 'Can not payment for this job! :(' },
            });
            console.log(err);
            return;
        }
        this.setState({
            actStt: { err: false, text: 'Payment success! Please waiting for confirm from your network.' },
            paymentDone: true,
            dialogLoading: false,
            btnStt: true,
        });
        console.log('payment log: ', paymentLog);
    };

    rejectPayment = async () => {
        const { jobHash } = this.state;
        const { web3 } = this.props;
        this.setState({ dialogLoading: true });
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        const [err, paymentLog] = await Utils.callMethod(jobInstance.instance.rejectPayment)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            this.setState({
                dialogLoading: false,
                rejectPaymentDone: false,
                actStt: { err: true, text: 'Can not reject payment, please reload page and try again! :(' },
            });
            console.log(err);
            return;
        }
        this.setState({
            actStt: { err: false, text: 'Reject payment success! Please waiting for confirm from your network.' },
            rejectPaymentDone: true,
            dialogLoading: false,
            btnStt: true,
        });
        console.log('payment log: ', paymentLog);
    };

    confirmAccept = bid => {
        this.setState({
            open: true,
            bidAddress: bid.address,
            bidValue: Number(bid.award + 'e18'), // convert bbo to eth gwei
            dialogData: {
                title: 'Do you want to accept bid?',
                actionText: 'Accept',
                actions: this.acceptBidInit,
            },
            actStt: { err: false, text: null },
            btnStt: false,
        });
    };

    confirmCancelJob = () => {
        this.setState({
            dialogData: {
                title: 'Do you want to cancel this job?',
                actionText: 'Cancel',
                actions: this.cancelJob,
            },
            open: true,
            actStt: { err: false, text: null },
            btnStt: false,
        });
    };

    confirmPayment = () => {
        this.setState({
            dialogData: {
                title: 'Do you want to payment for this job?',
                actionText: 'Payment',
                actions: this.payment,
            },
            open: true,
            actStt: { err: false, text: null },
            btnStt: false,
        });
    };

    confirmRejectPayment = () => {
        this.setState({
            dialogData: {
                title: 'Do you want to reject payment this job?',
                actionText: 'Reject Payment',
                actions: this.rejectPayment,
            },
            open: true,
            actStt: { err: false, text: null },
            btnStt: false,
        });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    back = () => {
        const { history } = this.props;
        history.goBack();
    };

    createAction = () => {
        const { history } = this.props;
        history.push('/hirer');
    };

    bidActions = freelancer => {
        const { acceptDone, jobData } = this.state;
        let disabled = acceptDone;
        if (jobData.status.canceled) {
            disabled = true;
        }
        if (jobData.status.bidding) {
            return (
                <ButtonBase aria-label="Cancel" className="btn btn-small btn-blue" onClick={() => this.confirmAccept(freelancer)} disabled={disabled}>
                    <FontAwesomeIcon icon="check" /> Accept
                </ButtonBase>
            );
        } else {
            return (
                <ButtonBase aria-label="Cancel" className="btn btn-small btn-blue" disabled>
                    <FontAwesomeIcon icon="check" /> Accept
                </ButtonBase>
            );
        }
    };

    jobActions = () => {
        const { jobData, cancelDone, paymentDone, rejectPaymentDone } = this.state;
        //console.log(jobData);
        if (jobData.status.bidding) {
            return (
                <span>
                    <ButtonBase className="btn btn-normal btn-red btn-back btn-bid" disabled={cancelDone} onClick={this.confirmCancelJob}>
                        Cancel
                    </ButtonBase>
                </span>
            );
        } else if (jobData.status.completed) {
            return (
                <span>
                    <ButtonBase className="btn btn-normal btn-blue btn-back btn-bid" disabled={paymentDone} onClick={this.confirmPayment}>
                        Payment
                    </ButtonBase>
                    <ButtonBase
                        className="btn btn-normal btn-orange btn-back btn-bid"
                        disabled={rejectPaymentDone}
                        onClick={this.confirmRejectPayment}
                    >
                        Reject Payment
                    </ButtonBase>
                </span>
            );
        }
    };

    render() {
        const { jobData, isLoading, stt, dialogLoading, open, actStt, dialogData, btnStt } = this.state;
        let jobTplRender;

        if (stt.err) {
            jobTplRender = () => (
                <Grid container className="single-body">
                    <Grid container>
                        <h2> Sorry. {stt.text} </h2>
                    </Grid>
                </Grid>
            );
        } else {
            if (jobData) {
                jobTplRender = () => {
                    return (
                        <Grid container className="single-body">
                            <Grid container>
                                <div className="top-action">
                                    <ButtonBase onClick={this.back} className="btn btn-normal btn-default btn-back e-left">
                                        <FontAwesomeIcon icon="angle-left" />
                                        View all Job
                                    </ButtonBase>
                                    <ButtonBase className="btn btn-normal btn-green btn-back" onClick={this.jobDataInit}>
                                        <FontAwesomeIcon icon="sync-alt" />
                                        Refresh
                                    </ButtonBase>
                                    {this.jobActions()}
                                </div>
                            </Grid>
                            <Grid container>
                                <Grid container className="job-detail-row">
                                    <Grid item xs={11}>
                                        <Grid container>
                                            <Grid item className="job-detail-col">
                                                <div className="name">Bid</div>
                                                <div className="ct">{jobData.bid.length}</div>
                                            </Grid>
                                            <Grid item className="job-detail-col">
                                                <div className="name">Avg Bid ({jobData.currency.label})</div>
                                                <div className="ct">
                                                    ${jobData.bid.length > 0 ? Utils.currencyFormat(Utils.avgBid(jobData.bid)) : 'NaN'}
                                                </div>
                                            </Grid>
                                            <Grid item className="job-detail-col">
                                                <div className="name">Job budget ({jobData.currency.label})</div>
                                                <div className="ct">${Utils.currencyFormat(jobData.budget.max_sum)}</div>
                                            </Grid>
                                            <Grid item className="job-detail-col">
                                                <div className="name">Estimated time</div>
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
                                        {skillShow(jobData.skills)}
                                    </Grid>
                                </Grid>

                                <Grid container className="freelancer-bidding">
                                    <h2>Freelancer bidding</h2>
                                    <Grid container className="list-container">
                                        <Grid container className="list-header">
                                            <Grid item xs={6}>
                                                Bid Address
                                            </Grid>
                                            <Grid item xs={2}>
                                                Awarded Bid
                                            </Grid>
                                            <Grid item xs={2}>
                                                Time
                                            </Grid>
                                            <Grid item xs={2}>
                                                Action
                                            </Grid>
                                        </Grid>
                                        {jobData.bid.length > 0 ? (
                                            <Grid container className="list-body">
                                                {jobData.bid.map(freelancer => {
                                                    return (
                                                        <Grid key={freelancer.address} container className="list-body-row">
                                                            <Grid item xs={6} className="title">
                                                                <span className="avatar">
                                                                    <FontAwesomeIcon icon="user-circle" />
                                                                </span>
                                                                {freelancer.address}
                                                                {freelancer.canceled && <span className="bold">&nbsp;(canceled)</span>}
                                                            </Grid>
                                                            <Grid item xs={2}>
                                                                <span className="bold">{Utils.currencyFormat(freelancer.award) + ' '}</span>
                                                                &nbsp;
                                                                {jobData.currency.label}
                                                            </Grid>

                                                            <Grid item xs={2}>
                                                                {freelancer.timeDone <= 24
                                                                    ? freelancer.timeDone + ' H'
                                                                    : Number.isInteger(freelancer.timeDone / 24)
                                                                        ? freelancer.timeDone / 24 + ' Days'
                                                                        : (freelancer.timeDone / 24).toFixed(2) + ' Days'}
                                                            </Grid>
                                                            <Grid item xs={2} className="action">
                                                                {this.bidActions(freelancer)}
                                                            </Grid>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        ) : (
                                            <Grid container className="list-body no-data">
                                                This job have no anyone bid yet
                                            </Grid>
                                        )}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    );
                };
            } else {
                jobTplRender = () => (
                    <Grid container className="single-body">
                        <Grid container>
                            <h2> Sorry. Job does not exist </h2>
                        </Grid>
                    </Grid>
                );
            }
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
                    btnStt={btnStt}
                />
                <div id="hirer" className="container-wrp">
                    <div className="container-wrp full-top-wrp">
                        <div className="container wrapper">
                            <Grid container className="main-intro">
                                <Grid item xs={8}>
                                    {jobData && <h1>{jobData.title}</h1>}
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
                                jobTplRender()
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
            </Grid>
        );
    }
}

JobDetail.propTypes = {
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
)(JobDetail);
