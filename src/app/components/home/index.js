import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import posed from 'react-pose';
import Eth from 'ethjs';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Utils from '../../_utils/utils';
import { loginMetamask, logoutMetamask, setWeb3, setNetwork, setAccount } from './actions';

const connects = [
    {
        logo: '/images/metamask.png',
        name: 'Metamask',
        action: function(e) {
            e.connectMetaMask();
        },
    },
    {
        logo: '/images/trezor.png',
        name: 'Trezor',
        action: null,
    },
    {
        logo: '/images/ledger.png',
        name: 'Ledger',
        action: null,
    },
];

const ContainerProps = {
    open: {
        x: '0%',
        delayChildren: 300,
        staggerChildren: 50,
    },
    closed: {
        delay: 500,
        staggerChildren: 20,
    },
};

const Container = posed.div(ContainerProps);
const Square = posed.div({
    idle: {
        y: 0,
    },
    popped: {
        y: -10,
        transition: { duration: 400 },
    },
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: 300 },
});

let _this;
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            hovering1: false,
            hovering2: false,
            hovering3: false,
            isLogout: false,
            isLogin: false,
            open: false,
        };
        _this = this;
    }

    componentDidMount() {
        const { setWeb3 } = this.props;
        setWeb3(global.web3);
        _this.checkMetamaskID = setInterval(() => {
            _this.checkMetamask();
        }, 1000);
        this.setState({ isLogout: true });
        document.getElementById('login').style.display = 'none';
    }

    componentWillUnmount() {
        clearInterval(this.checkMetamaskID);
        clearInterval(this.refreshTokenID);
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

    checkMetamask = async () => {
        const { isConnected, logoutMetamask, setAccount, defaultAccount, history, setNetwork } = this.props;
        const { web3 } = this.state;
        if (isConnected) {
            try {
                const { account, network } = await Utils.connectMetaMask(web3);
                if (defaultAccount !== account) {
                    setAccount(account);
                    setNetwork(network);
                    if (defaultAccount) {
                        logoutMetamask();
                        console.log('logout');
                        history.push('/');
                    }
                }
            } catch (error) {
                logoutMetamask();
            }
        }
    };

    connectMetaMask = () => {
        const { loginMetamask } = this.props;
        const { web3 } = this.state;
        Utils.connectMetaMask(web3).then(
            async () => {
                try {
                    loginMetamask();
                    console.log('connected');
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

    disconnectRender = () => {
        const { isLogout } = this.state;
        return (
            <Container id="intro" className="home-intro sidebar" pose={isLogout ? 'open' : 'closed'}>
                <Square className="col-6">
                    <h1>Hire expert freelancers for any job</h1>
                    <div className="buttons">
                        <ButtonBase className="btn btn-medium btn-white left" onClick={() => this.login()}>
                            Find a Freelancer
                        </ButtonBase>
                        <ButtonBase className="btn btn-medium btn-white" onClick={() => this.login()}>
                            Find a Job
                        </ButtonBase>
                    </div>
                </Square>
                <Square className="col-6">
                    <img src="/images/homebanner.png" alt="" />
                </Square>
            </Container>
        );
    };

    connectRender() {
        const { isLogin } = this.state;
        return (
            <Container id="login" className="home-intro sidebar" pose={isLogin ? 'open' : 'closed'}>
                {connects.map((cn, i) => {
                    const hoverName = 'hovering' + i;
                    return (
                        <Square
                            pose={this.state[hoverName] ? 'popped' : 'idle'}
                            onMouseEnter={() => this.setState({ [hoverName]: true })}
                            onMouseLeave={() => this.setState({ [hoverName]: false })}
                            key={i}
                            className="connect-item-wrp"
                        >
                            <div className="connect-item">
                                <div className="logo">
                                    <img src={cn.logo} alt="" />
                                </div>
                                <div className="name">{cn.name}</div>
                                {cn.action ? (
                                    <ButtonBase className="btn btn-normal btn-white" onClick={() => cn.action(this)}>
                                        Connect
                                    </ButtonBase>
                                ) : (
                                    <ButtonBase className="btn btn-normal btn-white">Connect</ButtonBase>
                                )}
                            </div>
                        </Square>
                    );
                })}
            </Container>
        );
    }

    login = () => {
        this.setState({ isLogout: false });
        setTimeout(() => {
            document.getElementById('intro').style.display = 'none';
            document.getElementById('login').style.display = 'flex';
            this.setState({ isLogin: true });
        }, 300);
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    render() {
        const { open, errMsg } = this.state;
        return (
            <div id="home" className="container-wrp">
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
                <div className="container-wrp home-wrp full-top-wrp">
                    <div className="container wrapper">
                        {this.disconnectRender()}
                        {this.connectRender()}
                    </div>
                </div>
                <div className="container wrapper">
                    <Grid container className="home-content">
                        <Grid container>
                            <h2>Get your job start now...</h2>
                        </Grid>
                        <Grid container>
                            <Grid item xs className="home-content-item">
                                <div className="home-content-img">
                                    <img src="/images/cate1.png" alt="" />
                                </div>
                                <p>Banner Designer</p>
                            </Grid>
                            <Grid item xs className="home-content-item">
                                <div className="home-content-img">
                                    <img src="/images/cate2.png" alt="" />
                                </div>
                                <p>Internet Marketing</p>
                            </Grid>
                            <Grid item xs className="home-content-item">
                                <div className="home-content-img">
                                    <img src="/images/cate3.png" alt="" />
                                </div>
                                <p>Content Marketer</p>
                            </Grid>
                            <Grid item xs className="home-content-item">
                                <div className="home-content-img">
                                    <img src="/images/cate4.png" alt="" />
                                </div>
                                <p>Business Development</p>
                            </Grid>
                            <Grid item xs className="home-content-item ">
                                <div className="home-content-img view-all">View all category</div>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </div>
        );
    }
}

Home.propTypes = {
    loginMetamask: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
    defaultAccount: PropTypes.string.isRequired,
    setWeb3: PropTypes.func.isRequired,
    logoutMetamask: PropTypes.func.isRequired,
    setAccount: PropTypes.func.isRequired,
    setNetwork: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
        defaultAccount: state.homeReducer.defaultAccount,
    };
};

const mapDispatchToProps = {
    loginMetamask,
    setWeb3,
    logoutMetamask,
    setAccount,
    setNetwork,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
