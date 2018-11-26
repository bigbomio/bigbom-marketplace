import groupBy from 'lodash.groupby';
import mapValues from 'lodash.mapvalues';
import omit from 'lodash.omit';
import Utils from '../_utils/utils';
import abiConfig, { fromBlock } from '../_services/abiConfig';

const getRatingLog = async payload => {
    const ratingInstance = await abiConfig.contractInstanceGenerator(payload.web3, 'BBRating');
    const ratingEvent = await ratingInstance.instance.Rating(
        { rateToAddress: payload.address },
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
    let ratingDatas = {
        ratinglist: [],
        totalStar: 0,
        avgRating: 'N/A',
        totalRating: 0,
        ratingRanks: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
    Object.entries(logsGroupByAddress).forEach(([, value]) => {
        const logsFilteredLatest = Utils.filterObjectArrayByMax(value, 'blockNumber');
        ratingDatas.totalStar += Number(logsFilteredLatest.args.star.toString());
        ratingDatas.ratingRanks[logsFilteredLatest.args.star.toString()] += 1;
        const rateData = {
            commentHash: logsFilteredLatest.args.commentHash,
            jobID: logsFilteredLatest.args.jobID.toString(),
            rateToAddress: logsFilteredLatest.args.rateToAddress,
            star: logsFilteredLatest.args.star.toString(),
            totalStar: logsFilteredLatest.args.totalStar.toString(),
            totalUser: logsFilteredLatest.args.totalUser.toString(),
            whoRate: logsFilteredLatest.args.whoRate,
        };
        ratingDatas.ratinglist.push(rateData);
        ratingDatas.avgRating = (ratingDatas.totalStar / ratingDatas.ratinglist.length).toFixed(1);
        ratingDatas.totalRating += 1;
    });
    return ratingDatas;
};

export default {
    getRatingLog,
};
