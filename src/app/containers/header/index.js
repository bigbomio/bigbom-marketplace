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

import Utils from '../../_utils/utils';

import RoutersAuthen from '../../routers/RoutersAuthen';

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
        };
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

    login = () => {
        const { history } = this.props;
        history.push('/login');
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

    render() {
        const { routes, anchorEl } = this.state;
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
};

const mapStateToProps = state => {
    return { isConnected: state.homeReducer.isConnected, view: state.commonReducer.view };
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
