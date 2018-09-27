import cloneDeep from 'lodash.clonedeep';
import * as nameActList from './consts';

const data = {
    disputes: [],
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
        default:
            return state;
    }
};

export default voterReducer;
