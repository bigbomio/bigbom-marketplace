import cloneDeep from 'lodash.clonedeep';
import * as nameActList from './consts';

const data = {
    disputes: [],
    vote: {},
    voteInputDisable: false,
    revealVote: {},
    voteResult: {},
};

const initData = cloneDeep(data);

const voterReducer = (state = initData, action) => {
    switch (action.type) {
        case nameActList.SAVE_DISPUTES: {
            let disputes = cloneDeep(state.disputes);
            disputes = action.disputes;
            return {
                ...state,
                disputes,
            };
        }
        case nameActList.SAVE_VOTE: {
            let vote = cloneDeep(state.vote);
            vote = action.vote;
            return {
                ...state,
                vote,
            };
        }
        case nameActList.SAVE_VOTE_INPUT_DISABLE: {
            let voteInputDisable = cloneDeep(state.voteInputDisable);
            voteInputDisable = action.voteInputDisable;
            return {
                ...state,
                voteInputDisable,
            };
        }
        case nameActList.SAVE_REVEAL_VOTE: {
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

export default voterReducer;
