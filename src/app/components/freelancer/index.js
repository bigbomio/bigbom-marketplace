import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link, Route, Switch } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

import Utils from '../../_utils/utils';

import Dashboard from './Dashboard';
import JobDetailBid from './JobDetailBid';
import JobBrowser from './JobBrowser';
import Jobs from '../../_services/jobData';
import NotFound from '../NotFound';

const styles = theme => ({
    lightTooltip: {
        background: theme.palette.common.white,
        color: '#555',
        boxShadow: theme.shadows[1],
        fontSize: 15,
        maxWidth: 'inherit',
    },
});
class FreelancerContainer extends Component {
    render() {
        const { match, classes } = this.props;
        const listSubLink = [
            {
                title: 'Find a Job',
                path: `${match.url}`,
                exact: true,
                component: JobBrowser,
            },
            {
                title: 'My Bid',
                path: `${match.url}/my-bid`,
                component: Dashboard,
            },
        ];

        return (
            <div id="main" className="container-wrp">
                <div className="container-wrp main-nav">
                    <div className="container">
                        <ul>
                            {listSubLink.map((route, key) => (
                                <Route key={key} path={route.path} exact={route.exact}>
                                    {({ match }) => (
                                        <li className={match ? 'actived' : null}>
                                            <Link to={route.path}>{route.title}</Link>
                                        </li>
                                    )}
                                </Route>
                            ))}
                        </ul>
                        <Grid container className="account-info">
                            <Tooltip
                                title="0xb10ca39DFa4903AE057E8C26E39377cfb4989551"
                                classes={{ tooltip: classes.lightTooltip, popper: classes.arrowPopper }}
                            >
                                <Grid
                                    item
                                    xs={7}
                                    className="account-info-item"
                                    aria-label="0xb10ca39DFa4903AE057E8C26E39377cfb4989551"
                                >
                                    <div>Your Wallet Address</div>

                                    {Utils.truncate('0xb10ca39DFa4903AE057E8C26E39377cfb4989551', 22)}
                                </Grid>
                            </Tooltip>
                            <Grid item xs={5} className="account-info-item right">
                                <div>Balance</div>
                                <span>10.000</span> USD
                            </Grid>
                        </Grid>
                    </div>
                </div>
                <Switch>
                    <Route
                        path={`${match.url}/find-job/:jobId`}
                        render={props => <JobDetailBid data={Jobs} {...props} />}
                    />
                    {listSubLink.length && listSubLink.map((route, key) => <Route key={key} {...route} />)}

                    <Route component={NotFound} />
                </Switch>
            </div>
        );
    }
}

FreelancerContainer.propTypes = {
    match: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FreelancerContainer);
