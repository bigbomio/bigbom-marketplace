import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';

class CircleProgress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            completed: 0,
        };
    }

    componentDidMount() {
        this.timer = setInterval(this.progress, 1000);
        this.mounted = true;
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.mounted = false;
    }

    progress = () => {
        const { completed } = this.state;
        const { callback } = this.props;
        if (this.mounted) {
            if (completed >= 100) {
                callback();
                this.setState({ completed: 0 });
            } else {
                this.setState({ completed: completed >= 100 ? 0 : completed + 100 / (60 * 2) }); // each 2 minutes that reload data
            }
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
