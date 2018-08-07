import axios from 'axios';

import { Api } from './api';

class ApiCROS {
    constructor() {
        const instance = axios.create();
        this.API = new Api(instance);
    }

    fetch(url, options = {}) {
        return this.API.fetch(url, options);
    }

    get(url, options = {}) {
        return this.API.get(url, options, false);
    }

    put(path = '', payload, options = {}) {
        return this.API.put(path, payload, options, false);
    }

    post(path = '', payload, options = {}) {
        return this.API.post(path, payload, options, false);
    }
}

export default new ApiCROS();
