import IPFS from 'ipfs-mini';
import Utils from '../_utils/utils';
import services from '../_services/services';

//import web3v1 from './web3'; // web3 v1

import BBFreelancerJob_dev from '../_services/abi_dev/BBFreelancerJob.json';
import BBFreelancerBid_dev from '../_services/abi_dev/BBFreelancerBid.json';
import BBFreelancerPayment_dev from '../_services/abi_dev/BBFreelancerPayment.json';
import BigbomTokenExtended_dev from '../_services/abi_dev/BigbomTokenExtended.json'; // bbo
import BBVotingHelper_dev from '../_services/abi_dev/BBVotingHelper.json';
import BBDispute_dev from '../_services/abi_dev/BBDispute.json';
import BBVoting_dev from '../_services/abi_dev/BBVoting.json';
import BBParams_dev from '../_services/abi_dev/BBParams.json';

import BBFreelancerJob_prod from '../_services/abi_production/BBFreelancerJob.json';
import BBFreelancerBid_prod from '../_services/abi_production/BBFreelancerBid.json';
import BBFreelancerPayment_prod from '../_services/abi_production/BBFreelancerPayment.json';
import BigbomTokenExtended_prod from '../_services/abi_production/BigbomTokenExtended.json'; // bbo
import BBDispute_prod from '../_services/abi_production/BBDispute.json';
import BBVoting_prod from '../_services/abi_production/BBVoting.json';
import BBParams_prod from '../_services/abi_production/BBParams.json';

const env = process.env.REACT_APP_ENV;

const ropstenAbi = {
    dev: {
        BBFreelancerJob: {
            address: '0xb1e878028d0e3e47c803cbb9d1684d9d3d72a1b1',
            abi: BBFreelancerJob_dev,
        },
        BBFreelancerBid: {
            address: '0x7b388ecfec2f5f706aa34b540a39e8c434cfc8b4',
            abi: BBFreelancerBid_dev,
        },
        BBFreelancerPayment: {
            address: '0x253f112b946a72a008343d5bccd14e04288ca45c',
            abi: BBFreelancerPayment_dev,
        },
        BigbomTokenExtended: {
            address: '0x1d893910d30edc1281d97aecfe10aefeabe0c41b',
            abi: BigbomTokenExtended_dev,
        },
        BBVotingHelper: {
            address: '0x771911025b4eafb6395042b7dca728b275e5d8c0',
            abi: BBVotingHelper_dev,
        },
        BBDispute: {
            address: '0x2b44a5589e8b3cd106a7542d4af9c5eb0016ef6e',
            abi: BBDispute_dev,
        },
        BBVoting: {
            address: '0xc7252214d78b15f37b94ae73027419a9f275c36f',
            abi: BBVoting_dev,
        },
        BBParams: {
            address: '0xc0647055b50dce8751908bfbd7f1d219ed592d6f',
            abi: BBParams_dev,
        },
    },
    uat: {
        BBFreelancerJob: {
            address: '0x1900fa17bbe8221873a126bd9e5eb9d0709379ec',
            abi: BBFreelancerJob_prod,
        },
        BBFreelancerBid: {
            address: '0x39abc4386a817b5d8a4b008e022b446637e2a1eb',
            abi: BBFreelancerBid_prod,
        },
        BBFreelancerPayment: {
            address: '0x5c6e2663ca0481156a63c7c8ca0372c3efa0471f',
            abi: BBFreelancerPayment_prod,
        },
        BigbomTokenExtended: {
            address: '0x1d893910d30edc1281d97aecfe10aefeabe0c41b',
            abi: BigbomTokenExtended_prod,
        },
        BBDispute: {
            address: '0xdeeaaad9a5f7c63fd2a29db1c9d522b056637b28',
            abi: BBDispute_prod,
        },
        BBVoting: {
            address: '0x347d3adf5081718020d11a2add2a52b39ad9971a',
            abi: BBVoting_prod,
        },
        BBParams: {
            address: '0x2866cef47dce5db897678695d08f0633102f164a',
            abi: BBParams_prod,
        },
    },
    production: {
        BBFreelancerJob: {
            address: '0x1900fa17bbe8221873a126bd9e5eb9d0709379ec',
            abi: BBFreelancerJob_prod,
        },
        BBFreelancerBid: {
            address: '0x39abc4386a817b5d8a4b008e022b446637e2a1eb',
            abi: BBFreelancerBid_prod,
        },
        BBFreelancerPayment: {
            address: '0x5c6e2663ca0481156a63c7c8ca0372c3efa0471f',
            abi: BBFreelancerPayment_prod,
        },
        BigbomTokenExtended: {
            address: '0x1d893910d30edc1281d97aecfe10aefeabe0c41b',
            abi: BigbomTokenExtended_prod,
        },
        BBDispute: {
            address: '0xdeeaaad9a5f7c63fd2a29db1c9d522b056637b28',
            abi: BBDispute_prod,
        },
        BBVoting: {
            address: '0x347d3adf5081718020d11a2add2a52b39ad9971a',
            abi: BBVoting_prod,
        },
        BBParams: {
            address: '0x2866cef47dce5db897678695d08f0633102f164a',
            abi: BBParams_prod,
        },
    },
};

