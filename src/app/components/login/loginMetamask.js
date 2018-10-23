import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Eth from 'ethjs';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ButtonBase from '@material-ui/core/ButtonBase';
import { Grid } from '@material-ui/core';

import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';
import { loginMetamask, setWeb3, setCheckAcount } from '../home/actions';
import { saveAccounts } from '../common/actions';

const avatarColors = ['blue', 'red', 'pink', 'green', 'orange', 'yellow', 'dark'];

class LoginMetamask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            open: false,
            register: true,
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

    accountsInit = async defaultAcc => {
        const { saveAccounts, web3 } = this.props;
        Utils.accountsInit(web3, saveAccounts, abiConfig, defaultAcc);
    };

    connectMetaMask = async () => {
        const { loginMetamask, history, setCheckAcount } = this.props;
        const { web3 } = this.state;
        Utils.connectMetaMask(web3).then(
            async () => {
                try {
                    loginMetamask();
                    this.accountsInit();
                    this.radomClass(); // set color for avatar
                    history.goBack();
                    setCheckAcount(true);
                } catch (err) {
                    this.setState({ open: true, errMsg: 'Something went wrong!' });
                }
            },
            error => {
                if (error) {
                    const message = JSON.parse(error.message);
                    if (message.code === 'NETWORK') {
                        this.setState({ open: true, errMsg: 'Network error' });
                    } else {
                        this.setState({ open: true, errMsg: message.message });
                    }
                }
            }
        );
    };

    formRender = () => {
        return (
            <Grid container>
                <Grid container className="form-row">
                    <Grid item xs={12} className="form-row-label">
                        Your name
                    </Grid>
                    <Grid container className="form-row-input">
                        <Grid item xs={6} className="first-name">
                            <input type="text" placeholder="First name" />
                        </Grid>
                        <Grid item xs={6} className="last-name">
                            <input type="text" placeholder="Last name" />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container className="form-row">
                    <Grid item xs={12} className="form-row-label">
                        Your email
                    </Grid>
                    <Grid container className="form-row-input">
                        <input type="text" placeholder="Email" />
                    </Grid>
                </Grid>
                <Grid container className="form-row confirm">
                    <Grid container className="form-row-input">
                        <input type="text" placeholder="Confirm your email" />
                    </Grid>
                </Grid>
                <Grid container className="form-row">
                    <Grid item xs={12} className="form-row-label">
                        Your wallet address
                    </Grid>
                    <Grid item xs={12} className="wallet">
                        0x6D02c7ac101F4e909A2f3d149022fbb5e4939a68
                    </Grid>
                </Grid>
                <Grid container className="form-row">
                    <Grid item xs={12}>
                        <ButtonBase className="btn btn-normal btn-white">Create</ButtonBase>
                    </Grid>
                </Grid>
            </Grid>
        );
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    render() {
        const { open, errMsg, register } = this.state;
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
                        <div className="connect-item">
                            <div className="logo">
                                <img src="/images/mtm-lg.png" alt="" />
                            </div>
                            <div className="name">Metamask</div>
                            <ButtonBase className="btn btn-normal btn-white" onClick={this.connectMetaMask}>
                                Login
                            </ButtonBase>
                        </div>
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
    saveAccounts: PropTypes.func.isRequired,
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
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginMetamask);
