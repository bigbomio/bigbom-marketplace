import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

import Utils from '../../_utils/utils';

const styles = theme => ({
    lightTooltip: {
        background: theme.palette.common.white,
        color: '#555',
        boxShadow: theme.shadows[1],
        fontSize: 15,
        maxWidth: 'inherit',
    },
});

class UserInfoNav extends Component {
    state = {};

    componentDidMount() {}

    render() {
        const { defaultAccount, isConnected, classes, yourNetwork } = this.props;
        return (
            isConnected && (
                <Grid container className="account-info">
                    <Tooltip title={defaultAccount} classes={{ tooltip: classes.lightTooltip, popper: classes.arrowPopper }}>
                        <Grid item xs={5} className="account-info-item" aria-label={defaultAccount}>
                            <div>Your Wallet Address</div>
                            {Utils.truncate(defaultAccount, 22)}
                        </Grid>
                    </Tooltip>
                    <Grid item xs={3} className="account-info-item right">
                        <div>Your Network</div>
                        <span>{yourNetwork.name}</span>
                    </Grid>
                </Grid>
            )
        );
    }
}

UserInfoNav.propTypes = {
    defaultAccount: PropTypes.string.isRequired,
    isConnected: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired,
    yourNetwork: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
    return {
        defaultAccount: state.homeReducer.defaultAccount,
        isConnected: state.homeReducer.isConnected,
        web3: state.homeReducer.web3,
        yourNetwork: state.commonReducer.yourNetwork,
    };
};

const mapDispatchToProps = {};

export default withStyles(styles)(
    withRouter(
        connect(
            mapStateToProps,
            mapDispatchToProps
        )(UserInfoNav)
    )
);
