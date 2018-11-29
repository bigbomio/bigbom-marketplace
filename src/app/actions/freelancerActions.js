import * as types from '../constants/actionTypes';

export const saveVotingParams = votingParams => {
    return {
        type: types.SAVE_VOTING_PARAMS,
        votingParams,
    };
};

export const setSttDisputeCreated = disputeCreated => {
    return {
        type: types.SET_STT_DISPUTE_CREATED,
        disputeCreated,
    };
};
