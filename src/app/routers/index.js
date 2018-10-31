import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Eth from 'ethjs';
import { connect } from 'react-redux';
import { isMobile } from 'react-device-detect';
import asyncComponent from '../components/_asynComponent';
import ScrollToTop from './scroll-to-top';
import Header from '../containers/header';
import Footer from '../containers/footer';
import NotFound from '../components/NotFound';
import RoutersAuthen from './RoutersAuthen';

import abiConfig from '../_services/abiConfig';
import Utils from '../_utils/utils';
import LocalStorage from '../_utils/localStorage';
import { setYourNetwork, setReload, saveAccountInfo } from '../components/common/actions';
import { loginMetamask, logoutMetamask, setWeb3, setNetwork, setCheckAcount } from '../components/home/actions';

const Home = asyncComponent(() => import('../components/home'));

class Routers extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            routes: RoutersAuthen,
        };
    }

    componentDidMount() {
        this.setWeb3();
        this.checkMetamaskID = setInterval(() => {
            this.checkMetamask();
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

    setWeb3 = async () => {
        const { setWeb3 } = this.props;
        setWeb3(global.web3);
        if (window.ethereum) {
            try {
                await window.ethereum.enable();
            } catch (error) {
                console.log('Access denied!');
            }
        }
    };

    getNetwork = async () => {
        const { web3, setYourNetwork } = this.props;
        let [err, netId] = await Utils.callMethod(web3.version.getNetwork)();
        if (!err) {
            const yourNetwork = Utils.getNetwork(netId);
            setYourNetwork({ id: netId, name: yourNetwork });
        }
    };

    accountsInit = async () => {
        const { web3, logoutMetamask, saveAccountInfo } = this.props;
        const userInfo = LocalStorage.getItemJson('userInfo');
        const accountInfo = {
            email: '',
            firstName: '',
            lastName: '',
            wallets: [],
        };
        if (userInfo) {
            const isHaveAddress = userInfo.wallets.filter(addr => addr.address === web3.eth.defaultAccount);
            if (isHaveAddress.length > 0) {
                // if wallet has existed in current account's wallet list, login and get account info
                const defaultAddress = web3.eth.defaultAccount || userInfo.wallets[0].address;
                let accounts = [];
                for (let acc of userInfo.wallets) {
                    let address = {
                        address: acc.address,
                        default: defaultAddress.toLowerCase() === acc.address.toLowerCase(),
                        balances: { ETH: 0, BBO: 0 },
                    };
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
                saveAccountInfo(userInfo);
            } else {
                // if wallet has not existed in current account's wallet list, logout current account
                logoutMetamask();
                LocalStorage.removeItem('userInfo');
                saveAccountInfo(accountInfo);
            }
        } else {
            logoutMetamask();
            LocalStorage.removeItem('userInfo');
            saveAccountInfo(accountInfo);
        }
    };

    checkMetamask = async () => {
        const { isConnected, logoutMetamask, defaultAccount, setNetwork, setReload, history, setCheckAcount, checkAccount } = this.props;
        const { web3 } = this.state;
        if (!checkAccount) {
            return;
        }
        if (isConnected) {
            try {
                const { account, network } = await Utils.connectMetaMask(web3);
                if (account) {
                    if (defaultAccount !== account) {
                        this.accountsInit();
                        setNetwork(network);
                        this.getNetwork();
                        if (defaultAccount) {
                            setReload(true);
                        }
                    }
                }
            } catch (error) {
                logoutMetamask();
                LocalStorage.removeItem('userInfo');
                setCheckAcount(false);
            }
        } else {
            history.push('/');
            setCheckAcount(false);
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
    setCheckAcount: PropTypes.func.isRequired,
    setNetwork: PropTypes.func.isRequired,
    setYourNetwork: PropTypes.func.isRequired,
    setReload: PropTypes.func.isRequired,
    checkAccount: PropTypes.bool.isRequired,
    saveAccountInfo: PropTypes.func.isRequired,
    accountInfo: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
        defaultAccount: state.homeReducer.defaultAccount,
        checkAccount: state.homeReducer.checkAccount,
        accountInfo: state.commonReducer.accountInfo,
    };
};

const mapDispatchToProps = {
    loginMetamask,
    setWeb3,
    logoutMetamask,
    setCheckAcount,
    setNetwork,
    setYourNetwork,
    setReload,
    saveAccountInfo,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Routers);
