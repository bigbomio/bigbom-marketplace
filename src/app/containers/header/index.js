import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import ButtonBase from '@material-ui/core/ButtonBase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@material-ui/core/Avatar';
import Fade from '@material-ui/core/Fade';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import Utils from '../../_utils/utils';
import LocalStorage from '../../_utils/localStorage';
import RoutersAuthen from '../../routers/RoutersAuthen';

import { logoutMetamask } from '../../components/home/actions';
import { setRegister, saveAccountInfo } from '../../actions/commonActions';

const options = [
    { text: 'View as Client', icon: 'fas fa-user-tie' },
    { text: 'View as Freelancer', icon: 'fas fa-user' },
    { text: 'View as Voter', icon: 'fas fa-users' },
];

class Header extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            routes: RoutersAuthen,
            anchorEl: null,
            selectedIndex: Utils.getCookie('view') !== '' ? 0 : Utils.getCookie('view'),
            checked: false,
        };
    }

    componentDidMount() {
        this.getAvatarClass();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.view === prevState.selectedIndex) {
            return null;
        }
        Utils.setCookie('view', nextProps.view, 30);
        return { selectedIndex: nextProps.view, web3: nextProps.web3 };
    }

    getBBO = () => {
        window.open('https://bigbomio.github.io/bbo-faucet-testnet/', '_blank');
    };

    getNameAvatar = () => {
        const { accountInfo } = this.props;
        if (accountInfo) {
            return accountInfo.firstName.charAt(0).toUpperCase();
        }
        return null;
    };

    getAvatarClass = () => {
        this.setState({ avatarColor: Utils.getCookie('avatar') ? Utils.getCookie('avatar') : 'red' });
    };

    login = () => {
        const { history } = this.props;
        history.push('/');
    };

    handleClickListView = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleMenuItemSelect = (event, index) => {
        const { history } = this.props;
        this.setState({ selectedIndex: index, anchorEl: null });
        switch (index) {
            case 0:
                history.push('/client');
                break;
            case 1:
                history.push('/freelancer');
                break;
            case 2:
                history.push('/voter');
                break;
            default:
                history.push('/client');
        }
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    handleClickAway = () => {
        const userMenu = document.getElementById('user-info');
        userMenu.classList.add('hide');
        userMenu.classList.remove('show');
        this.setState({
            checked: false,
        });
    };

    profileOpen = () => {
        const userMenu = document.getElementById('user-info');
        userMenu.classList.add('show');
        userMenu.classList.remove('hide');
        this.setState(state => ({ checked: !state.checked }));
    };

    logout = () => {
        const { logoutMetamask, saveAccountInfo } = this.props;
        const accountInfo = {
            email: '',
            firstName: '',
            lastName: '',
            wallets: [],
        };
        logoutMetamask();
        LocalStorage.removeItem('userInfo');
        LocalStorage.removeItem('userToken');
        saveAccountInfo(accountInfo);
    };

    withraw = () => {
        const { history } = this.props;
        history.push('/withraw');
    };

    render() {
        const { routes, anchorEl, avatarColor, checked } = this.state;
        const { setRegister, accountInfo, isConnected } = this.props;
        let defaultWallet;
        if (accountInfo.wallets.length > 0) {
            defaultWallet = accountInfo.wallets.filter(wallet => wallet.default);
        }
        return (
            <div id="header" className="container-wrp">
                <div className="container">
                    <header>
                        <div className="logo">
                            <Link to="/">
                                <img src="/images/logo_alpha.svg" alt="" />
                            </Link>
                        </div>
                        {routes.length && (
                            <ul className={accountInfo.wallets.length > 0 ? 'nav' : 'nav not-login-yet'}>
                                <li>
                                    <List component="nav" className="top-selection">
                                        <ListItem
                                            className="select-item"
                                            button
                                            aria-haspopup="true"
                                            aria-controls="as-menu"
                                            onClick={this.handleClickListView}
                                        >
                                            <ListItemText className="select-item-text" secondary={options[this.state.selectedIndex].text} />
                                            <i className="fas fa-angle-down icon" />
                                        </ListItem>
                                    </List>
                                    <Menu id="as-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
                                        {options.map((option, index) => (
                                            <MenuItem
                                                key={index}
                                                selected={index === this.state.selectedIndex}
                                                onClick={event => this.handleMenuItemSelect(event, index)}
                                            >
                                                <ListItemIcon>
                                                    <i className={option.icon + ' icon'} />
                                                </ListItemIcon>
                                                {option.text}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </li>
                                <li>
                                    <ButtonBase variant="contained" className="btn btn-normal btn-green get-bbo-btn" onClick={() => this.getBBO()}>
                                        Get Free BBO
                                    </ButtonBase>
                                </li>
                                {accountInfo.wallets.length > 0 ? (
                                    <ClickAwayListener onClickAway={this.handleClickAway}>
                                        <li className="profile">
                                            <div id="avatar-custom" className={'avatar ' + avatarColor} onClick={this.profileOpen}>
                                                {this.getNameAvatar()}
                                            </div>
                                            <Fade in={checked}>
                                                <div className="user-info" id="user-info">
                                                    <ul>
                                                        <li className="user-info-item top">
                                                            <Avatar className={'avatar avatar-left ' + avatarColor}>{this.getNameAvatar()}</Avatar>
                                                            {accountInfo && (
                                                                <div className="avatar-right">
                                                                    <div>
                                                                        {accountInfo.firstName} {accountInfo.lastName}
                                                                    </div>
                                                                    <div className="email">{accountInfo.email}</div>
                                                                </div>
                                                            )}
                                                        </li>
                                                        {defaultWallet && (
                                                            <li className="user-info-item balance">
                                                                {Utils.currencyFormat(defaultWallet[0].balances.ETH)} <span>ETH</span>
                                                            </li>
                                                        )}

                                                        {defaultWallet && (
                                                            <li className="user-info-item balance">
                                                                {Utils.currencyFormat(defaultWallet[0].balances.BBO)} <span>BBO</span>
                                                            </li>
                                                        )}
                                                        <li className="user-info-item addresses">
                                                            {accountInfo.wallets.map(wallet => {
                                                                return (
                                                                    <div className="address-item" key={wallet.address}>
                                                                        <div
                                                                            title="Click to copy"
                                                                            className={wallet.default ? 'address selected' : 'address'}
                                                                            onClick={() => Utils.copyStringToClipboard(wallet.address)}
                                                                        >
                                                                            {Utils.truncate(wallet.address, 23)}
                                                                        </div>
                                                                        {wallet.default && <span className="default">Default</span>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </li>
                                                        <li className="logout">
                                                            <span onClick={this.withraw} className="withraw">
                                                                Withdraw voting rights
                                                            </span>
                                                            <span onClick={this.logout} className="right">
                                                                Logout
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </Fade>
                                        </li>
                                    </ClickAwayListener>
                                ) : isConnected ? null : (
                                    <li>
                                        <ButtonBase
                                            variant="contained"
                                            className="btn btn-normal btn-white get-bbo-btn top-login"
                                            onClick={() => setRegister(false)}
                                        >
                                            Login
                                        </ButtonBase>
                                    </li>
                                )}
                            </ul>
                        )}
                    </header>
                </div>
            </div>
        );
    }
}

Header.propTypes = {
    history: PropTypes.object.isRequired,
    accountInfo: PropTypes.object.isRequired,
    setRegister: PropTypes.func.isRequired,
    logoutMetamask: PropTypes.func.isRequired,
    saveAccountInfo: PropTypes.func.isRequired,
    isConnected: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
    return {
        isConnected: state.homeReducer.isConnected,
        web3: state.homeReducer.web3,
        view: state.CommonReducer.view,
        accountInfo: state.CommonReducer.accountInfo,
    };
};

const mapDispatchToProps = {
    setRegister,
    logoutMetamask,
    saveAccountInfo,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
