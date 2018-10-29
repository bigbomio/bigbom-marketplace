const apiUrl = 'https://staging-api.bigbom.net';

function fetchData(url, options) {
    return fetch(url, options).then(response => {
        if (typeof response === 'object') {
            return response.json();
        }
        return response;
    });
}

function getHashFromAddress(address) {
    const endpoint = `${apiUrl}/authentication/meta-auth/${address}`;
    return fetchData(endpoint, {
        method: 'GET',
    })
        .then(data => data)
        .catch(error => console.error(error));
}

function getToken(data) {
    const endpoint = `${apiUrl}/authentication/meta-auth`;
    return fetchData(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(result => result)
        .catch(error => console.error(error));
}

function createUser(data) {
    const endpoint = `${apiUrl}/users`;
    return fetchData(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(result => result)
        .catch(error => console.error(error));
}

function addWallet(data) {
    const endpoint = `${apiUrl}/users/public/addWallet`;
    return fetchData(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(result => result)
        .catch(error => console.error(error));
}

function getUser(token) {
    const endpoint = `${apiUrl}/users`;
    return fetchData(endpoint, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then(result => result)
        .catch(error => console.error(error));
}

export default {
    getHashFromAddress,
    getToken,
    createUser,
    addWallet,
    getUser,
};
