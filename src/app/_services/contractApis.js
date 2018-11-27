import groupBy from 'lodash.groupby';
import mapValues from 'lodash.mapvalues';
import omit from 'lodash.omit';
import Utils from '../_utils/utils';
import abiConfig, { fromBlock } from '../_services/abiConfig';

const getBidAccepted = async payload => {
    try {
        const ratingInstance = await abiConfig.contractInstanceGenerator(payload.web3, 'BBFreelancerBid');
        const bidEvent = await ratingInstance.instance.BidAccepted(
            { jobID: payload.jobID },
            {
                fromBlock: fromBlock, // should use recent number
                toBlock: 'latest',
            }
        );
        const bidLogs = await Utils.WaitAllContractEventGet(bidEvent);
        return bidLogs;
    } catch (err) {
        console.log(err);
    }
};

const getRatingLog = async payload => {
    let ratingDatas = [];
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
};

export default {
    getRatingLog,
    getBidAccepted,
};
