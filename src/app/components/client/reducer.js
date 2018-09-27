import cloneDeep from 'lodash.clonedeep';
import * as nameActList from './consts';

const data = {
    jobs: [],
    reason: 0,
    actionBtnDisabled: true,
    sttRespondedDispute: false,
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
        case nameActList.SET_REASON: {
            let reason = cloneDeep(state.reason);
            reason = action.reason;
            return {
                ...state,
                reason,
                actionBtnDisabled: false,
            };
        }
        case nameActList.SET_STT_RESPONDED_DISPUTE: {
            let sttRespondedDispute = cloneDeep(state.sttRespondedDispute);
            sttRespondedDispute = action.sttRespondedDispute;
            return {
                ...state,
                sttRespondedDispute,
                actionBtnDisabled: false,
            };
        }
        default:
            return state;
    }
};

export default clientReducer;
