import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';

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
            <Grid container className="job-item-list">
                {disputes.length > 0 &&
                    disputes.map((dispute, i) => {
                        const maxLength = 400; // max length characters show on description
                        const description =
                            dispute.jobDispute.description.length > maxLength
                                ? dispute.jobDispute.description.slice(0, maxLength) + '...'
                                : dispute.jobDispute.description;
                        return (
                            <Link to={'voter/disputes/' + Utils.toAscii(dispute.jobHash)} key={i} className="job-item">
                                <Grid item xs={12}>
                                    <Grid container className="header">
                                        <Grid item xs={9} className="title">
                                            {dispute.jobDispute.title}
                                        </Grid>
                                        <Grid item xs={3} className="budget">
                                            <Countdown name="Voting duration" expiredTime={dispute.commitDuration} />
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} className="content">
                                        <Grid item xs={12} className="description">
                                            {description}
                                        </Grid>
                                        <Grid item xs={12} className="status">
                                            <span className="status stt-date-time">{' - Created: ' + Utils.convertDateTime(dispute.created)}</span>
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
