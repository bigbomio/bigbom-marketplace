import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

class CommonLoading extends Component {
    render() {
        const { size } = this.props;
        return (
            <div className="component-loading">
                <CircularProgress size={size} color="secondary" />
                <div className="loading-text blink-text">Loading...</div>
            </div>
        );
    }
}

CommonLoading.propTypes = {
    size: PropTypes.number,
};

CommonLoading.defaultProps = {
    size: 20,
};

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = {};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(CommonLoading)
);
