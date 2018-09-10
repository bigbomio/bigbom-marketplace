import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';
import { setBalances } from './actions';

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
    state = {
        yourNetwork: '',
        balances: {
            ETH: 0,
            BBO: 0,
        },
    };

    componentDidMount() {
        const { isConnected } = this.props;
        if (isConnected) {
            this.getNetwork();
            this.getBalance();
        }
    }

    getNetwork = async () => {
        const { web3 } = this.props;
        let [err, netId] = await Utils.callMethod(web3.version.getNetwork)();
        if (!err) {
            const yourNetwork = Utils.getNetwork(netId);
            this.setState({ yourNetwork });
        }
    };

    getBalance = async () => {
        const { web3, setBalances } = this.props;
        let balances = {
            ETH: 0,
            BBO: 0,
        };
        web3.eth.getBalance(web3.eth.defaultAccount, (err, balance) => {
            const ethBalance = Utils.WeiToBBO(web3, balance).toFixed(3);
            balances.ETH = ethBalance;
            //console.log(ethBalance, 'ETH');
        });

        const BBOinstance = await abiConfig.contractInstanceGenerator(web3, 'BigbomTokenExtended');
        const [errBalance, balance] = await Utils.callMethod(BBOinstance.instance.balanceOf)(BBOinstance.defaultAccount, {
            from: BBOinstance.defaultAccount,
            gasPrice: +BBOinstance.gasPrice.toString(10),
        });

        if (!errBalance) {
            const BBOBalance = Utils.WeiToBBO(web3, balance).toFixed(3);
            balances.BBO = BBOBalance;
            //console.log(BBOBalance, 'BBO');
        }
        this.setState({ balances });
        setBalances(balances);
    };

    render() {
        const { defaultAccount, isConnected, classes } = this.props;
        const { yourNetwork, balances } = this.state;
        return (
            isConnected && (
                <Grid container className="account-info">
                    <Grid item xs={3} className="account-info-item" aria-label={defaultAccount}>
                        <div>Your Balance</div>
                        {Utils.currencyFormat(balances.BBO)} BBO
                    </Grid>
                    <Tooltip title={defaultAccount} classes={{ tooltip: classes.lightTooltip, popper: classes.arrowPopper }}>
                        <Grid item xs={6} className="account-info-item" aria-label={defaultAccount}>
                            <div>Your Wallet Address</div>
                            {Utils.truncate(defaultAccount, 26)}
                        </Grid>
                    </Tooltip>
                    <Grid item xs={3} className="account-info-item right">
                        <div>Your Network</div>
                        <span>{yourNetwork}</span>
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
    web3: PropTypes.object.isRequired,
    setBalances: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        defaultAccount: state.homeReducer.defaultAccount,
        isConnected: state.homeReducer.isConnected,
        web3: state.homeReducer.web3,
    };
};

const mapDispatchToProps = {
    setBalances,
};

export default withStyles(styles)(
    withRouter(
        connect(
            mapStateToProps,
            mapDispatchToProps
        )(UserInfoNav)
    )
);
