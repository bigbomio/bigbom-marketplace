import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import { ButtonBase } from '@material-ui/core';

import Utils from '../../_utils/utils';
import Countdown from '../common/countdown';

class DisputesRendeManage extends Component {
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
        return { disputes: nextProps.disputes, finalDisputes: nextProps.finalDisputes };
    }

    render() {
        const { disputes, finalDisputes } = this.state;
        return (
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
                {disputes.length > 0 &&
                    disputes.map((dispute, i) => {
                        return (
                            <Link to={'disputes/' + dispute.jobHash} key={i} className="job-item">
                                <Grid item xs={12}>
                                    <Grid container className="header">
                                        <Grid item xs={6} className="title">
                                            <p>{dispute.jobDispute.title}</p>
                                            <span>{'Created: ' + Utils.convertDateTime(dispute.created)}</span>
                                        </Grid>
                                        <Grid item xs={3} className="status">
                                            {dispute.commitEndDate > Date.now() ? (
                                                <span>{dispute.evidenceEndDate > Date.now() ? 'Evidence' : 'Commit vote'}</span>
                                            ) : finalDisputes[dispute.jobHash] ? (
                                                <span>Finalized</span>
                                            ) : (
                                                <span>Reveal vote</span>
                                            )}
                                        </Grid>
                                        {dispute.commitEndDate > Date.now() ? (
                                            <Grid item xs={3} className="commit-duration">
                                                <Countdown expiredTime={dispute.commitEndDate} />
                                                <Grid className="vote-btn">
                                                    <ButtonBase className="btn btn-normal btn-green">Vote</ButtonBase>
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <Grid
                                                item
                                                xs={3}
                                                className={
                                                    dispute.revealEndDate > Date.now()
                                                        ? 'commit-duration orange'
                                                        : !finalDisputes[dispute.jobHash]
                                                            ? 'commit-duration gray'
                                                            : 'commit-duration blue'
                                                }
                                            >
                                                <Countdown expiredTime={dispute.revealEndDate} />
                                                <Grid className="vote-btn">
                                                    <ButtonBase className="btn btn-normal btn-green">Reveal</ButtonBase>
                                                </Grid>
                                            </Grid>
                                        )}
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
)(DisputesRendeManage);
