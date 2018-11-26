import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import homeReducer from '../components/home/reducer';
import clientReducer from '../components/client/reducer';
import commonReducer from '../components/common/reducer';
import freelancerReducer from '../components/freelancer/reducer';
import voterReducer from '../components/voter/reducer';
import RatingReducer from './RatingReducer';

const rootReducer = combineReducers({
    router: routerReducer,
    homeReducer,
    clientReducer,
    commonReducer,
    freelancerReducer,
    voterReducer,
    RatingReducer,
});

export default rootReducer;
