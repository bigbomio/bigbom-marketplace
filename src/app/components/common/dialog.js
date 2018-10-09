import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

class DialogPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    runAction = () => {
        const { actions } = this.props;
        actions();
    };

    handleClose = () => {
        const { actClose } = this.props;
        actClose();
    };

    render() {
        const { dialogLoading, stt, title, actionText, open, content, actionBtnDisabled } = this.props;
        return (
            <Dialog
                open={open}
                onClose={this.handleClose}
                maxWidth="sm"
                fullWidth
                className="dialog"
                disableBackdropClick
                disableEscapeKeyDown
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    {content && <div className="dialog-result">{content}</div>}
                    {dialogLoading ? (
                        <div className="loading">
                            <CircularProgress size={50} color="secondary" />
                            <span>Waiting...</span>
                        </div>
                    ) : (
                        stt.text && (
                            <div className="alert-dialog-description">
                                <div className="dialog-result">
                                    {stt.err ? (
                                        <div className="err">
                                            {stt.text}
                                            {stt.link}
                                        </div>
                                    ) : (
                                        <div className="success">
                                            {stt.text}
                                            {stt.link && <p>View your transaction status {stt.link}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </DialogContent>
                <DialogActions>
                    {!dialogLoading && (
                        <ButtonBase onClick={this.handleClose} className="btn btn-normal btn-default">
                            Close
                        </ButtonBase>
                    )}
                    {actionText && (
                        <ButtonBase onClick={this.runAction} className="btn btn-normal btn-blue" disabled={actionBtnDisabled}>
                            {actionText}
                        </ButtonBase>
                    )}
                </DialogActions>
            </Dialog>
        );
    }
}

DialogPopup.propTypes = {
    dialogLoading: PropTypes.bool.isRequired,
    content: PropTypes.any,
    open: PropTypes.bool.isRequired,
    stt: PropTypes.object.isRequired,
    actions: PropTypes.func,
    title: PropTypes.string,
    actionText: PropTypes.string,
    actClose: PropTypes.func.isRequired,
    actionBtnDisabled: PropTypes.bool.isRequired,
};

DialogPopup.defaultProps = {
    actions: null,
    title: null,
    actionText: null,
    content: null,
};

const mapStateToProps = state => {
    return {
        actionBtnDisabled: state.commonReducer.actionBtnDisabled,
    };
};

const mapDispatchToProps = {};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(DialogPopup)
);
