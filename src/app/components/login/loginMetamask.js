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

    handleClose = () => {
        this.setState({ open: false });
    };

    render() {
        const { open, errMsg } = this.state;
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
