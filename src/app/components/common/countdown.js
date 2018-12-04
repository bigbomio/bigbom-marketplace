import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

import { setReload } from '../../actions/commonActions';

let countdown;

class Countdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countDown: { exprired: false, days: 0, hours: 0, minutes: 0, seconds: 0 },
            expiredTime: 0,
        };
        this.mounted = false;
    }

    componentDidMount() {
        const { setReload } = this.props;
        this.bidDuration();
        this.mounted = true;
        setReload(false);
    }

    componentWillUnmount() {
        clearInterval(countdown);
        this.mounted = false;
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.expiredTime === prevState.expiredTime) {
            return null;
        }
        return { expiredTime: nextProps.expiredTime };
    }

    bidDuration = () => {
        const { isSecond, reload, setReload } = this.props;
        countdown = setInterval(() => {
            const { expiredTime } = this.state;
            let time = expiredTime;

            // countdown from second unit
            if (isSecond) {
                time = Math.floor(new Date().getTime() + Number(expiredTime) * 1000);
            }
            let countDownDate = new Date(time).getTime();
            const now = new Date().getTime();
            const distance = countDownDate - now;
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            if (this.mounted) {
                if (distance <= 0) {
                    this.setState({ countDown: { exprired: true, days: 0, hours: 0, minutes: 0, seconds: 0 } });
                    setReload(reload);
                    setTimeout(() => {
                        clearInterval(countdown);
                    }, 1000);
                } else {
                    this.setState({ countDown: { exprired: false, days, hours, minutes, seconds } });
                }
            }
        }, 1000);
    };

    render() {
        const { countDown } = this.state;
        const { name } = this.props;
        if (countDown) {
            return (
                <Grid item className="job-detail-col">
                    {name && <div className="name">{name}</div>}
                    <div className="ct">
                        {countDown.exprired ? (
                            'Expired'
                        ) : (
                            <span>{countDown.days + 'd ' + countDown.hours + 'h ' + countDown.minutes + 'm ' + countDown.seconds + 's '}</span>
                        )}
                    </div>
                </Grid>
            );
        } else {
            return null;
        }
    }
}

Countdown.propTypes = {
    name: PropTypes.string,
    isSecond: PropTypes.bool,
    reload: PropTypes.bool,
    setReload: PropTypes.func.isRequired,
};

Countdown.defaultProps = {
    name: null,
    isSecond: false,
    reload: false,
};

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = {
    setReload,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Countdown);
