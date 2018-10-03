import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import { ButtonBase } from '@material-ui/core';

import Utils from '../../_utils/utils';
import Countdown from '../common/countdown';

class DisputesRender extends Component {
    constructor(props) {
        super(props);
        this.state = {
            disputes: [],
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.disputes === prevState.disputes) {
            return null;
        }
        return { disputes: nextProps.disputes };
    }

    render() {
        const { disputes } = this.state;
        return (
            <Grid container className="job-item-list dispute-list">
                {disputes.length > 0 &&
                    disputes.map((dispute, i) => {
                        return (
                            <Link to={'voter/disputes/' + dispute.jobHash} key={i} className="job-item">
                                <Grid item xs={12}>
                                    <Grid container className="header">
                                        <Grid item xs={9} className="title">
                                            <p>{dispute.jobDispute.title}</p>
                                            <span>{'Created: ' + Utils.convertDateTime(dispute.created)}</span>
                                        </Grid>
                                        <Grid item xs={3} className="commit-duration">
                                            <Countdown expiredTime={dispute.commitDuration} />
                                            <Grid className="vote-btn">
                                                <ButtonBase className="btn btn-normal btn-green">Vote</ButtonBase>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Link>
                        );
                    })}
            </Grid>
        );
    }
}

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DisputesRender);
