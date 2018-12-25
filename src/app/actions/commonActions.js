import * as types from '../constants/actionTypes';

export const getRatingLogs = payload => ({
    type: types.GET_RATING_LOGS,
    payload,
});

export const setYourNetwork = yourNetwork => {
    return {
        type: types.SET_YOUR_NETWORK,
        yourNetwork,
    };
};

export const setView = view => {
    return {
        type: types.SET_VIEW,
        view,
    };
};

export const setActionBtnDisabled = actionBtnDisabled => {
    return {
        type: types.SET_ACTION_BTN_DISABLED,
        actionBtnDisabled,
    };
};

export const setReload = reload => {
    return {
        type: types.SET_RELOAD,
        reload,
    };
};

export const saveAccountInfo = accountInfo => {
    return {
        type: types.SAVE_ACCOUNT_INFO,
        accountInfo,
    };
};

export const setRegister = register => {
    return {
        type: types.SET_REGISTER,
        register,
    };
};

export const getExchangeRates = rates => {
    return {
        type: types.GET_EXCHANGE_RATES,
        rates,
    };
};

export const getTokensAddress = tokensAddress => {
    return {
        type: types.GET_TOKENS_ADDRESS,
        tokensAddress,
    };
};

export const saveTokens = tokens => {
    return {
        type: types.SAVE_TOKENS,
        tokens,
    };
};

export const setCurrentToken = currentToken => {
    return {
        type: types.SET_CURRENT_TOKEN,
        currentToken,
    };
};
