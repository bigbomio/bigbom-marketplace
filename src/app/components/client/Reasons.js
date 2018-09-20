import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { setReason } from './actions';
import { setActionBtnDisabled } from '../common/actions';
import reasons from '../../_services/reasons';

class Reasons extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rejectReasonSelected: 0,
            anchorEl: null,
        };
    }

    handleClickListReason = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleMenuReasonSelect = (event, index) => {
        const { setReason, setActionBtnDisabled } = this.props;
        this.setState({ rejectReasonSelected: index, anchorEl: null });
        setReason(index - 1);
        setActionBtnDisabled(false);
    };

    handleCloseReasonList = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        const { anchorEl } = this.state;
        return (
            <div className="reason-menu">
                <h3>Why do you reject payment? </h3>
                <List component="nav" className="top-selection">
                    <ListItem className="select-item" button aria-haspopup="true" aria-controls="reason-menu" onClick={this.handleClickListReason}>
                        <ListItemText className="select-item-text" secondary={reasons[this.state.rejectReasonSelected].text} />
                        <FontAwesomeIcon className="icon" icon="angle-down" />
                    </ListItem>
                </List>
                <Menu id="reason-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleCloseReasonList}>
                    {reasons.map((reason, index) => (
                        <MenuItem
                            key={index}
                            disabled={index === 0}
                            selected={index === this.state.rejectReasonSelected}
                            onClick={event => this.handleMenuReasonSelect(event, index)}
                            className="reason-item"
                        >
                            <ListItemIcon>
                                <FontAwesomeIcon className="icon" icon={reason.icon} />
                            </ListItemIcon>
                            {reason.text}
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        );
    }
}

Reasons.propTypes = {
    setReason: PropTypes.func.isRequired,
    setActionBtnDisabled: PropTypes.func.isRequired,
};

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = {
    setReason,
    setActionBtnDisabled,
};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Reasons)
);
