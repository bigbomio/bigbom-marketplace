import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import HomeReducer from '../reducers/HomeReducer';
import ClientReducer from '../reducers/ClientReducer';
import CommonReducer from '../reducers/CommonReducer';
import FreelancerReducer from '../reducers/FreelancerReducer';
import VoterReducer from '../reducers/VoterReducer';
import RatingReducer from './RatingReducer';

const rootReducer = combineReducers({
    router: routerReducer,
    HomeReducer,
    ClientReducer,
    CommonReducer,
    FreelancerReducer,
    VoterReducer,
    RatingReducer,
});

export default rootReducer;
