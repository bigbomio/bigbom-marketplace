import * as listTypes from './consts';

export const setBalances = balances => {
    return {
        type: listTypes.SET_BALANCES,
        balances,
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
