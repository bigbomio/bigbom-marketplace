import * as listTypes from './consts';

export const setBid = bid => {
    return {
        type: listTypes.SET_BID,
        bid,
    };
};

export const saveFreelancerProof = freelancerProof => {
    return {
        type: listTypes.SAVE_FREELANCER_PROOF,
        freelancerProof,
    };
};

export const saveVotingParams = votingParams => {
    return {
        type: listTypes.SAVE_VOTING_PARAMS,
        votingParams,
    };
};

export const setSttDisputeCreated = disputeCreated => {
    return {
        type: listTypes.SET_STT_DISPUTE_CREATED,
        disputeCreated,
    };
};
