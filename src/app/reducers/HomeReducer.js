import * as types from '../constants/actionTypes';

const data = {
    isConnected: true,
    web3: null,
    network: '',
    checkAccount: true,
    defaultAccount: '',
};

const HomeReducer = (state = data, action) => {
    switch (action.type) {
        case types.LOGIN_METAMASK:
            return {
                ...state,
                isConnected: true,
            };
        case types.LOGOUT_METAMASK:
            return {
                ...state,
                isConnected: false,
            };
        case types.SET_NETWORK:
            return {
                ...state,
                network: action.network,
            };
        case types.SET_ACCOUNT:
            return {
                ...state,
                defaultAccount: action.defaultAccount,
            };
        case types.SET_WEB3:
            return {
                ...state,
                web3: action.web3 || null,
            };
        case types.SET_CHECK_ACCOUNT:
            return {
                ...state,
                checkAccount: action.checkAccount,
            };
        default:
            return state;
    }
};

export default HomeReducer;
