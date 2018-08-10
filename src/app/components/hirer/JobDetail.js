import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
    back = () => {
        const { history } = this.props;
        history.goBack();
    };
    createAction = () => {
        const { history } = this.props;
        history.push('/hirer');
    };
    render() {
        const { match, data } = this.props;
        const job = data.find(j => j.id === match.params.jobId);
        let jobData;

        if (job)
            jobData = (
                <div id="hirer" className="container-wrp">
                    <div className="container-wrp full-top-wrp">
                        <div className="container wrapper">
                            <Grid container className="main-intro">
                                <Grid item xs={8}>
                                    <h1>{job.title}</h1>
                                </Grid>
                                <Grid item xs={4} className="main-intro-right">
                                    <ButtonBase
                                        onClick={this.createAction}
                                        className="btn btn-normal btn-white btn-create"
                                    >
                                        <FontAwesomeIcon icon="plus" /> Create A New Job
                                    </ButtonBase>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                    <div className="container-wrp main-ct">
                        <div className="container wrapper">
                            <Grid container className="single-body">
                                <Grid container>
                                    <ButtonBase onClick={this.back} className="btn btn-normal btn-default btn-back">
                                        <FontAwesomeIcon icon="angle-left" />
                                        View all Job
                                    </ButtonBase>
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
                                                            <Grid
                                                                key={freelancer.address}
                                                                container
                                                                className="list-body-row"
                                                            >
                                                                <Grid item xs={6} className="title">
                                                                    <span className="avatar">
                                                                        <FontAwesomeIcon icon="user-circle" />
                                                                    </span>
                                                                    {freelancer.address}
                                                                </Grid>
                                                                <Grid item xs={2}>
                                                                    <span className="bold">
                                                                        {freelancer.award + ' '}
                                                                    </span>
                                                                    {job.currency}
                                                                </Grid>

                                                                <Grid item xs={2}>
                                                                    {freelancer.time}
                                                                </Grid>
                                                                <Grid item xs={2} className="action">
                                                                    <ButtonBase
                                                                        aria-label="Cancel"
                                                                        className="btn btn-small btn-green"
                                                                    >
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
                            </Grid>
                        </div>
                    </div>
                </div>
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
    data: PropTypes.array.isRequired,
    history: PropTypes.object.isRequired,
};

export default JobDetail;
