import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { Link, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Tooltip from '@material-ui/core/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import Jobs from '../../_services/jobData';
import JobDetail from './JobDetail';

const styles = () => ({
    lightTooltip: {
        fontSize: 15,
        maxWidth: 'inherit',
    },
});

class HirerDashboard extends Component {
    state = {
        checkedStarted: true,
        checkedCompleted: true,
        checkedBidding: true,
        checkedExpired: false,
    };
    handleChange = name => event => {
        this.setState({ [name]: event.target.checked });
    };
    render() {
        const { classes, match } = this.props;
        return (
            <div id="hirer" className="container-wrp">
                <div className="container-wrp full-top-wrp">
                    <div className="container wrapper">
                        <Grid container className="main-intro">
                            <Grid item xs={8}>
                                <h1>Your Jobs</h1>
                            </Grid>
                            <Grid item xs={4} className="main-intro-right">
                                <ButtonBase className="btn btn-normal btn-white btn-create">
                                    <FontAwesomeIcon icon="plus" /> Create A New Job
                                </ButtonBase>
                            </Grid>
                        </Grid>
                    </div>
                </div>
                <div className="container-wrp main-ct">
                    <div className="container wrapper">
                        <Grid container className="single-body">
                            {/* <Route
                                path={`${match.url}/:jobId`}
                                render={props => <JobDetail data={Jobs} {...props} />}
                            /> */}
                            <fieldset className="list-filter">
                                <legend>Filter:</legend>
                                <Grid container className="list-filter-body">
                                    <Grid item xs={2}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={this.state.checkedStarted}
                                                    onChange={this.handleChange('checkedStarted')}
                                                    value="checkedStarted"
                                                />
                                            }
                                            label="Started"
                                        />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={this.state.checkedCompleted}
                                                    onChange={this.handleChange('checkedCompleted')}
                                                    value="checkedCompleted"
                                                />
                                            }
                                            label="Completed"
                                        />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={this.state.checkedBidding}
                                                    onChange={this.handleChange('checkedBidding')}
                                                    value="checkedBidding"
                                                />
                                            }
                                            label="Bidding"
                                        />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={this.state.checkedExpired}
                                                    onChange={this.handleChange('checkedExpired')}
                                                    value="checkedExpired"
                                                />
                                            }
                                            label="Expired"
                                        />
                                    </Grid>
                                </Grid>
                            </fieldset>
                            <Grid container className="list-container">
                                <Grid container className="list-header">
                                    <Grid item xs={6}>
                                        Job name
                                    </Grid>
                                    <Grid item xs={2}>
                                        Budget
                                    </Grid>
                                    <Grid item xs={1}>
                                        Bid
                                    </Grid>
                                    <Grid item xs={2}>
                                        Status
                                    </Grid>
                                    <Grid item xs={1}>
                                        Action
                                    </Grid>
                                </Grid>

                                {Jobs.length && (
                                    <Grid container className="list-body">
                                        {Jobs.map(job => {
                                            return (
                                                <Grid key={job.id} container className="list-body-row">
                                                    <Grid item xs={6} className="title">
                                                        <Link to={`${match.url}/${job.id}`}>{job.title}</Link>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <span className="bold">{job.budget}</span>
                                                        {' ' + job.currency}
                                                    </Grid>
                                                    <Grid item xs={1}>
                                                        {job.bid.length}
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
                                )}
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
    match: PropTypes.object.isRequired,
};

export default withStyles(styles)(HirerDashboard);
