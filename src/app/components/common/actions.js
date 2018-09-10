import * as listTypes from './consts';

export const setBalances = balances => {
    return {
        type: listTypes.SET_BALANCES,
        balances,
    };
};
