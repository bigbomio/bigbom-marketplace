import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';

import Utils from '../../_utils/utils';
import { setActionBtnDisabled } from '../common/actions';
import abiConfig from '../../_services/abiConfig';

import Countdown from '../common/countdown';
import DialogPopup from '../common/dialog';
import Voting from './Voting';

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
            votingParams: {},
            dialogContent: null,
        };
        this.setActionBtnDisabled = this.props.setActionBtnDisabled;
    }

    componentDidMount() {
        const { isConnected, web3 } = this.props;
        const { isLoading } = this.state;
        if (isConnected) {
            if (!isLoading) {
                this.mounted = true;
                abiConfig.getVotingParams(web3, this.saveVotingParams);
                this.getDispute();
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getDispute = async () => {
        const watchVotingParams = setInterval(() => {
            const { web3 } = this.props;
            const { votingParams } = this.state;
            this.setState({ isLoading: true });
            if (votingParams.commitDuration) {
                abiConfig.getAllAvailablePoll(web3, votingParams, this.disputeDataInit);
                clearInterval(watchVotingParams);
            }
        }, 100);
    };

    saveVotingParams = params => {
        this.setState({ votingParams: params });
    };

    disputeDataInit = async disputeData => {
        //console.log('disputeDataInit',disputeData);
        const { match } = this.props;
        const jobHash = match.params.disputeId;
        const URl = abiConfig.getIpfsLink() + jobHash;
        const dispute = {
            ...disputeData.data,
            jobDispute: {},
        };
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
                    //this.disputeListInit(dispute);
                },
                error => {
                    console.log(error);
                    dispute.err = 'Can not fetch data from server';
                }
            );
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

    votingConfirm = client => {
        this.setActionBtnDisabled(true);
        if (client) {
            this.setState({
                commitForClient: true,
                commitForFreelancer: false,
                open: true,
                dialogData: {
                    actionText: 'Submit Vote',
                    actions: this.finalVoting,
                },
                actStt: { title: 'Do you want to vote for client of this job?', err: false, text: null, link: '' },
            });
        } else {
            this.setState({
                commitForClient: false,
                commitForFreelancer: true,
                open: true,
                dialogContent: <Voting />,
                dialogData: {
                    actionText: 'Submit Vote',
                    actions: this.finalVoting,
                },
                actStt: { title: 'Do you want to vote for freelancer of this job?', err: false, text: null, link: '' },
            });
        }
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
        const { disputeData, isLoading, dialogLoading, open, actStt, dialogData, dialogContent, fullCt } = this.state;
        console.log(disputeData);
        let disputeTplRender;

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
                                <Grid item xs={12} className="commit-duration">
                                    <p>Remaining time</p>
                                    <Countdown expiredTime={disputeData.commitDuration} />
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
                            </Grid>
                            <Grid container className="proofs">
                                <Grid item xs={6} className="client-proof">
                                    <Grid item xs={12} className="header">
                                        Client’s Proof
                                    </Grid>
                                    <Grid item xs={12} className="proof-text">
                                        <p>{disputeData.clientProof.proof}</p>
                                    </Grid>
                                    <Grid item xs={12} className="vote-submit">
                                        <ButtonBase className="btn btn-normal btn-blue" onClick={() => this.votingConfirm(true)}>
                                            VOTE
                                        </ButtonBase>
                                    </Grid>
                                </Grid>
                                <Grid item xs={6} className="freelancer-proof">
                                    <Grid item xs={12} className="header">
                                        Freelancer’s Proof
                                    </Grid>
                                    <Grid item xs={12} className="proof-text">
                                        <p>{disputeData.freelancerProof.proof}</p>
                                    </Grid>
                                    <Grid item xs={12} className="vote-submit">
                                        <ButtonBase className="btn btn-normal btn-blue" onClick={() => this.votingConfirm(false)}>
                                            VOTE
                                        </ButtonBase>
                                    </Grid>
                                </Grid>
                            </Grid>
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
                                <Grid item xs={8}>
                                    {disputeData && <h1>{disputeData.jobDispute.title}</h1>}
                                </Grid>
                                <Grid item xs={4} className="main-intro-right">
                                    <ButtonBase onClick={this.createAction} className="btn btn-normal btn-white btn-create">
                                        <i className="fas fa-plus" /> Create A Job Like This
                                    </ButtonBase>
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
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
        disputes: state.voterReducer.disputes,
    };
};

const mapDispatchToProps = {
    setActionBtnDisabled,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DisputeDetail);
