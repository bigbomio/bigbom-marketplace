import cloneDeep from 'lodash.clonedeep';
import * as types from '../constants/actionTypes';

const data = {
    bid: {
        time: 0,
        award: 0,
    },
    freelancerProof: {
        proof: '',
        imgs: [],
    },
    votingParams: {},
    disputeCreated: false,
};

const initData = cloneDeep(data);

const FreelancerReducer = (state = initData, action) => {
    switch (action.type) {
        case types.SAVE_VOTING_PARAMS: {
            let votingParams = cloneDeep(state.votingParams);
            votingParams = action.votingParams;
            return {
                ...state,
                votingParams,
            };
        }
        case types.SET_STT_DISPUTE_CREATED: {
            let disputeCreated = cloneDeep(state.disputeCreated);
            disputeCreated = action.disputeCreated;
            return {
                ...state,
                disputeCreated,
            };
        }
        default:
            return state;
    }
};

export default FreelancerReducer;
