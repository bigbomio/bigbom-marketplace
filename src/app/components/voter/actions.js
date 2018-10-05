import * as listTypes from './consts';

export const saveDisputes = disputes => {
    return {
        type: listTypes.SAVE_DISPUTES,
        disputes,
    };
};

export const saveVote = vote => {
    return {
        type: listTypes.SAVE_VOTE,
        vote,
    };
};

export const setVoteInputDisable = voteInputDisable => {
    return {
        type: listTypes.SAVE_VOTE_INPUT_DISABLE,
        voteInputDisable,
    };
};
