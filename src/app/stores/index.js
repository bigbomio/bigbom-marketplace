import { createStore } from 'redux';

import createBrowserHistory from 'history/createBrowserHistory';

import rootReducer from '../reducers';

export const browserHistory = createBrowserHistory();
export const store = createStore(rootReducer);

const storeConfig = () => {
    return store;
};

export default storeConfig;
