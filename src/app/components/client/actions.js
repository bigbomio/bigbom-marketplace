import * as listTypes from './consts';

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
