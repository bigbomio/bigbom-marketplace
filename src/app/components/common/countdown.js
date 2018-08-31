import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

let countdown;

class Countdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            countDown: { expired: false, days: 0, hours: 0, minutes: 0, seconds: 0 },
        };
    }

    componentDidMount() {
        this.bidDuration();
    }

    componentWillUnmount() {
        clearInterval(countdown);
    }

    bidDuration = () => {
        const { expiredTime } = this.props;
        let countDownDate = new Date(expiredTime).getTime();
        countdown = setInterval(() => {
            const now = new Date().getTime();
            const distance = countDownDate - now;
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            if (distance < 0) {
                clearInterval(countdown);
                this.setState({ countDown: { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 } });
            } else {
                this.setState({ countDown: { expired: false, days, hours, minutes, seconds } });
            }
        }, 1000);
    };

    render() {
        const { countDown } = this.state;

        return (
            <Grid item className="job-detail-col">
                <div className="name">Bid duration</div>
                <div className="ct">
                    {countDown.expired ? (
                        'Expired'
                    ) : (
                        <span>
                            {countDown.days +
                                'd ' +
                                countDown.hours +
                                'h ' +
                                countDown.minutes +
                                'm ' +
                                countDown.seconds +
                                's '}
                        </span>
                    )}
                </div>
            </Grid>
        );
    }
}

Countdown.propTypes = {
    expiredTime: PropTypes.string.isRequired,
};

export default Countdown;
