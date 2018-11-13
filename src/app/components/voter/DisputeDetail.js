import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import leftPad from 'left-pad';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';

import Utils from '../../_utils/utils';
import { setActionBtnDisabled, setReload } from '../common/actions';
import abiConfig from '../../_services/abiConfig';
import api from '../../_services/settingsApi';
import LocalStorage from '../../_utils/localStorage';

import Countdown from '../common/countdown';
import DialogPopup from '../common/dialog';
import Voting from './Voting';
import Reveal from './Reveal';
import VoteResult from './VoteResult';

import { setVoteInputDisable } from './actions';

class DisputeDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            actStt: { err: false, text: null, link: '' },
            dialogLoading: false,
            dialogData: {
                title: null,
                actionText: null,
                actions: null,
            },
            dialogContent: null,
        };
        this.setActionBtnDisabled = this.props.setActionBtnDisabled;
    }

    componentDidMount() {
        const { isConnected } = this.props;
        const { isLoading } = this.state;
        if (isConnected) {
            if (!isLoading) {
                this.mounted = true;
                this.getDispute();
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

    getDispute = async () => {
        const { web3, match } = this.props;
        const jobHash = match.params.disputeId;
        this.setState({ isLoading: true });
        abiConfig.getAllAvailablePoll(web3, this.disputeDataInit, jobHash);
        this.checkGetRewardRight();
    };

    getReasonPaymentRejected = async paymentRejectReason => {
        if (this.mounted) {
            this.setState({ paymentRejectReason });
        }
    };

    setActionBtnStt = async (action, done) => {
        const { match, web3 } = this.props;
        const defaultAccount = await web3.eth.defaultAccount;
        const jobHash = match.params.disputeId;
        this.setState({ [action]: done });
        LocalStorage.setItemJson(action + '-' + defaultAccount + '-' + jobHash, { done });
    };

    getActionBtnStt = async action => {
        const { match, web3 } = this.props;
        const defaultAccount = await web3.eth.defaultAccount;
        const jobHash = await match.params.disputeId;
        const actionStt = LocalStorage.getItemJson(action + '-' + defaultAccount + '-' + jobHash);
        if (actionStt) {
            this.setState({ [action]: actionStt.done });
        } else {
            this.setState({ [action]: false });
        }
    };

    getDisputeResult = async jobHash => {
        const { web3 } = this.props;
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
        setTimeout(() => {
            this.setState({
                dialogLoading: false,
                dialogContent: <VoteResult voteResult={voteResult} />,
                dialogData: {
                    actionText: null,
                    actions: null,
                },
                actStt: { title: 'Vote result: ', err: false, text: null, link: '' },
            });
        }, 500);
    };

    setFinalizedStt = isFinal => {
        this.setState({ isFinal });
    };

    getReward = async () => {
        const { match, web3 } = this.props;
        const jobHash = match.params.disputeId;
        this.setState({ dialogLoading: true });
        this.setActionBtnDisabled(true);
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVoting');
        const [err, tx] = await Utils.callMethod(ctInstance.instance.claimReward)(jobHash, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        if (!tx) {
            this.setState({
                dialogLoading: false,
                dialogContent: null,
                actStt: { title: 'Error: ', err: true, text: 'Something went wrong! Can not claim your reward! :(', link: '' },
            });
            console.log(err);
            return;
        }
        this.setActionBtnStt('getRewardDone', true);
        this.setState({
            dialogLoading: false,
            dialogContent: null,
            actStt: {
                title: '',
                err: false,
                text: 'Your request has send! Please waiting for confirm from your network.',
                link: (
                    <a className="bold link" href={abiConfig.getTXlink() + tx} target="_blank" rel="noopener noreferrer">
                        HERE
                    </a>
                ),
            },
        });
    };

    getRewardConfirm = () => {
        const { reward } = this.state;
        const dialogContent = () => {
            return (
                <div className="dialog-note">
                    <i className="fas fa-exclamation-circle" />
                    <p>
                        By confirming this action, you will be able to get <span className="bold">{Utils.currencyFormat(reward)} BBO</span> as your
                        reward.
                    </p>
                </div>
            );
        };
        this.setState({
            open: true,
            dialogContent: dialogContent(),
            dialogData: {
                actionText: 'Claim Reward',
                actions: this.getReward,
            },
            actStt: { title: 'Do you want to get your reward now?', err: false, text: null, link: '' },
        });
        this.setActionBtnDisabled(false);
    };

    checkGetRewardRight = async () => {
        const { match, web3 } = this.props;
        const jobHash = match.params.disputeId;
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVoting');
        const [err, result] = await Utils.callMethod(ctInstance.instance.calcReward)(jobHash, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        if (err) {
            console.log(err);
            return;
        }
        if (Number(result.toString()) > 0) {
            if (this.mounted) {
                this.setState({ getRewardRight: true, reward: Utils.WeiToBBO(web3, Number(result.toString())) });
            }
        } else {
            if (this.mounted) {
                this.setState({ getRewardRight: false, reward: 0 });
            }
        }
    };

    viewVoteResult = () => {
        const { match } = this.props;
        const jobHash = match.params.disputeId;
        this.getDisputeResult(jobHash);
        this.setState({
            open: true,
            dialogLoading: true,
        });
    };

    sttAtionInit = () => {
        this.getActionBtnStt('revealDone');
        this.getActionBtnStt('getRewardDone');
    };

    disputeDataInit = async disputeData => {
        const { match, web3 } = this.props;
        const jobHash = match.params.disputeId;
        this.sttAtionInit();
        abiConfig.getReasonPaymentRejected(web3, jobHash, this.getReasonPaymentRejected);
        const URl = abiConfig.getIpfsLink() + jobHash;
        const dispute = {
            ...disputeData.data,
            jobDispute: {},
        };
        if (disputeData.data.commitEndDate <= Date.now()) {
            if (this.mounted) {
                this.setState({ reveal: true });
            }
        }
        if (disputeData.data.revealEndDate <= Date.now()) {
            abiConfig.getDisputeFinalized(web3, jobHash, this.setFinalizedStt);
        }
        fetch(URl)
            .then(res => res.json())
            .then(
                result => {
                    dispute.jobDispute.title = result.title;
                    dispute.jobDispute.skills = result.skills;
                    dispute.jobDispute.category = result.category;
                    dispute.jobDispute.description = result.description;
                    dispute.jobDispute.currency = result.currency;
                    dispute.jobDispute.budget = result.budget;
                    dispute.jobDispute.estimatedTime = result.estimatedTime;
                    dispute.jobDispute.expiredTime = result.expiredTime;
                    dispute.jobDispute.created = result.created;
                    this.clientProofFetch(dispute);
                },
                error => {
                    console.log(error);
                    dispute.err = 'Can not fetch data from server';
                }
            );
    };

    checkAccount = () => {
        const { reload, setReload } = this.props;
        const { isLoading } = this.state;
        if (!isLoading) {
            if (reload) {
                this.getDispute();
                setReload(false);
            }
        }
    };

    clientProofFetch = async dispute => {
        //console.log('clientProofFetch',dispute);
        const URl = abiConfig.getIpfsLink() + dispute.clientProofHash;
        fetch(URl)
            .then(res => res.json())
            .then(
                result => {
                    dispute.clientProof = result;
                    this.freelancerProofFetch(dispute);
                },
                error => {
                    console.log(error);
                    dispute.err = 'Can not fetch data from server';
                }
            );
    };

    freelancerProofFetch = async dispute => {
        //console.log('freelancerProofFetch', dispute);
        const URl = abiConfig.getIpfsLink() + dispute.freelancerProofHash;
        fetch(URl)
            .then(res => res.json())
            .then(
                result => {
                    dispute.freelancerProof = result;
                    this.disputeListInit(dispute);
                },
                error => {
                    console.log(error);
                    dispute.err = 'Can not fetch data from server';
                }
            );
    };

    disputeListInit = jobDispute => {
        //console.log('disputeListInit success: ', jobDispute);
        if (this.mounted) {
            this.setState({ isLoading: false, disputeData: jobDispute });
        }
    };

    keccak256(...args) {
        const { web3 } = this.props;
        args = args.map(arg => {
            if (typeof arg === 'string') {
                if (arg.substring(0, 2) === '0x') {
                    return arg.slice(2);
                } else {
                    return web3.toHex(arg).slice(2);
                }
            }

            if (typeof arg === 'number') {
                return leftPad(arg.toString(16), 64, 0);
            } else {
                return '';
            }
        });
        args = args.join('');
        return web3.sha3(args, { encoding: 'hex' });
    }

    finalVoting = async () => {
        const { disputeData } = this.state;
        const { web3, vote, setVoteInputDisable } = this.props;
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVoting');
        const secretHashString = this.keccak256(vote.choice, Number(vote.secretPhrase));
        const token = Utils.BBOToWei(web3, vote.token);
        setVoteInputDisable(true);
        const [err, tx] = await Utils.callMethod(ctInstance.instance.commitVote)(disputeData.jobHash, secretHashString, token, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        if (err) {
            this.setState({
                dialogLoading: false,
                dialogContent: null,
                actStt: { title: 'Error: ', err: true, text: 'Something went wrong! Can not vote! :(', link: '' },
            });
            console.log(err);
            return;
        }
        this.setState({
            dialogLoading: false,
            dialogContent: null,
            actStt: {
                title: '',
                err: false,
                text: 'Your vote has send! Please waiting for confirm from your network.',
                link: (
                    <a className="bold link" href={abiConfig.getTXlink() + tx} target="_blank" rel="noopener noreferrer">
                        HERE
                    </a>
                ),
            },
        });
    };

    submitReveal = async () => {
        const { disputeData } = this.state;
        const { web3, revealVote } = this.props;
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVoting');
        this.setActionBtnDisabled(true);
        this.setState({
            dialogLoading: true,
        });
        const [err, tx] = await Utils.callMethod(ctInstance.instance.revealVote)(
            disputeData.jobHash,
            revealVote.addressChoice,
            Number(revealVote.secretHash),
            {
                from: ctInstance.defaultAccount,
                gasPrice: +ctInstance.gasPrice.toString(10),
            }
        );
        if (!tx) {
            this.setState({
                dialogLoading: false,
                dialogContent: null,
                actStt: { title: 'Error: ', err: true, text: 'Something went wrong! Can not reveal voting! :(', link: '' },
            });
            console.log(err);
            return;
        }
        this.setActionBtnStt('revealDone', true);
        abiConfig.transactionWatch(web3, tx, () => this.getDisputeResult(disputeData.jobHash));
    };

    // check allowance
    checkAllowance = async () => {
        const { web3, vote, accountInfo } = this.props;
        const defaultWallet = accountInfo.wallets.filter(wallet => wallet.default);
        this.setState({ dialogLoading: true });
        this.setActionBtnDisabled(true);
        const allowance = await abiConfig.getAllowance(web3, 'BBVoting');

        /// check balance
        if (defaultWallet[0].balances.ETH <= 0) {
            this.setState({
                dialogLoading: false,
                actStt: {
                    title: 'Error: ',
                    err: true,
                    text: 'Sorry, you have insufficient funds! You can not vote if your balance less than fee.',
                    link: '',
                },
            });
            return;
        } else if (Utils.BBOToWei(web3, defaultWallet[0].balances.BBO) < vote.token) {
            this.setState({
                dialogLoading: false,
                actStt: {
                    title: 'Error: ',
                    err: true,
                    text: 'Sorry, you have insufficient funds! You can not vote if your BBO balance less than stake deposit.',
                    link: (
                        <a href="https://faucet.ropsten.bigbom.net/" target="_blank" rel="noopener noreferrer">
                            Get free BBO
                        </a>
                    ),
                },
            });
            return;
        }

        if (Number(allowance.toString(10)) === 0) {
            const apprv = await abiConfig.approve(web3, 'BBVoting', Math.pow(2, 255));
            if (apprv) {
                await this.finalVoting();
            }
        } else if (Number(allowance.toString(10)) > Utils.BBOToWei(web3, vote.token)) {
            await this.finalVoting();
        } else {
            const apprv = await abiConfig.approve(web3, 'BBVoting', 0);
            if (apprv) {
                const apprv2 = await abiConfig.approve(web3, 'BBVoting', Math.pow(2, 255));
                if (apprv2) {
                    await this.finalVoting();
                }
            }
        }
    };

    votingConfirm = client => {
        const { disputeData } = this.state;
        const options = {
            clientChoice: {
                address: disputeData.client,
                name: 'Client',
            },
            freelancerChoice: {
                address: disputeData.freelancer,
                name: 'Freelancer',
            },
        };

        this.setActionBtnDisabled(true);
        if (client) {
            this.setState({
                open: true,
                dialogContent: <Voting choice="client" dispute={disputeData} options={options} />,
                dialogData: {
                    actionText: 'Submit Vote',
                    actions: this.checkAllowance,
                },
                actStt: { title: 'Do you want to vote for this job?', err: false, text: null, link: '' },
            });
        } else {
            this.setState({
                open: true,
                dialogContent: <Voting choice="freelancer" dispute={disputeData} options={options} />,
                dialogData: {
                    actionText: 'Submit Vote',
                    actions: this.checkAllowance,
                },
                actStt: { title: 'Do you want to vote for this job?', err: false, text: null, link: '' },
            });
        }
    };

    revealConfirm = () => {
        const { disputeData } = this.state;
        this.setActionBtnDisabled(true);
        this.setState({
            open: true,
            dialogContent: <Reveal dispute={disputeData} />,
            dialogData: {
                actionText: 'Reveal Vote',
                actions: this.submitReveal,
            },
            actStt: { title: 'Do you want to reveal your vote?', err: false, text: null, link: '' },
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
        history.push('/client');
    };

    viewFull = () => {
        const { fullCt } = this.state;
        if (!fullCt) {
            document.getElementById('des-ct').classList.add('ct-full');
        } else {
            document.getElementById('des-ct').classList.remove('ct-full');
        }
        this.setState({ fullCt: !fullCt });
    };

    render() {
        const {
            disputeData,
            isLoading,
            dialogLoading,
            open,
            actStt,
            dialogData,
            dialogContent,
            fullCt,
            paymentRejectReason,
            reveal,
            getRewardRight,
            isFinal,
            revealDone,
            getRewardDone,
        } = this.state;
        let disputeTplRender;
        const { web3 } = this.props;
        if (disputeData) {
            disputeTplRender = () => {
                return (
                    <Grid container className="single-body">
                        <Grid container>
                            <div className="top-action">
                                <ButtonBase onClick={this.back} className="btn btn-normal btn-default btn-back e-left">
                                    <i className="fas fa-angle-left" />
                                    Back
                                </ButtonBase>
                                <ButtonBase className="btn btn-normal btn-green btn-back" onClick={() => this.getDispute()}>
                                    <i className="fas fa-sync-alt" />
                                    Refresh
                                </ButtonBase>
                                <div className="voting-stage">
                                    {disputeData.evidenceEndDate > Date.now()
                                        ? 'Evidence'
                                        : disputeData.commitEndDate > Date.now()
                                            ? 'Commit Vote'
                                            : !isFinal
                                                ? 'Reveal Vote'
                                                : 'Dispute finalized'}
                                </div>
                            </div>

                            <Grid item xs={8} className="job-detail-description">
                                <Grid item xs={12} className="name">
                                    Job description
                                </Grid>
                                <Grid item xs={12} className="ct" id="des-ct">
                                    {disputeData.jobDispute.description}
                                </Grid>
                                <Grid item xs={12} className="bottom-ct">
                                    <ButtonBase className="btn btn-small btn-white" onClick={this.viewFull}>
                                        {!fullCt ? (
                                            <span>
                                                More <i className="fas fa-caret-down right" />
                                            </span>
                                        ) : (
                                            <span>
                                                Less <i className="fas fa-caret-up right" />
                                            </span>
                                        )}
                                    </ButtonBase>
                                </Grid>
                            </Grid>
                            <Grid item xs={4} className="job-info">
                                <Grid
                                    item
                                    xs={12}
                                    className={
                                        !reveal
                                            ? 'commit-duration'
                                            : disputeData.revealEndDate > Date.now()
                                                ? 'commit-duration orange'
                                                : 'commit-duration blue'
                                    }
                                >
                                    <p>Remaining time</p>
                                    {!reveal ? (
                                        disputeData.evidenceEndDate > Date.now() ? (
                                            <Countdown reload expiredTime={disputeData.evidenceEndDate} />
                                        ) : (
                                            <Countdown reload expiredTime={disputeData.commitEndDate} />
                                        )
                                    ) : (
                                        <Countdown expiredTime={disputeData.revealEndDate} />
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    Category:
                                    <span className="bold"> {disputeData.jobDispute.category.label}</span>
                                </Grid>
                                <Grid item xs={12}>
                                    Created:
                                    <span className="bold"> {Utils.convertDateTime(disputeData.jobDispute.created)}</span>
                                </Grid>
                                <Grid item xs={12}>
                                    Budget:
                                    <span className="bold">
                                        &nbsp;
                                        {Utils.currencyFormat(disputeData.jobDispute.budget.max_sum)}
                                        &nbsp;
                                        {disputeData.jobDispute.budget.currency}
                                    </span>
                                </Grid>
                                <Grid item xs={12}>
                                    Dispute reason:&nbsp;
                                    <span className="bold">{paymentRejectReason && api.getReason(Number(paymentRejectReason.reason)).text}</span>
                                </Grid>
                            </Grid>

                            <Grid container className="proofs">
                                <Grid item xs={6} className="client-proof">
                                    <Grid item xs={12} className="header">
                                        Client’s Proof
                                    </Grid>
                                    <Grid item xs={12} className="proof-text">
                                        <p>{disputeData.clientProof.proof}</p>
                                    </Grid>
                                    {!reveal && (
                                        <Grid item xs={12} className="vote-submit">
                                            {disputeData.client === web3.eth.defaultAccount || disputeData.freelancer === web3.eth.defaultAccount ? (
                                                <span className="none-voter">Sorry, Participants in the dispute do not have the right to vote</span>
                                            ) : (
                                                <ButtonBase
                                                    className="btn btn-normal btn-blue"
                                                    onClick={() => this.votingConfirm(true)}
                                                    disabled={disputeData.evidenceEndDate > Date.now()}
                                                >
                                                    VOTE
                                                </ButtonBase>
                                            )}
                                        </Grid>
                                    )}
                                </Grid>
                                <Grid item xs={6} className="freelancer-proof">
                                    <Grid item xs={12} className="header">
                                        Freelancer’s Proof
                                    </Grid>
                                    <Grid item xs={12} className="proof-text">
                                        <p>{disputeData.freelancerProof.proof}</p>
                                    </Grid>
                                    {!reveal && (
                                        <Grid item xs={12} className="vote-submit">
                                            {disputeData.client === web3.eth.defaultAccount || disputeData.freelancer === web3.eth.defaultAccount ? (
                                                <span className="none-voter">Sorry, Participants in the dispute do not have the right to vote</span>
                                            ) : (
                                                <ButtonBase
                                                    className="btn btn-normal btn-blue"
                                                    onClick={() => this.votingConfirm(false)}
                                                    disabled={disputeData.evidenceEndDate > Date.now()}
                                                >
                                                    VOTE
                                                </ButtonBase>
                                            )}
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                            {reveal &&
                                (disputeData.client === web3.eth.defaultAccount || disputeData.freelancer === web3.eth.defaultAccount ? (
                                    <Grid container className="reveal-submit">
                                        <span className="none-voter">Sorry, Participants in the dispute do not have the right to vote</span>
                                    </Grid>
                                ) : (
                                    <Grid container className="reveal-submit">
                                        {disputeData.revealEndDate > Date.now() ? (
                                            <span>
                                                <ButtonBase className="btn btn-normal btn-blue" onClick={this.viewVoteResult}>
                                                    View Vote Result
                                                </ButtonBase>
                                                <ButtonBase
                                                    className="btn btn-normal btn-orange btn-right"
                                                    disabled={revealDone}
                                                    onClick={this.revealConfirm}
                                                >
                                                    Reveal Vote
                                                </ButtonBase>
                                            </span>
                                        ) : (
                                            <ButtonBase className="btn btn-normal btn-blue" onClick={this.viewVoteResult}>
                                                View Vote Result
                                            </ButtonBase>
                                        )}
                                        {getRewardRight && (
                                            <ButtonBase
                                                className="btn btn-normal btn-orange btn-right"
                                                disabled={getRewardDone}
                                                onClick={this.getRewardConfirm}
                                            >
                                                Claim Reward
                                            </ButtonBase>
                                        )}
                                    </Grid>
                                ))}
                        </Grid>
                    </Grid>
                );
            };
        } else {
            disputeTplRender = () => null;
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
                <div id="freelancer" className="container-wrp">
                    <div className="container-wrp full-top-wrp">
                        <div className="container wrapper">
                            <Grid container className="main-intro">
                                <Grid item xs={10}>
                                    {disputeData && <h1>{disputeData.jobDispute.title}</h1>}
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                    <div className="container-wrp main-ct">
                        <div className="container wrapper">
                            {!isLoading ? (
                                disputeTplRender()
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

DisputeDetail.propTypes = {
    web3: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    setActionBtnDisabled: PropTypes.func.isRequired,
    vote: PropTypes.object.isRequired,
    accountInfo: PropTypes.any.isRequired,
    setVoteInputDisable: PropTypes.func.isRequired,
    revealVote: PropTypes.object.isRequired,
    reload: PropTypes.bool.isRequired,
    setReload: PropTypes.func.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        reload: state.commonReducer.reload,
        isConnected: state.homeReducer.isConnected,
        disputes: state.voterReducer.disputes,
        accountInfo: state.commonReducer.accountInfo,
        vote: state.voterReducer.vote,
        revealVote: state.voterReducer.revealVote,
    };
};

const mapDispatchToProps = {
    setActionBtnDisabled,
    setVoteInputDisable,
    setReload,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DisputeDetail);