// const rinkebyAbi = {
//     BBFreelancerJob: {
//         address: '0x71356605e4f79fd07b01cc187bdcbc1f4025db1f',
//         abi: BBFreelancerJob.abi,
//     },
//     BBFreelancerBid: {
//         address: '0xf01cc898b9245930a345bec82423b87f602cb8e4',
//         abi: BBFreelancerBid.abi,
//     },
//     BBFreelancerPayment: {
//         address: '0x22ce61d3c44e5a005a9b9f4485cfbc660c1c2ef3',
//         abi: BBFreelancerPayment.abi,
//     },
//     BigbomTokenExtended: {
//         address: '0x2ddc511802a37039c42c6bdb36028b2f8992b0fe',
//         abi: BigbomTokenExtended.abi,
//     },
//     BBDispute: {
//         address: '0x278636913d5203a057adb7e0521b8df9431bdaa5',
//         abi: BBDispute.abi,
//     },
//     BBVoting: {
//         address: '0x54a7cb877948518444e4c97c426cf47718ac94c3',
//         abi: BBVoting.abi,
//     },
//     BBParams: {
//         address: '0xb1b1e7f9223bca9d66aa97b773935d4aec13165d',
//         abi: BBParams.abi,
//     },
// };

//let fromBlock = 3165089; // rinkeby
export const fromBlock = 4369092; // ropsten

class abiConfigs {
    getContract(type) {
        return ropstenAbi[env][type];
    }

    getIpfs() {
        return new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    }

    getIpfsLink() {
        //return 'https://ipfs.infura.io/ipfs/';
        return 'https://cloudflare-ipfs.com/ipfs/';
    }

    getTXlink() {
        return 'https://ropsten.etherscan.io/tx/';
        //return 'https://rinkeby.etherscan.io/tx/'; //'RINKEBY';
    }

