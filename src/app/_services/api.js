import axios from 'axios';
import _ from 'lodash';

import { Config } from '../../config';

export class Api {
    constructor(instance, getDefaultHeader) {
        if (instance) {
            this.instance = instance;
            this.getDefaultHeader = getDefaultHeader;
        } else {
            this.instance = axios.create({
                baseURL: Config.API_SERVER,
            });
        }
    }

    getDefaultOptions(isAuth = true) {
        let auth = isAuth ? { Authorization: null } : {};
        return {
            headers: {
                ...(typeof this.getDefaultHeade === 'function' ? this.getDefaultHeader() : {}),
                ...auth,
            },
        };
    }

    getDefaultHeader() {
        return { 'content-type': 'application/json' };
    }

    fetch(url, options = {}) {
        return this.get(url, options, false);
    }

    get(url, options = {}, isAuth = true) {
        const finalOptions = _.merge(this.getDefaultOptions(isAuth), options);
        return this.instance.get(url, finalOptions);
    }

    put({ path = '', payload, options = {}, isAuth = true }) {
        const finalOptions = _.merge(true, this.getDefaultOptions(isAuth), options);
        return this.instance.put(path, payload, finalOptions);
    }

    post({ path = '', payload, options = {}, isAuth = true }) {
        const finalOptions = _.merge(true, this.getDefaultOptions(isAuth), options);
        return this.instance.post(path, payload, finalOptions);
    }
}

export default new Api();
