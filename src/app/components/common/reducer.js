import cloneDeep from 'lodash.clonedeep';
import * as nameActList from './consts';

const data = {
    balances: {
        ETH: 0,
        BBO: 0,
    },
    view: 0,
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
        case nameActList.SET_VIEW: {
            let view = cloneDeep(state.view);
            switch (action.view) {
                case '/client':
                    view = 0;
                    break;
                case '/freelancer':
                    view = 1;
                    break;
                case '/voter':
                    view = 2;
                    break;
                default:
                    view = 0;
            }
            return {
                ...state,
                view,
            };
        }
        default:
            return state;
    }
};

export default commonReducer;
