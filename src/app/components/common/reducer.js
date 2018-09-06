import cloneDeep from 'lodash.clonedeep';
import * as nameActList from './consts';

const data = {
    balances: {
        ETH: 0,
        BBO: 0,
    },
};

const initData = cloneDeep(data);

const commonReducer = (state = initData, action) => {
    switch (action.type) {
        case nameActList.SET_BALANCES: {
            let balances = cloneDeep(state.balances);
            balances = action.balances;
            return {
                ...state,
                balances,
            };
        }
        default:
            return state;
    }
};

export default commonReducer;
