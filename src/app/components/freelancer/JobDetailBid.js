import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Utils from '../../_utils/utils';

const myAddress = '0xb10ca39DFa4903AE057E8C26E39377cfb4989551';

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
                return (
                    <span className="tag" key={i}>
                        {cate}
                    </span>
                );
            })}
        </div>
    );
};

class JobDetailBid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bidAccepted: false,
            bidStt: false,
        };
    }
    componentDidMount() {
        const { match, data } = this.props;
        const job = data.find(j => j.id === match.params.jobId);
        if (job) {
            if (Utils.getStatusJobOpen(job.bid)) {
                for (let user of job.bid) {
                    if (user.address === myAddress) {
                        return this.setState({ bidAccepted: false, bidStt: true, job: job });
                    } else {
                        return this.setState({ bidAccepted: false, bidStt: false, job: job });
                    }
                }
            } else {
                for (let user of job.bid) {
                    if (user.address === myAddress) {
                        this.setState({ bidAccepted: true, bidStt: true, job: job });
                    }
                }
            }
        }
    }
    getMyBid() {
        const { job } = this.state;
        for (let user of job.bid) {
            if (user.address === myAddress) {
                return (
                    <Grid item className="job-detail-col">
                        <div className="name">Your Bid ({job.currency})</div>
                        <div className="ct">${user.award}</div>
                    </Grid>
                );
            }
        }
        return null;
    }
    actions() {
        const { bidAccepted, bidStt } = this.state;
        if (!bidAccepted) {
            if (bidStt) {
                return (
                    <div className="top-action">
                        <ButtonBase onClick={this.back} className="btn btn-normal btn-default btn-back">
                            <FontAwesomeIcon icon="angle-left" />
                            Back
                        </ButtonBase>
                        <span className="note">
                            <FontAwesomeIcon icon="check-circle" /> <span className="bold">You have bid this job</span>,
                            please waiting acceptance from job owner.
                        </span>
                    </div>
                );
            } else {
                return (
                    <div className="top-action">
                        <ButtonBase onClick={this.back} className="btn btn-normal btn-default btn-back">
                            <FontAwesomeIcon icon="angle-left" />
                            Back
                        </ButtonBase>
                        <ButtonBase className="btn btn-normal btn-green btn-back btn-bid">Bid On This Job</ButtonBase>
                    </div>
                );
            }
        } else {
            return (
                <div className="top-action">
                    <ButtonBase onClick={this.back} className="btn btn-normal btn-default btn-back">
                        <FontAwesomeIcon icon="angle-left" />
                        Back
                    </ButtonBase>
                    <ButtonBase className="btn btn-normal btn-red btn-back btn-bid">Cancel</ButtonBase>
                    <ButtonBase className="btn btn-normal btn-blue btn-back btn-bid">Complete</ButtonBase>
                    <ButtonBase className="btn btn-normal btn-green btn-back btn-bid">Start Job</ButtonBase>
                    <ButtonBase className="btn btn-normal btn-orange btn-back btn-bid">Claim Payment</ButtonBase>
                </div>
            );
        }
    }
    back = () => {
        const { history } = this.props;
        history.goBack();
    };
    createAction = () => {
        const { history } = this.props;
        history.push('/hirer');
    };
    render() {
        const { bidAccepted, job } = this.state;
        let jobData;
        if (job) {
            jobData = (
                <div id="freelancer" className="container-wrp">
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
                                        <FontAwesomeIcon icon="plus" /> Create A Job Like This
                                    </ButtonBase>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                    <div className="container-wrp main-ct">
                        <div className="container wrapper">
                            <Grid container className="single-body">
                                <Grid container>
                                    {this.actions(job)}
                                    <Grid container className="job-detail-row">
                                        <Grid item xs={11}>
                                            <Grid container>
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Bid</div>
                                                    <div className="ct">{job.bid.length}</div>
                                                </Grid>
                                                {this.getMyBid()}
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Avg Bid ({job.currency})</div>
                                                    <div className="ct">${avgBid(job.bid)}</div>
                                                </Grid>
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Job budget ({job.currency})</div>
                                                    <div className="ct">
                                                        ${job.budget.min_sum} - ${job.budget.max_sum}
                                                    </div>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Grid item xs className="job-detail-col status">
                                                <div className="name">Status</div>
                                                <div className="ct">
                                                    {Utils.getStatusJobOpen(job.bid)
                                                        ? 'Bidding'
                                                        : Utils.getStatusJob(job.status)}
                                                </div>
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
                                    {!bidAccepted && (
                                        <Grid container className="freelancer-bidding">
                                            <h2>Freelancer bidding</h2>
                                            <Grid container className="list-container">
                                                <Grid container className="list-header">
                                                    <Grid item xs={8}>
                                                        Bid Address
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        Awarded Bid
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        Time
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
                                                                    <Grid item xs={8} className="title">
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
                                                                </Grid>
                                                            );
                                                        })}
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                </div>
            );
        } else {
            jobData = (
                <div id="freelancer" className="container-wrp">
                    <div className="container-wrp full-top-wrp">
                        <div className="container wrapper">
                            <Grid container className="main-intro">
                                <Grid item xs={8}>
                                    <h1>Sorry. Job does not exist</h1>
                                </Grid>
                                <Grid item xs={4} className="main-intro-right">
                                    <ButtonBase
                                        onClick={this.createAction}
                                        className="btn btn-normal btn-white btn-create"
                                    >
                                        <FontAwesomeIcon icon="plus" /> Create A Job Like This
                                    </ButtonBase>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                    <div className="container-wrp main-ct">
                        <div className="container wrapper">
                            <Grid container className="single-body">
                                <Grid container>
                                    <span> Job not found :( </span>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <Grid container className="job-detail">
                {jobData}
            </Grid>
        );
    }
}

JobDetailBid.propTypes = {
    match: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    history: PropTypes.object.isRequired,
};

export default JobDetailBid;
