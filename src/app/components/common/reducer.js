import cloneDeep from 'lodash.clonedeep';
import * as nameActList from './consts';

const data = {
    balances: {
        ETH: 0,
        BBO: 0,
    },
    view: 0,
    actionBtnDisabled: true,
    yourNetwork: {
        id: 0,
        name: '',
    },
    reload: false,
    accounts: [],
    defaultWallet: { address: '', default: true, balances: { ETH: 0, BBO: 0 } },
    token: null,
    register: false,
};

const initData = cloneDeep(data);

const commonReducer = (state = initData, action) => {
    switch (action.type) {
        case nameActList.SET_VIEW: {
            let view = cloneDeep(state.view);
            switch (action.view) {
                case 'client':
                    view = 0;
                    break;
                case 'freelancer':
                    view = 1;
                    break;
                case 'voter':
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
        case nameActList.SET_ACTION_BTN_DISABLED: {
            let actionBtnDisabled = cloneDeep(state.actionBtnDisabled);
            actionBtnDisabled = action.actionBtnDisabled;
            return {
                ...state,
                actionBtnDisabled,
            };
        }
        case nameActList.SET_YOUR_NETWORK: {
            let yourNetwork = cloneDeep(state.yourNetwork);
            yourNetwork = action.yourNetwork;
            return {
                ...state,
                yourNetwork,
            };
        }
        case nameActList.SET_RELOAD: {
            let reload = cloneDeep(state.reload);
            reload = action.reload;
            return {
                ...state,
                reload,
            };
        }
        case nameActList.SAVE_ACCOUNTS: {
            let accounts = cloneDeep(state.accounts);
            let defaultWallet = cloneDeep(state.accounts);
            accounts = action.accounts;
            defaultWallet = action.accounts.filter(wallet => wallet.default);
            return {
                ...state,
                accounts,
                defaultWallet: defaultWallet[0],
            };
        }
        case nameActList.SET_TOKEN:
            return {
                ...state,
                token: action.token,
            };
        case nameActList.SET_REGISTER:
            return {
                ...state,
                register: action.register,
            };
        default:
            return state;
    }
};

export default commonReducer;
