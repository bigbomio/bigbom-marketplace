import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';

class CircleProgress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            completed: 0,
        };
        this.mounted = false;
    }

    componentDidMount() {
        this.timer = setInterval(this.progress, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    progress = () => {
        const { completed } = this.state;
        const { callback } = this.props;
        if (completed >= 100) {
            callback();
            this.setState({ completed: 0 });
        } else {
            this.setState({ completed: completed >= 100 ? 0 : completed + 100 / (60 * 2) }); // each 2 minutes that reload data
        }
    };

    render() {
        return <CircularProgress variant="static" value={this.state.completed} />;
    }
}

CircleProgress.propTypes = {
    callback: PropTypes.func.isRequired,
};

export default CircleProgress;
