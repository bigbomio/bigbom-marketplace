import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Eth from 'ethjs';
import ethUtil from 'ethereumjs-util';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ButtonBase from '@material-ui/core/ButtonBase';
import { Grid } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';
import services from '../../_services/services';
import { loginMetamask, setWeb3, setCheckAcount, logoutMetamask } from '../home/actions';
import { saveAccounts, setToken } from '../common/actions';

const avatarColors = ['blue', 'red', 'pink', 'green', 'orange', 'yellow', 'dark'];

class LoginMetamask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            open: false,
            register: false,
            firstName: '',
            lastName: '',
            email: '',
            emailConfirm: '',
            submitDisabled: false,
        };
    }
    componentDidMount() {
        const { saveAccounts } = this.props;
        saveAccounts([]);
    }

    static getDerivedStateFromProps(props, previousState) {
        const { web3 } = props;
        const state = {};
        if (web3 && web3 !== previousState.web3) {
            state.web3 = web3;
            state.eth = new Eth(web3.currentProvider);
        }
        return state;
    }

    radomClass = () => {
        Utils.setCookie('avatar', avatarColors[Math.floor(Math.random() * avatarColors.length)], 1);
    };

    accountsInit = async userData => {
        console.log(userData);
        const { saveAccounts, web3, loginMetamask } = this.props;
        // wallets from current account
        const accountsFetch = [
            { address: '0x6D02c7ac101F4e909A2f3d149022fbb5e4939a68', default: false, balances: { ETH: 0, BBO: 0 } },
            { address: '0xB4cfa9AceEfE2120A1568Aa34eC3F2F9fB6eef12', default: false, balances: { ETH: 0, BBO: 0 } },
            { address: '0xBD3614fc1fCF72682b44021Db8396E518fEDcBF1', default: false, balances: { ETH: 0, BBO: 0 } },
            { address: '0xb10ca39DFa4903AE057E8C26E39377cfb4989551', default: false, balances: { ETH: 0, BBO: 0 } },
            { address: '0x6D58F2848156A8B3Bd18cB9Ce4392a876E558eC9', default: false, balances: { ETH: 0, BBO: 0 } },
        ];
        Utils.accountsInit(web3, saveAccounts, abiConfig, accountsFetch);
        loginMetamask();
        this.setState({ isLoading: false });
    };

    connectMetaMask = async () => {
        const { history, setCheckAcount, setToken } = this.props;
        const { web3 } = this.state;
        this.setState({ isLoading: true });
        Utils.connectMetaMask(web3).then(
            async ({ account }) => {
                try {
                    // call api to check wallet address existed on server
                    const eth = new Eth(web3.currentProvider);
                    const { hash } = await services.getHasFromAddress(account);
                    const msg = ethUtil.bufferToHex(new Buffer(hash));
                    const [err, signature] = await Utils.callMethod(eth.personal_sign)(msg, web3.eth.defaultAccount);
                    if (err) {
                        return this.setState({ open: true, errMsg: 'Something went wrong!', isLoading: false });
                    }
                    const userData = await services.getToken({ signature, hash });

                    // if result has not existed on server, show register form for user and return to exit login function
                    if (!userData.info) {
                        this.setState({ register: true });
                        setToken(userData.token);
                        return;
                    }

                    // if result has existed on server, continue login with user data result
                    setToken(userData.token);
                    this.accountsInit(userData);
                    this.radomClass(); // set color for avatar
                    history.goBack();
                    setCheckAcount(true);
                } catch (err) {
                    this.setState({ open: true, errMsg: 'Something went wrong!', isLoading: false });
                }
            },
            error => {
                if (error) {
                    const message = JSON.parse(error.message);
                    if (message.code === 'NETWORK') {
                        this.setState({ open: true, errMsg: 'Network error', isLoading: false });
                    } else {
                        this.setState({ open: true, errMsg: message.message, isLoading: false });
                    }
                }
            }
        );
    };

    validateAll = () => {
        const { firstName, lastName, email, emailConfirm } = this.state;
        const _first = this.validate(firstName, 'first', false);
        const _last = this.validate(lastName, 'last', false);
        const _email = this.validate(email, 'email', false);
        const _emailCf = this.validate(emailConfirm, 'emailConfirm', false);
        if (_first && _last && _email && _emailCf) {
            this.setState({ submitDisabled: false });
            return true;
        } else {
            this.setState({ submitDisabled: true });
            return false;
        }
    };

    validate = (val, field, setState) => {
        let min = 2;
        let max = 255;
        if (field === 'first') {
            if (val.length < min) {
                if (setState) {
                    this.setState({ nameErr: `Please enter first name or last name at least  ${min}  characters.` });
                }
                return false;
            } else if (val.length > max) {
                if (setState) {
                    this.setState({ nameErr: `Please enter first name or last name at most ${max} characters.` });
                }
                return false;
            }
            return true;
        } else if (field === 'last') {
            min = 2;
            max = 255;
            if (val.length < min) {
                if (setState) {
                    this.setState({ nameErr: `Please enter first name or last name at least  ${min}  characters.` });
                }
                return false;
            } else if (val.length > max) {
                if (setState) {
                    this.setState({ nameErr: `Please enter first name or last name at most ${max} characters.` });
                }
                return false;
            }
            return true;
        } else if (field === 'email') {
            if (!Utils.isEmail(val)) {
                if (setState) {
                    this.setState({ emailErr: 'Email is invalid.' });
                }
                return false;
            } else {
                const { emailConfirm } = this.state;
                if (emailConfirm.length > 0) {
                    if (val !== emailConfirm) {
                        if (setState) {
                            this.setState({ emailConfirmErr: 'Please, re-enter your email confirm.' });
                        }
                        return false;
                    }
                }
            }
            this.setState({ emailConfirmErr: '' });
            return true;
        } else if (field === 'emailConfirm') {
            if (!Utils.isEmail(val)) {
                if (setState) {
                    this.setState({ emailConfirmErr: 'Email is invalid.' });
                }
                return false;
            } else {
                const { email } = this.state;
                if (val !== email) {
                    if (setState) {
                        this.setState({ emailConfirmErr: 'Your email confirm is different.' });
                    }
                    return false;
                }
            }
            return true;
        }
    };

    inputOnChange = (e, field) => {
        const val = e.target.value;
        if (field === 'first') {
            this.setState({ firstName: val, nameErr: null });
            if (!this.validate(val, field, true)) {
                this.setState({ submitDisabled: true });
                return;
            }
        } else if (field === 'last') {
            this.setState({ lastName: val, nameErr: null });
            if (!this.validate(val, field, true)) {
                this.setState({ submitDisabled: true });
                return;
            }
        } else if (field === 'email') {
            this.setState({ email: val, emailErr: null });
            if (!this.validate(val, field, true)) {
                this.setState({ submitDisabled: true });
                return;
            }
        } else if (field === 'emailConfirm') {
            this.setState({ emailConfirm: val, emailConfirmErr: null });
            if (!this.validate(val, field, true)) {
                this.setState({ submitDisabled: true });
                return;
            }
        }
        setTimeout(() => {
            this.validateAll();
        }, 300);
    };

    createNewAccount = () => {
        const valid = this.validateAll();
        if (!valid) {
            return;
        }
        // create
    };

    formRender = () => {
        const { web3 } = this.props;
        const { submitDisabled, nameErr, emailErr, emailConfirmErr } = this.state;
        return (
            <Grid container>
                <Grid container className="form-row">
                    <Grid item xs={12} className="form-row-label">
                        Your name
                    </Grid>
                    <Grid container className="form-row-input">
                        <Grid item xs={6} className="first-name">
                            <input type="text" placeholder="First name" onChange={e => this.inputOnChange(e, 'first')} />
                        </Grid>
                        <Grid item xs={6} className="last-name">
                            <input type="text" placeholder="Last name" onChange={e => this.inputOnChange(e, 'last')} />
                        </Grid>
                    </Grid>
                    {nameErr && <span className="err">{nameErr}</span>}
                </Grid>
                <Grid container className="form-row">
                    <Grid item xs={12} className="form-row-label">
                        Your email
                    </Grid>
                    <Grid container className="form-row-input">
                        <input type="text" placeholder="Email" onChange={e => this.inputOnChange(e, 'email')} />
                    </Grid>
                    {emailErr && <span className="err">{emailErr}</span>}
                </Grid>
                <Grid container className="form-row confirm">
                    <Grid container className="form-row-input">
                        <input type="text" placeholder="Confirm your email" onChange={e => this.inputOnChange(e, 'emailConfirm')} />
                    </Grid>
                    {emailConfirmErr && <span className="err">{emailConfirmErr}</span>}
                </Grid>
                <Grid container className="form-row">
                    <Grid item xs={12} className="form-row-label">
                        Your wallet address
                    </Grid>
                    <Grid item xs={12} className="wallet">
                        {web3.eth.defaultAccount}
                    </Grid>
                </Grid>
                <Grid container className="form-row">
                    <Grid item xs={12}>
                        <ButtonBase className="btn btn-normal btn-white" disabled={submitDisabled} onClick={this.createNewAccount}>
                            Create
                        </ButtonBase>
                    </Grid>
                </Grid>
            </Grid>
        );
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    render() {
        const { open, errMsg, register, isLoading } = this.state;
        return (
            <Grid container id="login" className="home-intro sidebar login-page">
                <Dialog
                    open={open}
                    onClose={this.handleClose}
                    maxWidth="sm"
                    fullWidth
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Error:</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">{errMsg}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <ButtonBase onClick={this.handleClose} className="btn btn-normal btn-default">
                            Close
                        </ButtonBase>
                    </DialogActions>
                </Dialog>
                {register ? (
                    <div className="register-wrp">
                        <div className="name">Create New Account</div>
                        {this.formRender()}
                    </div>
                ) : (
                    <div className="connect-item-wrp">
                        {!isLoading ? (
                            <div className="connect-item">
                                <div className="logo">
                                    <img src="/images/mtm-lg.png" alt="" />
                                </div>
                                <div className="name">Metamask</div>
                                <ButtonBase className="btn btn-normal btn-white" onClick={this.connectMetaMask}>
                                    Login
                                </ButtonBase>
                            </div>
                        ) : (
                            <div className="loading register-loading">
                                <CircularProgress size={50} color="secondary" />
                                <span>Waiting...</span>
                            </div>
                        )}
                    </div>
                )}
            </Grid>
        );
    }
}

LoginMetamask.propTypes = {
    loginMetamask: PropTypes.func.isRequired,
    logoutMetamask: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    setCheckAcount: PropTypes.func.isRequired,
    saveAccounts: PropTypes.func.isRequired,
    web3: PropTypes.object.isRequired,
    setToken: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
    };
};

const mapDispatchToProps = {
    loginMetamask,
    setWeb3,
    setCheckAcount,
    saveAccounts,
    logoutMetamask,
    setToken,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginMetamask);
