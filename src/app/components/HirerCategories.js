import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, Switch } from 'react-router-dom';

import HirerDashboard from '../components/hirer/HirerDashboard';
import HirerPostJob from '../components/hirer//HirerPostJob';
import NotFound from '../components/NotFound';

class HirerCatagories extends PureComponent {
    render() {
        const { match } = this.props;
        const listSubLink = [
            {
                title: 'Post a Job',
                path: `${match.url}`,
                exact: true,
                component: HirerPostJob,
            },
            {
                title: 'Dashboard',
                path: `${match.url}/dashboard`,
                component: HirerDashboard,
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
                    </div>
                </div>
                <Switch>
                    {listSubLink.length && listSubLink.map((route, key) => <Route key={key} {...route} />)}
                    <Route component={NotFound} />
                </Switch>
            </div>
        );
    }
}

HirerCatagories.propTypes = {
    match: PropTypes.object.isRequired,
};

export default HirerCatagories;
