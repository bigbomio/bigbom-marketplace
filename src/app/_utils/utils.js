class Utils {
    callMethod(_method) {
        return (...param) => {
            return new Promise(resolve => {
                _method(...param, (error, result) => {
                    resolve([error, result]);
                });
            });
        };
    }

    callMethodWithReject(_method) {
        return (...param) => {
            return new Promise((resolve, reject) => {
                _method(...param, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        };
    }

    callAllMethodWithReject(promises) {
        return new Promise(async resolve => {
            let result = await Promise.all(promises);
            let error = null;
            result = result.map(item => {
                const [e, r] = item;
                e && !error && (error = e);
                return r;
            });

            if (error) {
                resolve([error, null]);
            } else {
                resolve([null, result]);
            }
        });
    }

    callAllMethod(promises) {
        return new Promise(async resolve => {
            try {
                const result = await Promise.all(promises);
                resolve([null, result]);
            } catch (error) {
                resolve([error, null]);
            }
        });
    }
}

export default new Utils();
