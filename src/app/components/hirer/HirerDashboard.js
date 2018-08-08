import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';

class HirerDashboard extends Component {
    render() {
        return (
            <div className="container-wrp">
                <div className="container-wrp full-top-wrp">
                    <div className="container wrapper">
                        <Grid container className="home-intro">
                            <Grid item xs={6}>
                                <h1>Hire expert freelancers for any job</h1>
                                <div className="buttons">
                                    <ButtonBase className="btn btn-medium btn-white left">Find a Freelancer</ButtonBase>
                                    <ButtonBase className="btn btn-medium btn-white">Find a Job</ButtonBase>
                                </div>
                            </Grid>
                            <Grid item xs={6}>
                                <img src="/images/homebanner.png" alt="" />
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </div>
        );
    }
}

export default HirerDashboard;
