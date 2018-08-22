import IPFS from 'ipfs-mini';
import Utils from '../_utils/utils';

import BBFreelancerJob from '../_services/abi/BBFreelancerJob.json';
import BBFreelancerBid from '../_services/abi/BBFreelancerBid.json';
import BBFreelancerPayment from '../_services/abi/BBFreelancerPayment.json';
import BigbomTokenExtended from '../_services/abi/BigbomTokenExtended.json'; // bbo

class abiConfigs {
    getContract(type) {
        switch (type) {
            case 'BBFreelancerJob':
                return {
                    address: '0x62aa93f9dffec25daf9d2955d468194e996e8c87',
                    abi: BBFreelancerJob.abi,
                };
            case 'BBFreelancerBid':
                return {
                    address: '0x0ff11890ef301dfd0fb37e423930b391836c69c9',
                    abi: BBFreelancerBid.abi,
                };
            case 'BBFreelancerPayment':
                return {
                    address: '0x7b7e6f2b02a48bd24b5b1554fafff5f70547ab0a',
                    abi: BBFreelancerPayment.abi,
                };
            case 'BigbomTokenExtended':
                return {
                    address: '0x1d893910d30edc1281d97aecfe10aefeabe0c41b',
                    abi: BigbomTokenExtended.abi,
                };
            default:
                return {
                    address: '0x62aa93f9dffec25daf9d2955d468194e996e8c87',
                    abi: BBFreelancerJob.abi,
                };
        }
    }

    getIpfs() {
        return new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    }

    getIpfsLink() {
        return 'https://ipfs.infura.io/ipfs/';
    }

    async contractInstanceGenerator(web3, type) {
        const defaultAccount = web3.eth.defaultAccount;
        const address = this.getContract(type).address;
        const abiInstance = web3.eth.contract(this.getContract(type).abi);
        const instance = await abiInstance.at(address);
        const gasPrice = await Utils.callMethodWithReject(web3.eth.getGasPrice)();
        return {
            defaultAccount,
            instance,
            gasPrice,
            address,
        };
    }

    async getPastEvents(web3, type, event, filter, callback) {
        const contractInstance = await this.contractInstanceGenerator(web3, type);
        let results = {
            data: [],
        };
        function resultsInit(error, eventResult) {
            if (error) {
                console.log(error);
                results.status = { err: true, text: 'something went wrong! can not get events log :(' };
                callback(results);
            }
            if (eventResult.length > 0) {
                results.data = eventResult;
                results.status = { err: false, text: 'get events log success!' };
                callback(results);
            } else {
                results.status = { err: true, text: 'Data not found! :(' };
                callback(results);
            }
        }

        const eventInstance = contractInstance.instance[event](filter, {
            fromBlock: 3880298, // should use recent number
            toBlock: 'latest',
        });

        eventInstance.watch((error, eventResult) => {
            resultsInit(error, eventResult); // when data update
        });

        eventInstance.get(function(error, eventResult) {
            resultsInit(error, eventResult);
        });
    }

    async getPastEventsMerge(web3, type, event, filter, mergeData, callback) {
        const contractInstance = await this.contractInstanceGenerator(web3, type);
        let results = {
            data: [],
        };
        const events = contractInstance.instance[event](filter, {
            fromBlock: 3880298, // should use recent number
            toBlock: 'latest',
        });
        await events.get(function(error, events) {
            if (error) {
                console.log(error);
                results.status = { err: true, text: 'something went wrong! can not get events log :(' };
                callback(results);
            }
            for (let event of events) {
                const bidTpl = {
                    address: event.args.owner,
                    award: event.args.bid.toString(),
                    created: event.args.created.toString(),
                    id: event.args.jobHash,
                    accepted: false,
                };
                if (mergeData.id === event.args.jobHash) {
                    mergeData.bid.push(bidTpl);
                }
            }
            results.data = mergeData;
            results.status = { err: false, text: 'get events log success!' };
            callback(results);
        });
    }

    async getPastEventsBidAccepted(web3, type, event, filter, jobData, callback) {
        const contractInstance = await this.contractInstanceGenerator(web3, type);
        let results = {
            data: [],
        };
        const events = contractInstance.instance[event](filter, {
            fromBlock: 3880298, // should use recent number
            toBlock: 'latest',
        });
        await events.get(function(error, events) {
            if (error) {
                console.log(error);
                results.status = { err: true, text: 'something went wrong! can not get events log :(' };
                callback(results);
            }
            for (let event of events) {
                if (jobData.bid.length > 0) {
                    for (let bid of jobData.bid) {
                        if (bid.id === event.args.jobHash) {
                            bid.accepted = true;
                        }
                    }
                }
            }
            results.data = jobData;
            results.status = { err: false, text: 'get events log success!' };
            callback(results);
        });
    }

    async getPastSingleEvent(web3, type, event, filter, callback) {
        const contractInstance = await this.contractInstanceGenerator(web3, type);
        let results = {
            data: null,
        };

        function resultsInit(error, eventResult) {
            if (error) {
                console.log(error);
                results.status = { err: true, text: 'something went wrong! can not get events log :(' };
                callback(results);
            } else {
                results.data = eventResult;
                results.status = { err: false, text: 'get events log success!' };
                callback(results);
            }
        }

        contractInstance.instance[event](
            filter,
            {
                fromBlock: 3880298, // should use recent number
                toBlock: 'latest',
            },
            (error, eventResult) => {
                console.log(eventResult);
                resultsInit(error, eventResult);
            }
        );

        // check no data case
        const eventInstance = contractInstance.instance[event](filter, {
            fromBlock: 3880298, // should use recent number
            toBlock: 'latest',
        });
        eventInstance.get(function(err, allEvent) {
            if (allEvent.length <= 0) {
                results.status = { err: false, text: 'Have no event' };
                callback(results);
            }
        });
    }
}

export default new abiConfigs();
