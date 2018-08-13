class Utils {
    getNetwork(netId) {
        switch (netId) {
            case '1':
                return 'MAINNET';
            case '2':
                return 'MORDEN';
            case '3':
                return 'ROPSTEN';
            case '4':
                return 'RINKEBY';
            case '42':
                return 'KOVAN';
            case '89':
                return 'TOMOCHAIN';
            default:
                return 'UNKNOW';
        }
    }

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

    truncate = (fullStr, strLen, separator) => {
        if (fullStr.length <= strLen) return fullStr;

        separator = separator || '...';

        var sepLen = separator.length,
            charsToShow = strLen - sepLen,
            frontChars = Math.ceil(charsToShow / 2),
            backChars = Math.floor(charsToShow / 2);

        return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
    };

    getStatusJobOpen = bid => {
        for (let b of bid) {
            if (b.accepted) {
                return false;
            }
        }
        return true;
    };

    getStatusJob = all => {
        Object.entries(all).forEach(([key, value]) => {
            if (value) {
                return key;
            }
        });
        return 'Accepted';
    };

    async connectMetaMask(web3, ignoreNetwork = ['MAINNET']) {
        if (!web3) {
            throw new Error(
                JSON.stringify({
                    code: 'INSTALL',
                    message: 'Please install Metamask!',
                })
            );
        } else {
            let [err, netId] = await this.callMethod(web3.version.getNetwork)();
            if (err) {
                throw new Error(
                    JSON.stringify({
                        code: 'NETWORK',
                        message: err,
                    })
                );
            } else if (ignoreNetwork.includes(this.getNetwork(netId))) {
                throw new Error(
                    JSON.stringify({
                        code: 'CONNECT_NETWORK',
                        message: 'Please choose TESTNET',
                    })
                );
            } else {
                let [err, accounts] = await this.callMethod(web3.eth.getAccounts)();
                if (err) {
                    throw new Error(
                        JSON.stringify({
                            code: 'NETWORK',
                            message: err,
                        })
                    );
                } else {
                    if (accounts.length > 0) {
                        return {
                            account: web3.eth.defaultAccount,
                            network: netId,
                        };
                    } else {
                        throw new Error(
                            JSON.stringify({
                                code: 'CONNECT_WALLET',
                                message: 'Please connect your wallet with Metamask!',
                            })
                        );
                    }
                }
            }
        }
    }
}

export default new Utils();
