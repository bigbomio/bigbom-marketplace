const apiUrl = 'https://staging-api.bigbom.net';

async function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    throw await parseJSON(response);
}

function parseJSON(response) {
    return response.json();
}

function request(url, options) {
    return fetch(url, options)
        .then(checkStatus)
        .then(parseJSON);
}

function getHasFromAddress(address) {
    const endpoint = `${apiUrl}/authentication/meta-auth/${address}`;
    return request(endpoint, {
        method: 'GET',
        // headers: {
        //     'Content-Type': 'application/json'
        // }
    });
}

function getToken(data) {
    const endpoint = `${apiUrl}/authentication/meta-auth`;
    return request(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

function refreshToken() {
    const endpoint = `${apiUrl}/authentication/meta-auth`;
    const token = global.store.getState().loginReducer.token;
    return request(endpoint, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

function sendEmail(data) {
    const endpoint = `${apiUrl}/emails/sendMailSignature`;
    const token = global.store.getState().loginReducer.token;
    return request(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
}

export default {
    sendEmail,
    getHasFromAddress,
    getToken,
    refreshToken,
};
