import { call, put, takeLatest } from 'redux-saga/effects';
import CountryLanguage from 'country-language';
import _ from 'lodash';

import Utils from '../_utils/utils';

import { GET_DEFAULT_LANGUAGE, DEFAULT_LANGUAGE } from './constants';
import { setLanguage } from './actions';

import { appLocales } from '../../i18n';

/**
 * First time enter website, get language follow priority IP, browser, default
 */
function* getDefaultLanguage(langCode) {
    console.log(langCode);
    try {
        const languages = yield call(Utils.callMethodWithReject(CountryLanguage.getCountryLanguages), langCode);
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
export default function sagaData() {
    const onSuccess = function*(location) {
        const code = location.coutry.iso_code.toLowerCase();
        yield takeLatest(GET_DEFAULT_LANGUAGE, getDefaultLanguage(code));
    };
    const onError = function(error) {
        console.log('Error:\n\n' + JSON.stringify(error, undefined, 4));
    };
    window.geoip2.city(onSuccess, onError);
}
