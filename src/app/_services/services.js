import axios from 'axios';

const apiUrl = 'https://uat-api.bigbom.net';

function dataFetch(options) {
    return axios(options)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (
                    (error.response.status === 409 && error.response.data.message === 'EmailExist') ||
                    (error.response.status === 429 && error.response.data.message === 'TooManyWallets')
                ) {
                    return error.response.data;
                }
                console.log(error);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            console.log(error.config);
        });
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
        data: data,
    };
    return dataFetch(options);
}

function getUser(token) {
    const endpoint = `${apiUrl}/users`;
    const options = {
        method: 'GET',
        url: endpoint,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    return dataFetch(options);
}

function getWallets(token) {
    const endpoint = `${apiUrl}/wallets`;
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

export default {
    getHashFromAddress,
    getToken,
    createUser,
    addWallet,
    getUser,
    getWallets,
};
