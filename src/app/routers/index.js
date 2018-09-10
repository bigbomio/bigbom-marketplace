import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Eth from 'ethjs';
import { connect } from 'react-redux';
import { isMobile } from 'react-device-detect';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import asyncComponent from '../components/_asynComponent';
import ScrollToTop from './scroll-to-top';
import Header from '../containers/header';
import Footer from '../containers/footer';
import NotFound from '../components/NotFound';
import Login from '../components/login';
import RoutersUnAuthen from './RoutersUnAuthen';
import RoutersAuthen from './RoutersAuthen';

import Utils from '../_utils/utils';
import { loginMetamask, logoutMetamask, setWeb3, setNetwork, setAccount } from '../components/home/actions';

const Home = asyncComponent(() => import('../components/home'));

let _this;
class Routers extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: true,
            routes: RoutersUnAuthen,
        };
        _this = this;
    }

    componentDidMount() {
        const { isLogin } = this.state;
        const { setWeb3 } = this.props;
        if (isLogin) {
            this.setState({
                routes: RoutersAuthen,
            });
        }
        setWeb3(global.web3);
        _this.checkMetamaskID = setInterval(() => {
            _this.checkMetamask();
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.checkMetamaskID);
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
                        //console.log('logout');
                        history.push('/login');
                    }
                }
            } catch (error) {
                logoutMetamask();
            }
        }
    };

    render() {
        const { history } = this.props;
        const { routes } = this.state;
        if (isMobile) {
            return (
                <div className="not-support-err">
                    <h1>Not Supported!</h1>
                    <div className="ct">
                        <img src="/images/phonelock.png" alt="" />
                        <p className="bold">We are sorry!</p>
                        <p>This App requires use on PC browser, which is not supported by your device.</p>
                        <p>We will update in the next version.</p>
                    </div>
                </div>
            );
        } else {
            return (
                <Router history={history}>
                    <ScrollToTop>
                        <div className="main-container">
                            <Helmet titleTemplate="%s - Bigbom Marketplace" defaultTitle="Bigbom Marketplace">
                                <meta name="description" content="Bigbom Marketplace" />
                            </Helmet>
                            <Header history={history} />
                            <Switch>
                                <Route exact path="/" component={Home} />
                                <Route path="/login" component={Login} />
                                {routes.length && routes.map((route, key) => <Route key={key} {...route} />)}
                                <Route component={NotFound} />
                            </Switch>
                            <Footer />
                        </div>
                    </ScrollToTop>
                </Router>
            );
        }
    }
}

Routers.propTypes = {
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
)(Routers);
