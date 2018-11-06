import * as nameActList from './consts';

const data = {
    isConnected: true,
    web3: null,
    network: '',
    checkAccount: true,
    defaultAccount: '',
};

const homeReducer = (state = data, action) => {
    switch (action.type) {
        case nameActList.LOGIN_METAMASK:
            return {
                ...state,
                isConnected: true,
            };
        case nameActList.LOGOUT_METAMASK:
            return {
                ...state,
                isConnected: false,
            };
        case nameActList.SET_NETWORK:
            return {
                ...state,
                network: action.network,
            };
        case nameActList.SET_ACCOUNT:
            return {
                ...state,
                defaultAccount: action.defaultAccount,
            };
        case nameActList.SET_WEB3:
            return {
                ...state,
                web3: action.web3 || null,
            };
        case nameActList.SET_CHECK_ACCOUNT:
            return {
                ...state,
                checkAccount: action.checkAccount,
            };
        default:
            return state;
    }
};

export default homeReducer;
