import * as types from '../constants/actionTypes';

export const loginMetamask = () => {
    return {
        type: types.LOGIN_METAMASK,
    };
};

export const logoutMetamask = () => {
    return {
        type: types.LOGOUT_METAMASK,
    };
};

export const setNetwork = network => {
    return {
        type: types.SET_NETWORK,
        network,
    };
};

export const setAccount = defaultAccount => {
    return {
        type: types.SET_ACCOUNT,
        defaultAccount,
    };
};

export const setWeb3 = web3 => {
    return {
        type: types.SET_WEB3,
        web3,
    };
};

export const setCheckAcount = checkAccount => {
    return {
        type: types.SET_CHECK_ACCOUNT,
        checkAccount,
    };
};
