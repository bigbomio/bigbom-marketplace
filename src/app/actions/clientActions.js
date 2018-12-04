import * as listTypes from '../constants/actionTypes';

export const saveJobs = jobs => {
    return {
        type: listTypes.SAVE_JOBS,
        jobs,
    };
};

export const setReason = reason => {
    return {
        type: listTypes.SET_REASON,
        reason,
    };
};

export const setSttRespondedDispute = sttRespondedDispute => {
    return {
        type: listTypes.SET_STT_RESPONDED_DISPUTE,
        sttRespondedDispute,
    };
};
