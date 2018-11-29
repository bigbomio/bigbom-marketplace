import groupBy from 'lodash.groupby';
import mapValues from 'lodash.mapvalues';
import omit from 'lodash.omit';
import Utils from '../_utils/utils';
import abiConfig, { fromBlock } from '../_services/abiConfig';
import services from './services';

const getAllowance = async (web3, ctName) => {
    try {
        const BBOinstance = await abiConfig.contractInstanceGenerator(web3, 'BigbomTokenExtended');
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, ctName);
        const [err, result] = await Utils.callMethod(BBOinstance.instance.allowance)(ctInstance.defaultAccount, ctInstance.address);
        if (err) {
            console.log('err allowance: ', err);
            return;
        }
        return result;
    } catch (error) {
        console.log('error: ', error);
    }
};

const approve = async (web3, ctName, value) => {
    try {
        const BBOinstance = await abiConfig.contractInstanceGenerator(web3, 'BigbomTokenExtended');
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, ctName);
        const [errApprove, tx] = await Utils.callMethod(BBOinstance.instance.approve)(ctInstance.address, value, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        if (errApprove) {
            console.log('errApprove: ', errApprove);
            return false;
        }
        console.log('approve: ', tx);
        return true;
    } catch (error) {
        console.log('error: ', error);
    }
};

const checkPayment = async (web3, jobID) => {
    try {
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerPayment');
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
            return {
                claim: false,
                paymentDuration: paymentLog[1].toString() * 1000,
            };
        } else {
            return {
                claim: true,
                paymentDuration: 0,
            };
        }
    } catch (error) {
        console.log('error: ', error);
    }
};

const getBlock = async (web3, blockNumber) => {
    try {
        const [err, blockLogs] = await Utils.callMethod(web3.eth.getBlock)(blockNumber);
        if (err) {
            return null;
        }
        return blockLogs;
    } catch (error) {
        console.log('error: ', error);
    }
};

const getBidCancalled = async (web3, filter, mergeData) => {
    try {
        const bidInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerBid');
        const bidEvent = await bidInstance.instance.BidAccepted(filter, {
            fromBlock: fromBlock,
            toBlock: 'latest',
        });
        let results = {
            data: {},
        };
        const bidLogs = await Utils.WaitAllContractEventGet(bidEvent);
        for (let log of bidLogs) {
            for (let bid of mergeData.bid) {
                if (bid.address === log.args.owner) {
                    bid.canceled = true;
                    bid.canceledBlockNumber = log.blockNumber;
                }
            }
        }
        results.data = mergeData;
        return results;
    } catch (error) {
        console.log('error: ', error);
    }
};

