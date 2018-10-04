import cloneDeep from 'lodash.clonedeep';
import * as nameActList from './consts';

const data = {
    disputes: [],
    vote: {},
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
            console.log(vote);
            return {
                ...state,
                vote,
            };
        }
        default:
            return state;
    }
};

export default voterReducer;
