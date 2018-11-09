import axios from 'axios';
import LocalStorage from '../_utils/localStorage';
import { store } from '../stores';
import * as listTypes from '../components/home/consts';
import * as listTypesCommon from '../components/common/consts';

const env = process.env.REACT_APP_ENV;

const envConfig = {
    dev: {
        returnUrl: 'https://dev-marketplace.bigbom.net/',
        apiUrl: 'https://dev-api.bigbom.net',
    },
    uat: {
        returnUrl: 'https://uat-marketplace.bigbom.net/',
        apiUrl: 'https://uat-api.bigbom.net',
    },
    production: {
        returnUrl: 'https://marketplace.bigbom.com/',
        apiUrl: 'https://api.bigbom.net',
    },
};

function dataFetch(options) {
    return axios(options)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            if (error.response) {
                if (
                    (error.response.status === 409 && error.response.data.message === 'EmailExist') ||
                    (error.response.status === 429 && error.response.data.message === 'TooManyWallets')
                ) {
                    return error.response.data;
                }
                console.log(error);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            //console.log(error.config);
        });
}

async function refreshToken() {
    const endpoint = `${envConfig[env].apiUrl}/authentication`;
    const userToken = LocalStorage.getItemJson('userToken');
    const options = {
        method: 'GET',
        url: endpoint,
        headers: {
            Authorization: `Bearer ${userToken.token}`,
        },
    };
    const tokenFetch = await dataFetch(options);
    const tokenExpired = Date.now() + 15 * 60 * 1000; // 15p to refresh token
    LocalStorage.removeItem('userToken');
    if (tokenFetch) {
        LocalStorage.setItemJson('userToken', { expired: tokenExpired, token: tokenFetch.token });
    }
}

function getTokenSaved() {
    const userToken = LocalStorage.getItemJson('userToken');
    const accountInfo = {
        email: '',
        firstName: '',
        lastName: '',
        wallets: [],
    };
    if (userToken) {
        return userToken.token;
    } else {
        // logout account
        store.dispatch({
            type: listTypes.LOGOUT_METAMASK,
        });
        store.dispatch({
            type: listTypesCommon.SAVE_ACCOUNT_INFO,
            accountInfo,
        });
        LocalStorage.removeItem('userToken');
        LocalStorage.removeItem('userInfo');
    }
}

function getHashFromAddress(address) {
    const endpoint = `${envConfig[env].apiUrl}/authentication/meta-auth/${address}`;
    const options = {
        url: endpoint,
        method: 'GET',
    };
    return dataFetch(options);
}

function getToken(data) {
    const endpoint = `${envConfig[env].apiUrl}/authentication/meta-auth`;
    const options = {
        method: 'POST',
        url: endpoint,
        headers: {
            'Content-Type': 'application/json',
        },
        data: data,
    };
    return dataFetch(options);
}

function createUser(data) {
    const endpoint = `${envConfig[env].apiUrl}/users`;
    const returnUrl = envConfig[env].returnUrl;
    const options = {
        method: 'POST',
        url: endpoint,
        headers: {
            'Content-Type': 'application/json',
        },
        data: { ...data, returnUrl },
    };
    return dataFetch(options);
}

function addWallet(data) {
    const endpoint = `${envConfig[env].apiUrl}/users/public/addWallet`;
    const returnUrl = envConfig[env].returnUrl;
    const options = {
        method: 'POST',
        url: endpoint,
        headers: {
            'Content-Type': 'application/json',
        },
        data: { ...data, returnUrl },
    };
    return dataFetch(options);
}

async function getUser() {
    const endpoint = `${envConfig[env].apiUrl}/users`;
    const token = await getTokenSaved();
    const options = {
        method: 'GET',
        url: endpoint,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    return dataFetch(options);
}

async function getWallets() {
    const endpoint = `${envConfig[env].apiUrl}/wallets`;
    const token = await getTokenSaved();
    return axios({
        method: 'GET',
        url: endpoint,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then(response => {
            return response.data.docs.map(wallet => {
                return { address: wallet.address, default: false, balances: { ETH: 0, BBO: 0 } };
            });
        })
        .catch(function(error) {
            console.log(error);
        });
}

async function getUserByWallet(wallet) {
    const token = await getTokenSaved();
    const endpoint = `${envConfig[env].apiUrl}/wallets/info/${wallet}`;
    const options = {
        method: 'GET',
        url: endpoint,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    return dataFetch(options);
}

export default {
    getHashFromAddress,
    getToken,
    createUser,
    addWallet,
    getUser,
    getWallets,
    getUserByWallet,
    refreshToken,
};
