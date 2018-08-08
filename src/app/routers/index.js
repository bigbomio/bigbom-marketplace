import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import ScrollToTop from './scroll-to-top';
import Header from '../containers/header';
import Footer from '../containers/footer';
import NotFound from '../components/NotFound';
import RoutersUnAuthen from './RoutersUnAuthen';
import RoutersAuthen from './RoutersAuthen';

class Routers extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: true,
            routes: RoutersUnAuthen,
        };
    }

    componentDidMount() {
        const { isLogin } = this.state;
        if (isLogin) {
            this.setState({
                routes: RoutersAuthen,
            });
        }
    }

    render() {
        const { history } = this.props;
        const { routes } = this.state;
        return (
            <Router history={history}>
                <ScrollToTop>
                    <div className="main-container">
                        <Helmet titleTemplate="%s - React.js Boilerplate" defaultTitle="Default React.js Boilerplate">
                            <meta name="description" content="A React.js Boilerplate application" />
                        </Helmet>
                        <Header />
                        <Switch>
                            {routes.length && routes.map((route, key) => <Route key={key} {...route} />)}
                            <Route component={NotFound} />
                        </Switch>
                        <Footer />
                    </div>
                </ScrollToTop>
            </Router>
        );
    }
}

Routers.propTypes = {
    history: PropTypes.object.isRequired,
};

export default Routers;
