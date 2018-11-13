import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import parmeters from '../_services/parmeters';

class Parameters extends Component {
    back = () => {
        const { history } = this.props;
        history.goBack();
    };
    render() {
        return (
            <div id="main" className="container-wrp">
                <Grid container className="job-detail">
                    <div className="container-wrp">
                        <div className="container-wrp full-top-wrp">
                            <div className="container wrapper">
                                <Grid container className="main-intro">
                                    <Grid item xs={8}>
                                        <h1>Marketplace&#39;s parameters</h1>
                                    </Grid>
                                </Grid>
                            </div>
                        </div>
                        <div className="container-wrp main-ct">
                            <div className="container wrapper">
                                <Grid container className="single-body">
                                    <Grid container>
                                        <div className="top-action">
                                            <ButtonBase onClick={this.back} className="btn btn-normal btn-default btn-back e-left">
                                                <i className="fas fa-angle-left" />
                                                Back
                                            </ButtonBase>
                                        </div>
                                        {parmeters.map((params, key) => {
                                            return (
                                                <Grid key={key} container className="bb-parameters">
                                                    <Grid container className="type">
                                                        {params.type}
                                                    </Grid>
                                                    <Grid container className="header">
                                                        <Grid item xs={3}>
                                                            Name
                                                        </Grid>
                                                        <Grid item xs={5}>
                                                            Description
                                                        </Grid>
                                                        <Grid item xs={1}>
                                                            Value
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            RealParams
                                                        </Grid>
                                                    </Grid>
                                                    {params.parameters.map((param, keyParam) => {
                                                        return (
                                                            <Grid key={keyParam} container className="row">
                                                                <Grid item xs={3} className="name">
                                                                    {param.name}
                                                                </Grid>
                                                                <Grid item xs={5} className="description">
                                                                    {param.description}
                                                                </Grid>
                                                                <Grid item xs={1} className="value">
                                                                    <span>{param.value}</span>
                                                                </Grid>
                                                                <Grid item xs={3} className="real-params">
                                                                    {param.realParams}
                                                                </Grid>
                                                            </Grid>
                                                        );
                                                    })}
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </Grid>
                            </div>
                        </div>
                    </div>
                </Grid>
            </div>
        );
    }
}

Parameters.propTypes = {
    history: PropTypes.object.isRequired,
};
const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Parameters);
