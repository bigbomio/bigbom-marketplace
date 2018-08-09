import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Tooltip from '@material-ui/core/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Utils from '../../_utils/utils';

const styles = () => ({
    lightTooltip: {
        fontSize: 15,
        maxWidth: 'inherit',
    },
});

const jobs = [
    {
        id: 'wwkrjhfs',
        title: 'Design some banner ad',
        freelancer: '0xb10ca39DFa4903AE057E8C26E39377cfb4989551',
        awardedBid: '200',
        currency: 'USD',
        time: '10 days',
        status: 'started',
    },
    {
        id: 'wwkjh3fs',
        title: 'Design some banner ad 2',
        freelancer: '0xb10ca39DFa4903AE057E8C26E39377cfb4989551',
        awardedBid: '200',
        currency: 'USD',
        time: '10 days',
        status: 'completed',
    },
    {
        id: 'wwkjhfs3',
        title: 'Design some banner ad 3',
        freelancer: '0xb10ca39DFa4903AE057E8C26E39377cfb4989551',
        awardedBid: '200',
        currency: 'USD',
        time: '10 days',
        status: 'bidding',
    },
    {
        id: 'wwkjhfsh3',
        title: 'Design some banner ad 5',
        freelancer: '0xb10ca39DFa4903AE057E8C26E39377cfb4989551',
        awardedBid: '200',
        currency: 'USD',
        time: '10 days',
        status: 'bidding',
    },
];

class HirerDashboard extends Component {
    render() {
        const { classes } = this.props;
        return (
            <div className="container-wrp">
                <div className="container-wrp full-top-wrp">
                    <div className="container wrapper">
                        <Grid container className="main-intro">
                            <Grid item xs={8}>
                                <h1>Your Jobs</h1>
                            </Grid>
                            <Grid item xs={4} className="main-intro-right">
                                <ButtonBase className="btn btn-normal btn-white">+ Create A New Job</ButtonBase>
                            </Grid>
                        </Grid>
                    </div>
                </div>
                <div className="container-wrp main-ct">
                    <div className="container wrapper">
                        <Grid container className="single-body">
                            <Grid container className="list-filter">
                                Filter
                            </Grid>
                            <Grid container className="list-container">
                                <Grid container className="list-header">
                                    <Grid item xs={3}>
                                        Job name
                                    </Grid>
                                    <Grid item xs={2}>
                                        Freelancer
                                    </Grid>
                                    <Grid item xs={2}>
                                        Awarded Bid
                                    </Grid>
                                    <Grid item xs={2}>
                                        Time
                                    </Grid>
                                    <Grid item xs={2}>
                                        Status
                                    </Grid>
                                    <Grid item xs={1}>
                                        Action
                                    </Grid>
                                </Grid>
                                <Grid container className="list-body">
                                    {jobs.map(job => {
                                        return (
                                            <Grid key={job.id} container className="list-body-row">
                                                <Grid item xs={3} className="title">
                                                    <a href="/">{job.title}</a>
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <Tooltip
                                                        title={job.freelancer}
                                                        classes={{
                                                            tooltip: classes.lightTooltip,
                                                            popper: classes.arrowPopper,
                                                        }}
                                                    >
                                                        <span aria-label={job.freelancer}>
                                                            {Utils.truncate(job.freelancer, 19)}
                                                        </span>
                                                    </Tooltip>
                                                </Grid>
                                                <Grid item xs={2}>
                                                    {job.awardedBid} {job.currency}
                                                </Grid>
                                                <Grid item xs={2}>
                                                    {job.time}
                                                </Grid>
                                                <Grid item xs={2}>
                                                    {job.status}
                                                </Grid>
                                                <Grid item xs={1} className="action">
                                                    <Tooltip
                                                        title="Cancel"
                                                        classes={{
                                                            tooltip: classes.lightTooltip,
                                                            popper: classes.arrowPopper,
                                                        }}
                                                    >
                                                        <ButtonBase aria-label="Cancel" className="cancel">
                                                            <FontAwesomeIcon icon="minus-circle" />
                                                        </ButtonBase>
                                                    </Tooltip>
                                                </Grid>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </div>
        );
    }
}
HirerDashboard.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HirerDashboard);
