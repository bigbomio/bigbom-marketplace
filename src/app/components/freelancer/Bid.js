import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { setBid } from './actions';
import Utils from '../../_utils/utils';

class Bid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jobData: this.props.jobData,
            checkedBid: false,
            time: 0,
            award: 0,
        };
        this.setBid = this.props.setBid;
    }

    validate = (val, field) => {
        const { jobData } = this.state;
        const avg = Utils.avgBid(jobData.bid);
        let min = 1;
        let max = jobData.estimatedTime; // need set to totaltime of job jobData.totalTime
        if (field === 'time') {
            if (val < min) {
                this.setState({ timeErr: 'Please enter your estimated time at least 1 hour' });
                return false;
            } else if (val > max) {
                this.setState({ timeErr: 'Please do not enter longer job period' });
                return false;
            }
            return true;
        } else if (field === 'award') {
            if (avg) {
                max = Number(jobData.budget.max_sum); // job budget
                min = avg / 2; // 50% of avg bid
            } else {
                max = Number(jobData.budget.max_sum); // job budget
                min = max / 10; // 10% of budget
            }
            if (val < min) {
                if (val <= 0) {
                    this.setState({ awardErr: 'Please enter your bid' });
                    return false;
                } else {
                    this.setState({
                        awardErr: 'You enter your bid too low, your bid may not be accepted by this cause',
                    });
                    return true;
                }
            } else if (val > max) {
                this.setState({ awardErr: 'Please do not enter more than job estimated budget' });
                return false;
            }
            return true;
        }
    };

    inputOnChange = (e, field) => {
        const val = Number(e.target.value);
        if (field === 'time') {
            if (!this.validate(val, 'time')) {
                return;
            }
            this.setBid({ award: this.state.award, time: val });
            this.setState({ time: val, timeErr: null });
        } else if (field === 'award') {
            if (!this.validate(val, 'award')) {
                return;
            }
            this.setBid({ award: val, time: this.state.time });
            this.setState({ award: val, awardErr: null });
        }
    };

    handleClose = () => {
        this.setState({ open: false, checkedBid: false });
    };

    render() {
        const { timeErr, awardErr, jobData, checkedBid } = this.state;
        return (
            <Fade in={checkedBid}>
                <Grid container elevation={4} className={checkedBid ? 'bid-form show-block' : 'bid-form hide'}>
                    <Grid container className="mkp-form-row">
                        <Grid item xs={5} className="mkp-form-row-sub left">
                            <span className="mkp-form-row-label">Time (Hour unit)</span>
                            <span className="mkp-form-row-description">Time to complete this job</span>
                            <input
                                className={timeErr ? 'input-err' : ''}
                                type="number"
                                id="time"
                                name="time"
                                min="1"
                                onChange={e => this.inputOnChange(e, 'time')}
                            />
                            {timeErr && <span className="err">{timeErr}</span>}
                        </Grid>
                        <Grid item xs={4} className="mkp-form-row-sub">
                            <span className="mkp-form-row-label">Award ({jobData.currency.label})</span>
                            <span className="mkp-form-row-description">Your bid for this job</span>
                            <input
                                className={awardErr ? 'input-err' : ''}
                                type="number"
                                id="award"
                                name="award"
                                min="1"
                                onChange={e => this.inputOnChange(e, 'award')}
                            />
                            {awardErr && <span className="err">{awardErr}</span>}
                        </Grid>
                    </Grid>
                    <Grid container className="mkp-form-row">
                        <ButtonBase className="btn btn-normal btn-blue e-left" onClick={() => this.confirmBid()}>
                            <FontAwesomeIcon icon="check" /> Bid
                        </ButtonBase>
                        <ButtonBase className="btn btn-normal btn-red" onClick={() => this.bidSwitched(false)}>
                            <FontAwesomeIcon icon="times" />
                            Cancel
                        </ButtonBase>
                    </Grid>
                </Grid>
            </Fade>
        );
    }
}

Bid.propTypes = {
    jobData: PropTypes.object.isRequired,
    setBid: PropTypes.func.isRequired,
};

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = {
    setBid,
};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Bid)
);
