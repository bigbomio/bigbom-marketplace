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
import LocalStorage from '../../_utils/localStorage';

import { loginMetamask, setWeb3, setCheckAcount } from '../home/actions';
import { saveAccountInfo, setRegister } from '../../actions/commonActions';

const avatarColors = ['blue', 'red', 'pink', 'green', 'orange', 'yellow', 'dark'];

class LoginMetamask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            open: false,
            firstName: '',
            lastName: '',
            email: '',
            emailConfirm: '',
            submitDisabled: false,
        };
        this.mounted = false;
    }
    componentDidMount() {
        this.mounted = true;
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

    componentWillUnmount() {
        this.mounted = false;
    }

    radomClass = () => {
        Utils.setCookie('avatar', avatarColors[Math.floor(Math.random() * avatarColors.length)], 1);
    };

    accountsInit = async userInfo => {
        const { saveAccountInfo, web3, loginMetamask, history, setCheckAcount } = this.props;
        // wallets from current account
        const defaultAddress = web3.eth.defaultAccount || userInfo.wallets[0].address;
        let accounts = [];
        for (let acc of userInfo.wallets) {
            let address = { address: acc.address, default: defaultAddress.toLowerCase() === acc.address.toLowerCase(), balances: { ETH: 0, BBO: 0 } };
            await web3.eth.getBalance(acc.address, (err, balance) => {
                const ethBalance = Utils.WeiToBBO(web3, balance).toFixed(3);
                address.balances.ETH = ethBalance;
            });
            const BBOinstance = await abiConfig.contractInstanceGenerator(web3, 'BigbomTokenExtended');
            const [errBalance, balance] = await Utils.callMethod(BBOinstance.instance.balanceOf)(acc.address);
            if (!errBalance) {
                const BBOBalance = Utils.WeiToBBO(web3, balance).toFixed(3);
                address.balances.BBO = BBOBalance;
            }
            accounts.push(address);
        }
        userInfo.wallets = accounts;
        if (userInfo) {
            saveAccountInfo(userInfo);
            LocalStorage.setItemJson('userInfo', userInfo);
        }
        loginMetamask();
        this.radomClass(); // set color for avatar
        history.goBack();
        setTimeout(() => {
            setCheckAcount(true);
        }, 500);

        if (this.mounted) {
            this.setState({ isLoading: false });
        }
    };

    connectMetaMask = async () => {
        const { setRegister } = this.props;
        const { web3 } = this.state;
        this.setState({ isLoading: true });
        Utils.connectMetaMask(web3).then(
            async ({ account }) => {
                try {
                    // call api to check wallet address existed on server
                    const eth = new Eth(web3.currentProvider);
                    const { hash } = await services.getHashFromAddress(account);
                    const msg = ethUtil.bufferToHex(new Buffer(hash));
                    let userInfo = {};
                    const tokenExpired = Date.now() + 15 * 60 * 1000; // 15p to refresh token
                    const [err, signature] = await Utils.callMethod(eth.personal_sign)(msg, web3.eth.defaultAccount);
                    if (err) {
                        if (this.mounted) {
                            return this.setState({ open: true, errMsg: 'Something went wrong!', isLoading: false });
                        }
                    }
                    const userData = await services.getToken({ signature, hash });
                    if (userData) {
                        // if not existed on server, show register form for user and return to exit login function
                        if (!userData.info) {
                            if (this.mounted) {
                                this.setState({ token: userData.token, isLoading: false });
                            }
                            setRegister(true);
                            return;
                        }
                        // if existed, continue login with user data result
                        LocalStorage.setItemJson('userToken', { expired: tokenExpired, token: userData.token });
                    }
                    const wallets = await services.getWallets();
                    userInfo = {
                        email: userData.info.email,
                        firstName: userData.info.firstName,
                        lastName: userData.info.lastName,
                        wallets,
                    };
                    if (this.mounted) {
                        this.setState({ token: userData.token });
                    }
                    setRegister(false);
                    this.accountsInit(userInfo);
                } catch (err) {
                    if (this.mounted) {
                        this.setState({ open: true, errMsg: 'Something went wrong! Can not login!', isLoading: false });
                    }
                }
            },
            error => {
                if (error) {
                    const message = JSON.parse(error.message);
                    if (message.code === 'NETWORK') {
                        if (this.mounted) {
                            this.setState({ open: true, errMsg: 'Network error', isLoading: false });
                        }
                    } else {
                        if (this.mounted) {
                            this.setState({ open: true, errMsg: message.message, isLoading: false });
                        }
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

    createNewAccount = async () => {
        const valid = this.validateAll();
        if (!valid) {
            return;
        }
        // create
        const { email, firstName, lastName, token } = this.state;
        const data = {
            email,
            firstName,
            lastName,
            hash: token,
        };

        this.setState({ isLoading: true });
        const userCreated = await services.createUser(data);
        // if email existed, add wallet
        if (userCreated && userCreated.message === 'EmailExist') {
            const dataWallet = {
                email,
                hash: token,
            };

            const addWallet = await services.addWallet(dataWallet);
            // count wallet of this email, if < 5, accept to add more
            if (addWallet && addWallet.message === 'TooManyWallets') {
                if (this.mounted) {
                    this.setState({
                        isLoading: false,
                        err: true,
                        userCreated: true,
                        note: 'Sorry, your account have had 5 wallet addresses, you can not add more wallet.',
                    });
                }
                return;
            }
            if (addWallet && addWallet.message === 'OK') {
                if (this.mounted) {
                    this.setState({
                        isLoading: false,
                        userCreated: true,
                        note: `Your wallet address has been added into your account! We have sent to ${email} a verify link, please checking your email.`,
                    });
                }
            }
            return;
        }

        // if email is not existed
        if (userCreated) {
            if (this.mounted) {
                this.setState({
                    isLoading: false,
                    userCreated: true,
                    note: `Your account has been created! We have sent to ${email} a verify link, please checking your email.`,
                });
                return;
            }
        }

        if (this.mounted) {
            this.setState({ open: true, errMsg: 'Something went wrong! Can not create account!', isLoading: false });
        }
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
        const { open, errMsg, isLoading, userCreated, note, err } = this.state;
        const { register } = this.props;
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
                    userCreated ? (
                        <div className="register-wrp note">
                            <p>{err ? <i className="fas fa-exclamation-circle" /> : <i className="fas fa-check-circle" />}</p>
                            <p>{note}</p>
                        </div>
                    ) : (
                        <div className="register-wrp">
                            <div className="name">Create New Account</div>
                            {this.formRender()}
                        </div>
                    )
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
    history: PropTypes.object.isRequired,
    setCheckAcount: PropTypes.func.isRequired,
    saveAccountInfo: PropTypes.func.isRequired,
    web3: PropTypes.object.isRequired,
    setRegister: PropTypes.func.isRequired,
    register: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
        register: state.CommonReducer.register,
    };
};

const mapDispatchToProps = {
    loginMetamask,
    setWeb3,
    setCheckAcount,
    saveAccountInfo,
    setRegister,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginMetamask);
