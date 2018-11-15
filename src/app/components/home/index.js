import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import posed from 'react-pose';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';

import LoginMetamask from '../login/loginMetamask';
import UserInfoNav from '../../components/common/UserInfoNav';
import Utils from '../../_utils/utils';

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

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogout: false,
            isReady: false,
            sttText: null,
        };
    }

    componentDidMount() {
        const { accountInfo } = this.props;
        this.setState({ isLogout: true });

        const confirmStatus = Utils.getURLParam('status');
        this.setConfirmStt(confirmStatus);

        // time for login metamask checking
        if (accountInfo.wallets) {
            if (accountInfo.wallets.length <= 0) {
                setTimeout(() => {
                    this.setState({ isReady: true });
                }, 1200);
            } else {
                this.setState({ isReady: true });
            }
        } else {
            this.setState({ isReady: true });
        }
    }

    setConfirmStt = stt => {
        switch (stt) {
            case '0':
                this.setState({ sttText: 'Sorry, data is invalid!' });
                break;
            case '1':
                this.setState({ sttText: 'Thank you! Your account has been confirmed!' });
                break;
            case '2':
                this.setState({ sttText: 'Sorry, your link has been expired!' });
                break;
            case '3':
                this.setState({ sttText: 'Your wallet has been added to your account!' });
                break;
            default:
                this.setState({ sttText: null });
        }
    };

    connectedRender = () => {
        const { isLogout } = this.state;
        return (
            <Container id="intro" className="home-intro sidebar" pose={isLogout ? 'open' : 'closed'}>
                <Square className="col-6">
                    <h1>Find a freelancer or find a job</h1>
                    <div className="buttons">
                        <ButtonBase className="btn btn-medium btn-white left" onClick={() => this.HomeAction('postJobAction')}>
                            Find a Freelancer
                        </ButtonBase>
                        <ButtonBase className="btn btn-medium btn-white" onClick={() => this.HomeAction('findJobAction')}>
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

    HomeAction = action => {
        const { history } = this.props;
        if (action === 'postJobAction') {
            history.push('/client');
        } else {
            history.push('/freelancer');
        }
    };

    render() {
        const { history, isConnected, register } = this.props;
        const { isReady, sttText } = this.state;
        return isReady ? (
            <div id="home" className="container-wrp">
                <div className="container-wrp main-nav">
                    <div className="container">
                        <UserInfoNav />
                    </div>
                </div>
                <div className="container-wrp home-wrp full-top-wrp">
                    <div className="container wrapper">{isConnected ? this.connectedRender() : <LoginMetamask history={history} />}</div>
                </div>
                <div className="container wrapper">
                    <Grid container className="home-content">
                        {!isConnected &&
                            (sttText ? (
                                <Grid container>
                                    <h2>{sttText}</h2>
                                </Grid>
                            ) : (
                                !register && (
                                    <Grid container>
                                        <h2>You have disconnected your account!</h2>
                                        <p className="note">Please try again.</p>
                                    </Grid>
                                )
                            ))}
                        {/* <Grid container>
                            <h2>Pick your job right now </h2>
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
                                <p>Content Writer</p>
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
                        </Grid> */}
                    </Grid>
                </div>
            </div>
        ) : (
            <div id="home" className="container-wrp">
                <Grid container className="single-body">
                    <div className="loading">
                        <CircularProgress size={50} color="secondary" />
                        <span>Loading...</span>
                    </div>
                </Grid>
            </div>
        );
    }
}

Home.propTypes = {
    history: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
    accountInfo: PropTypes.object.isRequired,
    register: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
    return {
        isConnected: state.homeReducer.isConnected,
        accountInfo: state.commonReducer.accountInfo,
        register: state.commonReducer.register,
    };
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
