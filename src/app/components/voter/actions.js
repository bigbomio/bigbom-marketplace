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

export const saveRevealVote = revealVote => {
    return {
        type: listTypes.SAVE_REVEAL_VOTE,
        revealVote,
    };
};

export const setVoteInputDisable = voteInputDisable => {
    return {
        type: listTypes.SAVE_VOTE_INPUT_DISABLE,
        voteInputDisable,
    };
};
