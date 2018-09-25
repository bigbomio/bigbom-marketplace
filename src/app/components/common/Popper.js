import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';

class DialogPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { placement, open, anchorEl, content } = this.props;
        return (
            <Popper className="popper" open={open} anchorEl={anchorEl} placement={placement} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Paper className="popper-ct">{content}</Paper>
                    </Fade>
                )}
            </Popper>
        );
    }
}

DialogPopup.propTypes = {
    content: PropTypes.any,
    open: PropTypes.bool.isRequired,
    anchorEl: PropTypes.any,
    placement: PropTypes.any,
};

DialogPopup.defaultProps = {
    anchorEl: null,
    content: null,
    placement: null,
};

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = {};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(DialogPopup)
);
