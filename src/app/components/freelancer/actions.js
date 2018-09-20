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
