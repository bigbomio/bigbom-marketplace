import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';

import DialogPopup from '../components/common/dialog';
import { setActionBtnDisabled } from '../actions/commonActions';
import Utils from '../_utils/utils';
import abiConfig from '../_services/abiConfig';

let currentAccount = '';

class WithdrawToken extends Component {
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
            withrawAction: true,
            tokenInputErr: null,
            tokenWithdraw: 0,
        };
        this.setActionBtnDisabled = this.props.setActionBtnDisabled;
    }
    componentDidMount() {
        const { isConnected } = this.props;
        if (isConnected) {
            this.checkMetamaskID = setInterval(() => {
                this.checkAccount();
            }, 1000);
        }
    }

    componentWillUnmount() {
        clearInterval(this.checkMetamaskID);
    }

    getTokenDeposit = async () => {
        const { web3 } = this.props;
        currentAccount = web3.eth.defaultAccount;
        const votingInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVotingHelper');
        const [, tokenDeposit] = await Utils.callMethod(votingInstance.instance.checkStakeBalance)();
        if (tokenDeposit) {
            this.setState({ tokenDeposit: Utils.WeiToBBO(web3, tokenDeposit) });
        }
    };

    withdrawVotingRights = async () => {
        const { tokenWithdraw } = this.state;
        const { web3 } = this.props;
        const tokenWithdrawSend = Utils.BBOToWei(web3, tokenWithdraw);
        const votingInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVoting');
        const [errWVR, txWVR] = await Utils.callMethod(votingInstance.instance.withdrawVotingRights)(tokenWithdrawSend);
        if (errWVR) {
            this.setState({
                dialogLoading: false,
                actStt: { title: 'Error: ', err: true, text: 'Can not withraw! :(' },
            });
            console.log(errWVR);
            return;
        }
        this.setState({
            actStt: {
                title: '',
                err: false,
                text: 'Withraw success! Please waiting for confirm from your network.',
                link: (
                    <a className="bold link" href={abiConfig.getTXlink() + txWVR} target="_blank" rel="noopener noreferrer">
                        HERE
                    </a>
                ),
            },
            dialogLoading: false,
            dialogContent: null,
        });
        this.setActionBtnDisabled(true);
    };

    checkAccount = () => {
        const { web3 } = this.props;
        this.getTokenDeposit();
        if (web3.eth.defaultAccount !== currentAccount) {
            this.getTokenDeposit();
        }
    };

    confirmWithdraw = () => {
        const { tokenDeposit, tokenWithdraw } = this.state;
        this.setActionBtnDisabled(false);
        const dialogContent = () => {
            return (
                <div className="dialog-note">
                    <i className="fas fa-exclamation-circle" />
                    <p>
                        By confirming this action, you will reduce your voting rights to{' '}
                        <span className="bold">{tokenWithdraw > 0 ? Utils.currencyFormat(tokenDeposit - tokenWithdraw) : tokenWithdraw} BBO </span>.
                        Also <span className="bold">{tokenWithdraw > 0 ? Utils.currencyFormat(tokenWithdraw) : tokenWithdraw} BBO </span> BBO will be
                        send back to your account.
                    </p>
                </div>
            );
        };
        this.setState({
            dialogData: {
                actionText: 'Withdraw',
                actions: this.withdrawVotingRights,
            },
            open: true,
            actStt: { title: 'Do you want to withdraw your voting right?', err: false, text: null, link: '' },
            dialogContent: dialogContent(),
        });
    };

    validate = val => {
        const { tokenDeposit } = this.state;
        let min = 0;
        let max = tokenDeposit;
        if (val <= min) {
            this.setState({ tokenInputErr: 'Please enter your token number that you want to withraw' });
            return false;
        } else if (val > max) {
            this.setState({ tokenInputErr: `Please enter your token number that you want to withraw most ${tokenDeposit} BBO` });
            return false;
        }
        return true;
    };

    inputOnChange = e => {
        const val = Number(e.target.value);
        if (!this.validate(val)) {
            this.setState({ withrawAction: true });
            return;
        } else {
            this.setState({ withrawAction: false });
        }
        this.setState({ tokenWithdraw: val, tokenInputErr: null });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    back = () => {
        const { history } = this.props;
        history.goBack();
    };

    render() {
        const { dialogLoading, open, actStt, dialogData, dialogContent, withrawAction, tokenInputErr, tokenDeposit } = this.state;
        return (
            <Grid id="main" className="container-wrp">
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
                <Grid container className="job-detail">
                    <Grid className="container-wrp">
                        <div className="container-wrp full-top-wrp">
                            <div className="container wrapper">
                                <Grid container className="main-intro">
                                    <Grid item xs={8}>
                                        <h1>Withdraw voting rights</h1>
                                    </Grid>
                                </Grid>
                            </div>
                        </div>
                        <Grid className="container-wrp main-ct">
                            <Grid className="container wrapper">
                                <Grid container className="single-body">
                                    <Grid container>
                                        <div className="top-action">
                                            <ButtonBase onClick={this.back} className="btn btn-normal btn-default btn-back e-left">
                                                <i className="fas fa-angle-left" />
                                                Back
                                            </ButtonBase>
                                        </div>
                                        <Grid container className="withraw-token">
                                            <Grid className="withraw-form">
                                                <div className="withraw-form-title">
                                                    Your voting rights number: <span className="bold">{tokenDeposit} BB0</span>
                                                </div>
                                                <Grid className="mkp-form-row">
                                                    <span className="mkp-form-row-description">Enter number that you want to withdraw</span>
                                                    <input
                                                        className={tokenInputErr ? 'input-err' : ''}
                                                        type="number"
                                                        id="tokenInput"
                                                        name="tokenInput"
                                                        onChange={e => this.inputOnChange(e)}
                                                    />
                                                    {tokenInputErr && <span className="err">{tokenInputErr}</span>}
                                                </Grid>
                                                <ButtonBase
                                                    className="btn btn-normal btn-blue"
                                                    onClick={this.confirmWithdraw}
                                                    disabled={withrawAction}
                                                >
                                                    Withdraw Voting Rights
                                                </ButtonBase>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

WithdrawToken.propTypes = {
    history: PropTypes.object.isRequired,
    web3: PropTypes.object,
    setActionBtnDisabled: PropTypes.func.isRequired,
    isConnected: PropTypes.bool.isRequired,
};

WithdrawToken.defaultProps = {
    web3: null,
};

const mapStateToProps = state => {
    return {
        web3: state.HomeReducer.web3,
        isConnected: state.HomeReducer.isConnected,
        reload: state.CommonReducer.reload,
    };
};

const mapDispatchToProps = {
    setActionBtnDisabled,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WithdrawToken);
