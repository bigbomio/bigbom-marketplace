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
        return disputes.length > 0 ? (
            <Grid container className="job-item-list dispute-list">
                <Grid container className="dispute-list-header">
                    <Grid item xs={6}>
                        Job title
                    </Grid>
                    <Grid item xs={3} className="status">
                        Stage
                    </Grid>
                    <Grid item xs={3} className="time">
                        Remain time
                    </Grid>
                </Grid>
                {disputes.map((dispute, i) => {
                    return (
                        <Link to={'voter/disputes/' + dispute.jobID} key={i} className="job-item">
                            <Grid item xs={12}>
                                <Grid container className="header">
                                    <Grid item xs={6} className="title">
                                        <p>{dispute.jobDispute.title}</p>
                                        <span>{'Created: ' + Utils.convertDateTime(dispute.created)}</span>
                                    </Grid>
                                    <Grid item xs={3} className="status">
                                        <span>{dispute.evidenceEndDate > Date.now() ? 'Evidence' : 'Commit vote'}</span>
                                    </Grid>
                                    <Grid item xs={3} className="commit-duration">
                                        {dispute.evidenceEndDate > Date.now() ? (
                                            <Countdown expiredTime={dispute.evidenceEndDate} />
                                        ) : (
                                            <Countdown expiredTime={dispute.commitEndDate} />
                                        )}
                                        <Grid className="vote-btn">
                                            <ButtonBase className="btn btn-normal btn-green" disabled={dispute.evidenceEndDate > Date.now()}>
                                                Vote
                                            </ButtonBase>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Link>
                    );
                })}
            </Grid>
        ) : (
            <Grid container className="job-item-list dispute-list">
                <Grid container className="no-data">
                    Have no any dispute to show.
                </Grid>
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
