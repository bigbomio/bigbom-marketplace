import { call, put, takeLatest } from 'redux-saga/effects';
import CountryLanguage from 'country-language';
import _ from 'lodash';

import Utils from '../_utils/utils';
import apiCROS from '../_services/apiCROS';

import { GET_DEFAULT_LANGUAGE, DEFAULT_LANGUAGE } from './constants';
import { setLanguage } from './actions';

import { appLocales } from '../../i18n';

const checkLocalLanguage = () => {
    const path = 'http://ip-api.com/json';

    return apiCROS
        .get(path)
        .then(res => {
            return res.data.countryCode.toLowerCase();
        })
        .catch(error => {
            throw error;
        });
};

/**
 * First time enter website, get language follow priority IP, browser, default
 */
function* getDefaultLanguage() {
    try {
        const result = yield call(checkLocalLanguage);
        const languages = yield call(Utils.callMethodWithReject(CountryLanguage.getCountryLanguages), result);
        const languageCodes = languages[0].iso639_1.toLowerCase();
        let ipLang = _.find(appLocales, locale => locale === languageCodes);

        ipLang = ipLang || getBrowserLanguage();

        yield put(setLanguage(ipLang));
    } catch (err) {
        yield put(setLanguage(getBrowserLanguage()));
    }
}

const getBrowserLanguage = () => {
    const browserLang = window.navigator.language && window.navigator.language.split('-')[0];
    return (
        (browserLang && (_.find(appLocales, locale => locale === browserLang.toLowerCase()) || DEFAULT_LANGUAGE)) ||
        DEFAULT_LANGUAGE
    );
};

export default function* sagaData() {
    yield takeLatest(GET_DEFAULT_LANGUAGE, getDefaultLanguage);
}
