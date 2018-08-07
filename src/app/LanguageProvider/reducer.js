import { fromJS } from 'immutable';
import CountryLanguage from 'country-language';
import localStorageAdapter from '../_utils/localStorage';

import { appLocales } from '../../i18n';

import { SET_LANGUAGE, DEFAULT_LANGUAGE } from './constants';

const lang = localStorageAdapter.getLang();
const isLanguageCodeExists = appLocales.indexOf(lang) !== -1 && CountryLanguage.languageCodeExists(lang);

const initialState = fromJS({
    language: isLanguageCodeExists ? lang : DEFAULT_LANGUAGE,
});

function languageProviderReducer(state = initialState, action) {
    switch (action.type) {
        case SET_LANGUAGE:
            localStorageAdapter.setLanguage(action.language);
            return state.set('language', action.language);
        default:
            return state;
    }
}

export default languageProviderReducer;
