import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';

import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';
import Countdown from '../common/countdown';
import DialogPopup from '../common/dialog';

import Reasons from '../client/Reasons';
import { setActionBtnDisabled } from '../common/actions';
import { saveVotingParams } from '../freelancer/actions';
import Popper from '../common/Popper';
import ResponseDispute from './ResponseDispute';
import VoteResult from '../voter/VoteResult';

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
            actStt: { title: '', err: false, text: null, link: '' },
            dialogLoading: false,
            open: false,
            dialogData: {
                title: null,
                actionText: null,
                actions: null,
            },
            dialogContent: null,
            anchorEl: null,
            disputeStt: {
                clientResponseDuration: 0,
                started: false,
                freelancerProof: { imgs: [], text: '' },
            },
            freelancerDispute: { responded: false, commitDuration: 0 },
            evidenceShow: false,
            checkedDispute: false,
        };
        this.setActionBtnDisabled = this.props.setActionBtnDisabled;
    }

    componentDidMount() {
        const { isConnected, web3, saveVotingParams } = this.props;
        const { isLoading } = this.state;
        if (isConnected) {
            if (!isLoading) {
                this.mounted = true;
                this.jobDataInit(false);
                abiConfig.getVotingParams(web3, saveVotingParams);
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    setDisputeStt = async event => {
        const { jobHash } = this.state;
        const { web3 } = this.props;
        let clientResponseDuration = event.evidenceEndDate * 1000;
        const URl = abiConfig.getIpfsLink() + event.proofHash;
        if (clientResponseDuration <= Date.now()) {
            clientResponseDuration = 0;
        }
        if (event.revealEndDate <= Date.now()) {
            abiConfig.getDisputeFinalized(web3, jobHash, this.setFinalizedStt);
            this.getDisputeResult();
        }
        fetch(URl)
            .then(res => res.json())
            .then(
                result => {
                    const freelancerProof = {
                        text: result.proof,
                        imgs: result.imgs,
                    };
                    if (this.mounted) {
                        this.setState({
                            disputeStt: { started: event.started, clientResponseDuration, freelancerProof },
                        });
                    }
                },
                error => {
                    console.log(error);
                    if (this.mounted) {
                        this.setState({
                            disputeStt: {
                                started: event.started,
                                clientResponseDuration,
                                freelancerProof: { imgs: [], text: 'Freelancer’s evidence not found!' },
                            },
                        });
                    }
                }
            );
    };

    setFinalizedStt = isFinal => {
        this.setState({ isFinal });
    };

    setRespondedisputeStt = async event => {
        const commitDuration = event.commitEndDate * 1000;
        const evidenceDurtion = event.evidenceEndDate * 1000;
        this.setState({ disputeDurations: event });
        if (commitDuration > Date.now() && evidenceDurtion <= Date.now()) {
            if (this.mounted) {
                this.setState({
                    freelancerDispute: { responded: event.responded, commitDuration },
                    disputeStt: {
                        clientResponseDuration: 0,
                        started: true,
                        freelancerProof: { imgs: [], text: '' },
                    },
                });
            }
        } else {
            if (this.mounted) {
                this.setState({ freelancerDispute: { responded: event.responded, commitDuration: 0 } });
            }
        }
        this.setActionBtnDisabled(false);
    };

    getDisputeResult = async () => {
        const { web3 } = this.props;
        const { jobHash } = this.state;
        let voteResult = {};
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');
        const [err, result] = await Utils.callMethod(ctInstance.instance.getPoll)(jobHash, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        if (err) {
            this.setState({
                dialogLoading: false,
                dialogContent: null,
                actStt: { title: 'Error: ', err: true, text: 'Something went wrong! Can not view result! :(', link: '' },
            });
            console.log(err);
            return;
        }
        // Returns (jobOwnerVotes, freelancerVotes, jobOwner, freelancer, pID)
        voteResult = {
            clientVotes: Utils.WeiToBBO(web3, Number(result[0].toString())),
            freelancerVotes: Utils.WeiToBBO(web3, Number(result[1].toString())),
        };
        if (voteResult.clientVotes > voteResult.freelancerVotes) {
            this.setState({ voteResult, voteWinner: 'client' });
        } else if (voteResult.clientVotes < voteResult.freelancerVotes) {
            this.setState({ voteResult, voteWinner: 'freelancer' });
        } else {
            this.setState({ voteResult, voteWinner: 'drawn' });
        }
    };

    viewVotingResult = () => {
        const { voteResult } = this.state;
        this.setState({
            open: true,
            dialogLoading: false,
            dialogContent: <VoteResult voteResult={voteResult} />,
            dialogData: {
                actionText: null,
                actions: null,
            },
            actStt: { title: 'Vote result: ', err: false, text: null, link: '' },
        });
    };

    finalizeDispute = async () => {
        const { web3 } = this.props;
        const { jobHash } = this.state;
        this.setState({ dialogLoading: true });
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');
        const [err, tx] = await Utils.callMethod(ctInstance.instance.finalizePoll)(jobHash, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        if (err) {
            this.setState({
                dialogLoading: false,
                dialogContent: null,
                actStt: { title: 'Error: ', err: true, text: 'Something went wrong! Can not finalize dispute! :(', link: '' },
            });
            console.log(err);
            return;
        }
        this.setState({
            actStt: {
                title: '',
                err: false,
                text: 'Your dispute has been finalized! Please waiting for confirm from your network.',
                link: (
                    <a className="bold link" href={abiConfig.getTXlink() + tx} target="_blank" rel="noopener noreferrer">
                        HERE
                    </a>
                ),
            },
            finalizeDisputeDone: true,
            dialogLoading: false,
        });
        this.setActionBtnDisabled(true);
    };

    updateDispute = async giveUp => {
        const { web3 } = this.props;
        const { jobHash } = this.state;
        this.setState({ dialogLoading: true });
        this.setActionBtnDisabled(true);
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');
        const [err, tx] = await Utils.callMethod(ctInstance.instance.updatePoll)(jobHash, giveUp, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        let text = 'Your request has been sent! Please waiting for confirm from your network.';
        if (err) {
            text = 'Something went wrong! Can not renewal of the dispute! :(';
            if (giveUp) {
                text = 'Something went wrong! Can not give up the dispute! :(';
            }
            this.setState({
                dialogLoading: false,
                dialogContent: null,
                actStt: { title: 'Error: ', err: true, text, link: '' },
            });
            console.log(err);
            this.setActionBtnDisabled(false);
            return;
        }
        this.setState({
            actStt: {
                title: '',
                err: false,
                text,
                link: (
                    <a className="bold link" href={abiConfig.getTXlink() + tx} target="_blank" rel="noopener noreferrer">
                        HERE
                    </a>
                ),
            },
            updateDisputeDone: true,
            dialogLoading: false,
        });
    };

    disputeSttInit = async () => {
        const { match, web3 } = this.props;
        const jobHash = match.params.jobId;
        abiConfig.getEventsPollStarted(web3, jobHash, this.setDisputeStt);

        // check client dispute response status
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');
        const [error, re] = await Utils.callMethod(ctInstance.instance.isAgaintsPoll)(jobHash, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        if (!error) {
            if (re) {
                if (this.mounted) {
                    abiConfig.getEventsPollAgainsted(web3, jobHash, this.setRespondedisputeStt);
                }
            } else {
                if (this.mounted) {
                    this.setState({ freelancerDispute: { responded: false, commitDuration: 0, freelancerProof: { imgs: [], text: '' } } });
                }
            }
        }
    };

    jobDataInit = async refresh => {
        const { match, web3, jobs } = this.props;
        const jobHash = match.params.jobId;
        this.setState({ isLoading: true, jobHash });

        if (!refresh) {
            if (jobs.length > 0) {
                const jobData = jobs.filter(job => job.jobHash === jobHash);
                if (jobData[0].status.disputing) {
                    this.disputeSttInit();
                }
                if (jobData[0].owner !== web3.eth.defaultAccount) {
                    this.setState({
                        stt: { title: 'Error: ', err: true, text: 'You are not permission to view this page' },
                        isLoading: false,
                    });
                    return;
                }
                this.setState({ jobData: jobData[0], isLoading: false });
                return;
            }
        }
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
                    stt: { title: 'Error: ', err: true, text: 'You are not permission to view this page' },
                    isLoading: false,
                });
                return;
            }
            const jobStatus = Utils.getStatus(jobStatusLog);
            if (jobStatus.disputing) {
                this.disputeSttInit();
            }
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
                            stt: { title: 'Error: ', err: true, text: 'Can not fetch data from server' },
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
        abiConfig.getPastEventsMergeBidToJob(web3, 'BBFreelancerBid', 'BidCreated', { jobHash: web3.sha3(job.jobHash) }, job, this.BidAcceptedInit);
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

    acceptBid = async () => {
        const { jobHash, bidAddress } = this.state;
        const { web3 } = this.props;
        const BidInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerBid');
        const [errAccept, tx] = await Utils.callMethod(BidInstance.instance.acceptBid)(jobHash, bidAddress, {
            from: BidInstance.defaultAccount,
            gasPrice: +BidInstance.gasPrice.toString(10),
        });
        if (errAccept) {
            this.setState({
                acceptDone: false,
                dialogLoading: false,
                actStt: { title: 'Error: ', err: true, text: 'Can not accept bid! :(', link: '' },
            });
            console.log('errAccept', errAccept);
            return;
        }
        this.setState({
            actStt: {
                title: '',
                err: false,
                text: 'Your job has been accepted! Please waiting for confirm from your network.',
                link: (
                    <a className="bold link" href={abiConfig.getTXlink() + tx} target="_blank" rel="noopener noreferrer">
                        HERE
                    </a>
                ),
            },
            acceptDone: true,
            dialogLoading: false,
        });
    };

    acceptBidInit = async () => {
        const { bidValue } = this.state;
        const { web3, balances } = this.props;
        const allowance = await abiConfig.getAllowance(web3, 'BBFreelancerBid');
        if (Number(balances.ETH) <= 0) {
            this.setActionBtnDisabled(true);
            this.setState({
                actStt: {
                    title: 'Error: ',
                    err: true,
                    text: 'Sorry, you have insufficient funds! You can not create a job if your ETH balance less than fee.',
                    link: '',
                },
            });
            return;
        } else if (Utils.BBOToWei(web3, balances.BBO) < Number(bidValue)) {
            this.setActionBtnDisabled(true);
            this.setState({
                actStt: {
                    title: 'Error: ',
                    err: true,
                    text: 'Sorry, you have insufficient funds! You can not create a job if your BBO balance less than fee.',
                    link: (
                        <a href="https://faucet.ropsten.bigbom.net/" target="_blank" rel="noopener noreferrer">
                            Get free BBO
                        </a>
                    ),
                },
            });
            return;
        }
        this.setActionBtnDisabled(true);
        this.setState({ dialogLoading: true });
        if (Number(allowance.toString(10)) === 0) {
            const apprv = await abiConfig.approve(web3, 'BBFreelancerBid', Math.pow(2, 255));
            if (apprv) {
                await this.acceptBid();
            }
        } else if (Number(allowance.toString(10)) > Number(bidValue)) {
            await this.acceptBid();
        } else {
            const apprv = await abiConfig.approve(web3, 'BBFreelancerBid', 0);
            if (apprv) {
                const apprv2 = await abiConfig.approve(web3, 'BBFreelancerBid', Math.pow(2, 255));
                if (apprv2) {
                    await this.acceptBid();
                }
            }
        }
    };

    cancelJob = async () => {
        const { jobHash } = this.state;
        const { web3 } = this.props;
        this.setActionBtnDisabled(true);
        this.setState({ dialogLoading: true });
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const [cancelErr, tx] = await Utils.callMethod(jobInstance.instance.cancelJob)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (cancelErr) {
            this.setState({
                dialogLoading: false,
                cancelDone: false,
                actStt: { title: 'Error: ', err: true, text: 'Can not cancel job! :(' },
            });
            console.log(cancelErr);
            return;
        }
        this.setState({
            actStt: {
                title: '',
                err: false,
                text: 'Your job has been canceled! Please waiting for confirm from your network.',
                link: (
                    <a className="bold link" href={abiConfig.getTXlink() + tx} target="_blank" rel="noopener noreferrer">
                        HERE
                    </a>
                ),
            },
            cancelDone: true,
            dialogLoading: false,
        });
    };

    payment = async () => {
        const { jobHash } = this.state;
        const { web3 } = this.props;
        this.setActionBtnDisabled(true);
        this.setState({ dialogLoading: true });
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        const [err, tx] = await Utils.callMethod(jobInstance.instance.acceptPayment)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            this.setState({
                dialogLoading: false,
                paymentDone: false,
                actStt: { title: 'Error: ', err: true, text: 'Can not payment for this job! :(' },
            });
            console.log(err);
            return;
        }
        this.setState({
            actStt: {
                title: '',
                err: false,
                text: 'Payment success! Please waiting for confirm from your network.',
                link: (
                    <a className="bold link" href={abiConfig.getTXlink() + tx} target="_blank" rel="noopener noreferrer">
                        HERE
                    </a>
                ),
            },
            paymentDone: true,
            dialogLoading: false,
        });
    };

    rejectPayment = async () => {
        const { jobHash } = this.state;
        const { web3, reason } = this.props;
        this.setActionBtnDisabled(true);
        this.setState({ dialogLoading: true, dialogContent: null });
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        const [err, tx] = await Utils.callMethod(jobInstance.instance.rejectPayment)(jobHash, reason, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            this.setState({
                dialogLoading: false,
                rejectPaymentDone: false,
                actStt: { title: 'Error: ', err: true, text: 'Can not reject payment, please reload page and try again! :(' },
            });
            console.log(err);
            return;
        }
        this.setState({
            actStt: {
                title: '',
                err: false,
                text: 'Reject payment success! Please waiting for confirm from your network.',
                link: (
                    <a className="bold link" href={abiConfig.getTXlink() + tx} target="_blank" rel="noopener noreferrer">
                        HERE
                    </a>
                ),
            },
            rejectPaymentDone: true,
            dialogLoading: false,
        });
    };

    confirmAccept = bid => {
        const { web3 } = this.props;
        this.setActionBtnDisabled(false);
        this.setState({
            open: true,
            bidAddress: bid.address,
            bidValue: Utils.BBOToWei(web3, bid.award), // convert bbo to eth wei
            dialogData: {
                actionText: 'Accept',
                actions: this.acceptBidInit,
            },
            actStt: { title: 'Do you want to accept bid?', err: false, text: null, link: '' },
            dialogContent: null,
        });
    };

    confirmCancelJob = () => {
        this.setActionBtnDisabled(false);
        this.setState({
            dialogData: {
                actionText: 'Cancel',
                actions: this.cancelJob,
            },
            open: true,
            actStt: { title: 'Do you want to cancel this job?', err: false, text: null, link: '' },
            dialogContent: null,
        });
    };

    confirmFinalizeDispute = () => {
        this.setActionBtnDisabled(false);
        this.setState({
            dialogData: {
                actionText: 'Finalize',
                actions: this.finalizeDispute,
            },
            open: true,
            actStt: { title: 'Do you want to finalize this dispute?', err: false, text: null, link: '' },
            dialogContent: null,
        });
    };

    confirmGiveUpDispute = () => {
        this.setActionBtnDisabled(false);
        this.setState({
            dialogData: {
                actionText: 'Give up',
                actions: () => this.updateDispute(true),
            },
            open: true,
            actStt: { title: 'Do you want to give up this dispute?', err: false, text: null, link: '' },
            dialogContent: null,
        });
    };

    confirmRenewalDispute = () => {
        this.setActionBtnDisabled(false);
        this.setState({
            dialogData: {
                actionText: 'Renewal',
                actions: () => this.updateDispute(false),
            },
            open: true,
            actStt: { title: 'Do you want to renewal of this dispute?', err: false, text: null, link: '' },
            dialogContent: null,
        });
    };

    confirmPayment = () => {
        this.setActionBtnDisabled(false);
        this.setState({
            dialogData: {
                actionText: 'Payment',
                actions: this.payment,
            },
            open: true,
            actStt: { title: 'Do you want to payment for this job?', err: false, text: null, link: '' },
            dialogContent: null,
        });
    };

    confirmRejectPayment = () => {
        this.setActionBtnDisabled(true);
        this.setState({
            dialogContent: <Reasons />,
            dialogData: {
                actionText: 'Reject Payment',
                actions: this.rejectPayment,
            },
            open: true,
            actStt: { title: 'Do you want to reject payment this job?', err: false, text: null, link: '' },
        });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handlePopoverOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handlePopoverClose = () => {
        this.setState({ anchorEl: null });
    };

    back = () => {
        const { history } = this.props;
        history.goBack();
    };

    createAction = () => {
        const { history } = this.props;
        history.push('/client');
    };

    handleResponseDispute = () => {
        const { checkedDispute } = this.state;
        this.setState({ checkedDispute: !checkedDispute });
    };

    handleEvidenceShow = () => {
        const { evidenceShow } = this.state;
        this.setState({ evidenceShow: !evidenceShow });
    };

    bidActions = freelancer => {
        const { acceptDone, jobData } = this.state;
        let disabled = acceptDone;
        if (jobData.status.canceled || freelancer.canceled) {
            disabled = true;
        }
        if (jobData.status.bidding) {
            return (
                <ButtonBase aria-label="Cancel" className="btn btn-small btn-blue" onClick={() => this.confirmAccept(freelancer)} disabled={disabled}>
                    <i className="fas fa-check" /> Accept
                </ButtonBase>
            );
        } else {
            return (
                <ButtonBase aria-label="Cancel" className="btn btn-small btn-blue" disabled>
                    <i className="fas fa-check" /> Accept
                </ButtonBase>
            );
        }
    };

    jobActions = () => {
        const { jobData, cancelDone, paymentDone, rejectPaymentDone, disputeStt } = this.state;
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
        } else if (jobData.status.reject && disputeStt.clientResponseDuration <= 0) {
            return (
                <div className="note">
                    <span className="bold">You have rejected payment for freelancer</span>, please waiting for response from your freelancer.
                </div>
            );
        }
    };

    evidence = () => {
        const { disputeStt } = this.state;
        return (
            <div className="evidence-show">
                <p className="bold">Freelancer’s evidence:</p>
                <p>{disputeStt.freelancerProof.text}</p>
            </div>
        );
    };

    disputeActions = () => {
        const {
            disputeStt,
            anchorEl,
            evidenceShow,
            freelancerDispute,
            disputeDurations,
            voteWinner,
            finalizeDisputeDone,
            isFinal,
            updateDisputeDone,
        } = this.state;
        const { sttRespondedDispute } = this.props;
        const isPopperOpen = Boolean(anchorEl);

        if (!freelancerDispute.responded) {
            if (disputeStt.clientResponseDuration > 0) {
                return (
                    <span className="note">
                        <Popper
                            placement="top"
                            anchorEl={anchorEl}
                            id="mouse-over-popover"
                            onClose={this.handlePopoverClose}
                            disableRestoreFocus
                            open={isPopperOpen}
                            content="If you think that your partner is on the right side, you don’t need to do anything. After due date, your partner can claim their payment."
                        />
                        <i className="fas fa-exclamation-circle red" /> <span className="bold">You have a dispute for this job.</span> Do you want to
                        participate into this dipute?{' '}
                        <i
                            className="fas fa-info-circle icon-popper-note"
                            aria-owns={isPopperOpen ? 'mouse-over-popover' : null}
                            aria-haspopup="true"
                            onMouseEnter={this.handlePopoverOpen}
                            onMouseLeave={this.handlePopoverClose}
                        />
                        <ButtonBase
                            className="btn btn-normal btn-blue btn-bid right"
                            disabled={sttRespondedDispute}
                            onClick={this.handleResponseDispute}
                        >
                            Yes
                        </ButtonBase>
                        <ButtonBase onClick={this.handleEvidenceShow} className="btn btn-normal btn-dark-green btn-bid float-right">
                            {evidenceShow ? <i className="fas fa-angle-up icon-popper-note" /> : <i className="fas fa-angle-down icon-popper-note" />}
                            Freelancer&#39;s Evidences
                        </ButtonBase>
                    </span>
                );
            } else {
                return (
                    <span className="note">
                        <Popper
                            placement="top"
                            anchorEl={anchorEl}
                            id="mouse-over-popover"
                            onClose={this.handlePopoverClose}
                            disableRestoreFocus
                            open={isPopperOpen}
                            content="You have a dispute for this job, but during expired duration, you did not do anything."
                        />
                        <i className="fas fa-exclamation-circle red" /> You have a dispute for this job.
                        <span className="bold"> But it was expired</span>
                        &nbsp;
                        <i
                            className="fas fa-info-circle icon-popper-note"
                            aria-owns={isPopperOpen ? 'mouse-over-popover' : null}
                            aria-haspopup="true"
                            onMouseEnter={this.handlePopoverOpen}
                            onMouseLeave={this.handlePopoverClose}
                        />
                        <ButtonBase onClick={this.handleEvidenceShow} className="btn btn-normal btn-dark-green btn-bid float-right">
                            {evidenceShow ? <i className="fas fa-angle-up icon-popper-note" /> : <i className="fas fa-angle-down icon-popper-note" />}
                            Freelancer&#39;s Evidences
                        </ButtonBase>
                    </span>
                );
            }
        } else {
            if (disputeStt.clientResponseDuration > 0) {
                return (
                    <span className="note">
                        <Popper
                            placement="top"
                            anchorEl={anchorEl}
                            id="mouse-over-popover"
                            onClose={this.handlePopoverClose}
                            disableRestoreFocus
                            open={isPopperOpen}
                            content="You have participated a dispute of this job. After Evidence Duration expired, your dispute will be display to voters."
                        />
                        <span className="bold">
                            You have participated a dispute of this job. After Evidence Duration expired, your dispute will be display to voters.
                        </span>
                        <i
                            className="fas fa-info-circle icon-popper-note"
                            aria-owns={isPopperOpen ? 'mouse-over-popover' : null}
                            aria-haspopup="true"
                            onMouseEnter={this.handlePopoverOpen}
                            onMouseLeave={this.handlePopoverClose}
                        />
                    </span>
                );
            } else {
                return disputeDurations.revealEndDate <= Date.now() ? (
                    <span className="note">
                        <Popper
                            placement="top"
                            anchorEl={anchorEl}
                            id="mouse-over-drawn"
                            onClose={this.handlePopoverClose}
                            disableRestoreFocus
                            open={isPopperOpen}
                            content="Your dispute has had result, but there is not winner..."
                        />
                        <span className="bold">
                            <i className="fas fa-check-circle orange" />
                            {voteWinner === 'client'
                                ? 'Your dispute has had result and you are winner.'
                                : voteWinner === 'freelancer'
                                    ? 'Your dispute has had result and you are losers.'
                                    : 'Your dispute has had result, but there is not winner.'}
                            <i
                                className="fas fa-info-circle icon-popper-note"
                                aria-owns={isPopperOpen ? 'mouse-over-drawn' : null}
                                aria-haspopup="true"
                                onMouseEnter={this.handlePopoverOpen}
                                onMouseLeave={this.handlePopoverClose}
                            />
                        </span>
                        <ButtonBase onClick={this.viewVotingResult} className="btn btn-normal btn-blue btn-right">
                            View voting result
                        </ButtonBase>
                        {isFinal ? (
                            <span className="final-stt">Dispute finalized</span>
                        ) : voteWinner === 'drawn' ? (
                            <span className="float-right">
                                <ButtonBase onClick={this.confirmRenewalDispute} className="btn btn-normal btn-green " disabled={updateDisputeDone}>
                                    Renewal
                                </ButtonBase>
                                <ButtonBase
                                    onClick={this.confirmGiveUpDispute}
                                    className="btn btn-normal btn-red btn-right"
                                    disabled={updateDisputeDone}
                                >
                                    Give up
                                </ButtonBase>
                            </span>
                        ) : (
                            <ButtonBase
                                onClick={this.confirmFinalizeDispute}
                                className="btn btn-normal btn-green float-right"
                                disabled={finalizeDisputeDone}
                            >
                                Finalize Dispute
                            </ButtonBase>
                        )}
                    </span>
                ) : (
                    <span className="note">
                        <Popper
                            placement="top"
                            anchorEl={anchorEl}
                            id="mouse-over-popover"
                            onClose={this.handlePopoverClose}
                            disableRestoreFocus
                            open={isPopperOpen}
                            content="You have participated a dipute of this job......"
                        />
                        <span className="bold">You have participated a dipute of this job. Please waiting for result from Voters</span>
                        <i
                            className="fas fa-info-circle icon-popper-note"
                            aria-owns={isPopperOpen ? 'mouse-over-popover' : null}
                            aria-haspopup="true"
                            onMouseEnter={this.handlePopoverOpen}
                            onMouseLeave={this.handlePopoverClose}
                        />
                    </span>
                );
            }
        }
    };

    render() {
        const {
            jobData,
            isLoading,
            stt,
            dialogLoading,
            open,
            actStt,
            dialogData,
            dialogContent,
            checkedDispute,
            disputeStt,
            evidenceShow,
            freelancerDispute,
        } = this.state;
        const { web3, sttRespondedDispute } = this.props;
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
                                        <i className="fas fa-angle-left" />
                                        View all Job
                                    </ButtonBase>
                                    <ButtonBase className="btn btn-normal btn-green btn-back" onClick={() => this.jobDataInit(true)}>
                                        <i className="fas fa-sync-alt" />
                                        Refresh
                                    </ButtonBase>
                                    {this.jobActions()}
                                </div>
                                {disputeStt.started && (
                                    <div className="dispute-actions">
                                        {this.disputeActions()}
                                        {evidenceShow && this.evidence()}
                                    </div>
                                )}
                            </Grid>
                            <Grid container>
                                {!sttRespondedDispute && (
                                    <ResponseDispute
                                        checkedDispute={checkedDispute}
                                        closeAct={this.handleResponseDispute}
                                        jobHash={jobData.jobHash}
                                        web3={web3}
                                    />
                                )}
                                <Grid container className="job-detail-row">
                                    <Grid item xs={10}>
                                        <Grid container>
                                            <Grid item className="job-detail-col">
                                                <div className="name">Bid</div>
                                                <div className="ct">{jobData.bid.length}</div>
                                            </Grid>
                                            <Grid item className="job-detail-col">
                                                <div className="name">Avg Bid ({jobData.currency.label})</div>
                                                <div className="ct">
                                                    {jobData.bid.length > 0 ? Utils.currencyFormat(Utils.avgBid(jobData.bid)) : 'NaN'}
                                                </div>
                                            </Grid>
                                            <Grid item className="job-detail-col">
                                                <div className="name">Job budget ({jobData.currency.label})</div>
                                                <div className="ct">{Utils.currencyFormat(jobData.budget.max_sum)}</div>
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
                                            {jobData.status.bidding && <Countdown name="Bid duration" expiredTime={jobData.expiredTime} />}
                                            {disputeStt.started &&
                                                (disputeStt.clientResponseDuration > 0 && (
                                                    <Countdown name="Evidence Duration" expiredTime={disputeStt.clientResponseDuration} />
                                                ))}
                                            {freelancerDispute.responded &&
                                                (freelancerDispute.commitDuration > 0 && (
                                                    <Countdown name="Voting Duration" expiredTime={freelancerDispute.commitDuration} />
                                                ))}
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
                                                Bid Amount
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
                                                            <Grid item xs={6} className={freelancer.accepted ? 'title bold' : 'title'}>
                                                                <span className="avatar">
                                                                    <i className="fas fa-user-circle" />
                                                                </span>
                                                                {freelancer.address}
                                                                {freelancer.canceled && (
                                                                    <span className="bold">
                                                                        &nbsp;
                                                                        <span className="text-stt-unsuccess">
                                                                            &nbsp;
                                                                            <i className="fas fa-times-circle" />
                                                                            Canceled
                                                                        </span>
                                                                    </span>
                                                                )}
                                                                {freelancer.accepted && (
                                                                    <span className="bold">
                                                                        &nbsp;
                                                                        <span className="text-stt-success">
                                                                            &nbsp;
                                                                            <i className="fas fa-check" />
                                                                            Accepted
                                                                        </span>
                                                                    </span>
                                                                )}
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
                    title={actStt.title}
                    actionText={dialogData.actionText}
                    actClose={this.handleClose}
                    content={dialogContent}
                />
                <div id="client" className="container-wrp">
                    <div className="container-wrp full-top-wrp">
                        <div className="container wrapper">
                            <Grid container className="main-intro">
                                <Grid item xs={8}>
                                    {jobData && <h1>{jobData.title}</h1>}
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
    jobs: PropTypes.any.isRequired,
    balances: PropTypes.any.isRequired,
    reason: PropTypes.number.isRequired,
    setActionBtnDisabled: PropTypes.func.isRequired,
    saveVotingParams: PropTypes.func.isRequired,
    sttRespondedDispute: PropTypes.bool.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
        jobs: state.clientReducer.jobs,
        reason: state.clientReducer.reason,
        actionBtnDisabled: state.commonReducer.actionBtnDisabled,
        balances: state.commonReducer.balances,
        sttRespondedDispute: state.clientReducer.sttRespondedDispute,
    };
};

const mapDispatchToProps = {
    setActionBtnDisabled,
    saveVotingParams,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(JobDetail);
