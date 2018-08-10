import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Jobs from '../../_services/jobData';

function avgBid(bids) {
    let total = 0;
    for (let b of bids) {
        total += b.award;
    }
    return (total / bids.length).toFixed(2);
}

const skillShow = job => {
    return (
        <div className="skill">
            <span className="bold">Skill required</span>
            {job.category.map((cate, i) => {
                return <span key={i}>{cate}</span>;
            })}
        </div>
    );
};

class JobDetail extends Component {
    render() {
        const { match } = this.props;
        const job = Jobs.find(j => j.id === match.params.jobId);
        console.log(match);
        let jobData;

        if (job)
            jobData = (
                <Grid container>
                    <h2> {job.title} </h2>
                    <Grid container className="job-detail-row">
                        <Grid item xs={11}>
                            <Grid container>
                                <Grid item className="job-detail-col">
                                    <div className="name">Bid</div>
                                    <div className="ct">{job.bid.length}</div>
                                </Grid>
                                <Grid item className="job-detail-col">
                                    <div className="name">Avg Bid ({job.currency})</div>
                                    <div className="ct">${avgBid(job.bid)}</div>
                                </Grid>
                                <Grid item className="job-detail-col">
                                    <div className="name">Job budget ({job.currency})</div>
                                    <div className="ct">${job.budget}</div>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={1}>
                            <Grid item xs className="job-detail-col status">
                                <div className="name">Status</div>
                                <div className="ct">{job.status}</div>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container className="job-detail-description">
                        <Grid item xs={12} className="name">
                            Job description
                        </Grid>
                        <Grid item xs={12} className="ct">
                            {job.description}
                            {skillShow(job)}
                        </Grid>
                    </Grid>
                    <Grid container className="freelancer-bidding">
                        <h2>Freelancer bidding</h2>
                        <Grid container className="list-container">
                            <Grid container className="list-header">
                                <Grid item xs={6}>
                                    Bid Address
                                </Grid>
                                <Grid item xs={2}>
                                    Awarded Bid
                                </Grid>
                                <Grid item xs={2}>
                                    Time
                                </Grid>
                                <Grid item xs={2}>
                                    Action
                                </Grid>
                            </Grid>
                            {job.bid.length && (
                                <Grid container className="list-body">
                                    {job.bid.map(freelancer => {
                                        return (
                                            <Grid key={freelancer.address} container className="list-body-row">
                                                <Grid item xs={6} className="title">
                                                    <span className="avatar">
                                                        <FontAwesomeIcon icon="user-circle" />
                                                    </span>
                                                    {freelancer.address}
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <span className="bold">{freelancer.award + ' '}</span>
                                                    {job.currency}
                                                </Grid>

                                                <Grid item xs={2}>
                                                    {freelancer.time}
                                                </Grid>
                                                <Grid item xs={2} className="action">
                                                    <ButtonBase aria-label="Cancel" className="btn btn-small btn-green">
                                                        Accept Bid
                                                    </ButtonBase>
                                                </Grid>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            );
        else jobData = <h2> Sorry. Job does not exist </h2>;
        return (
            <Grid container className="job-detail">
                {jobData}
            </Grid>
        );
    }
}

JobDetail.propTypes = {
    match: PropTypes.object.isRequired,
};

export default JobDetail;
