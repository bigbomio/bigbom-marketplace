import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import homeReducer from '../components/home/reducer';
import clientReducer from '../components/client/reducer';
import commonReducer from '../components/common/reducer';
import freelancerReducer from '../components/freelancer/reducer';

const rootReducer = combineReducers({
    router: routerReducer,
    homeReducer,
    clientReducer,
    commonReducer,
    freelancerReducer,
});

export default rootReducer;