const mergeBidToJob = async (web3, type, event, filter, mergeData) => {
    try {
        const contractInstance = await abiConfig.contractInstanceGenerator(web3, type);
        const ctEvent = await contractInstance.instance[event](filter, {
            fromBlock: fromBlock,
            toBlock: 'latest',
        });
        let results = {
            data: {},
        };
        const eventLogs = await Utils.WaitAllContractEventGet(ctEvent);
        for (let event of eventLogs) {
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
        const bidsCalled = await getBidCancalled(web3, filter, results.data);
        return bidsCalled;
    } catch (error) {
        console.log('error: ', error);
    }
};

const jobStarted = async (web3, jobData) => {
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const jobEvent = await ctInstance.instance.BidAccepted(
            { jobID: jobData.jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const jobLogs = await Utils.WaitAllContractEventGet(jobEvent);
        for (let jobLog in jobLogs) {
            if (jobData.jobID === jobLog.args.jobID.toString()) {
                const blockLog = await getBlock(web3, jobLog.blockNumber);
                const result = {
                    created: blockLog.timestamp,
                };
                return {
                    jobData,
                    jobStarted: result,
                };
            }
        }
    } catch (error) {
        console.log('error: ', error);
    }
};

const getPastSingleEvent = async (web3, type, event, filter) => {
    const contractInstance = await abiConfig.contractInstanceGenerator(web3, type);
    let results = [];
    const ctEvent = await contractInstance.instance[event](filter, {
        fromBlock: fromBlock, // should use recent number
        toBlock: 'latest',
    });
    const eventLogs = await Utils.WaitAllContractEventGet(ctEvent);
    if (eventLogs) {
        results = eventLogs;
    }
    return results;
};

const getBidAccepted = async (web3, filter, jobData) => {
    let results = {
        data: {},
    };
    try {
        const ratingInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerBid');
        const bidEvent = await ratingInstance.instance.BidAccepted(filter, {
            fromBlock: fromBlock, // should use recent number
            toBlock: 'latest',
        });
        const bidLogs = await Utils.WaitAllContractEventGet(bidEvent);
        const bidAcceptedFiltered = bidLogs.filter(bid => bid.args.jobID.toString() === jobData.jobID);
        if (jobData.bid.length > 0) {
            if (bidAcceptedFiltered.length > 0) {
                for (let bid of jobData.bid) {
                    if (bid.address === bidAcceptedFiltered[0].args.freelancer) {
                        bid.accepted = true;
                        bid.acceptedBlockNumber = bidAcceptedFiltered.blockNumber;
                    }
                }
            }
        } else {
            jobData.status.expired = Number(jobData.expired) <= Math.floor(Date.now() / 1000) ? true : false;
        }
        results.data = jobData;
        results.status = { err: false, text: 'get events log success!' };
        return results;
    } catch (err) {
        console.log(err);
    }
};

const checkAllowRating = async (web3, ratingOwner, ratingFor, jobID) => {
    try {
        const ratingInstance = await abiConfig.contractInstanceGenerator(web3, 'BBRating');
        const [, allow] = await Utils.callMethod(ratingInstance.instance.allowRating)(ratingOwner, ratingFor, jobID, {
            from: ratingInstance.defaultAccount,
            gasPrice: +ratingInstance.gasPrice.toString(10),
        });
        return allow;
    } catch (err) {
        console.log(err);
    }
};

const getVotingParams = async web3 => {
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBParams');
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
        return votingParams;
    } catch (err) {
        console.log(err);
    }
};

const getDisputeFinalized = async (web3, jobID) => {
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        const ctEvent = await ctInstance.instance.DisputeFinalized(
            {},
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const eventLogs = await Utils.WaitAllContractEventGet(ctEvent);
        for (let event of eventLogs) {
            if (event.args.jobID.toString() === jobID) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    } catch (e) {
        console.log(e);
    }
};

const getRatingLog = async payload => {
    let ratingDatas = [];
    try {
        const ratingInstance = await abiConfig.contractInstanceGenerator(payload.web3, 'BBRating');
        for (let i = 0; i < payload.listAddress.length; i++) {
            const ratingEvent = await ratingInstance.instance.Rating(
                { rateToAddress: payload.listAddress[i] },
                {
                    fromBlock: fromBlock, // should use recent number
                    toBlock: 'latest',
                }
            );
            const logs = await Utils.WaitAllContractEventGet(ratingEvent);
            const logsGroupByAddress = mapValues(
                groupBy(logs, obj => {
                    return obj.args.whoRate;
                }),
                ratelist => {
                    return ratelist.map(rate =>
                        omit(rate, rateObj => {
                            return rateObj.whoRate;
                        })
                    );
                }
            );
            let ratingData = {
                address: payload.listAddress[i],
                ratinglist: [],
                totalStar: 0,
                avgRating: 'N/A',
                totalRating: 0,
                ratingRanks: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
            Object.entries(logsGroupByAddress).forEach(([, value]) => {
                const logsFilteredLatest = Utils.filterObjectArrayByMax(value, 'blockNumber');
                ratingData.totalStar += Number(logsFilteredLatest.args.star.toString());
                ratingData.ratingRanks[logsFilteredLatest.args.star.toString()] += 1;
                const rateData = {
                    commentHash: logsFilteredLatest.args.commentHash,
                    jobID: logsFilteredLatest.args.jobID.toString(),
                    rateToAddress: logsFilteredLatest.args.rateToAddress,
                    star: logsFilteredLatest.args.star.toString(),
                    totalStar: logsFilteredLatest.args.totalStar.toString(),
                    totalUser: logsFilteredLatest.args.totalUser.toString(),
                    whoRate: logsFilteredLatest.args.whoRate,
                };
                ratingData.ratinglist.push(rateData);
                ratingData.avgRating = (ratingData.totalStar / ratingData.ratinglist.length).toFixed(1);
                ratingData.totalRating += 1;
            });
            ratingDatas.push(ratingData);
        }

        return ratingDatas;
    } catch (err) {
        console.log(err);
    }
};

export default {
    getAllowance,
    approve,
    checkPayment,
    getBlock,
    checkAllowRating,
    getBidCancalled,
    mergeBidToJob,
    jobStarted,
    getRatingLog,
    getBidAccepted,
    getPastSingleEvent,
    getVotingParams,
    getDisputeFinalized,
};
