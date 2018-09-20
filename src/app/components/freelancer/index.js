import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import Dashboard from './Dashboard';
import JobDetailBid from './JobDetailBid';
import JobBrowse from './JobBrowse';
import NotFound from '../NotFound';
import UserInfoNav from '../../components/common/UserInfoNav';

import { setView } from '../common/actions';

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
    componentDidMount() {
        const { isConnected, history, setView } = this.props;
        setView('freelancer');
        if (!isConnected) {
            history.push('/login');
        }
    }
    render() {
        const { match } = this.props;
        const listSubLink = [
            {
                title: 'Find a Job',
                path: `${match.url}`,
                exact: true,
                component: JobBrowse,
            },
            {
                title: 'My Bid',
                path: `${match.url}/bid`,
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
                        <UserInfoNav />
                    </div>
                </div>
                <Switch>
                    <Route path={`${match.url}/jobs/:jobId`} render={props => <JobDetailBid {...props} />} />
                    {listSubLink.length && listSubLink.map((route, key) => <Route key={key} {...route} />)}
                    <Route component={NotFound} />
                </Switch>
            </div>
        );
    }
}

FreelancerContainer.propTypes = {
    history: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
    match: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    setView: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        isConnected: state.homeReducer.isConnected,
    };
};

const mapDispatchToProps = {
    setView,
};

export default withStyles(styles)(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(FreelancerContainer)
);
