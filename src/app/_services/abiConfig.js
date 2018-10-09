import IPFS from 'ipfs-mini';
import Utils from '../_utils/utils';

import BBFreelancerJob from '../_services/abi/BBFreelancerJob.json';
import BBFreelancerBid from '../_services/abi/BBFreelancerBid.json';
import BBFreelancerPayment from '../_services/abi/BBFreelancerPayment.json';
import BigbomTokenExtended from '../_services/abi/BigbomTokenExtended.json'; // bbo
import BBDispute from '../_services/abi/BBDispute.json';
import BBVoting from '../_services/abi/BBVoting.json';
import BBParams from '../_services/abi/BBParams.json';

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
            case 'BBParams':
                return {
                    address: '0x2866cef47dce5db897678695d08f0633102f164a',
                    abi: BBParams.abi,
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
        return 'https://ipfs.infura.io/ipfs/';
        //return 'https://cloudflare-ipfs.com/ipfs/';
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

    async getAllowance(web3, ctName) {
        const BBOinstance = await this.contractInstanceGenerator(web3, 'BigbomTokenExtended');
        const ctInstance = await this.contractInstanceGenerator(web3, ctName);
        const [err, result] = await Utils.callMethod(BBOinstance.instance.allowance)(ctInstance.defaultAccount, ctInstance.address);
        if (err) {
            console.log('err allowance: ', err);
            return;
        }
        return result;
    }

    async approve(web3, ctName, value) {
        const BBOinstance = await this.contractInstanceGenerator(web3, 'BigbomTokenExtended');
        const ctInstance = await this.contractInstanceGenerator(web3, ctName);
        const [errApprove, approve] = await Utils.callMethod(BBOinstance.instance.approve)(ctInstance.address, value, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        if (errApprove) {
            console.log('errApprove: ', errApprove);
            return false;
        }
        console.log('approve: ', approve);
        return true;
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
        if (err) {
            return null;
        }
        return blockLogs;
    }

    async getVotingParams(web3, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBParams');
        ctInstance.instance.getVotingParams(
            {
                from: web3.eth.defaultAccount,
            },
            (err, re) => {
                if (err) {
                    console.log(err);
                } else {
                    const votingParams = {
                        minVotes: re[0].toString(),
                        maxVotes: re[1].toString(),
                        stakeDeposit: re[2].toString(),
                        evidenceDuration: re[3].toString(),
                        commitDuration: re[4].toString(),
                        revealDuration: re[5].toString(),
                        bboRewards: re[6].toString(),
                    };
                    callback(votingParams);
                }
            }
        );
    }

    async getDisputeFinalized(web3, jobHash, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        const eventInstance = ctInstance.instance.DisputeFinalized(
            { indexJobHash: web3.sha3(jobHash) },
            {
                fromBlock: 4030174, // should use recent number
                toBlock: 'latest',
            },
            async (err, re) => {
                //console.log('getDisputeFinalized', re);
                if (err) {
                    console.log(err);
                } else {
                    callback(re.args);
                }
            }
        );
        eventInstance.stopWatching();
    }

    async getEventsPollStarted(web3, jobHash, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBDispute');
        const eventInstance = ctInstance.instance.PollStarted(
            { indexJobHash: web3.sha3(jobHash) },
            {
                fromBlock: 4030174, // should use recent number
                toBlock: 'latest',
            },
            async (err, re) => {
                //console.log('getEventsPollStarted', re);
                if (err) {
                    console.log(err);
                } else {
                    ctInstance.instance.getPollTiming(
                        jobHash,
                        {},
                        {
                            fromBlock: 4030174, // should use recent number
                            toBlock: 'latest',
                        },
                        async (err, timmingResult) => {
                            //console.log('timmingResult', timmingResult);
                            if (err) {
                                console.log(err);
                            } else {
                                const blockLog = await this.getBlock(web3, re.blockNumber);
                                const result = {
                                    jobHash,
                                    owner: re.args.creator,
                                    created: blockLog.timestamp,
                                    started: true,
                                    proofHash: Utils.toAscii(re.args.proofHash),
                                    commitEndDate: Number(timmingResult[1].toString()),
                                    evidenceEndDate: Number(timmingResult[0].toString()),
                                    revealEndDate: Number(timmingResult[2].toString()),
                                };
                                callback(result);
                            }
                        }
                    );
                }
            }
        );
        eventInstance.stopWatching();
    }

    async getReasonPaymentRejected(web3, jobHash, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        const eventInstance = ctInstance.instance.PaymentRejected(
            { jobHash },
            {
                fromBlock: 4030174, // should use recent number
                toBlock: 'latest',
            },
            async (err, re) => {
                //console.log('getReasonPaymentRejected', re);
                if (err) {
                    console.log(err);
                } else {
                    if (jobHash === Utils.toAscii(re.args.jobHash)) {
                        const result = {
                            reason: re.args.reason.toString(),
                            created: re.args.rejectedTimestamp.toString(),
                            owner: re.args.sender,
                        };
                        callback(result);
                    }
                }
            }
        );
        eventInstance.stopWatching();
    }

    async getEventsPollAgainsted(web3, jobHash, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBDispute');
        const eventInstance = ctInstance.instance.PollAgainsted(
            { indexJobHash: web3.sha3(jobHash) },
            {
                fromBlock: 4030174, // should use recent number
                toBlock: 'latest',
            },
            async (err, re) => {
                // console.log('getEventsPollAgainsted', re);
                if (err) {
                    console.log(err);
                } else {
                    const blockLog = await this.getBlock(web3, re.blockNumber);
                    const result = {
                        created: blockLog.timestamp,
                        responded: true,
                        jobHash,
                        owner: re.args.creator,
                        proofHash: Utils.toAscii(re.args.proofHash),
                    };
                    // get freelancer proofhash
                    const pollStartedEventInstance = ctInstance.instance.PollStarted(
                        { indexJobHash: web3.sha3(jobHash) },
                        {
                            fromBlock: 4030174, // should use recent number
                            toBlock: 'latest',
                        },
                        (err, pollStartedResult) => {
                            if (err) {
                                console.log(err);
                            } else {
                                ctInstance.instance.getPollTiming(
                                    jobHash,
                                    {},
                                    {
                                        fromBlock: 4030174, // should use recent number
                                        toBlock: 'latest',
                                    },
                                    async (err, timmingResult) => {
                                        //console.log('timmingResult', timmingResult);
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            result.freelancerProofHash = Utils.toAscii(pollStartedResult.args.proofHash);
                                            result.freelancer = pollStartedResult.args.creator;
                                            result.commitEndDate = Number(timmingResult[1].toString());
                                            result.evidenceEndDate = Number(timmingResult[0].toString());
                                            result.revealEndDate = Number(timmingResult[2].toString());
                                            callback(result);
                                        }
                                    }
                                );
                            }
                        }
                    );
                    pollStartedEventInstance.stopWatching();
                }
            }
        );
        eventInstance.stopWatching();
    }

    async checkDisputeStatus(web3, jobHash, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBDispute');
        ctInstance.instance.getPollTiming(
            jobHash,
            {},
            {
                fromBlock: 4030174, // should use recent number
                toBlock: 'latest',
            },
            async (err, timmingResult) => {
                //console.log('timmingResult', timmingResult);
                if (err) {
                    console.log(err);
                } else {
                    if (timmingResult[1].toString() * 1000 > Date.now()) {
                        this.getAllAvailablePoll(web3, callback, jobHash);
                    } else {
                        this.getMyVoting(web3, callback, jobHash);
                    }
                }
            }
        );
    }

    async getAllAvailablePoll(web3, callback, jobHash) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBDispute');
        let filter = {};
        if (jobHash !== undefined) {
            filter = {
                indexJobHash: web3.sha3(jobHash),
            };
        }

        const pollStartedEventInstance = ctInstance.instance.PollStarted(
            filter,
            {
                fromBlock: 4030174, // should use recent number
                toBlock: 'latest',
            },
            (err, pollStartedResult) => {
                //console.log('getAllAvailablePoll', pollStartedResult);
                if (err) {
                    console.log(err);
                } else {
                    ctInstance.instance.getPollTiming(
                        Utils.toAscii(pollStartedResult.args.jobHash),
                        {},
                        {
                            fromBlock: 4030174, // should use recent number
                            toBlock: 'latest',
                        },
                        async (err, timmingResult) => {
                            //console.log('timmingResult', timmingResult);
                            if (err) {
                                console.log(err);
                            } else {
                                if (timmingResult[1].toString() * 1000 > Date.now()) {
                                    let results = {
                                        data: {
                                            freelancerProofHash: Utils.toAscii(pollStartedResult.args.proofHash),
                                            freelancer: pollStartedResult.args.creator,
                                            commitEndDate: timmingResult[1].toString() * 1000,
                                            evidenceEndDate: timmingResult[0].toString() * 1000,
                                            revealEndDate: timmingResult[2].toString() * 1000,
                                        },
                                    };

                                    const eventInstance = ctInstance.instance.PollAgainsted(
                                        { indexJobHash: web3.sha3(Utils.toAscii(pollStartedResult.args.jobHash)) },
                                        {
                                            fromBlock: 4030174, // should use recent number
                                            toBlock: 'latest',
                                        },
                                        async (err, re) => {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                const blockLog = await this.getBlock(web3, re.blockNumber);
                                                results.data.id = re.args.jobHash;
                                                results.data.created = blockLog.timestamp;
                                                results.data.started = true;
                                                results.data.jobHash = Utils.toAscii(re.args.jobHash);
                                                results.data.client = re.args.creator;
                                                results.data.clientProofHash = Utils.toAscii(re.args.proofHash);
                                                callback(results);
                                            }
                                        }
                                    );
                                    eventInstance.stopWatching();
                                }
                            }
                        }
                    );
                }
            }
        );
        pollStartedEventInstance.stopWatching();
    }

    async getMyVoting(web3, callback, jobHash) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBDispute');
        const votingInstance = await this.contractInstanceGenerator(web3, 'BBVoting');
        let filter = {};
        if (jobHash !== undefined) {
            filter = {
                indexJobHash: web3.sha3(jobHash),
            };
        }
        const pollStartedEventInstance = ctInstance.instance.PollStarted(
            filter,
            {
                fromBlock: 4030174, // should use recent number
                toBlock: 'latest',
            },
            (err, pollStartedResult) => {
                //console.log('getMyVoting', pollStartedResult);
                if (err) {
                    console.log(err);
                } else {
                    ctInstance.instance.getPollTiming(
                        Utils.toAscii(pollStartedResult.args.jobHash),
                        {},
                        {
                            fromBlock: 4030174, // should use recent number
                            toBlock: 'latest',
                        },
                        async (err, timmingResult) => {
                            //console.log('timmingResult', timmingResult);
                            if (err) {
                                console.log(err);
                            } else {
                                let results = {
                                    data: {
                                        freelancerProofHash: Utils.toAscii(pollStartedResult.args.proofHash),
                                        freelancer: pollStartedResult.args.creator,
                                        commitEndDate: timmingResult[1].toString() * 1000,
                                        evidenceEndDate: timmingResult[0].toString() * 1000,
                                        revealEndDate: timmingResult[2].toString() * 1000,
                                    },
                                };

                                const eventVotingInstance = votingInstance.instance.VoteCommitted(
                                    { voter: web3.eth.defaultAccount },
                                    {
                                        fromBlock: 4030174, // should use recent number
                                        toBlock: 'latest',
                                    },
                                    async (err, votingResult) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            if (votingResult.args.jobHash === pollStartedResult.args.jobHash) {
                                                const eventInstance = ctInstance.instance.PollAgainsted(
                                                    {},
                                                    {
                                                        fromBlock: 4030174, // should use recent number
                                                        toBlock: 'latest',
                                                    },
                                                    async (err, re) => {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            if (pollStartedResult.args.jobHash === re.args.jobHash) {
                                                                const blockLog = await this.getBlock(web3, re.blockNumber);
                                                                results.data.id = re.args.jobHash;
                                                                results.data.created = blockLog.timestamp;
                                                                results.data.started = true;
                                                                results.data.jobHash = Utils.toAscii(re.args.jobHash);
                                                                results.data.client = re.args.creator;
                                                                results.data.clientProofHash = Utils.toAscii(re.args.proofHash);
                                                                callback(results);
                                                            }
                                                        }
                                                    }
                                                );
                                                eventInstance.stopWatching();
                                            }
                                        }
                                    }
                                );
                                eventVotingInstance.stopWatching();
                            }
                        }
                    );
                }
            }
        );
        pollStartedEventInstance.stopWatching();
    }
}

export default new abiConfigs();
