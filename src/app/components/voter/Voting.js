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
import { saveVote } from './actions';

class Reasons extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            votingParams: {},
        };
    }

    componentDidMount() {
        const { web3 } = this.props;
        this.mounted = true;
        abiConfig.getVotingParams(web3, this.saveVotingParams);
        this.getSecretPhrase();
    }

    getSecretPhrase() {
        const secretPhrase = Utils.makeId(12);
        const { choice } = this.props;
        const data = [
            {
                choice,
                secretPhrase,
            },
        ];
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
            this.setState({ voteErr: `Please enter at least  ${min}  BBO.` });
            setActionBtnDisabled(true);
            return;
        } else if (Number(val) > max) {
            this.setState({ voteErr: `Please enter at most  ${max}  BBO.` });
            setActionBtnDisabled(true);
            return;
        }
        this.setState({ voteErr: null });
        saveVote({ ...vote, token: Number(val) });
        setActionBtnDisabled(false);
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

    render() {
        const { anchorEl, secretPhrase, linkDownload, voteErr } = this.state;
        const isPopperOpen = Boolean(anchorEl);
        return (
            <Grid item xs={12} className="voting-options">
                <Grid container className="voting-options-vote">
                    <Grid item xs={8}>
                        <TextField
                            className={voteErr ? 'voting-options-vote-input input-err' : 'voting-options-vote-input'}
                            type="number"
                            required
                            label="Enter the number of votes to commit"
                            defaultValue=""
                            onChange={e => this.voteOnChange(e)}
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
                        <a href={linkDownload} download="Your-secret-phrase.json" target="_blank" rel="noopener noreferrer">
                            <ButtonBase className="btn btn-normal btn-blue">
                                Download <i className="fas fa-arrow-down icon-right" />
                            </ButtonBase>
                        </a>
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

Reasons.propTypes = {
    setActionBtnDisabled: PropTypes.func.isRequired,
    web3: PropTypes.object.isRequired,
    choice: PropTypes.string.isRequired,
    saveVote: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
    };
};

const mapDispatchToProps = {
    setActionBtnDisabled,
    saveVote,
};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Reasons)
);
