/*
 *
 * LanguageProvider actions
 *
 */

import { SET_LANGUAGE, GET_DEFAULT_LANGUAGE } from './constants';

export function setLanguage(language) {
    return {
        type: SET_LANGUAGE,
        language
    };
}

export function getDefaultLanguage() {
    return {
        type: GET_DEFAULT_LANGUAGE
    };
}
