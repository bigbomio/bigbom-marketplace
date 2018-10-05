import cloneDeep from 'lodash.clonedeep';
import * as nameActList from './consts';

const data = {
    disputes: [],
    vote: {},
    voteInputDisable: false,
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
        default:
            return state;
    }
};

export default voterReducer;
