export default class sessionStorageAdapter {
    setItem(key, value) {
        sessionStorage.setItem(key, value);
    }

    getItem(key) {
        return sessionStorage.getItem(key);
    }

    getItemJson(key) {
        return JSON.parse(sessionStorage.getItem(key));
    }

    setItemJson(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    removeItem(key) {
        sessionStorage.removeItem(key);
    }
}
