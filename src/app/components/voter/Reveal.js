import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import { ButtonBase } from '@material-ui/core';
import Popper from '../common/Popper';

import Utils from '../../_utils/utils';
import abiConfig from '../../_services/abiConfig';

import { setActionBtnDisabled } from '../common/actions';
import { saveRevealVote } from './actions';

let json;

class Reveal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {}

    upload = () => {
        const realFileBtn = document.getElementById('real-file');
        const customTxt = document.getElementById('upload-text');
        realFileBtn.click();
        realFileBtn.addEventListener('change', handleFileSelect, false);
        let that = this;

        function fetchJson(file) {
            let reader = new FileReader();
            reader.onload = (() => {
                return e => {
                    try {
                        json = JSON.parse(e.target.result);
                        that.voteRender(json[0]);
                    } catch (ex) {
                        //console.log('ex when trying to parse json = ' + ex);
                    }
                };
            })(file);
            reader.readAsText(file);
        }

        function handleFileSelect(evt) {
            const files = evt.target.files;
            if (files.length > 0) {
                for (let f of files) {
                    customTxt.innerHTML = f.name;
                    fetchJson(f);
                }
            } else {
                customTxt.innerHTML = 'No file chosen, yet.';
            }
        }
    };

    voteRender = async vote => {
        const { dispute, setActionBtnDisabled, saveRevealVote } = this.props;
        const { web3 } = this.props;
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVoting');
        let revealVote = {
            choice: '',
            voteNum: 0,
            secretHash: '',
        };

        if (vote.choice === dispute.client) {
            revealVote = {
                choice: 'client',
                addressChoice: dispute.client,
                voteNum: vote.voteNum,
                secretHash: vote.secretPhrase,
            };
        } else {
            revealVote = {
                choice: 'freelancer',
                addressChoice: dispute.freelancer,
                voteNum: vote.voteNum,
                secretHash: vote.secretPhrase,
            };
        }

        const [errCheckHash, re] = await Utils.callMethod(ctInstance.instance.checkHash)(vote.jobHash, vote.addressChoice, Number(vote.secretHash), {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        if (re) {
            if (!re) {
                this.setState({ err: 'Invalid json file, this file is not json file for this job.' });
                return;
            } else {
                this.setState({ err: null });
            }
        } else {
            console.log(errCheckHash);
            return;
        }

        this.setState({ revealVote });
        saveRevealVote(revealVote);
        setActionBtnDisabled(false);
    };

    handlePopoverOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handlePopoverClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        const { anchorEl, revealVote, err } = this.state;
        const isPopperOpen = Boolean(anchorEl);
        const clientWidth = { width: Utils.toWidth(100, 200) };
        const freelancerWidth = { width: Utils.toWidth(200, 100) };
        return (
            <Grid item xs={12} className="voting-options">
                <Grid container>
                    <Popper
                        placement="top"
                        anchorEl={anchorEl}
                        id="mouse-over-popover"
                        onClose={this.handlePopoverClose}
                        disableRestoreFocus
                        open={isPopperOpen}
                        content="text description ...."
                    />
                    <Grid item xs={12}>
                        Upload your JSON commit file to reveal your vote
                        <i
                            className="fas fa-info-circle icon-popper-note icon-right"
                            aria-owns={isPopperOpen ? 'mouse-over-popover' : null}
                            aria-haspopup="true"
                            onMouseEnter={this.handlePopoverOpen}
                            onMouseLeave={this.handlePopoverClose}
                        />
                    </Grid>
                </Grid>
                <Grid container className="voting-options-download upload">
                    <Grid item xs={12}>
                        <input type="file" id="real-file" hidden="hidden" accept=".json" />
                        <ButtonBase className="btn btn-normal btn-blue" id="upload-btn" onClick={this.upload}>
                            Upload <i className="fas fa-arrow-up icon-right" />
                        </ButtonBase>
                    </Grid>
                    <Grid item xs={12} className="file-name">
                        <span id="upload-text">No file chosen, yet.</span>
                    </Grid>
                </Grid>
                {revealVote && (
                    <Grid container className="voting-choice reveal">
                        <Grid item xs={12} className="reveal-field">
                            Your choice:
                            <span className={revealVote.choice === 'client' ? 'selected' : ''}>Client</span>
                            <span className={revealVote.choice === 'freelancer' ? 'selected' : ''}>Freelancer</span>
                        </Grid>
                        <Grid item xs={12} className="reveal-field">
                            Your Vote number: <div className="bold"> {revealVote.voteNum}</div>
                        </Grid>
                        <Grid item xs={12} className="reveal-field">
                            Secret phrase: <div className="bold"> {revealVote.secretHash}</div>
                        </Grid>
                    </Grid>
                )}
                <Grid container className="result-show">
                    <div className="result-bar">
                        <div className="client" style={clientWidth} />
                        <div className="freelancer" style={freelancerWidth} />
                    </div>
                </Grid>
                {err && <Grid className="err">{err}</Grid>}
            </Grid>
        );
    }
}

Reveal.propTypes = {
    setActionBtnDisabled: PropTypes.func.isRequired,
    dispute: PropTypes.object.isRequired,
    saveRevealVote: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
    };
};

const mapDispatchToProps = {
    setActionBtnDisabled,
    saveRevealVote,
};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Reveal)
);
