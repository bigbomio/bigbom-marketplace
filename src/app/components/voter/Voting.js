import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { ButtonBase } from '@material-ui/core';

import Popper from '../common/Popper';

import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';
import { setActionBtnDisabled } from '../common/actions';
import { saveVote, setVoteInputDisable } from './actions';

class Voting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            votingParams: {},
            choice: this.props.choice,
            secretPhrase: Utils.makeId(12),
            downloadDisable: true,
        };
    }

    componentDidMount() {
        const { web3 } = this.props;
        this.mounted = true;
        abiConfig.getVotingParams(web3, this.saveVotingParams);
        this.getSecretPhrase();
    }

    componentWillUnmount() {
        const { setVoteInputDisable } = this.props;
        setVoteInputDisable(false);
    }

    getSecretPhrase() {
        const { choice, secretPhrase, voteNum } = this.state;
        const { options } = this.props;
        let data = [
            {
                choice: options.clientChoice.address,
                secretPhrase,
                voteNum,
            },
        ];
        if (choice === 'freelancer') {
            data = [
                {
                    choice: options.freelancerChoice.address,
                    secretPhrase,
                    voteNum,
                },
            ];
        }
        const fileData = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
        this.setState({ secretPhrase, linkDownload: fileData, vote: { ...data[0] } });
    }

    voteOnChange = e => {
        const val = e.target.value;
        const { web3, setActionBtnDisabled, saveVote } = this.props;
        const { votingParams, vote } = this.state;
        const min = Utils.WeiToBBO(web3, votingParams.minVotes);
        const max = Utils.WeiToBBO(web3, votingParams.maxVotes);
        if (Number(val) < min) {
            this.setState({ voteErr: `Please enter at least  ${min}  BBO.`, downloadDisable: true });
            setActionBtnDisabled(true);
            return;
        } else if (Number(val) > max) {
            this.setState({ voteErr: `Please enter at most  ${max}  BBO.`, downloadDisable: true });
            setActionBtnDisabled(true);
            return;
        }
        this.setState({ voteErr: null, downloadDisable: false, voteNum: Number(val) });
        saveVote({ ...vote, token: Number(val) });
        setActionBtnDisabled(false);
        this.getSecretPhrase();
    };

    saveVotingParams = params => {
        this.setState({ votingParams: params });
    };

    handlePopoverOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handlePopoverClose = () => {
        this.setState({ anchorEl: null });
    };

    choice = client => {
        if (client) {
            this.setState({ choice: 'client' });
        } else {
            this.setState({ choice: 'freelancer' });
        }
        this.getSecretPhrase();
    };

    render() {
        const { anchorEl, secretPhrase, linkDownload, voteErr, choice, downloadDisable } = this.state;
        const { voteInputDisable, options, dispute } = this.props;
        const isPopperOpen = Boolean(anchorEl);
        return (
            <Grid item xs={12} className="voting-options">
                <Grid container className="voting-choice">
                    <Grid item xs={12}>
                        Your choice:
                        <span onClick={() => this.choice(true)} className={choice === 'client' ? 'selected' : ''}>
                            {options.clientChoice.name}
                        </span>
                        <span onClick={() => this.choice(false)} className={choice === 'freelancer' ? 'selected' : ''}>
                            {options.freelancerChoice.name}
                        </span>
                    </Grid>
                </Grid>
                <Grid container className="voting-options-vote">
                    <Grid item xs={8}>
                        <TextField
                            className={voteErr ? 'voting-options-vote-input input-err' : 'voting-options-vote-input'}
                            type="number"
                            required
                            label="Enter the number of votes to commit"
                            defaultValue=""
                            onChange={e => this.voteOnChange(e)}
                            disabled={voteInputDisable}
                        />
                        {voteErr && <span className="err">{voteErr}</span>}
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
                <Grid container className="voting-options-download">
                    <Popper
                        placement="top"
                        anchorEl={anchorEl}
                        id="mouse-over-popover"
                        onClose={this.handlePopoverClose}
                        disableRestoreFocus
                        open={isPopperOpen}
                        content="text description ...."
                    />
                    <Grid item xs={6}>
                        Your commit is needed to reveal your vote in the <span className="bold">Reveal Stage</span>
                        <i
                            className="fas fa-info-circle icon-popper-note icon-right"
                            aria-owns={isPopperOpen ? 'mouse-over-popover' : null}
                            aria-haspopup="true"
                            onMouseEnter={this.handlePopoverOpen}
                            onMouseLeave={this.handlePopoverClose}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        {!downloadDisable ? (
                            <a href={linkDownload} download={dispute.jobHash + '.json'} target="_blank" rel="noopener noreferrer">
                                <ButtonBase className="btn btn-normal btn-blue">
                                    Download <i className="fas fa-arrow-down icon-right" />
                                </ButtonBase>
                            </a>
                        ) : (
                            <ButtonBase className="btn btn-normal btn-blue" disabled>
                                Download <i className="fas fa-arrow-down icon-right" />
                            </ButtonBase>
                        )}
                    </Grid>
                </Grid>
                {secretPhrase && (
                    <Grid container className="voting-options-secret">
                        <Grid item xs={10}>
                            <p>If you misplace your commit, you can enter your secret phrase below to reveal your vote</p>
                            Secret phrase:&nbsp;
                            <span className="bold">{secretPhrase}</span>
                        </Grid>
                    </Grid>
                )}
            </Grid>
        );
    }
}

Voting.propTypes = {
    setActionBtnDisabled: PropTypes.func.isRequired,
    web3: PropTypes.object.isRequired,
    choice: PropTypes.string.isRequired,
    options: PropTypes.object.isRequired,
    saveVote: PropTypes.func.isRequired,
    voteInputDisable: PropTypes.bool.isRequired,
    setVoteInputDisable: PropTypes.func.isRequired,
    dispute: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        voteInputDisable: state.voterReducer.voteInputDisable,
    };
};

const mapDispatchToProps = {
    setActionBtnDisabled,
    saveVote,
    setVoteInputDisable,
};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Voting)
);
