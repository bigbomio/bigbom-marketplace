import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Select from 'react-select';

import Utils from '../../_utils/utils';

import settingsApi from '../../_services/settingsApi';
import Jobs from '../../_services/jobData';

class HirerDashboard extends Component {
    state = {
        checkedStarted: true,
        checkedCompleted: true,
        checkedBidding: true,
        checkedExpired: false,
    };
    createAction = () => {
        const { history } = this.props;
        history.push('/hirer');
    };
    handleChange = name => event => {
        this.setState({ [name]: event.target.checked });
    };
    handleChangeCategory = selectedOption => {
        this.setState({ selectedCategory: selectedOption });
    };
    render() {
        const { match } = this.props;
        const { selectedCategory } = this.state;
        const categories = settingsApi.getCategories();
        return (
            <div id="hirer" className="container-wrp">
                <div className="container-wrp full-top-wrp">
                    <div className="container wrapper">
                        <Grid container className="main-intro">
                            <Grid item xs={8}>
                                <h1>Your Jobs</h1>
                            </Grid>
                            <Grid item xs={4} className="main-intro-right">
                                <ButtonBase onClick={this.createAction} className="btn btn-normal btn-white btn-create">
                                    <FontAwesomeIcon icon="plus" /> Create A New Job
                                </ButtonBase>
                            </Grid>
                        </Grid>
                    </div>
                </div>
                <div className="container-wrp main-ct">
                    <div className="container wrapper">
                        <Grid container className="single-body">
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
                                    <Grid item xs={4}>
                                        <Select
                                            value={selectedCategory}
                                            onChange={this.handleChangeCategory}
                                            options={categories}
                                            isMulti
                                            placeholder="Select category..."
                                        />
                                    </Grid>
                                </Grid>
                            </fieldset>
                            <Grid container className="list-container">
                                <Grid container className="list-header">
                                    <Grid item xs={5}>
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
                                    <Grid item xs={2}>
                                        Action
                                    </Grid>
                                </Grid>

                                {Jobs.length && (
                                    <Grid container className="list-body">
                                        {Jobs.map(job => {
                                            return (
                                                <Grid key={job.id} container className="list-body-row">
                                                    <Grid item xs={5} className="title">
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
                                                        {Utils.getStatusJobOpen(job.bid)
                                                            ? 'Bidding'
                                                            : Utils.getStatusJob(job.status)}
                                                    </Grid>
                                                    <Grid item xs={2} className="action">
                                                        <ButtonBase
                                                            aria-label="Cancel"
                                                            className="btn btn-small btn-red"
                                                        >
                                                            <FontAwesomeIcon icon="minus-circle" />
                                                            Cancel
                                                        </ButtonBase>
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
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default HirerDashboard;
