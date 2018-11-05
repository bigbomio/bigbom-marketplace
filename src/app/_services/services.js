import axios from 'axios';
import LocalStorage from '../_utils/localStorage';

const apiUrl = 'https://dev-api.bigbom.net';

let returnUrl = 'http://localhost:3000/';
let loginUrl = 'http://localhost:3000/';

if (process.env.REACT_APP_ENV === 'uat') {
    returnUrl = 'http://uat-marketplace.bigbom.net';
    loginUrl = 'http://uat-marketplace.bigbom.net';
} else if (process.env.REACT_APP_ENV === 'production') {
    returnUrl = 'https://marketplace.bigbom.com/';
    loginUrl = 'https://marketplace.bigbom.com/';
}

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
    const endpoint = `${apiUrl}/authentication`;
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
    LocalStorage.setItemJson('userToken', { expired: tokenExpired, token: tokenFetch.token });
}

function getTokenSaved() {
    const userToken = LocalStorage.getItemJson('userToken');
    return userToken.token;
}

function getHashFromAddress(address) {
    const endpoint = `${apiUrl}/authentication/meta-auth/${address}`;
    const options = {
        url: endpoint,
        method: 'GET',
    };
    return dataFetch(options);
}

function getToken(data) {
    const endpoint = `${apiUrl}/authentication/meta-auth`;
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
    const endpoint = `${apiUrl}/users`;
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

function addWallet(data) {
    const endpoint = `${apiUrl}/users/public/addWallet`;
    const options = {
        method: 'POST',
        url: endpoint,
        headers: {
            'Content-Type': 'application/json',
        },
        data: { ...data, returnUrl, loginUrl },
    };
    return dataFetch(options);
}

async function getUser() {
    const endpoint = `${apiUrl}/users`;
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
    const endpoint = `${apiUrl}/wallets`;
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
    const endpoint = `${apiUrl}/wallets/info/${wallet}`;
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
