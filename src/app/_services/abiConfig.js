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
            fromBlock: 3938000, // should use recent number
            toBlock: 'latest',
        });

        eventInstance.watch((error, eventResult) => {
            resultsInit(error, eventResult); // when data update
        });

        eventInstance.get(function(error, eventResult) {
            resultsInit(error, eventResult);
        });

        eventInstance.stopWatching();
    }

    async getBidCancalled(web3, filter, mergeData, callback) {
        const contractInstance = await this.contractInstanceGenerator(web3, 'BBFreelancerBid');
        let results = {
            data: {},
        };
        const events = contractInstance.instance.BidCanceled(filter, {
            fromBlock: 3938000, // should use recent number
            toBlock: 'latest',
        });
        events.get(function(error, bidCanceledEvents) {
            if (error) {
                console.log(error);
                results.status = { err: true, text: 'something went wrong! can not get events log :(' };
                callback(results);
            }
            for (let bidEvents of bidCanceledEvents) {
                for (let bid of mergeData.bid) {
                    if (bid.address === bidEvents.args.owner) {
                        bid.canceled = true;
                    }
                }
            }
            results.data = mergeData;
            results.status = { err: false, text: 'get events log success!' };
            callback(results);
        });
        events.stopWatching();
    }

    async getPastEventsMerge(web3, type, event, filter, mergeData, callback) {
        const contractInstance = await this.contractInstanceGenerator(web3, type);
        let results = {
            data: {},
        };

        const events = contractInstance.instance[event](filter, {
            fromBlock: 3938000, // should use recent number
            toBlock: 'latest',
        });

        events.get((error, events) => {
            if (error) {
                console.log(error);
                results.status = { err: true, text: 'something went wrong! can not get events log :(' };
                callback(results);
            }
            let bidAddr = '';
            for (let event of events) {
                //console.log('event created bid  -------', event);
                const bidTpl = {
                    address: event.args.owner,
                    award: event.args.bid.toString(),
                    created: event.args.created.toString(),
                    timeDone: event.args.timeDone.toString(),
                    id: event.args.jobHash,
                    jobHash: mergeData.jobHash,
                    accepted: false,
                    canceled: false,
                    blockNumber: event.blockNumber,
                };
                if (web3.sha3(mergeData.jobHash) === event.args.jobHash) {
                    // get latest bid for each address
                    if (bidTpl.address !== bidAddr) {
                        bidAddr = bidTpl.address;
                        mergeData.bid.push(bidTpl);
                    } else {
                        mergeData.bid.map((b, i) => {
                            if (b.address === bidTpl.address) {
                                mergeData.bid[i] = bidTpl;
                            }
                            return mergeData;
                        });
                    }
                }
            }
            results.data = mergeData;
            results.status = { err: false, text: 'get events log success!' };
            this.getBidCancalled(web3, filter, results.data, callback);
        });
        events.stopWatching();
    }

    async getPastEventsBidAccepted(web3, type, event, filter, jobData, callback) {
        const contractInstance = await this.contractInstanceGenerator(web3, type);
        let results = {
            data: {},
        };
        const events = contractInstance.instance[event](filter, {
            fromBlock: 3938000, // should use recent number
            toBlock: 'latest',
        });
        events.get(function(error, events) {
            if (error) {
                console.log(error);
                results.status = { err: true, text: 'something went wrong! can not get events log :(' };
                callback(results);
            }
            //console.log('event bid accepted  -------', events);
            for (let e of events) {
                if (jobData.bid.length > 0) {
                    for (let bid of jobData.bid) {
                        if (bid.address === e.args.freelancer) {
                            bid.accepted = true;
                        }
                    }
                } else {
                    jobData.status.expired = Number(jobData.expired) <= Math.floor(Date.now() / 1000) ? true : false;
                }
            }
            results.data = jobData;
            results.status = { err: false, text: 'get events log success!' };
            callback(results);
        });
        events.stopWatching();
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
                fromBlock: 3938000, // should use recent number
                toBlock: 'latest',
            },
            (error, eventResult) => {
                //console.log('job single event -----', eventResult);
                resultsInit(error, eventResult);
            }
        );

        // check no data case
        const eventInstance = contractInstance.instance[event](filter, {
            fromBlock: 3938000, // should use recent number
            toBlock: 'latest',
        });
        eventInstance.get(function(err, allEvent) {
            if (allEvent.length <= 0) {
                results.status = { err: false, text: 'Have no event' };
                callback(results);
            }
        });

        eventInstance.stopWatching();
    }
}

export default new abiConfigs();
