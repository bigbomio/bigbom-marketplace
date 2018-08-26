import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CircularProgress from '@material-ui/core/CircularProgress';

import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';
import Countdown from '../common/countdown';
import DialogPopup from '../common/dialog';

function avgBid(bids) {
    let total = 0;
    for (let b of bids) {
        total += b.award;
    }
    if (!Number.isInteger(total / bids.length)) {
        return (total / bids.length).toFixed(2);
    }
    return total / bids.length;
}

const skillShow = jobSkills => {
    return (
        <div className="skill">
            <span className="bold">Skill required</span>
            {jobSkills.map((skill, i) => {
                return (
                    <span className="tag" key={i}>
                        {skill.label}
                    </span>
                );
            })}
        </div>
    );
};

class JobDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            stt: { err: false, text: null },
            actStt: { err: false, text: null },
            dialogLoading: false,
            open: false,
        };
    }

    componentDidMount() {
        const { isConnected } = this.props;
        const { isLoading } = this.state;
        if (isConnected) {
            if (!isLoading) {
                this.jobDataInit();
            }
        }
    }

    jobDataInit = async () => {
        const { match, web3 } = this.props;
        const jobHash = match.params.jobId;
        this.setState({ isLoading: true, jobHash });
        // get job status
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const [err, jobStatusLog] = await Utils.callMethod(jobInstance.instance.getJob)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            return console.log(err);
        } else {
            // [owner, expired, budget, cancel, status, freelancer]
            if (jobStatusLog[0] !== web3.eth.defaultAccount) {
                this.setState({
                    stt: { err: true, text: 'You are not permission to view this page' },
                    isLoading: false,
                });
                return;
            }
            const jobStatus = {
                started: Number(jobStatusLog[4].toString()) === 1,
                completed: Number(jobStatusLog[4].toString()) === 2,
                claimed: Number(jobStatusLog[4].toString()) === 5,
                reject: Number(jobStatusLog[4].toString()) === 4,
                paymentAccepted: Number(jobStatusLog[4].toString()) === 9,
                canceled: jobStatusLog[3],
                bidAccepted: jobStatusLog[5] !== '0x0000000000000000000000000000000000000000',
                bidding: jobStatusLog[5] === '0x0000000000000000000000000000000000000000',
                expired: Number(jobStatusLog[1].toString()) <= Math.floor(Date.now() / 1000) ? true : false,
            };
            // get detail from ipfs
            const URl = abiConfig.getIpfsLink() + jobHash;
            const jobTpl = {
                id: jobHash,
                owner: jobStatusLog[0],
                jobHash: jobHash,
                status: jobStatus,
                bid: [],
            };
            fetch(URl)
                .then(res => res.json())
                .then(
                    result => {
                        jobTpl.title = result.title;
                        jobTpl.skills = result.skills;
                        jobTpl.description = result.description;
                        jobTpl.currency = result.currency;
                        jobTpl.budget = result.budget;
                        jobTpl.category = result.category;
                        jobTpl.estimatedTime = result.estimatedTime;
                        jobTpl.expiredTime = result.expiredTime;
                        this.BidCreatedInit(jobTpl);
                    },
                    error => {
                        console.log(error);
                        jobTpl.err = 'Can not fetch data from server';
                        this.BidCreatedInit(jobTpl);
                    }
                );
        }
    };

    BidCreatedInit = async job => {
        const { web3 } = this.props;
        abiConfig.getPastEventsMerge(web3, 'BBFreelancerBid', 'BidCreated', { jobHash: web3.sha3(job.jobHash) }, job, this.BidAcceptedInit);
    };

    BidAcceptedInit = async jobData => {
        const { web3 } = this.props;
        abiConfig.getPastEventsBidAccepted(
            web3,
            'BBFreelancerBid',
            'BidAccepted',
            { jobHash: web3.sha3(jobData.data.jobHash) },
            jobData.data,
            this.JobsInit
        );
    };

    JobsInit = jobData => {
        this.setState({ jobData: jobData.data, isLoading: false });
    };

    back = () => {
        const { history } = this.props;
        history.goBack();
    };

    createAction = () => {
        const { history } = this.props;
        history.push('/hirer');
    };

    acceptBid = async () => {
        const { jobHash, bidAddress } = this.state;
        const { web3 } = this.props;
        const BidInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerBid');
        const [errAccept, jobLogAccept] = await Utils.callMethod(BidInstance.instance.acceptBid)(jobHash, bidAddress, {
            from: BidInstance.defaultAccount,
            gasPrice: +BidInstance.gasPrice.toString(10),
        });
        this.setState({ dialogLoading: true });
        if (errAccept) {
            this.setState({
                isLoading: false,
                acceptDone: false,
                dialogLoading: false,
                actStt: { err: true, text: 'Can not accept bid! :(' },
            });
            console.log('errAccept', errAccept);
            return;
        }
        console.log('jobLogAccept: ', jobLogAccept);
        this.setState({
            isLoading: false,
            actStt: { err: false, text: 'Your job has been accepted!' },
            acceptDone: true,
            dialogLoading: false,
        });
    };

    confirmAccept = bidAddress => {
        this.setState({ open: true, bidAddress: bidAddress });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    actionsRender = freelancer => {
        const { acceptDone, jobData } = this.state;
        if (jobData.status.bidAccepted) {
            if (jobData.status.completed) {
                return (
                    <ButtonBase aria-label="Cancel" className="btn btn-small btn-blue">
                        <FontAwesomeIcon icon="check" /> Payment
                    </ButtonBase>
                );
            }
            return (
                <ButtonBase aria-label="Cancel" className="btn btn-small btn-blue" disabled>
                    <FontAwesomeIcon icon="check" /> Accepted
                </ButtonBase>
            );
        } else {
            return (
                <ButtonBase
                    aria-label="Cancel"
                    className="btn btn-small btn-blue"
                    onClick={() => this.confirmAccept(freelancer.address)}
                    disabled={acceptDone}
                >
                    <FontAwesomeIcon icon="check" /> Accept
                </ButtonBase>
            );
        }
    };

    render() {
        const { jobData, isLoading, stt, dialogLoading, open, actStt } = this.state;
        let jobTplRender;
        if (!isLoading) {
            if (stt.err) {
                jobTplRender = () => <h2> Sorry. {stt.text} </h2>;
            } else {
                if (jobData) {
                    jobTplRender = () => {
                        return (
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
                                                    <div className="ct">{jobData.bid.length}</div>
                                                </Grid>
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Avg Bid ({jobData.currency.label})</div>
                                                    <div className="ct">${jobData.bid.length > 0 ? avgBid(jobData.bid) : 'NaN'}</div>
                                                </Grid>
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Job budget ({jobData.currency.label})</div>
                                                    <div className="ct">${jobData.budget.max_sum}</div>
                                                </Grid>
                                                <Grid item className="job-detail-col">
                                                    <div className="name">Estimate time</div>
                                                    <div className="ct">
                                                        {jobData.estimatedTime < 24
                                                            ? jobData.estimatedTime + ' H'
                                                            : Number.isInteger(jobData.estimatedTime / 24)
                                                                ? jobData.estimatedTime / 24 + ' Days'
                                                                : (jobData.estimatedTime / 24).toFixed(2) + ' Days'}
                                                    </div>
                                                </Grid>
                                                <Countdown expiredTime={jobData.expiredTime} />
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Grid item xs className="job-detail-col status">
                                                <div className="name">Status</div>
                                                <div className="ct">{Utils.getStatusJob(jobData.status)}</div>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid container className="job-detail-description">
                                        <Grid item xs={12} className="name">
                                            Job description
                                        </Grid>
                                        <Grid item xs={12} className="ct">
                                            {jobData.description}
                                            {skillShow(jobData.skills)}
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
                                            {jobData.bid.length > 0 ? (
                                                <Grid container className="list-body">
                                                    {jobData.bid.map(freelancer => {
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
                                                                    &nbsp;
                                                                    {jobData.currency.label}
                                                                </Grid>

                                                                <Grid item xs={2}>
                                                                    {freelancer.timeDone <= 24
                                                                        ? freelancer.timeDone + ' H'
                                                                        : Number.isInteger(freelancer.timeDone / 24)
                                                                            ? freelancer.timeDone / 24 + ' Days'
                                                                            : (freelancer.timeDone / 24).toFixed(2) + ' Days'}
                                                                </Grid>
                                                                <Grid item xs={2} className="action">
                                                                    {this.actionsRender(freelancer)}
                                                                </Grid>
                                                            </Grid>
                                                        );
                                                    })}
                                                </Grid>
                                            ) : (
                                                <Grid container className="list-body no-data">
                                                    This job have no anyone bid yet
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        );
                    };
                } else {
                    jobTplRender = () => <h2> Sorry. Job does not exist </h2>;
                }
            }
        } else {
            return (
                <Grid container className="single-body">
                    <div className="loading">
                        <CircularProgress size={50} color="secondary" />
                        <span>Loading...</span>
                    </div>
                </Grid>
            );
        }
        return (
            <Grid container className="job-detail">
                <DialogPopup
                    dialogLoading={dialogLoading}
                    open={open}
                    stt={actStt}
                    actions={this.acceptBid}
                    title="Do you want to accept bid?"
                    actionText="Accept"
                    actClose={this.handleClose}
                />
                <div id="hirer" className="container-wrp">
                    <div className="container-wrp full-top-wrp">
                        <div className="container wrapper">
                            <Grid container className="main-intro">
                                <Grid item xs={8}>
                                    {jobData && <h1>{jobData.title}</h1>}
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
                        <div className="container wrapper">{jobTplRender()}</div>
                    </div>
                </div>
            </Grid>
        );
    }
}

JobDetail.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    web3: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
    };
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(JobDetail);
