import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CircularProgress from '@material-ui/core/CircularProgress';

import { saveFreelancerProof } from './actions';
import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';

const ipfs = abiConfig.getIpfs();

class CreateDispute extends Component {
    constructor(props) {
        super(props);
        this.state = {
            proof: '',
            imgs: [],
            isLoading: false,
            isDone: false,
            actStt: {
                title: '',
                err: false,
                text: '',
                link: '',
            },
            checkedDisputeResult: true,
            submitDisabled: true,
        };
        this.saveFreelancerProof = this.props.saveFreelancerProof;
    }

    createDispute = async proofHash => {
        const { web3, jobHash, balances } = this.props;
        if (balances.ETH <= 0) {
            this.setState({
                actStt: {
                    title: 'Error: ',
                    err: true,
                    text: 'Sorry, you have insufficient funds! You can not create a job if your balance less than fee.',
                    link: '',
                },
            });
            return;
        }
        console.log(jobHash, proofHash);
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.startPoll)(jobHash, proofHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            this.autoHide();
            this.setState({
                isDone: true,
                isLoading: false,
                actStt: { title: 'Error: ', err: true, text: 'Something went wrong! Can not create dispute! :(', link: '' },
            });
            console.log(err);
            return;
        }
        this.setState({
            isDone: true,
            isLoading: false,
            actStt: {
                title: '',
                err: false,
                text: 'Your dispute has created! Please waiting for confirm from your network.',
                link: abiConfig.getTXlink() + jobLog,
            },
        });
    };

    createProofHash = async () => {
        const { proof, imgs } = this.state;
        const { jobHash } = this.props;
        this.setState({
            isLoading: true,
        });
        const proofData = {
            jobHash,
            proof,
            imgs,
        };
        ipfs.addJSON(proofData, (err, proofHash) => {
            if (err) {
                return console.log(err);
            }
            this.createDispute(proofHash);
        });
    };

    autoHide = () => {
        setTimeout(() => {
            this.setState({ checkedDisputeResult: false });
        }, 1000000);
    };

    validate = (val, field) => {
        let min = 30;
        let max = 1000;
        if (field === 'proof') {
            if (val.length < min) {
                this.setState({ proofErr: 'Please enter your proof at least 30 characters' });
                return false;
            } else if (val.length > max) {
                this.setState({ proofErr: 'Please enter your proof at most 1000 characters' });
                return false;
            }
            return true;
        }
    };

    inputOnChange = (e, field) => {
        const val = e.target.value;
        if (field === 'proof') {
            if (!this.validate(val, 'proof')) {
                this.setState({ submitDisabled: true });
                return;
            } else {
                this.setState({ submitDisabled: false });
            }
            this.saveFreelancerProof({ proof: val, imgs: this.state.imgs });
            this.setState({ proof: val, proofErr: null });
        }
    };

    handleResultClose = () => {
        this.setState({ checkedDisputeResult: false });
    };

    render() {
        const { proofErr, isLoading, actStt, isDone, checkedDisputeResult, submitDisabled } = this.state;
        const { closeAct, checkedDispute } = this.props;
        return isLoading ? (
            <div className="loading">
                <CircularProgress size={50} color="secondary" />
                <span>Waiting...</span>
            </div>
        ) : isDone ? (
            actStt.err ? (
                <Collapse in={checkedDisputeResult} className="inside-box">
                    <ButtonBase className="btn-icon btn-normal gray inside-result-close" onClick={this.handleResultClose}>
                        <FontAwesomeIcon icon="times" />
                    </ButtonBase>
                    <Grid container className="inside-result">
                        <p className="bold">
                            <FontAwesomeIcon icon="exclamation-circle" className="red" /> {actStt.text}
                        </p>
                    </Grid>
                </Collapse>
            ) : (
                <Collapse in={checkedDisputeResult} className="inside-box">
                    <Grid container className="inside-result">
                        <p className="bold">
                            <FontAwesomeIcon icon="check" className="green" /> {actStt.text}
                            View your transaction status{' '}
                            <a className="bold link" href={actStt.link} target="_blank" rel="noopener noreferrer">
                                HERE
                            </a>
                        </p>
                    </Grid>
                </Collapse>
            )
        ) : (
            <Collapse in={checkedDispute} className="inside-box">
                <Grid container>
                    <Grid container className="mkp-form-row">
                        <Grid item xs={12} className="mkp-form-row-sub left">
                            <span className="mkp-form-row-label">Enter your proof: </span>
                            <span className="mkp-form-row-description">Maximum 1000 characters</span>
                            <textarea
                                className={proofErr ? 'input-err' : ''}
                                rows={10}
                                id="proof"
                                name="proof"
                                onChange={e => this.inputOnChange(e, 'proof')}
                            />
                            {proofErr && <span className="err">{proofErr}</span>}
                        </Grid>
                    </Grid>
                    {/* <Grid container className="mkp-form-row">
                                <Grid item xs={12} className="mkp-form-row-sub">
                                    <span className="mkp-form-row-label">Images: </span>
                                    <span className="mkp-form-row-description">Maximum 3 images</span>
                                    <ButtonBase className="btn btn-normal btn-blue">Select image...</ButtonBase>
                                    {imgErr && <span className="err">{imgErr}</span>}
                                </Grid>
                            </Grid> */}
                    <Grid container className="mkp-form-row">
                        <ButtonBase className="btn btn-normal btn-blue e-left" onClick={() => this.createProofHash()} disabled={submitDisabled}>
                            <FontAwesomeIcon icon="check" /> Create
                        </ButtonBase>
                        <ButtonBase className="btn btn-normal btn-red" onClick={() => closeAct()}>
                            <FontAwesomeIcon icon="times" />
                            Cancel
                        </ButtonBase>
                    </Grid>
                </Grid>
            </Collapse>
        );
    }
}

CreateDispute.propTypes = {
    saveFreelancerProof: PropTypes.func.isRequired,
    closeAct: PropTypes.func.isRequired,
    checkedDispute: PropTypes.bool.isRequired,
    jobHash: PropTypes.string.isRequired,
    web3: PropTypes.any.isRequired,
    balances: PropTypes.any.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        balances: state.commonReducer.balances,
    };
};

const mapDispatchToProps = {
    saveFreelancerProof,
};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(CreateDispute)
);
