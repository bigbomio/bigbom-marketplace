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
    bidAction = () => {
        const { history } = this.props;
        history.push('/freelancer');
    };
    handleChange = name => event => {
        this.setState({ [name]: event.target.checked });
    };
    handleChangeCategory = selectedOption => {
        this.setState({ selectedCategory: selectedOption });
    };
    render() {
        const myAddress = '0xb10ca39DFa4903AE057E8C26E39377cfb4989551';
        const { selectedCategory } = this.state;
        const categories = settingsApi.getCategories();
        let jobs = [];
        Jobs.map(job => {
            for (let user of job.bid) {
                if (user.address === myAddress) {
                    jobs.push(job);
                }
            }
            return jobs;
        });
        return (
            <div id="hirer" className="container-wrp">
                <div className="container-wrp full-top-wrp">
                    <div className="container wrapper">
                        <Grid container className="main-intro">
                            <Grid item xs={8}>
                                <h1>Your Bid</h1>
                            </Grid>
                            <Grid item xs={4} className="main-intro-right">
                                <ButtonBase onClick={this.bidAction} className="btn btn-normal btn-white btn-create">
                                    <FontAwesomeIcon icon="plus" /> Bid A New Job
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
                                    <Grid item xs={4}>
                                        Job name
                                    </Grid>
                                    <Grid item xs={2}>
                                        Budget
                                    </Grid>
                                    <Grid item xs={2}>
                                        Award Bid
                                    </Grid>
                                    <Grid item xs={2}>
                                        Status
                                    </Grid>
                                    <Grid item xs={2}>
                                        Action
                                    </Grid>
                                </Grid>

                                {jobs.length ? (
                                    <Grid container className="list-body">
                                        {jobs.map(job => {
                                            return (
                                                <Grid key={job.id} container className="list-body-row">
                                                    <Grid item xs={4} className="title">
                                                        <Link to={`jobs/${job.id}`}>{job.title}</Link>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <span className="bold">{job.budget}</span>
                                                        {' ' + job.currency}
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        {job.awardBid}
                                                        {' ' + job.currency}
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
                                ) : (
                                    <Grid container className="list-body">
                                        <div className="no-content">
                                            You have not bid any job yet :(
                                            <p>
                                                <Link to="/freelancer">Find a job</Link>
                                            </p>
                                        </div>
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
    history: PropTypes.object.isRequired,
};

export default HirerDashboard;
