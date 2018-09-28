import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';

import Utils from '../../_utils/utils';
import DialogPopup from '../common/dialog';

class DisputeDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            actStt: { err: false, text: null, link: '' },
            dialogLoading: false,
            dialogData: {
                title: null,
                actionText: null,
                actions: null,
            },
            btnSttDisabled: false,
        };
    }

    componentDidMount() {
        const { isConnected } = this.props;
        const { isLoading } = this.state;
        if (isConnected) {
            if (!isLoading) {
                this.mounted = true;
                this.disputeDataInit(false);
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    disputeDataInit = async refresh => {
        const { match, web3, disputes } = this.props;
        const jobHash = match.params.disputeId;
        console.log(disputes);

        this.setState({ isLoading: true, jobHash: jobHash });
        if (!refresh) {
            if (disputes.length > 0) {
                const currentDispute = disputes.filter(dispute => Utils.toAscii(dispute.jobHash) === jobHash);
                this.setState({ disputeData: currentDispute[0], isLoading: false, isOwner: web3.eth.defaultAccount === currentDispute[0].owner });
                return;
            }
        }

        // get dispute here
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    back = () => {
        const { history } = this.props;
        history.goBack();
    };

    createAction = () => {
        const { history } = this.props;
        history.push('/client');
    };

    render() {
        const { disputeData, isLoading, dialogLoading, open, actStt, dialogData, btnSttDisabled } = this.state;
        //console.log(disputeData);
        let disputeTplRender;

        if (disputeData) {
            disputeTplRender = () => {
                return (
                    <Grid container className="single-body">
                        <Grid container>
                            <div className="top-action">
                                <ButtonBase onClick={this.back} className="btn btn-normal btn-default btn-back e-left">
                                    <i className="fas fa-angle-left" />
                                    Back
                                </ButtonBase>
                                <ButtonBase className="btn btn-normal btn-green btn-back" onClick={() => this.disputeDataInit(true)}>
                                    <i className="fas fa-sync-alt" />
                                    Refresh
                                </ButtonBase>
                            </div>

                            <Grid container className="job-detail-description">
                                <Grid item xs={12} className="name">
                                    Job description
                                </Grid>
                                <Grid item xs={12} className="ct">
                                    {disputeData.jobDispute.description}
                                </Grid>
                                <Grid item xs={12} className="bottom-ct">
                                    <ButtonBase className="btn btn-small btn-white">
                                        More <i className="fas fa-caret-down right" />
                                    </ButtonBase>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                );
            };
        } else {
            disputeTplRender = () => (
                <Grid container className="single-body">
                    <Grid container>
                        <h2> Sorry. Dispute does not exist </h2>
                    </Grid>
                </Grid>
            );
        }
        return (
            <Grid container className="job-detail">
                <DialogPopup
                    dialogLoading={dialogLoading}
                    open={open}
                    stt={actStt}
                    actions={dialogData.actions}
                    title={actStt.title}
                    actionText={dialogData.actionText}
                    actClose={this.handleClose}
                    btnSttDisabled={btnSttDisabled}
                />
                <div id="freelancer" className="container-wrp">
                    <div className="container-wrp full-top-wrp">
                        <div className="container wrapper">
                            <Grid container className="main-intro">
                                <Grid item xs={8}>
                                    {disputeData && <h1>{disputeData.jobDispute.title}</h1>}
                                </Grid>
                                <Grid item xs={4} className="main-intro-right">
                                    <ButtonBase onClick={this.createAction} className="btn btn-normal btn-white btn-create">
                                        <i className="fas fa-plus" /> Create A Job Like This
                                    </ButtonBase>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                    <div className="container-wrp main-ct">
                        <div className="container wrapper">
                            {!isLoading ? (
                                disputeTplRender()
                            ) : (
                                <Grid container className="single-body">
                                    <div className="loading">
                                        <CircularProgress size={50} color="secondary" />
                                        <span>Loading...</span>
                                    </div>
                                </Grid>
                            )}
                        </div>
                    </div>
                </div>
            </Grid>
        );
    }
}

DisputeDetail.propTypes = {
    web3: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    disputes: PropTypes.any.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
        disputes: state.voterReducer.disputes,
    };
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DisputeDetail);
