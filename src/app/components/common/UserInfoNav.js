import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';

import Utils from '../../_utils/utils';

class UserInfoNav extends Component {
    state = {};

    componentDidMount() {}

    render() {
        const { isConnected, yourNetwork, defaultAccount } = this.props;
        return (
            isConnected && (
                <Grid container className="account-info">
                    <Grid title="Click to copy" item xs={7} className="account-info-item" onClick={() => Utils.copyStringToClipboard(defaultAccount)}>
                        <div>Default Address</div>
                        {Utils.truncate(defaultAccount, 22)}
                    </Grid>
                    <Grid item xs={5} className="account-info-item right">
                        <div>Your Network</div>
                        <span>{yourNetwork.name}</span>
                    </Grid>
                </Grid>
            )
        );
    }
}

UserInfoNav.propTypes = {
    isConnected: PropTypes.bool.isRequired,
    yourNetwork: PropTypes.object.isRequired,
    defaultAccount: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
    return {
        isConnected: state.homeReducer.isConnected,
        web3: state.homeReducer.web3,
        yourNetwork: state.CommonReducer.yourNetwork,
        defaultAccount: state.homeReducer.defaultAccount,
    };
};

const mapDispatchToProps = {};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(UserInfoNav)
);
