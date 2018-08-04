//import jwt from 'jsonwebtoken';
//import Config from './config';

class Utils {
    getNetworkLink(netId) {
        switch (netId) {
            case '3':
                return 'https://ropsten.etherscan.io/address/';
            case '89':
                return 'https://explorer-testnet.tomochain.com/txs/';
            default:
                return '';
        }
    }

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

    callMethod2(_method) {
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

    callAllMethod(promises) {
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

    callAllMethod2(promises) {
        return new Promise(async resolve => {
            try {
                const result = await Promise.all(promises);
                resolve([null, result]);
            } catch (error) {
                resolve([error, null]);
            }
        });
    }

    async connectMetaMask(web3, ignoreNetwork = ['MAINNET']) {
        if (!web3) {
            throw new Error(
                JSON.stringify({
                    code: 'INSTALL',
                    message: 'Please install Metamask!'
                })
            );
        } else {
            let [err, netId] = await this.callMethod(web3.version.getNetwork)();
            if (err) {
                throw new Error(
                    JSON.stringify({
                        code: 'NETWORK',
                        message: err
                    })
                );
            } else if (ignoreNetwork.includes(this.getNetwork(netId))) {
                throw new Error(
                    JSON.stringify({
                        code: 'CONNECT_NETWORK',
                        message: 'Please choose TESTNET'
                    })
                );
            } else {
                let [err, accounts] = await this.callMethod(web3.eth.getAccounts)();
                if (err) {
                    throw new Error(
                        JSON.stringify({
                            code: 'NETWORK',
                            message: err
                        })
                    );
                } else {
                    if (accounts.length > 0) {
                        return {
                            account: web3.eth.defaultAccount,
                            network: netId
                        };
                    } else {
                        throw new Error(
                            JSON.stringify({
                                code: 'CONNECT_WALLET',
                                message: 'Please connect your wallet with Metamask!'
                            })
                        );
                    }
                }
            }
        }
    }

    // generateHash(contractId, expiryDate) {
    //     return jwt.sign(
    //         {
    //             exp: expiryDate,
    //             contractId
    //         },
    //         Config.getHashSecretKey()
    //     );
    // }

    // async decodeHash(hash) {
    //     const [err, data] = await this.callMethod(jwt.verify)(hash, Config.getHashSecretKey());
    //     let errorMesag = null;
    //     if (err) {
    //         switch (err.name) {
    //             case 'TokenExpiredError':
    //                 errorMesag = 'EXPIRED';
    //                 break;
    //             // case 'JsonWebTokenError':
    //             //     errorMesag = 'INVALID';
    //             //     break;
    //             default:
    //                 errorMesag = 'INVALID';
    //         }
    //     }

    //     return [errorMesag, data];
    // }

    isEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return email ? re.test(String(email).toLowerCase()) : false;
    }

    isWalletAddress(walletAddress) {
        const regexWalletAdress = /^(0x)?[0-9a-f]{40}$/i;
        return walletAddress ? regexWalletAdress.test(walletAddress.trim()) : false;
    }
}

export default new Utils();
