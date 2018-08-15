import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import posed from 'react-pose';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';

import LoginMethods from '../login/loginMethods';

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
            isLogin: false,
            homeAction: '',
        };
    }

    componentDidMount() {
        this.setState({ isLogout: true });
        document.getElementById('login').style.display = 'none';
    }

    disconnectRender = () => {
        const { isLogout } = this.state;
        return (
            <Container id="intro" className="home-intro sidebar" pose={isLogout ? 'open' : 'closed'}>
                <Square className="col-6">
                    <h1>Hire expert freelancers for any job</h1>
                    <div className="buttons">
                        <ButtonBase
                            className="btn btn-medium btn-white left"
                            onClick={() => this.HomeAction('postJobAction')}
                        >
                            Find a Freelancer
                        </ButtonBase>
                        <ButtonBase
                            className="btn btn-medium btn-white"
                            onClick={() => this.HomeAction('findJobAction')}
                        >
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
        const { isConnected, history } = this.props;
        if (isConnected) {
            if (action === 'postJobAction') {
                history.push('/hirer');
            } else {
                history.push('/freelancer');
            }
        } else {
            this.setState({ isLogout: false, homeAction: action });
            setTimeout(() => {
                document.getElementById('intro').style.display = 'none';
                document.getElementById('login').style.display = 'flex';
                this.setState({ isLogin: true });
            }, 300);
        }
    };

    render() {
        const { isLogin, homeAction } = this.state;
        const { history } = this.props;
        return (
            <div id="home" className="container-wrp">
                <div className="container-wrp home-wrp full-top-wrp">
                    <div className="container wrapper">
                        {this.disconnectRender()}
                        <LoginMethods history={history} isLogin={isLogin} home homeAction={homeAction} />
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
    history: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
    return {
        isConnected: state.homeReducer.isConnected,
    };
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
