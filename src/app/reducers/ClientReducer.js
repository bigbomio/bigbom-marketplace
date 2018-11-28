import cloneDeep from 'lodash.clonedeep';
import * as types from '../constants/actionTypes';

const data = {
    jobs: [],
    reason: 0,
    actionBtnDisabled: true,
    sttRespondedDispute: false,
};

const initData = cloneDeep(data);

const ClientReducer = (state = initData, action) => {
    switch (action.type) {
        case types.SAVE_JOBS: {
            let jobs = cloneDeep(state.jobs);
            jobs = action.jobs;
            return {
                ...state,
                jobs,
            };
        }
        case types.SET_REASON: {
            let reason = cloneDeep(state.reason);
            reason = action.reason;
            return {
                ...state,
                reason,
                actionBtnDisabled: false,
            };
        }
        case types.SET_STT_RESPONDED_DISPUTE: {
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

export default ClientReducer;
