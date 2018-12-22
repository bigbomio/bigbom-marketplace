import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Eth from 'ethjs';
import { connect } from 'react-redux';
import { isMobile } from 'react-device-detect';
import asyncComponent from '../components/_asynComponent';
import Header from '../containers/header';
import Footer from '../containers/footer';
import NotFound from '../components/NotFound';
import RoutersAuthen from './RoutersAuthen';
import WithrawToken from '../components/WithrawToken';

import services from '../_services/services';
import Utils from '../_utils/utils';
import LocalStorage from '../_utils/localStorage';
import { setYourNetwork, setReload, saveAccountInfo, setRegister, getTokensAddress } from '../actions/commonActions';
import { loginMetamask, logoutMetamask, setWeb3, setNetwork, setAccount, setCheckAcount } from '../actions/homeActions';
import contractApis from '../_services/contractApis';

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

    logout = () => {
        const { logoutMetamask, saveAccountInfo, setReload } = this.props;
        const accountInfo = {
            email: '',
            firstName: '',
            lastName: '',
            wallets: [],
        };
        LocalStorage.removeItem('userInfo');
        LocalStorage.removeItem('userToken');
        saveAccountInfo(accountInfo);
        setReload(false);
        logoutMetamask();
    };

    updateBalanceTokens = userInfo => {
        const { saveAccountInfo } = this.props;
        saveAccountInfo(userInfo);
    };

    updateBalance = async userInfo => {
        const { web3, tokensAddress } = this.props;
        // if wallet has existed in current account's wallet list, login and get account info
        const defaultAddress = web3.eth.defaultAccount || userInfo.wallets[0].address;
        let accounts = [];
        for (let acc of userInfo.wallets) {
            let address = {
                address: acc.address,
                default: defaultAddress.toLowerCase() === acc.address.toLowerCase(),
                balances: { ETH: 0, BBO: 0, DAI: 0, USDT: 0, USDC: 0 },
            };

            // get eth balance
            await web3.eth.getBalance(acc.address, (err, balance) => {
                const ethBalance = Utils.weiToToken(web3, balance).toFixed(3);
                address.balances.ETH = ethBalance;
            });
            accounts.push(address);
        }
        userInfo.wallets = accounts;
        // get tokens balance
        contractApis.getBalanceToken(tokensAddress, userInfo, this.updateBalanceTokens);
    };

    accountsInit = async (account, network) => {
        const { web3, setAccount, setNetwork } = this.props;
        const userInfo = LocalStorage.getItemJson('userInfo');
        if (userInfo) {
            const isHaveAddress = userInfo.wallets.filter(addr => addr.address === web3.eth.defaultAccount);
            if (isHaveAddress.length > 0) {
                this.updateBalance(userInfo);
                setAccount(account);
                setNetwork(network);
                this.getNetwork();
            } else {
                // if wallet has not existed in current account's wallet list, logout current account
                this.logout();
            }
        } else {
            this.logout();
        }
    };

    checkMetamask = async () => {
        const { isConnected, defaultAccount, history, setCheckAcount, checkAccount, setRegister, setReload, getTokensAddress } = this.props;
        const { web3 } = this.state;
        if (isConnected) {
            getTokensAddress();
            const userToken = LocalStorage.getItemJson('userToken');
            if (userToken) {
                if (userToken.expired <= Date.now()) {
                    services.refreshToken();
                }
            } else {
                this.logout();
            }
            if (!checkAccount) {
                return;
            }
            try {
                const { account, network } = await Utils.connectMetaMask(web3);
                if (account) {
                    if (defaultAccount !== account) {
                        this.accountsInit(account, network);
                        if (defaultAccount) {
                            setReload(true);
                        }
                    } else {
                        const userInfo = LocalStorage.getItemJson('userInfo');
                        if (userInfo) {
                            this.updateBalance(userInfo);
                        }
                        setReload(false);
                    }
                }
            } catch (error) {
                this.logout();
                setCheckAcount(false);
            }
        } else {
            if (web3.eth.defaultAccount === undefined) {
                setRegister(false);
            }
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
                    <div className="main-container">
                        <Helmet titleTemplate="%s - Bigbom Marketplace" defaultTitle="Bigbom Marketplace">
                            <meta name="description" content="Bigbom Marketplace" />
                        </Helmet>
                        <Header history={history} />
                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route path="/withraw" component={WithrawToken} />
                            {routes.length && routes.map((route, key) => <Route key={key} {...route} />)}
                            <Route component={NotFound} />
                        </Switch>
                        <Footer />
                    </div>
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
    setAccount: PropTypes.func.isRequired,
    logoutMetamask: PropTypes.func.isRequired,
    setCheckAcount: PropTypes.func.isRequired,
    setNetwork: PropTypes.func.isRequired,
    setYourNetwork: PropTypes.func.isRequired,
    setReload: PropTypes.func.isRequired,
    checkAccount: PropTypes.bool.isRequired,
    saveAccountInfo: PropTypes.func.isRequired,
    accountInfo: PropTypes.object.isRequired,
    setRegister: PropTypes.func.isRequired,
    getTokensAddress: PropTypes.func.isRequired,
    tokensAddress: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.HomeReducer.web3,
        isConnected: state.HomeReducer.isConnected,
        defaultAccount: state.HomeReducer.defaultAccount,
        checkAccount: state.HomeReducer.checkAccount,
        accountInfo: state.CommonReducer.accountInfo,
        tokensAddress: state.CommonReducer.tokensAddress,
    };
};

const mapDispatchToProps = {
    loginMetamask,
    setWeb3,
    logoutMetamask,
    setCheckAcount,
    setNetwork,
    setAccount,
    setYourNetwork,
    setReload,
    saveAccountInfo,
    setRegister,
    getTokensAddress,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Routers);
