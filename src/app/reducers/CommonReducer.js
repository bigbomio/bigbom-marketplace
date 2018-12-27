import cloneDeep from 'lodash.clonedeep';
import * as types from '../constants/actionTypes';

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
    accountInfo: {
        email: '',
        firstName: '',
        lastName: '',
        wallets: [],
    },
    register: false,
    rates: [],
    tokensAddress: [],
    tokens: {},
    currentToken: {},
    defaultAddress: {},
    currencies: [],
};

const initData = cloneDeep(data);

const CommonReducer = (state = initData, action) => {
    switch (action.type) {
        case types.SET_VIEW: {
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
        case types.SET_ACTION_BTN_DISABLED: {
            let actionBtnDisabled = cloneDeep(state.actionBtnDisabled);
            actionBtnDisabled = action.actionBtnDisabled;
            return {
                ...state,
                actionBtnDisabled,
            };
        }
        case types.SET_YOUR_NETWORK: {
            let yourNetwork = cloneDeep(state.yourNetwork);
            yourNetwork = action.yourNetwork;
            return {
                ...state,
                yourNetwork,
            };
        }
        case types.SET_RELOAD: {
            let reload = cloneDeep(state.reload);
            reload = action.reload;
            return {
                ...state,
                reload,
            };
        }
        case types.SAVE_ACCOUNT_INFO: {
            let accountInfo = cloneDeep(state.accountInfo);
            accountInfo = action.accountInfo;
            return {
                ...state,
                accountInfo,
            };
        }
        case types.SET_REGISTER: {
            let register = cloneDeep(state.register);
            register = action.register;
            return {
                ...state,
                register,
            };
        }
        case types.GET_EXCHANGE_RATES_SUCCESS:
            return {
                ...state,
                rates: action.rates,
            };
        case types.GET_TOKENS_ADDRESS_SUCCESS:
            return {
                ...state,
                tokensAddress: action.tokensAddress,
            };
        case types.SAVE_TOKENS:
            return {
                ...state,
                tokens: action.tokens,
            };
        case types.SAVE_CURRENCIES:
            return {
                ...state,
                currencies: action.currencies,
            };
        case types.SET_CURRENT_TOKEN:
            return {
                ...state,
                currentToken: action.currentToken,
            };
        case types.SET_DEFAULT_ADDRESS:
            return {
                ...state,
                defaultAddress: action.defaultAddress,
            };
        default:
            return state;
    }
};

export default CommonReducer;
