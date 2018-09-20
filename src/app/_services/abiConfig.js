import IPFS from 'ipfs-mini';
import Utils from '../_utils/utils';

import BBFreelancerJob from '../_services/abi/BBFreelancerJob.json';
import BBFreelancerBid from '../_services/abi/BBFreelancerBid.json';
import BBFreelancerPayment from '../_services/abi/BBFreelancerPayment.json';
import BigbomTokenExtended from '../_services/abi/BigbomTokenExtended.json'; // bbo
import BBDispute from '../_services/abi/BBDispute.json';
import BBVoting from '../_services/abi/BBVoting.json';

class abiConfigs {
    getContract(type) {
        switch (type) {
            case 'BBFreelancerJob':
                return {
                    address: '0x1900fa17bbe8221873a126bd9e5eb9d0709379ec',
                    abi: BBFreelancerJob.abi,
                };
            case 'BBFreelancerBid':
                return {
                    address: '0x39abc4386a817b5d8a4b008e022b446637e2a1eb',
                    abi: BBFreelancerBid.abi,
                };
            case 'BBFreelancerPayment':
                return {
                    address: '0x5c6e2663ca0481156a63c7c8ca0372c3efa0471f',
                    abi: BBFreelancerPayment.abi,
                };
            case 'BigbomTokenExtended':
                return {
                    address: '0x1d893910d30edc1281d97aecfe10aefeabe0c41b',
                    abi: BigbomTokenExtended.abi,
                };
            case 'BBDispute':
                return {
                    address: '0xdeeaaad9a5f7c63fd2a29db1c9d522b056637b28',
                    abi: BBDispute.abi,
                };
            case 'BBVoting':
                return {
                    address: '0x347d3adf5081718020d11a2add2a52b39ad9971a',
                    abi: BBVoting.abi,
                };
            default:
                return {
                    address: '0x1900fa17bbe8221873a126bd9e5eb9d0709379ec',
                    abi: BBFreelancerJob.abi,
                };
        }
    }

    getIpfs() {
        return new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    }

    getIpfsLink() {
        return 'https://cloudflare-ipfs.com/ipfs/';
    }

    getTXlink() {
        return 'https://ropsten.etherscan.io/tx/';
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
            fromBlock: 4030174, // should use recent number
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
            fromBlock: 4030174, // should use recent number
            toBlock: 'latest',
        });
        events.get(function(error, bidCanceledEvents) {
            if (error) {
                console.log(error);
                results.status = { err: true, text: 'something went wrong! can not get events log :(' };
                callback(results);
            }
            for (let bidEvent of bidCanceledEvents) {
                for (let bid of mergeData.bid) {
                    if (bid.address === bidEvent.args.owner) {
                        bid.canceled = true;
                        bid.canceledBlockNumber = bidEvent.blockNumber;
                    }
                }
            }
            results.data = mergeData;
            results.status = { err: false, text: 'get events log success!' };
            callback(results);
        });
        events.stopWatching();
    }

    async getPastEventsMergeBidToJob(web3, type, event, filter, mergeData, callback) {
        const contractInstance = await this.contractInstanceGenerator(web3, type);
        let results = {
            data: {},
        };

        const events = contractInstance.instance[event](filter, {
            fromBlock: 4030174, // should use recent number
            toBlock: 'latest',
        });

        events.get(async (error, events) => {
            if (error) {
                console.log(error);
                results.status = { err: true, text: 'something went wrong! can not get events log :(' };
                callback(results);
            }
            let bidAddr = '';
            for (let event of events) {
                const bidTpl = {
                    address: event.args.owner,
                    award: Utils.WeiToBBO(web3, event.args.bid.toString()),
                    timeDone: event.args.bidTime.toString(),
                    id: event.args.jobHash,
                    jobHash: mergeData.jobHash,
                    accepted: false,
                    canceled: false,
                    bidBlockNumber: event.blockNumber,
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
            fromBlock: 4030174, // should use recent number
            toBlock: 'latest',
        });
        events.get(function(error, events) {
            if (error) {
                console.log(error);
                results.status = { err: true, text: 'something went wrong! can not get events log :(' };
                callback(results);
            }
            // console.log('event bid accepted  -------', events);
            for (let e of events) {
                const jobHashE = e.args.jobHash;
                if (jobData.bid.length > 0) {
                    for (let bid of jobData.bid) {
                        if (web3.sha3(jobData.jobHash) === jobHashE) {
                            if (bid.address === e.args.freelancer) {
                                bid.accepted = true;
                                bid.acceptedBlockNumber = e.blockNumber;
                            }
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

        const getSingleEvent = contractInstance.instance[event](
            filter,
            {
                fromBlock: 4030174, // should use recent number
                toBlock: 'latest',
            },
            (error, eventResult) => {
                //console.log('job single event -----', eventResult);
                resultsInit(error, eventResult);
            }
        );

        getSingleEvent.stopWatching();

        // check no data case
        const eventInstance = contractInstance.instance[event](filter, {
            fromBlock: 4030174, // should use recent number
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

    async getBlock(web3, blockNumber) {
        const [err, blockLogs] = await Utils.callMethod(web3.eth.getBlock)(blockNumber);
        console.log(err, blockLogs);
    }
}

export default new abiConfigs();
