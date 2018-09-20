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
        default:
            return state;
    }
};

export default freelancerReducer;
