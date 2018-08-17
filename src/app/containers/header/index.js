import React, { PureComponent } from 'react';
import { Route, Link } from 'react-router-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import ButtonBase from '@material-ui/core/ButtonBase';

import RoutersAuthen from '../../routers/RoutersAuthen';

class Header extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            routes: RoutersAuthen,
        };
    }

    login = () => {
        const { history } = this.props;
        history.push('/login');
    };

    render() {
        const { routes } = this.state;
        const { isConnected } = this.props;
        return (
            <div id="header" className="container-wrp">
                <div className="container">
                    <header>
                        <div className="logo">
                            <Link to="/">
                                <img src="/images/logo.png" alt="" />
                            </Link>
                        </div>
                        {routes.length && (
                            <ul className="nav">
                                {routes.map((route, key) => {
                                    return (
                                        <Route key={key} path={route.path} exact={route.exact}>
                                            {({ match }) => {
                                                return (
                                                    <li className={match ? 'active' : null}>
                                                        <Link to={route.path}>{route.title}</Link>
                                                    </li>
                                                );
                                            }}
                                        </Route>
                                    );
                                })}
                                {!isConnected && (
                                    <li>
                                        <ButtonBase
                                            variant="contained"
                                            className="btn btn-normal btn-green"
                                            onClick={() => this.login()}
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
    isConnected: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
    return { isConnected: state.homeReducer.isConnected };
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
