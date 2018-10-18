import * as listTypes from './consts';

export const loginMetamask = () => {
    return {
        type: listTypes.LOGIN_METAMASK,
    };
};

export const logoutMetamask = () => {
    return {
        type: listTypes.LOGOUT_METAMASK,
    };
};

export const setAccount = defaultAccount => {
    return {
        type: listTypes.SET_ACCOUNT,
        defaultAccount,
    };
};

export const setNetwork = network => {
    return {
        type: listTypes.SET_NETWORK,
        network,
    };
};

export const setWeb3 = web3 => {
    return {
        type: listTypes.SET_WEB3,
        web3,
    };
};

export const setCheckAcount = checkAccount => {
    return {
        type: listTypes.SET_CHECK_ACCOUNT,
        checkAccount,
    };
};
