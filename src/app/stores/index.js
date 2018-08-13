import { createStore, applyMiddleware, compose } from 'redux';
// import { combineReducers } from 'redux-immutable';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'react-router-redux';
import createBrowserHistory from 'history/createBrowserHistory';

import ENV from '../../config';

import rootReducer from '../reducers';
import rootSaga from '../sagas';

export const browserHistory = createBrowserHistory();

const storeConfig = () => {
    const sagaMiddleware = createSagaMiddleware();
    const routesMiddleware = routerMiddleware(browserHistory);

    const middlewares = [sagaMiddleware, routesMiddleware];

    const enhancers = [applyMiddleware(...middlewares)];

    let composeEnhancers = compose;
    ENV !== 'production' &&
        typeof window === 'object' &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
        (composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            shouldHotReload: false
        }));

    const store = createStore(rootReducer, composeEnhancers(...enhancers));
    sagaMiddleware.run(rootSaga);

    return store;
};

export default storeConfig;
