import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';

import LoginMethods from './loginMethods';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: false,
        };
    }

    componentDidMount() {
        this.setState({ isLogin: true });
    }

    render() {
        const { isLogin } = this.state;
        const { history } = this.props;
        return (
            <div id="home" className="container-wrp">
                <div className="container-wrp home-wrp full-top-wrp">
                    <div className="container wrapper">
                        <LoginMethods history={history} isLogin={isLogin} home={false} />
                    </div>
                </div>
                <div className="container wrapper">
                    <Grid container className="home-content">
                        <Grid container>
                            <h2>Your have disconnected your account!</h2>
                            <p className="note">Please choise a method to Login again</p>
                        </Grid>
                    </Grid>
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    history: PropTypes.object.isRequired,
};

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Login);
