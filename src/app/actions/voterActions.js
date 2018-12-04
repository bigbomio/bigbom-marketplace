import * as types from '../constants/actionTypes';

export const saveDisputes = disputes => {
    return {
        type: types.SAVE_DISPUTES,
        disputes,
    };
};

export const saveVote = vote => {
    return {
        type: types.SAVE_VOTE,
        vote,
    };
};

export const saveRevealVote = revealVote => {
    return {
        type: types.SAVE_REVEAL_VOTE,
        revealVote,
    };
};

export const setVoteInputDisable = voteInputDisable => {
    return {
        type: types.SET_VOTE_INPUT_DISABLE,
        voteInputDisable,
    };
};
