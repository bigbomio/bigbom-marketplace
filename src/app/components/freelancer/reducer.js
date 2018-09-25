import cloneDeep from 'lodash.clonedeep';
import * as nameActList from './consts';

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

const freelancerReducer = (state = initData, action) => {
    switch (action.type) {
        case nameActList.SET_BID: {
            let bid = cloneDeep(state.bid);
            bid = action.bid;
            return {
                ...state,
                bid,
            };
        }
        case nameActList.SAVE_FREELANCER_PROOF: {
            let freelancerProof = cloneDeep(state.freelancerProof);
            freelancerProof = action.freelancerProof;
            return {
                ...state,
                freelancerProof,
            };
        }
        case nameActList.SAVE_VOTING_PARAMS: {
            let votingParams = cloneDeep(state.votingParams);
            votingParams = action.votingParams;
            return {
                ...state,
                votingParams,
            };
        }
        case nameActList.SET_STT_DISPUTE_CREATED: {
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

export default freelancerReducer;
