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
        const { dialogLoading, stt, title, actionText, open, btnStt } = this.props;
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
                                        <div className="success">
                                            {stt.text}
                                            {stt.link && (
                                                <p>
                                                    View your transaction status{' '}
                                                    <a className="bold link" href={stt.link} target="_blank" rel="noopener noreferrer">
                                                        HERE
                                                    </a>
                                                </p>
                                            )}
                                        </div>
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
                        <ButtonBase onClick={this.runAction} className="btn btn-normal btn-blue" disabled={!btnStt}>
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
    actions: PropTypes.func,
    title: PropTypes.string,
    actionText: PropTypes.string,
    actClose: PropTypes.func.isRequired,
    btnStt: PropTypes.bool.isRequired,
};

DialogPopup.defaultProps = {
    actions: null,
    title: null,
    actionText: null,
};

export default DialogPopup;
