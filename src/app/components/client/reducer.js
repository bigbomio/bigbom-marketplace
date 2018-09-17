import cloneDeep from 'lodash.clonedeep';
import * as nameActList from './consts';

const data = {
    jobs: [],
};

const initData = cloneDeep(data);

const clientReducer = (state = initData, action) => {
    switch (action.type) {
        case nameActList.SAVE_JOBS: {
            let jobs = cloneDeep(state.jobs);
            jobs = action.jobs;
            return {
                ...state,
                jobs,
            };
        }
        default:
            return state;
    }
};

export default clientReducer;
