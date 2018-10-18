import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import Manage from './Manage';
import DisputeDetail from './DisputeDetail';
import DisputeBrowse from './DisputeBrowse';
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
class VoterContainer extends Component {
    componentDidMount() {
        const { isConnected, history, setView } = this.props;
        setView('voter');
        if (!isConnected) {
            history.push('/');
        }
    }
    render() {
        const { match } = this.props;
        const listSubLink = [
            {
                title: 'Browser Disputes',
                path: `${match.url}`,
                exact: true,
                component: DisputeBrowse,
            },
            {
                title: 'Manage',
                path: `${match.url}/manage`,
                component: Manage,
            },
        ];

        return (
            <div id="voter" className="container-wrp">
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
                    <Route path={`${match.url}/disputes/:disputeId`} render={props => <DisputeDetail {...props} />} />
                    {listSubLink.length && listSubLink.map((route, key) => <Route key={key} {...route} />)}
                    <Route component={NotFound} />
                </Switch>
            </div>
        );
    }
}

VoterContainer.propTypes = {
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
    )(VoterContainer)
);
