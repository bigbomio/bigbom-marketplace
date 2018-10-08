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

        function handleFileSelect(evt) {
            const files = evt.target.files;
            if (files.length > 0) {
                for (let f of files) {
                    customTxt.innerHTML = f.name;
                    let reader = new FileReader();
                    reader.onload = (() => {
                        return e => {
                            try {
                                json = JSON.parse(e.target.result);
                                console.log(json);
                            } catch (ex) {
                                console.log('ex when trying to parse json = ' + ex);
                            }
                        };
                    })(f);
                    reader.readAsText(f);
                }
            } else {
                customTxt.innerHTML = 'No file chosen, yet.';
            }
        }
    };

    handlePopoverOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handlePopoverClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        const { anchorEl } = this.state;
        const isPopperOpen = Boolean(anchorEl);
        return (
            <Grid item xs={12} className="voting-options">
                <Grid container className="">
                    <Popper
                        placement="top"
                        anchorEl={anchorEl}
                        id="mouse-over-popover"
                        onClose={this.handlePopoverClose}
                        disableRestoreFocus
                        open={isPopperOpen}
                        content="text description ...."
                    />
                    <Grid item xs={8}>
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
                    <Grid item xs={12}>
                        <span id="upload-text">No file chosen, yet.</span>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

Reveal.propTypes = {
    setActionBtnDisabled: PropTypes.func.isRequired,
    web3: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
    };
};

const mapDispatchToProps = {
    setActionBtnDisabled,
};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Reveal)
);