    async contractInstanceGenerator(web3, type) {
        const defaultAccount = web3.eth.defaultAccount;
        const address = this.getContract(type).address;
        const abi = this.getContract(type).abi;
        const abiInstance = web3.eth.contract(abi);
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

    async approveNotWait(web3, ctName, value) {
        const BBOinstance = await this.contractInstanceGenerator(web3, 'BigbomTokenExtended');
        const ctInstance = await this.contractInstanceGenerator(web3, ctName);
        BBOinstance.instance.approve(
            ctInstance.address,
            value,
            {
                from: ctInstance.defaultAccount,
                gasPrice: +ctInstance.gasPrice.toString(10),
            },
            (err, re) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(re);
                }
            }
        );
        return true;
    }

    async checkPayment(web3, jobID, callback) {
        const jobInstance = await this.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        const now = Date.now();
        const [err, paymentLog] = await Utils.callMethod(jobInstance.instance.checkPayment)(jobID, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            console.log(err);
            return;
        }
        if (paymentLog[1].toString() * 1000 > now) {
            callback({
                claim: false,
                paymentDuration: paymentLog[1].toString() * 1000,
            });
        } else {
            callback({
                claim: true,
                paymentDuration: 0,
            });
        }
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
            fromBlock: fromBlock, // should use recent number
            toBlock: 'latest',
        });

        eventInstance.watch((error, eventResult) => {
            resultsInit(error, eventResult); // when data update
        });

        eventInstance.get(function(error, eventResult) {
            resultsInit(error, eventResult);
        });
    }

    async getBidCancalled(web3, filter, mergeData, callback) {
        const contractInstance = await this.contractInstanceGenerator(web3, 'BBFreelancerBid');
        let results = {
            data: {},
        };
        const events = contractInstance.instance.BidCanceled(filter, {
            fromBlock: fromBlock, // should use recent number
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
    }

    async filterJobByBider(web3, callback) {
        const filter = { owner: web3.eth.defaultAccount };
        const contractInstance = await this.contractInstanceGenerator(web3, 'BBFreelancerBid');
        contractInstance.instance.BidCreated(
            filter,
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            },
            (error, eventResult) => {
                callback(Utils.toAscii(eventResult.args.jobHash));
            }
        );
    }

    async getPastEventsMergeBidToJob(web3, type, event, filter, mergeData, callback) {
        const contractInstance = await this.contractInstanceGenerator(web3, type);
        let results = {
            data: {},
        };

        const events = contractInstance.instance[event](filter, {
            fromBlock: fromBlock, // should use recent number
            toBlock: 'latest',
        });

        events.get(async (error, events) => {
            if (error) {
                console.log(error);
                results.status = { err: true, text: 'something went wrong! can not get events log :(' };
                callback(results);
            }
            //console.log('getPastEventsMergeBidToJob', events);
            for (let event of events) {
                const userInfoFetch = await services.getUserByWallet(event.args.owner);

                let user = {
                    fullName: event.args.owner,
                    walletAddress: event.args.owner,
                };
                if (userInfoFetch) {
                    user = {
                        fullName: userInfoFetch.userInfo.firstName + ' ' + userInfoFetch.userInfo.lastName,
                        walletAddress: event.args.owner,
                    };
                }
                const bidTpl = {
                    address: event.args.owner,
                    award: Utils.WeiToBBO(web3, event.args.bid.toString()),
                    timeDone: event.args.bidTime.toString(),
                    id: event.args.jobHash,
                    jobHash: mergeData.jobHash,
                    accepted: false,
                    canceled: false,
                    bidBlockNumber: event.blockNumber,
                    freelancerInfo: user,
                };

                mergeData.bid.push(bidTpl);
                if (mergeData.bid.length > 0) {
                    for (let i = 0; i < mergeData.bid.length; i++) {
                        if (mergeData.bid[i].address === event.args.owner) {
                            mergeData.bid[i] = bidTpl;
                        }
                    }
                    mergeData.bid = Utils.removeDuplicates(mergeData.bid, 'address');
                }
            }
            results.data = mergeData;
            results.status = { err: false, text: 'get events log success!' };
            this.getBidCancalled(web3, filter, results.data, callback);
        });
    }

    async jobStarted(web3, jobData, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBFreelancerJob');
        ctInstance.instance.JobStarted(
            { jobID: jobData.jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            },
            async (err, re) => {
                //console.log('jobStarted', re);
                if (err) {
                    console.log(err);
                } else {
                    const blockLog = await this.getBlock(web3, re.blockNumber);
                    const result = {
                        created: blockLog.timestamp,
                    };
                    callback(jobData, result);
                }
            }
        );
    }

    async getPastEventsBidAccepted(web3, type, event, filter, jobData, callback) {
        const contractInstance = await this.contractInstanceGenerator(web3, type);
        let results = {
            data: {},
        };
        const events = contractInstance.instance[event](filter, {
            fromBlock: fromBlock, // should use recent number
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
                if (jobData.bid.length > 0) {
                    for (let bid of jobData.bid) {
                        if (bid.address === e.args.freelancer) {
                            bid.accepted = true;
                            bid.acceptedBlockNumber = e.blockNumber;
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
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            },
            (error, eventResult) => {
                //console.log('job single event -----', eventResult);
                resultsInit(error, eventResult);
            }
        );

        // check no data case
        const eventInstance = contractInstance.instance[event](filter, {
            fromBlock: fromBlock, // should use recent number
            toBlock: 'latest',
        });
        eventInstance.get(function(err, allEvent) {
            if (allEvent.length <= 0) {
                results.status = { err: false, text: 'Have no event' };
                callback(results);
            }
        });
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
        const [, params] = await Utils.callMethod(ctInstance.instance.getVotingParams)();
        const votingParams = {
            minVotes: params[0].toString(),
            maxVotes: params[1].toString(),
            stakeDeposit: params[2].toString(),
            evidenceDuration: params[3].toString(),
            commitDuration: params[4].toString(),
            revealDuration: params[5].toString(),
            bboRewards: params[6].toString(),
        };
        callback(votingParams);
    }

    async getDisputeFinalized(web3, jobID, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        ctInstance.instance.DisputeFinalized(
            { jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            },
            async (err, re) => {
                if (err) {
                    console.log(err, re);
                } else {
                    callback(true);
                }
            }
        );
    }

    async getDisputeFinalizedDisputeContract(web3, jobID, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBDispute');
        ctInstance.instance.DisputeFinalized(
            { jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            },
            async (err, re) => {
                if (err) {
                    console.log(err, re);
                } else {
                    //console.log('getDisputeFinalized', re);
                    callback(true);
                }
            }
        );
    }

    async getTimeDurations(web3, result, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBVotingHelper');
        const [timmingErr, timmingResult] = await Utils.callMethod(ctInstance.instance.getPollStage)(result.jobID, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        if (timmingErr) {
            console.log(timmingErr);
        } else {
            const mResult = {
                commitEndDate: Number(timmingResult[1].toString()),
                evidenceEndDate: Number(timmingResult[0].toString()),
                revealEndDate: Number(timmingResult[2].toString()),
                ...result,
            };
            callback(mResult);
        }
    }

    async getEventsPollStarted(web3, jobID, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBDispute');
        ctInstance.instance.DisputeStarted(
            { jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            },
            async (err, re) => {
                //console.log('getEventsPollStarted', re);
                if (err) {
                    console.log(err);
                } else {
                    const blockLog = await this.getBlock(web3, re.blockNumber);
                    const result = {
                        jobID,
                        //jobHash
                        owner: re.args.creator,
                        created: blockLog.timestamp,
                        started: true,
                        proofHash: Utils.toAscii(re.args.proofHash),
                    };
                    this.getTimeDurations(web3, result, callback);
                }
            }
        );
    }

    async getReasonPaymentRejected(web3, jobID, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        ctInstance.instance.PaymentRejected(
            { jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            },
            async (err, re) => {
                //console.log('getReasonPaymentRejected', re);
                if (err) {
                    console.log(err);
                } else {
                    const result = {
                        reason: re.args.reason.toString(),
                        created: re.args.rejectedTimestamp.toString(),
                        owner: re.args.sender,
                    };
                    callback(result);
                }
            }
        );
    }

    async getEventsPollAgainsted(web3, jobID, callback) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBDispute');
        ctInstance.instance.DisputeAgainsted(
            { jobID },
            {
                fromBlock: fromBlock, // should use recent number
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
                        jobID,
                        //jobHash,
                        owner: re.args.creator,
                        proofHash: Utils.toAscii(re.args.proofHash),
                    };
                    // get freelancer proofhash
                    ctInstance.instance.DisputeStarted(
                        { jobID },
                        {
                            fromBlock: fromBlock, // should use recent number
                            toBlock: 'latest',
                        },
                        (err, pollStartedResult) => {
                            if (err) {
                                console.log(err);
                            } else {
                                result.freelancerProofHash = Utils.toAscii(pollStartedResult.args.proofHash);
                                result.freelancer = pollStartedResult.args.creator;
                                this.getTimeDurations(web3, result, callback);
                            }
                        }
                    );
                }
            }
        );
    }

    async getAllAvailablePoll(web3, callback, jobID) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBDispute');
        const helperInstance = await this.contractInstanceGenerator(web3, 'BBVotingHelper');
        let filter = {};
        if (jobID !== undefined) {
            filter = {
                jobID,
            };
        }
        ctInstance.instance.DisputeStarted(
            filter,
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            },
            async (err, pollStartedResult) => {
                //console.log('getAllAvailablePoll', pollStartedResult);
                if (err) {
                    console.log(err);
                } else {
                    const [timmingErr, timmingResult] = await Utils.callMethod(helperInstance.instance.getPollStage)(
                        pollStartedResult.args.jobID.toString(),
                        {
                            from: ctInstance.defaultAccount,
                            gasPrice: +ctInstance.gasPrice.toString(10),
                        }
                    );
                    if (timmingErr) {
                        console.log(timmingErr);
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
                        ctInstance.instance.DisputeAgainsted(
                            { jobID: pollStartedResult.args.jobID.toString() },
                            {
                                fromBlock: fromBlock, // should use recent number
                                toBlock: 'latest',
                            },
                            async (err, re) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    const blockLog = await this.getBlock(web3, re.blockNumber);
                                    results.data.jobID = re.args.jobID.toString();
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
                    }
                }
            }
        );
    }

    async getMyVoting(web3, callback, jobHash) {
        const ctInstance = await this.contractInstanceGenerator(web3, 'BBDispute');
        const helperInstance = await this.contractInstanceGenerator(web3, 'BBVotingHelper');
        const votingInstance = await this.contractInstanceGenerator(web3, 'BBVoting');
        let filter = {};
        if (jobHash !== undefined) {
            filter = {
                indexJobHash: web3.sha3(jobHash),
            };
        }
        ctInstance.instance.DisputeStarted(
            filter,
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            },
            async (err, pollStartedResult) => {
                //console.log('getMyVoting', pollStartedResult);
                if (err) {
                    console.log(err);
                } else {
                    const [timmingErr, timmingResult] = await Utils.callMethod(helperInstance.instance.getPollStage)(pollStartedResult.args.jobID, {
                        from: helperInstance.defaultAccount,
                        gasPrice: +helperInstance.gasPrice.toString(10),
                    });
                    if (timmingErr) {
                        console.log(timmingErr);
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
                        votingInstance.instance.VoteCommitted(
                            { voter: web3.eth.defaultAccount, jobID: pollStartedResult.args.jobID.toString() },
                            {
                                fromBlock: fromBlock, // should use recent number
                                toBlock: 'latest',
                            },
                            async (err, votingResult) => {
                                if (!votingResult) {
                                    console.log(err);
                                } else {
                                    ctInstance.instance.DisputeAgainsted(
                                        { jobID: pollStartedResult.args.jobID.toString() },
                                        {
                                            fromBlock: fromBlock, // should use recent number
                                            toBlock: 'latest',
                                        },
                                        async (err, re) => {
                                            if (!re) {
                                                console.log(err);
                                            } else {
                                                const blockLog = await this.getBlock(web3, re.blockNumber);
                                                results.data.id = re.args.jobHash;
                                                results.data.created = blockLog.timestamp;
                                                results.data.started = true;
                                                results.data.jobHash = Utils.toAscii(re.args.jobHash);
                                                results.data.client = re.args.creator;
                                                results.data.clientProofHash = Utils.toAscii(re.args.proofHash);
                                                results.data.isFinal = false;
                                                results.data.rewardRight = false;

                                                const [errRewardCheck, resultRewardCheck] = await Utils.callMethod(
                                                    votingInstance.instance.calcReward
                                                )(Utils.toAscii(re.args.jobHash), {
                                                    from: votingInstance.defaultAccount,
                                                    gasPrice: +votingInstance.gasPrice.toString(10),
                                                });
                                                if (errRewardCheck) {
                                                    console.log(errRewardCheck);
                                                    return;
                                                }
                                                if (Number(resultRewardCheck.toString()) > 0) {
                                                    results.data.rewardRight = true;
                                                }

                                                callback(results);
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    }
                }
            }
        );
    }

    async transactionWatch(web3, hashString, callback) {
        async function getReceipt() {
            const [, receipt] = await Utils.callMethod(web3.eth.getTransactionReceipt)(hashString);
            if (receipt) {
                if (receipt.blockNumber !== null) {
                    clearInterval(watch);
                    callback();
                    return;
                }
            }
        }
        const watch = setInterval(async () => {
            getReceipt();
        }, 1000);
    }
}

export default new abiConfigs();
