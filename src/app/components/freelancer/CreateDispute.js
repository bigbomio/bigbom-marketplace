import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';
import { setSttDisputeCreated } from './actions';
import LocalStorage from '../../_utils/localStorage';

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
    }

    componentDidMount() {
        const { web3, votingParams } = this.props;
        const stakeDeposit = Utils.currencyFormat(Utils.WeiToBBO(web3, Number(votingParams.stakeDeposit)));
        this.setState({ stakeDeposit });
    }

    createDispute = async proofHash => {
        const { web3, jobID, setSttDisputeCreated } = this.props;
        const defaultAccount = await web3.eth.defaultAccount;
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');
        const [err, tx] = await Utils.callMethod(ctInstance.instance.startPoll)(jobID, proofHash, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
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
                link: (
                    <a className="bold link" href={abiConfig.getTXlink() + tx} target="_blank" rel="noopener noreferrer">
                        HERE
                    </a>
                ),
            },
        });
        setSttDisputeCreated(true);
        LocalStorage.setItemJson('disputeCreated-' + defaultAccount + '-' + jobID, { done: true });
    };

    createProofHash = async () => {
        const { proof, imgs } = this.state;
        const { jobHash, jobID, votingParams, accountInfo, web3 } = this.props;
        const defaultWallet = accountInfo.wallets.filter(wallet => wallet.default);
        const allowance = await abiConfig.getAllowance(web3, 'BBDispute');

        /// check balance
        if (defaultWallet[0].balances.ETH <= 0) {
            this.setState({
                isDone: true,
                isLoading: false,
                actStt: {
                    title: 'Error: ',
                    err: true,
                    text: 'Sorry, you have insufficient funds! You can not create a job if your balance less than fee.',
                    link: '',
                },
            });
            return;
        } else if (Utils.BBOToWei(web3, defaultWallet[0].balances.BBO) < Number(votingParams.stakeDeposit)) {
            this.setState({
                isDone: true,
                isLoading: false,
                actStt: {
                    title: 'Error: ',
                    err: true,
                    text: 'Sorry, you have insufficient funds! You can not create a job if your BBO balance less than stake deposit.',
                    link: (
                        <a href="https://faucet.ropsten.bigbom.net/" target="_blank" rel="noopener noreferrer">
                            Get free BBO
                        </a>
                    ),
                },
            });
            return;
        }

        this.setState({
            isLoading: true,
        });

        const proofData = {
            jobID,
            jobHash,
            proof,
            imgs,
        };
        ipfs.addJSON(proofData, async (err, proofHash) => {
            if (err) {
                return console.log(err);
            }

            // check allowance
            if (Number(allowance.toString(10)) === 0) {
                const apprv = await abiConfig.approve(web3, 'BBDispute', Math.pow(2, 255));
                if (apprv) {
                    await this.createDispute(proofHash);
                }
            } else if (Number(allowance.toString(10)) > Number(votingParams.stakeDeposit)) {
                await this.createDispute(proofHash);
            } else {
                const apprv = await abiConfig.approve(web3, 'BBDispute', 0);
                if (apprv) {
                    const apprv2 = await abiConfig.approve(web3, 'BBDispute', Math.pow(2, 255));
                    if (apprv2) {
                        await this.createDispute(proofHash);
                    }
                }
            }
        });
    };

    autoHide = () => {
        setTimeout(() => {
            this.setState({ checkedDisputeResult: false });
        }, 10000);
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
            this.setState({ proof: val, proofErr: null });
        }
    };

    handleResultClose = () => {
        this.setState({ checkedDisputeResult: false });
    };

    render() {
        const { proofErr, isLoading, actStt, isDone, checkedDisputeResult, submitDisabled, stakeDeposit } = this.state;
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
                        <i className="fas fa-times" />
                    </ButtonBase>
                    <Grid container className="inside-result">
                        <p className="bold">
                            <i className="fas fa-exclamation-circle red" /> {actStt.text} {actStt.link}
                        </p>
                    </Grid>
                </Collapse>
            ) : (
                <Collapse in={checkedDisputeResult} className="inside-box">
                    <Grid container className="inside-result">
                        <p className="bold">
                            <i className="fas fa-check green" /> {actStt.text}
                            View your transaction status {actStt.link}
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
                        <div className="dialog-note build-in-note">
                            <i className="fas fa-exclamation-circle" />
                            <p>
                                By confirming this action, you will deposit <span className="bold">{stakeDeposit} BBO</span> into staking contract. If
                                you win the dispute, your staked tokens will be refunded to you account. If you loose the dispute, your staked tokens
                                will be use as the reward for voter.
                            </p>
                        </div>
                        <ButtonBase className="btn btn-normal btn-blue e-left" onClick={() => this.createProofHash()} disabled={submitDisabled}>
                            <i className="fas fa-check" /> Create
                        </ButtonBase>
                        <ButtonBase className="btn btn-normal btn-red" onClick={() => closeAct()}>
                            <i className="fas fa-times" />
                            Cancel
                        </ButtonBase>
                    </Grid>
                </Grid>
            </Collapse>
        );
    }
}

CreateDispute.propTypes = {
    closeAct: PropTypes.func.isRequired,
    checkedDispute: PropTypes.bool.isRequired,
    jobHash: PropTypes.string.isRequired,
    jobID: PropTypes.string.isRequired,
    web3: PropTypes.any.isRequired,
    accountInfo: PropTypes.any.isRequired,
    votingParams: PropTypes.object.isRequired,
    setSttDisputeCreated: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        accountInfo: state.commonReducer.accountInfo,
        votingParams: state.freelancerReducer.votingParams,
    };
};

const mapDispatchToProps = {
    setSttDisputeCreated,
};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(CreateDispute)
);
