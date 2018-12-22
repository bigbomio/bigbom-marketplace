import groupBy from 'lodash.groupby';
import mapValues from 'lodash.mapvalues';
import omit from 'lodash.omit';
import Utils from '../_utils/utils';
import abiConfig, { fromBlock } from '../_services/abiConfig';
import services from './services';

const web3 = global.web3;

const getAllowance = async ctName => {
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

const approve = async (ctName, value) => {
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

const checkPayment = async jobID => {
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

const getBlock = async blockNumber => {
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

const getBidCancalled = async (filter, mergeData) => {
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

const mergeBidToJob = async (type, event, filter, mergeData) => {
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
                    fullName: userInfoFetch.userInfo.firstName
                        ? userInfoFetch.userInfo.firstName + ' '
                        : 'N/A ' + userInfoFetch.userInfo.lastName
                        ? userInfoFetch.userInfo.lastName
                        : null,
                    walletAddress: event.args.owner,
                };
            }
            const bidTpl = {
                address: event.args.owner,
                award: Utils.weiToToken(web3, event.args.bid.toString()),
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
        const bidsCalled = await getBidCancalled(filter, results.data);
        return bidsCalled;
    } catch (error) {
        console.log('error: ', error);
    }
};

const jobStarted = async jobData => {
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const jobEvent = await ctInstance.instance.JobStarted(
            { jobID: jobData.jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const jobLogs = await Utils.WaitAllContractEventGet(jobEvent);
        for (let jobLog of jobLogs) {
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

const getPastSingleEvent = async (type, event, filter) => {
    try {
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
    } catch (err) {
        console.log(err);
    }
};

const getBidAccepted = async (filter, jobData) => {
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

const checkAllowRating = async (ratingOwner, ratingFor, jobID) => {
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

const getVotingParams = async () => {
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

const getDisputeFinalized = async jobID => {
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

const getDisputeFinalizedDisputeContract = async jobID => {
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');
        const ctEvent = await ctInstance.instance.DisputeFinalized(
            { jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const eventLogs = await Utils.WaitAllContractEventGet(ctEvent);
        for (let event of eventLogs) {
            if (event) {
                return true;
            } else {
                return false;
            }
        }
    } catch (e) {
        console.log(e);
    }
};

const getTimeDurations = async result => {
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVotingHelper');
        const [timmingErr, timmingResult] = await Utils.callMethod(ctInstance.instance.getPollStage)(result.pollID, {
            from: ctInstance.defaultAccount,
            gasPrice: +ctInstance.gasPrice.toString(10),
        });
        if (timmingErr) {
            console.log(timmingErr);
        } else {
            return {
                commitEndDate: Number(timmingResult[3].toString()),
                evidenceEndDate: Number(timmingResult[2].toString()),
                revealEndDate: Number(timmingResult[4].toString()),
                ...result,
            };
        }
    } catch (e) {
        console.log(e);
    }
};

const getEventsPollStarted = async (jobID, optionID) => {
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');
        const helperInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVotingHelper');
        const ctEvent = await ctInstance.instance.DisputeStarted(
            { jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const logs = await Utils.WaitAllContractEventGet(ctEvent);
        for (let log of logs) {
            const blockLog = await getBlock(web3, log.blockNumber);
            const [, pollOption] = await Utils.callMethod(helperInstance.instance.getPollOption)(log.args.pollID.toString(), optionID);
            const result = {
                jobID,
                pollID: log.args.pollID.toString(),
                //jobHash
                owner: log.args.creator,
                created: blockLog.timestamp,
                started: true,
                proofHash: Utils.toAscii(pollOption),
            };
            const timeDurations = await getTimeDurations(result);
            return timeDurations;
        }
    } catch (e) {
        console.log(e);
    }
};

const getReasonPaymentRejected = async jobID => {
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        const ctEvent = await ctInstance.instance.PaymentRejected(
            { jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const logs = await Utils.WaitAllContractEventGet(ctEvent);
        for (let log of logs) {
            return {
                reason: log.args.reason.toString(),
                created: log.args.rejectedTimestamp.toString(),
                owner: log.args.sender,
            };
        }
    } catch (e) {
        console.log(e);
    }
};

const getEventsPollAgainsted = async jobID => {
    try {
        const helperInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVotingHelper');
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');

        const DisputeAgainstedEvent = await ctInstance.instance.DisputeAgainsted(
            { jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const DisputeAgainstedlogs = await Utils.WaitAllContractEventGet(DisputeAgainstedEvent);
        const pollID = DisputeAgainstedlogs[0].args.pollID.toString();
        const [, freelancerProofHash] = await Utils.callMethod(helperInstance.instance.getPollOption)(pollID, 1); // get freelancer proofhash
        const [, clientProofHash] = await Utils.callMethod(helperInstance.instance.getPollOption)(pollID, 2); // get client proofhash
        const blockLog = await getBlock(web3, DisputeAgainstedlogs[0].blockNumber);
        const result = {
            created: blockLog.timestamp,
            responded: true,
            jobID,
            pollID,
            owner: DisputeAgainstedlogs[0].args.creator,
            proofHash: Utils.toAscii(clientProofHash),
        };
        const disputeStartedEvent = await ctInstance.instance.DisputeStarted(
            { pollID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const disputeStartedlogs = await Utils.WaitAllContractEventGet(disputeStartedEvent);
        result.freelancerProofHash = Utils.toAscii(freelancerProofHash);
        result.freelancer = disputeStartedlogs[0].args.creator;
        const timeDurations = await getTimeDurations(result);
        return timeDurations;
    } catch (e) {
        console.log(e);
    }
};

const getJobCreatedByJobID = async datas => {
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const ctEvent = await ctInstance.instance.JobCreated(
            { jobID: datas.data.jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const ctLogs = await Utils.WaitAllContractEventGet(ctEvent);
        for (let log of ctLogs) {
            datas.data.jobHash = Utils.toAscii(log.args.jobHash);
        }
        return datas;
    } catch (e) {
        console.log(e);
    }
};

const getAllAvailablePoll = async jobID => {
    let disputeDatas = [];
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');
        const helperInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVotingHelper');
        let filter = {};
        if (jobID !== undefined) {
            filter = {
                jobID,
            };
        }
        // get dispute againsted by client
        const disputeAgaistedEvent = await ctInstance.instance.DisputeAgainsted(filter, {
            fromBlock: fromBlock, // should use recent number
            toBlock: 'latest',
        });
        const disputeAgaistedLogs = await Utils.WaitAllContractEventGet(disputeAgaistedEvent);
        for (let disputeAgaistedLog of disputeAgaistedLogs) {
            let results = {};
            const pollID = disputeAgaistedLog.args.pollID.toString();

            // get freelancer address :(
            const disputeStartedEvent = await ctInstance.instance.DisputeStarted(
                { pollID },
                {
                    fromBlock: fromBlock, // should use recent number
                    toBlock: 'latest',
                }
            );
            const disputeStartedlogs = await Utils.WaitAllContractEventGet(disputeStartedEvent);
            const freelancer = disputeStartedlogs[0].args.creator;

            // get time duration :(
            const [timmingErr, timmingResult] = await Utils.callMethod(helperInstance.instance.getPollStage)(pollID, {
                from: ctInstance.defaultAccount,
                gasPrice: +ctInstance.gasPrice.toString(10),
            });
            const [, freelancerProofHash] = await Utils.callMethod(helperInstance.instance.getPollOption)(pollID, 1); // get freelancer proofhash
            const [, clientProofHash] = await Utils.callMethod(helperInstance.instance.getPollOption)(pollID, 2); // get client proofhash
            if (timmingErr) {
                console.log(timmingErr);
            } else {
                results = {
                    data: {
                        freelancerProofHash: Utils.toAscii(freelancerProofHash),
                        clientProofHash: Utils.toAscii(clientProofHash),
                        freelancer,
                        commitEndDate: timmingResult[3].toString() * 1000,
                        evidenceEndDate: timmingResult[2].toString() * 1000,
                        revealEndDate: timmingResult[4].toString() * 1000,
                    },
                };
                const blockLog = await getBlock(web3, disputeAgaistedLog.blockNumber);
                results.data.jobID = disputeAgaistedLog.args.jobID.toString();
                results.data.pollID = disputeAgaistedLog.args.pollID.toString();
                results.data.created = blockLog.timestamp;
                results.data.started = true;
                results.data.client = disputeAgaistedLog.args.creator;
            }
            const disputeData = await getJobCreatedByJobID(results);
            disputeDatas.push(disputeData);
        }
        return disputeDatas;
    } catch (e) {
        console.log(e);
    }
};

const getMyVoting = async () => {
    let disputeDatas = [];
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');
        const helperInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVotingHelper');
        const votingInstance = await abiConfig.contractInstanceGenerator(web3, 'BBVoting');
        const VoteCommittedEvent = await votingInstance.instance.VoteCommitted(
            { voter: web3.eth.defaultAccount },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const VoteCommittedlogs = await Utils.WaitAllContractEventGet(VoteCommittedEvent);
        for (let VoteCommitted of VoteCommittedlogs) {
            let results = {};
            const disputeStartedEvent = await ctInstance.instance.DisputeStarted(
                { pollID: VoteCommitted.args.pollID.toString() },
                {
                    fromBlock: fromBlock, // should use recent number
                    toBlock: 'latest',
                }
            );
            const disputeStartedlogs = await Utils.WaitAllContractEventGet(disputeStartedEvent);
            for (let disputeStartedlog of disputeStartedlogs) {
                const pollID = disputeStartedlog.args.pollID.toString();
                const [timmingErr, timmingResult] = await Utils.callMethod(helperInstance.instance.getPollStage)(pollID, {
                    from: helperInstance.defaultAccount,
                    gasPrice: +helperInstance.gasPrice.toString(10),
                });
                const [, freelancerProofHash] = await Utils.callMethod(helperInstance.instance.getPollOption)(pollID, 1); // get freelancer proofhash
                const [, clientProofHash] = await Utils.callMethod(helperInstance.instance.getPollOption)(pollID, 2); // get client proofhash
                if (timmingErr) {
                    console.log(timmingErr);
                } else {
                    results = {
                        data: {
                            freelancerProofHash: Utils.toAscii(freelancerProofHash),
                            clientProofHash: Utils.toAscii(clientProofHash),
                            freelancer: disputeStartedlog.args.creator,
                            commitEndDate: timmingResult[3].toString() * 1000,
                            evidenceEndDate: timmingResult[2].toString() * 1000,
                            revealEndDate: timmingResult[4].toString() * 1000,
                        },
                    };
                    const disputeAgaistedEvent = await ctInstance.instance.DisputeAgainsted(
                        { jobID: disputeStartedlog.args.jobID.toString() },
                        {
                            fromBlock: fromBlock, // should use recent number
                            toBlock: 'latest',
                        }
                    );
                    const disputeAgaistedLogs = await Utils.WaitAllContractEventGet(disputeAgaistedEvent);
                    for (let disputeAgaistedLog of disputeAgaistedLogs) {
                        const blockLog = await getBlock(web3, disputeAgaistedLog.blockNumber);
                        results.data.jobID = disputeAgaistedLog.args.jobID.toString();
                        results.data.pollID = disputeAgaistedLog.args.pollID.toString();
                        results.data.created = blockLog.timestamp;
                        results.data.started = true;
                        results.data.client = disputeAgaistedLog.args.creator;
                        results.data.isFinal = false;
                        results.data.rewardRight = false;
                        const [errRewardCheck, resultRewardCheck] = await Utils.callMethod(ctInstance.instance.calcReward)(
                            disputeAgaistedLog.args.jobID.toString(),
                            {
                                from: ctInstance.defaultAccount,
                                gasPrice: +ctInstance.gasPrice.toString(10),
                            }
                        );
                        if (errRewardCheck) {
                            console.log(errRewardCheck);
                            return;
                        }
                        if (Number(resultRewardCheck[0].toString()) > 0) {
                            results.data.rewardRight = true;
                        }
                    }
                }
            }
            const disputeData = await getJobCreatedByJobID(results);
            disputeDatas.push(disputeData);
        }
        return disputeDatas;
    } catch (e) {
        console.log(e);
    }
};

const getJobIDByPollID = async pollID => {
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBDispute');
        const disputeStartedEvent = await ctInstance.instance.DisputeStarted(
            { pollID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const disputeStartedlogs = await Utils.WaitAllContractEventGet(disputeStartedEvent);
        if (disputeStartedlogs.length > 0) {
            return disputeStartedlogs[0].args.jobID.toString();
        }
    } catch (e) {
        console.log(e);
    }
};

const getToken = async (tokenAddress, userInfo, callback) => {
    const walletAddress = web3.eth.defaultAccount;
    const wallet = userInfo.wallets.filter(wallet => wallet.address === walletAddress);
    let minABI = [
        {
            constant: true,
            inputs: [],
            name: 'name',
            outputs: [
                {
                    name: '',
                    type: 'string',
                },
            ],
            payable: false,
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'decimals',
            outputs: [
                {
                    name: '',
                    type: 'uint8',
                },
            ],
            payable: false,
            type: 'function',
        },
        {
            constant: true,
            inputs: [
                {
                    name: '_owner',
                    type: 'address',
                },
            ],
            name: 'balanceOf',
            outputs: [
                {
                    name: 'balance',
                    type: 'uint256',
                },
            ],
            payable: false,
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'symbol',
            outputs: [
                {
                    name: '',
                    type: 'string',
                },
            ],
            payable: false,
            type: 'function',
        },
    ];
    try {
        // Get ERC20 Token contract instance
        let contract = web3.eth.contract(minABI).at(tokenAddress);
        // Call balanceOf function
        contract.balanceOf(walletAddress, (error, balance) => {
            // Get decimals
            contract.decimals((error, decimals) => {
                // calculate a balance
                contract.symbol((err, symbol) => {
                    wallet[0].balances[symbol] = balance.div(10 ** decimals).toString();
                    userInfo.wallets.map(walletMap => {
                        if (walletMap.address === walletAddress) {
                            walletMap = wallet;
                        }
                        return walletMap;
                    });
                    callback(userInfo);
                });
            });
        });
    } catch (err) {
        console.log(err);
    }
};

const getBalanceToken = async (tokenAddressList, userInfo, callback) => {
    for (let tokenLog of tokenAddressList) {
        if (tokenLog.args.tokenAddress !== '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeebb0') {
            const tokenAddress = tokenLog.args.tokenAddress;
            getToken(tokenAddress, userInfo, callback);
        }
    }
};

const getTokenAddress = async () => {
    try {
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerPayment');
        const tokenAddressEvent = await ctInstance.instance.PaymentTokenAdded(
            {},
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const tokenAddressList = await Utils.WaitAllContractEventGet(tokenAddressEvent);
        if (tokenAddressList.length > 0) {
            return tokenAddressList;
        }
    } catch (e) {
        console.log(e);
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
    getDisputeFinalizedDisputeContract,
    getTimeDurations,
    getEventsPollStarted,
    getReasonPaymentRejected,
    getEventsPollAgainsted,
    getAllAvailablePoll,
    getJobCreatedByJobID,
    getMyVoting,
    getJobIDByPollID,
    getTokenAddress,
    getBalanceToken,
};
