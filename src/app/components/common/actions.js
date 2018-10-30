import * as listTypes from './consts';

export const setYourNetwork = yourNetwork => {
    return {
        type: listTypes.SET_YOUR_NETWORK,
        yourNetwork,
    };
};

export const setView = view => {
    return {
        type: listTypes.SET_VIEW,
        view,
    };
};

export const setActionBtnDisabled = actionBtnDisabled => {
    return {
        type: listTypes.SET_ACTION_BTN_DISABLED,
        actionBtnDisabled,
    };
};

export const setReload = reload => {
    return {
        type: listTypes.SET_RELOAD,
        reload,
    };
};

export const saveAccountInfo = accountInfo => {
    return {
        type: listTypes.SAVE_ACCOUNT_INFO,
        accountInfo,
    };
};

export const setToken = token => {
    return {
        type: listTypes.SET_TOKEN,
        token,
    };
};

export const setRegister = register => {
    return {
        type: listTypes.SET_REGISTER,
        register,
    };
};
