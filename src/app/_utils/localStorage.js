class localStorageAdapter {
    setItem(key, value) {
        localStorage.setItem(key, value);
    }

    getItem(key) {
        return localStorage.getItem(key);
    }

    getItemJson(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    setItemJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    removeItem(key) {
        localStorage.removeItem(key);
    }
}

export default new localStorageAdapter();
