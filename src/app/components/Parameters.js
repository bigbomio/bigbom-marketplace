import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import parmeters from '../_services/parmeters';

import Utils from '../_utils/utils';
import abiConfig from '../_services/abiConfig';
import Loading from '../components/common/Loading';

class Parameters extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bbparams: null,
        };
    }
    componentDidMount() {
        this.getParamValue();
    }
    getParamValue = async () => {
        const { web3 } = this.props;
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBParams');
        const [, votingParamsSource] = await Utils.callMethod(ctInstance.instance.getVotingParams)();
        const [, freelancerParams] = await Utils.callMethod(ctInstance.instance.getFreelancerParams)();
        const minVotes = Utils.currencyFormat(Utils.WeiToBBO(web3, votingParamsSource[0].toString()));
        const maxVotes = Utils.currencyFormat(Utils.WeiToBBO(web3, votingParamsSource[1].toString()));
        const stakeDeposit = Utils.currencyFormat(Utils.WeiToBBO(web3, votingParamsSource[2].toString()));
        const evidenceDuration = Utils.secondsToHours(votingParamsSource[3].toString());
        const commitDuration = Utils.secondsToHours(votingParamsSource[4].toString());
        const revealDuration = Utils.secondsToHours(votingParamsSource[5].toString());
        const bboRewards = Utils.currencyFormat(Utils.WeiToBBO(web3, votingParamsSource[6].toString()));
        const paymentLimitTimestamp = Utils.secondsToHours(freelancerParams[0].toString());
        const rejectedPaymentLimitTimestamp = Utils.secondsToHours(freelancerParams[1].toString());
        const bbparams = {
            minVotes: minVotes + ' BBO',
            maxVotes: maxVotes + ' BBO',
            stakeDeposit: stakeDeposit + ' BBO',
            evidenceDuration: evidenceDuration > 1 ? evidenceDuration + ' Hours' : evidenceDuration + ' Hour',
            commitDuration: commitDuration > 1 ? commitDuration + ' Hours' : commitDuration + ' Hour',
            revealDuration: revealDuration > 1 ? revealDuration + ' Hours' : revealDuration + ' Hour',
            bboRewards: bboRewards + ' BBO',
            paymentLimitTimestamp: paymentLimitTimestamp > 1 ? paymentLimitTimestamp + ' Hours' : paymentLimitTimestamp + ' Hour',
            rejectedPaymentLimitTimestamp:
                rejectedPaymentLimitTimestamp > 1 ? rejectedPaymentLimitTimestamp + ' Hours' : rejectedPaymentLimitTimestamp + ' Hour',
        };
        this.setState({ bbparams });
    };
    back = () => {
        const { history } = this.props;
        history.goBack();
    };
    render() {
        const { bbparams } = this.state;
        return (
            <div id="main" className="container-wrp">
                <Grid container className="job-detail">
                    <div className="container-wrp">
                        <div className="container-wrp full-top-wrp">
                            <div className="container wrapper">
                                <Grid container className="main-intro">
                                    <Grid item xs={8}>
                                        <h1>Marketplace&#39;s parameters</h1>
                                    </Grid>
                                </Grid>
                            </div>
                        </div>
                        <div className="container-wrp main-ct">
                            <div className="container wrapper">
                                <Grid container className="single-body">
                                    {bbparams ? (
                                        <Grid container>
                                            <div className="top-action">
                                                <ButtonBase onClick={this.back} className="btn btn-normal btn-default btn-back e-left">
                                                    <i className="fas fa-angle-left" />
                                                    Back
                                                </ButtonBase>
                                            </div>
                                            {parmeters.map((params, key) => {
                                                return (
                                                    <Grid key={key} container className="bb-parameters">
                                                        <Grid container className="type">
                                                            {params.type}
                                                        </Grid>
                                                        <Grid container className="header">
                                                            <Grid item xs={3}>
                                                                Name
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                Description
                                                            </Grid>
                                                            <Grid item xs={2}>
                                                                Value
                                                            </Grid>
                                                            <Grid item xs={3}>
                                                                RealParams
                                                            </Grid>
                                                        </Grid>
                                                        {params.parameters.map((param, keyParam) => {
                                                            return (
                                                                <Grid key={keyParam} container className="row">
                                                                    <Grid item xs={3} className="name">
                                                                        {param.name}
                                                                    </Grid>
                                                                    <Grid item xs={4} className="description">
                                                                        {param.description}
                                                                    </Grid>
                                                                    <Grid item xs={2} className="value">
                                                                        <span>{bbparams[param.realParams]}</span>
                                                                    </Grid>
                                                                    <Grid item xs={3} className="real-params">
                                                                        {param.realParams}
                                                                    </Grid>
                                                                </Grid>
                                                            );
                                                        })}
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    ) : (
                                        <Loading />
                                    )}
                                </Grid>
                            </div>
                        </div>
                    </div>
                </Grid>
            </div>
        );
    }
}

Parameters.propTypes = {
    history: PropTypes.object.isRequired,
    web3: PropTypes.object.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
    };
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Parameters);
