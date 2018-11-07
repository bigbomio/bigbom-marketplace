import React, { Component } from 'react';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';

import Utils from '../../_utils/utils';

class Reveal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            voteResult: {},
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.voteResult === prevState.voteResult) {
            return {};
        }
        return { voteResult: nextProps.voteResult };
    }

    componentWillUnmount() {}

    render() {
        const { voteResult } = this.state;
        let clientW = 0;
        let freelancerW = 0;
        if (voteResult.clientVotes > 0) {
            clientW = Utils.toWidth(voteResult.clientVotes, voteResult.freelancerVotes);
        }
        if (voteResult.freelancerVotes > 0) {
            freelancerW = Utils.toWidth(voteResult.freelancerVotes, voteResult.clientVotes);
        }
        const clientWidth = { width: clientW + '%' };
        const freelancerWidth = { width: freelancerW + '%' };
        return (
            <Grid item xs={12} className="voting-options">
                <Grid container className="result-show">
                    <h3>Vote result</h3>
                    <div className="result-bar">
                        {clientW > 0 && (
                            <div className={clientW === 100 ? 'client full' : 'client'} style={clientWidth}>
                                {Number(clientW).toFixed(2)}%
                            </div>
                        )}
                        {freelancerW > 0 && (
                            <div className={freelancerW === 100 ? 'freelancer full' : 'freelancer'} style={freelancerWidth}>
                                {Number(freelancerW).toFixed(2)}%
                            </div>
                        )}
                    </div>
                    <div className="result-bar label">
                        <div className="client" style={clientWidth}>
                            <span className="rec" />
                            Client | <span className="bold">&nbsp; {voteResult.clientVotes} &nbsp;</span> votes
                        </div>
                        <div className="freelancer" style={freelancerWidth}>
                            <span className="rec" />
                            Freelancer | <span className="bold">&nbsp; {voteResult.freelancerVotes} &nbsp;</span> votes
                        </div>
                    </div>
                </Grid>
            </Grid>
        );
    }
}

Reveal.propTypes = {};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
    };
};

const mapDispatchToProps = {};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Reveal)
);
