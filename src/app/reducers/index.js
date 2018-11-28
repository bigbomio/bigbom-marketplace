import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import homeReducer from '../components/home/reducer';
import ClientReducer from '../reducers/ClientReducer';
import CommonReducer from '../reducers/CommonReducer';
import freelancerReducer from '../components/freelancer/reducer';
import voterReducer from '../components/voter/reducer';
import RatingReducer from './RatingReducer';

const rootReducer = combineReducers({
    router: routerReducer,
    homeReducer,
    ClientReducer,
    CommonReducer,
    freelancerReducer,
    voterReducer,
    RatingReducer,
});

export default rootReducer;
