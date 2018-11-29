import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import ButtonBase from '@material-ui/core/ButtonBase';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';
import StarRatingComponent from 'react-star-rating-component';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import Loading from './Loading';
import ComponentLoading from './componentLoading';

import abiConfig from '../../_services/abiConfig';
import Utils from '../../_utils/utils';

const ipfs = abiConfig.getIpfs();

class Rating extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rating: 0,
            submitDisabled: true,
            open: false,
            commentPrepare: null,
            rightOfRating: true,
        };
    }

    componentDidMount() {
        this.ratingInit();
    }

    onStarClick = nextValue => {
        if (nextValue < 1) {
            this.setState({ submitDisabled: true });
        } else {
            this.setState({ submitDisabled: false, rating: nextValue });
        }
    };

    ratingInit = async () => {
        const { web3, jobID, ratingOwner, ratingFor } = this.props;
        const ratingID = Utils.makeIdString(7);
        const allow = await abiConfig.checkAllowRating(web3, ratingOwner, ratingFor, jobID);
        this.setState({ rightOfRating: allow, ratingID });
    };

    ratingSubmit = async () => {
        const { jobID, ratingOwner, ratingFor } = this.props;
        const { commentPrepare, rating } = this.state;
        const ratingData = {
            jobID: jobID,
            comment: commentPrepare,
            rating,
            ratingOwner,
            ratingFor,
        };
        this.setState({ isLoading: true });
        if (commentPrepare) {
            ipfs.addJSON(ratingData, (err, commentHash) => {
                if (err) {
                    return console.log(err);
                }
                this.ratingUpdate(commentHash, ratingData);
            });
        } else {
            this.ratingUpdate('', ratingData); // sent review without comment hash
        }
    };

    ratingUpdate = async (commentHash, ratingData) => {
        const { web3 } = this.props;
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBRating');
        const [err, jobTx] = await Utils.callMethod(jobInstance.instance.rate)(
            ratingData.ratingFor,
            ratingData.jobID,
            ratingData.rating,
            commentHash,
            {
                from: jobInstance.defaultAccount,
                gasPrice: +jobInstance.gasPrice.toString(10),
            }
        );
        if (err) {
            this.setState({
                isLoading: false,
                done: true,
                status: { err: true, text: 'Sorry, something went wrong! Can not review now. :(' },
            });
            console.log(err);
        }
        // check event logs
        if (jobTx) {
            abiConfig.transactionWatch(web3, jobTx, () => this.reviewDone());
        }
    };

    reviewDone = () => {
        setTimeout(() => {
            this.setState({ done: true, isLoading: false, status: { err: false, text: 'Done! Thank you for your review! :)' } });
        }, 2000);
    };

    inputOnChange = e => {
        const val = e.target.value;
        if (val.length > 1000) {
            this.setState({ submitDisabled: true, commentErr: 'Please enter your comment most 1000 words' });
            return;
        }
        this.setState({ commentPrepare: val, commentErr: null, submitDisabled: false });
    };

    rateOn = () => {
        this.setState({ open: true, checked: false });
    };

    rateOff = () => {
        this.setState({ open: false });
        this.setState({ commentPrepare: null, commentErr: null, submitDisabled: true, rating: 0, done: false, status: { err: false, text: null } });
    };

    ratingDialogContent = () => {
        const { commentErr, submitDisabled, rating, done, status } = this.state;
        if (!done) {
            return (
                <div className="rating-form">
                    <Grid item xs={12} className="mkp-form-row">
                        <span className="mkp-form-row-description">Tell others what you think about this employer, your recommend and why?</span>
                        <textarea id="comment" rows="4" className={commentErr ? 'input-err' : ''} onChange={e => this.inputOnChange(e)} />
                        {commentErr && <span className="err">{commentErr}</span>}
                    </Grid>
                    <Grid item xs={12} className="mkp-form-row rate-select">
                        <StarRatingComponent
                            name="rate"
                            renderStarIcon={(index, value) => {
                                return (
                                    <span>
                                        <i className={index <= value ? 'fas fa-star' : 'far fa-star'} />
                                    </span>
                                );
                            }}
                            starCount={5}
                            value={rating}
                            onStarClick={this.onStarClick}
                        />
                    </Grid>
                    <div className="rating-submit">
                        <ButtonBase className="btn btn-normal btn-blue" disabled={submitDisabled} onClick={this.ratingSubmit}>
                            Submit
                        </ButtonBase>
                        <ButtonBase className="btn btn-normal btn-default cancel btn-right" onClick={this.rateOff}>
                            Cancel
                        </ButtonBase>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="rating-form">
                    <Grid item xs={12} className="mkp-form-row">
                        {status.err ? (
                            <span className="error">
                                <i className="fas fa-exclamation-triangle" />
                                {status.text}
                            </span>
                        ) : (
                            <span className="success">
                                <i className="fas fa-check-circle" />
                                {status.text}
                            </span>
                        )}
                    </Grid>
                    <div className="rating-submit">
                        <ButtonBase className="btn btn-normal btn-default cancel btn-right" onClick={this.rateOff}>
                            Close
                        </ButtonBase>
                    </div>
                </div>
            );
        }
    };

    ratingDetail = () => {
        const { ratingDatas, ratingFor } = this.props;
        const ratingInfo = ratingDatas.filter(rate => rate.address === ratingFor);
        let charts = [
            { index: 5, width: '0%', count: 0 },
            { index: 4, width: '0%', count: 0 },
            { index: 3, width: '0%', count: 0 },
            { index: 2, width: '0%', count: 0 },
            { index: 1, width: '0%', count: 0 },
        ];
        if (ratingInfo[0].ratingRanks) {
            charts = [
                {
                    index: 5,
                    width: Utils.findPerWidth(ratingInfo[0].ratingRanks['5'], ratingInfo[0].ratingRanks),
                    count: ratingInfo[0].ratingRanks['5'],
                },
                {
                    index: 4,
                    width: Utils.findPerWidth(ratingInfo[0].ratingRanks['4'], ratingInfo[0].ratingRanks),
                    count: ratingInfo[0].ratingRanks['4'],
                },
                {
                    index: 3,
                    width: Utils.findPerWidth(ratingInfo[0].ratingRanks['3'], ratingInfo[0].ratingRanks),
                    count: ratingInfo[0].ratingRanks['3'],
                },
                {
                    index: 2,
                    width: Utils.findPerWidth(ratingInfo[0].ratingRanks['2'], ratingInfo[0].ratingRanks),
                    count: ratingInfo[0].ratingRanks['2'],
                },
                {
                    index: 1,
                    width: Utils.findPerWidth(ratingInfo[0].ratingRanks['1'], ratingInfo[0].ratingRanks),
                    count: ratingInfo[0].ratingRanks['1'],
                },
            ];
        }

        const { rightOfRating, ratingID } = this.state;

        if (ratingInfo.length > 0) {
            return (
                <div id={ratingID} className="rating-detail hidden" onMouseLeave={this.viewRatingOff}>
                    <div className="left">
                        <div className="avg-detail">{ratingInfo[0].avgRating}</div>
                        <div className="star">
                            <StarRatingComponent
                                name="detail"
                                starColor="#ffb400"
                                emptyStarColor="#ffb400"
                                value={Number(ratingInfo[0].avgRating)}
                                editing={false}
                                renderStarIcon={(index, value) => {
                                    return (
                                        <span>
                                            <i className={index <= value ? 'fas fa-star' : 'far fa-star'} />
                                        </span>
                                    );
                                }}
                                renderStarIconHalf={() => {
                                    return (
                                        <span>
                                            <span style={{ position: 'absolute' }}>
                                                <i className="far fa-star" />
                                            </span>
                                            <span>
                                                <i className="fas fa-star-half" />
                                            </span>
                                        </span>
                                    );
                                }}
                            />
                        </div>
                        <div className="total">
                            {ratingInfo[0].totalRating}
                            {ratingInfo[0].totalRating > 1 ? ' Reviews' : ' Review'}
                        </div>
                        <ButtonBase onClick={this.rateOn} disabled={!rightOfRating}>
                            Write a Review
                        </ButtonBase>
                    </div>
                    <div className="right">
                        {charts.map(chart => {
                            return (
                                <div className="row" title={chart.count} key={chart.index}>
                                    <div className="numRate">{chart.index}</div>
                                    <div className="chart">
                                        <div className={'widthRate widthRate-' + chart.index} style={{ width: chart.width }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="fix-top" />
                </div>
            );
        } else {
            return <ComponentLoading />;
        }
    };

    viewRatingOn = () => {
        const { ratingID } = this.state;
        const rating = document.getElementById(ratingID);
        rating.classList.add('visible');
        rating.classList.remove('hidden');
        this.setState({ checked: true });
    };

    viewRatingOff = () => {
        const { ratingID } = this.state;
        const rating = document.getElementById(ratingID);
        rating.classList.add('hidden');
        rating.classList.remove('visible');
        this.setState({ checked: false });
    };

    render() {
        const { ratingDatas, ratingFor } = this.props;
        const ratingInfo = ratingDatas.filter(rate => rate.address === ratingFor);
        const { checked, open, isLoading } = this.state;
        if (ratingInfo.length > 0) {
            return (
                <div className="rating" onMouseEnter={this.viewRatingOn} onMouseLeave={this.viewRatingOff}>
                    <div className="fix-hover" />
                    <Dialog open={open} onClose={this.handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                        <DialogTitle id="alert-dialog-title">Your review</DialogTitle>
                        <DialogContent className="rating-dialog-ct">{isLoading ? <Loading /> : this.ratingDialogContent()}</DialogContent>
                    </Dialog>
                    <span className="avg">{ratingInfo[0].avgRating}</span>
                    <StarRatingComponent
                        name="main"
                        starColor="#ffb400"
                        emptyStarColor="#ffb400"
                        value={Number(ratingInfo[0].avgRating)}
                        editing={false}
                        renderStarIcon={(index, value) => {
                            return (
                                <span>
                                    <i className={index <= value ? 'fas fa-star' : 'far fa-star'} />
                                </span>
                            );
                        }}
                        renderStarIconHalf={() => {
                            return (
                                <span>
                                    <span style={{ position: 'absolute' }}>
                                        <i className="far fa-star" />
                                    </span>
                                    <span>
                                        <i className="fas fa-star-half" />
                                    </span>
                                </span>
                            );
                        }}
                    />
                    <span className="total">
                        {ratingInfo[0].totalRating}
                        {ratingInfo[0].totalRating > 1 ? ' Reviews' : ' Review'}
                    </span>
                    <Fade in={checked}>{this.ratingDetail()}</Fade>
                </div>
            );
        } else {
            return <ComponentLoading />;
        }
    }
}

Rating.propTypes = {
    web3: PropTypes.object.isRequired,
    jobID: PropTypes.string.isRequired,
    ratingOwner: PropTypes.string.isRequired,
    ratingFor: PropTypes.string.isRequired,
    ratingDatas: PropTypes.array,
};

Rating.defaultProps = {
    ratingDatas: [],
};

const mapStateToProps = state => {
    return {
        web3: state.HomeReducer.web3,
        ratingDatas: state.RatingReducer.ratingDatas,
    };
};

const mapDispatchToProps = {};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Rating)
);
