import cloneDeep from 'lodash.clonedeep';
import * as types from '../constants/actionTypes';

const data = {
    disputes: [],
    vote: {},
    voteInputDisable: false,
    revealVote: {},
    voteResult: {},
};

const initData = cloneDeep(data);

const VoterReducer = (state = initData, action) => {
    switch (action.type) {
        case types.SAVE_DISPUTES: {
            let disputes = cloneDeep(state.disputes);
            disputes = action.disputes;
            return {
                ...state,
                disputes,
            };
        }
        case types.SAVE_VOTE: {
            let vote = cloneDeep(state.vote);
            vote = action.vote;
            return {
                ...state,
                vote,
            };
        }
        case types.SET_VOTE_INPUT_DISABLE: {
            let voteInputDisable = cloneDeep(state.voteInputDisable);
            voteInputDisable = action.voteInputDisable;
            return {
                ...state,
                voteInputDisable,
            };
        }
        case types.SAVE_REVEAL_VOTE: {
            let revealVote = cloneDeep(state.revealVote);
            revealVote = action.revealVote;
            return {
                ...state,
                revealVote,
            };
        }
        default:
            return state;
    }
};

export default VoterReducer;
