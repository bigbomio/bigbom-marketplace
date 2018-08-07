import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, Switch } from 'react-router-dom';

import NotFound from '../components/NotFound';

class Catagories extends PureComponent {
    render() {
        const { match } = this.props;
        const listSubLink = [
            {
                title: 'Shoes',
                path: `${match.url}`,
                exact: true,
                component: () => <p className="cataDetail">Shoe</p>
            },
            {
                title: 'Boots',
                path: `${match.url}/boots`,
                component: () => <p className="cataDetail">Boots</p>
            },
            {
                title: 'Footwear',
                path: `${match.url}/footwear`,
                component: () => <p className="cataDetail">Footwear</p>
            }
        ];

        return (
            <div className="catagories">
                <ul className="list-catagories">
                    {listSubLink.map((route, key) => (
                        <Route key={key} path={route.path} exact={route.exact}>
                            {({ match }) => (
                                <li className={match ? 'curr' : null}>
                                    <Link to={route.path}>{route.title}</Link>
                                </li>
                            )}
                        </Route>
                    ))}
                </ul>

                <Switch>
                    {listSubLink.length && listSubLink.map((route, key) => <Route key={key} {...route} />)}
                    <Route component={NotFound} />
                </Switch>
            </div>
        );
    }
}

Catagories.propTypes = {
    match: PropTypes.object.isRequired
};

export default Catagories;
