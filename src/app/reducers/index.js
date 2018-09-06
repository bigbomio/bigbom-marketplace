// import { combineReducers } from 'redux-immutable';
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import reducerMyComApi from '../components/myComApi/reducer';
import reducerLanguage from '../LanguageProvider/reducer';
import homeReducer from '../components/home/reducer';
import hirerReducer from '../components/hirer/reducer';
import commonReducer from '../components/common/reducer';

const rootReducer = combineReducers({
    router: routerReducer,
    reducerLanguage,
    reducerMyComApi,
    homeReducer,
    hirerReducer,
    commonReducer,
});

export default rootReducer;
