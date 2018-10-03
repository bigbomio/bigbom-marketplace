import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';

import Popper from '../common/Popper';

import { setActionBtnDisabled } from '../common/actions';

class Reasons extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
        };
    }

    handlePopoverOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handlePopoverClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        const { anchorEl } = this.state;
        const isPopperOpen = Boolean(anchorEl);
        return (
            <Grid item xs={12} className="voting-options">
                <Grid container className="voting-options-vote">
                    <Grid item xs={10}>
                        <TextField
                            className="voting-options-vote-input"
                            type="number"
                            required
                            label="Enter the number of votes to commit"
                            defaultValue=""
                        />
                    </Grid>
                    <Grid item xs={2} className="currency">
                        <Popper
                            placement="top"
                            anchorEl={anchorEl}
                            id="mouse-over-popover"
                            onClose={this.handlePopoverClose}
                            disableRestoreFocus
                            open={isPopperOpen}
                            content="text description ...."
                        />
                        BBO
                        <i
                            className="fas fa-info-circle icon-popper-note"
                            aria-owns={isPopperOpen ? 'mouse-over-popover' : null}
                            aria-haspopup="true"
                            onMouseEnter={this.handlePopoverOpen}
                            onMouseLeave={this.handlePopoverClose}
                        />
                    </Grid>
                </Grid>
                <Grid container className="voting-options-secret">
                    Secret phrase: <span className="bold">10238u482</span>
                </Grid>
                <Grid container className="voting-options-mail">
                    <Grid item xs={12}>
                        Your commit is needed to reveal your vote in the <span className="bold">Reveal Stage</span>, we will send to your email a link
                        to do that.
                    </Grid>
                    <Grid item xs={12}>
                        <TextField className="voting-options-vote-input" required label="Your email" defaultValue="" />
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

Reasons.propTypes = {
    setActionBtnDisabled: PropTypes.func.isRequired,
};

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = {
    setActionBtnDisabled,
};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Reasons)
);
