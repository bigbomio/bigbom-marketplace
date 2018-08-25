import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

class DialogPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            actionRun: false,
        };
    }

    runAction = () => {
        const { actions } = this.props;
        this.setState({ actionRun: true });
        actions();
    };

    handleClose = () => {
        const { actClose } = this.props;
        actClose();
    };

    render() {
        const { dialogLoading, stt, title, actionText, open } = this.props;
        const { actionRun } = this.state;
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
                    {dialogLoading ? (
                        <div className="loading">
                            <CircularProgress size={50} color="secondary" />
                            <span>Waiting...</span>
                        </div>
                    ) : (
                        <div className="alert-dialog-description">
                            {stt && (
                                <div className="dialog-result">
                                    {stt.err ? (
                                        <div className="err">{stt.text}</div>
                                    ) : (
                                        <div className="success">{stt.text}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    {!dialogLoading && (
                        <ButtonBase onClick={this.handleClose} className="btn btn-normal btn-default">
                            Close
                        </ButtonBase>
                    )}
                    {actionText && (
                        <ButtonBase onClick={this.runAction} className="btn btn-normal btn-blue" disabled={actionRun}>
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
    open: PropTypes.bool.isRequired,
    stt: PropTypes.object.isRequired,
    actions: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    actionText: PropTypes.string.isRequired,
    actClose: PropTypes.func.isRequired,
};

export default DialogPopup;