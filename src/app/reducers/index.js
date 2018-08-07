// import { combineReducers } from 'redux-immutable';
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import reducerMyComApi from '../components/myComApi/reducer';
import reducerLanguage from '../LanguageProvider/reducer';

const rootReducer = combineReducers({
    router: routerReducer,
    reducerLanguage,
    reducerMyComApi,
});

export default rootReducer;
