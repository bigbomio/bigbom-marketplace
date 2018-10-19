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

import RoutersAuthen from '../../routers/RoutersAuthen';
import abiConfig from '../../_services/abiConfig';
import { saveAccounts } from '../../components/common/actions';

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
        return { selectedIndex: nextProps.view };
    }

    getBBO = () => {
        window.open('https://faucet.ropsten.bigbom.net/', '_blank');
    };

    getNameAvatar = () => {
        const name = 'Hieu';
        return name.charAt(0);
    };

    getAvatarClass = () => {
        this.setState({ avatarColor: Utils.getCookie('avatar') });
    };

    login = () => {
        const { history } = this.props;
        history.push('/');
    };

    accountsInit = async defaultWallet => {
        const { saveAccounts, web3 } = this.props;
        Utils.accountsInit(web3, saveAccounts, abiConfig, defaultWallet);
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
        this.setState({
            checked: false,
        });
    };

    profileOpen = () => {
        this.setState(state => ({ checked: !state.checked }));
    };

    render() {
        const { routes, anchorEl, avatarColor, checked } = this.state;
        const { accounts, defaultWallet } = this.props;

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
                            <ul className="nav">
                                {/* {!isConnected && (
                                    <li>
                                        <ButtonBase variant="contained" className="btn btn-normal btn-green" onClick={() => this.login()}>
                                            Login
                                        </ButtonBase>
                                    </li>
                                )} */}
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
                                    <ButtonBase variant="contained" className="btn btn-normal btn-green" onClick={() => this.getBBO()}>
                                        Get Free BBO
                                    </ButtonBase>
                                </li>
                                <ClickAwayListener onClickAway={this.handleClickAway}>
                                    <li className="profile">
                                        <Avatar className={'avatar ' + avatarColor} onClick={this.profileOpen}>
                                            {this.getNameAvatar()}
                                        </Avatar>
                                        <Fade in={checked}>
                                            <div className="user-info">
                                                <ul>
                                                    <li className="user-info-item top">
                                                        <Avatar className={'avatar avatar-left ' + avatarColor}>{this.getNameAvatar()}</Avatar>
                                                        <div className="avatar-right">
                                                            <div>Hieu Huynh</div>
                                                            <div className="email">Hieu102@gmail.com</div>
                                                        </div>
                                                    </li>
                                                    {defaultWallet && (
                                                        <li className="user-info-item balance">
                                                            {Utils.currencyFormat(defaultWallet.balances.ETH)} <span>ETH</span>
                                                        </li>
                                                    )}

                                                    {defaultWallet && (
                                                        <li className="user-info-item balance">
                                                            {Utils.currencyFormat(defaultWallet.balances.BBO)} <span>BBO</span>
                                                        </li>
                                                    )}
                                                    <li className="user-info-item addresses">
                                                        {accounts &&
                                                            accounts.map(wallet => {
                                                                return (
                                                                    <div className="address-item" key={wallet.address}>
                                                                        <div className={wallet.default ? 'address selected' : 'address'}>
                                                                            {Utils.truncate(wallet.address, 18)}
                                                                        </div>
                                                                        {wallet.default ? (
                                                                            <span className="default">Default</span>
                                                                        ) : (
                                                                            <span
                                                                                className="set-default"
                                                                                onClick={() => this.accountsInit(wallet.address)}
                                                                            >
                                                                                Set default
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                    </li>
                                                </ul>
                                            </div>
                                        </Fade>
                                    </li>
                                </ClickAwayListener>
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
    accounts: PropTypes.array.isRequired,
    defaultWallet: PropTypes.object,
    saveAccounts: PropTypes.func.isRequired,
};

Header.defaultProps = {
    defaultWallet: { address: '', default: true, balances: { ETH: 0, BBO: 0 } },
};

const mapStateToProps = state => {
    return {
        isConnected: state.homeReducer.isConnected,
        web3: state.homeReducer.web3,
        view: state.commonReducer.view,
        accounts: state.commonReducer.accounts,
        defaultWallet: state.commonReducer.defaultWallet,
    };
};

const mapDispatchToProps = { saveAccounts };

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
