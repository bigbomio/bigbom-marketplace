/*
 *
 * LanguageProvider
 *
 * this component connects the redux state language locale to the
 * IntlProvider component and i18n messages (loaded from `app/translations`)
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import localStorageAdapter from '../_utils/localStorage';
import { getDefaultLanguage } from './actions';

class LanguageProvider extends React.PureComponent {
    componentWillMount() {
        if (!localStorageAdapter.getLang()) {
            const { getDefaultLanguage } = this.props;
            getDefaultLanguage();
        }
    }

    render() {
        const { messages, language } = this.props;
        return (
            <IntlProvider locale={language} messages={messages[language]}>
                {React.Children.only(this.props.children)}
            </IntlProvider>
        );
    }
}

LanguageProvider.propTypes = {
    language: PropTypes.string.isRequired,
    messages: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired,
    getDefaultLanguage: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        language: state.reducerLanguage.get('language'),
    };
};

const mapDispatchToProps = {
    getDefaultLanguage,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LanguageProvider);
