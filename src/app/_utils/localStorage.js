const language = 'language';
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

    // Language
    setLanguage(lang) {
        this.setItem(language, lang);
    }
    getLang() {
        return this.getItem(language);
    }
}

export default new localStorageAdapter();
