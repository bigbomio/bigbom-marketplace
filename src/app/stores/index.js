import { createStore } from 'redux';

import createBrowserHistory from 'history/createBrowserHistory';

import rootReducer from '../reducers';

export const browserHistory = createBrowserHistory();

const storeConfig = () => {
    const store = createStore(rootReducer);
    return store;
};

export default storeConfig;
