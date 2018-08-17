import React, { Component } from 'react';
import PropTypes from 'prop-types';
import posed from 'react-pose';
import { connect } from 'react-redux';
import Eth from 'ethjs';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ButtonBase from '@material-ui/core/ButtonBase';

import Utils from '../../_utils/utils';
import { loginMetamask, setWeb3 } from '../home/actions';

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

class LoginMethods extends Component {
    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            hovering1: false,
            hovering2: false,
            hovering3: false,
            open: false,
        };
    }
    componentDidMount() {
        const { setWeb3 } = this.props;
        setWeb3(global.web3);
        this.setState({ isLogin: true });
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
    connectMetaMask = () => {
        const { loginMetamask, history, home, homeAction } = this.props;
        const { web3 } = this.state;
        Utils.connectMetaMask(web3).then(
            async () => {
                try {
                    loginMetamask();
                    if (!home) {
                        history.goBack();
                    } else {
                        if (homeAction) {
                            if (homeAction === 'postJobAction') {
                                history.push('/hirer');
                            } else {
                                history.push('/freelancer');
                            }
                        }
                    }
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
        const { isLogin } = this.props;
        const { open, errMsg } = this.state;
        return (
            <Container id="login" className="home-intro sidebar" pose={isLogin ? 'open' : 'closed'}>
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
}

LoginMethods.propTypes = {
    loginMetamask: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    setWeb3: PropTypes.func.isRequired,
    isLogin: PropTypes.bool.isRequired,
    home: PropTypes.bool.isRequired,
    homeAction: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
    };
};

const mapDispatchToProps = {
    loginMetamask,
    setWeb3,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginMethods);
