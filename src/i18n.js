/**
 * i18n.js
 *
 * This will setup the i18n language files and locale data for your app.
 *
 */
import { addLocaleData } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';

import { DEFAULT_LANGUAGE } from './app/LanguageProvider/constants';

import enTranslationMessages from './translations/en.json';

addLocaleData(enLocaleData);

export const appLocales = [
    'en',
];

export const formatTranslationMessages = (locale, messages) => {
    const defaultFormattedMessages =
        locale !== DEFAULT_LANGUAGE ? formatTranslationMessages(DEFAULT_LANGUAGE, enTranslationMessages) : {};
    return Object.keys(messages).reduce((formattedMessages, key) => {
        const formattedMessage =
            !messages[key] && locale !== DEFAULT_LANGUAGE ? defaultFormattedMessages[key] : messages[key];
        return Object.assign(formattedMessages, { [key]: formattedMessage });
    }, {});
};

export const translationMessages = {
    en: formatTranslationMessages('en', enTranslationMessages),
};
