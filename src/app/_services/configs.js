import categories from './categories';
import skills from './skills';
import budgets from './budgets';
import reasons from './reasons';

const env = process.env.REACT_APP_ENV;

const api = {
    getCategories: () => {
        return categories;
    },
    getSkills: () => {
        return skills;
    },
    getBudgets: () => {
        return budgets;
    },
    getReasons: () => {
        return reasons;
    },
    getReason: id => {
        return reasons[id];
    },
};

// Usd
export const postJobConfigs = {
    minBudget: 1,
    maxBudget: 100000,
    minTitle: 10,
    maxTitle: 255,
    minDescription: 30,
    maxDescription: 4000,
};

const getBBOTestNetURLList = {
    dev: 'https://bigbomio.github.io/bbo-faucet-testnet/',
    uat: 'https://rinkeby.aragon.org/#/bigbom.aragonid.eth/0xc94850af313f311b0a8aa492817100bd4bcd4fb2',
    production: 'https://rinkeby.aragon.org/#/bigbom.aragonid.eth/0xc94850af313f311b0a8aa492817100bd4bcd4fb2',
};

const blackListNetworkEnv = {
    dev: ['MAINNET', 'MORDEN', 'RINKEBY', 'KOVAN', 'TOMOCHAIN', 'UNKNOW'],
    uat: ['MAINNET', 'MORDEN', 'ROPSTEN', 'KOVAN', 'TOMOCHAIN', 'UNKNOW'],
    production: ['MAINNET', 'MORDEN', 'ROPSTEN', 'KOVAN', 'TOMOCHAIN', 'UNKNOW'],
};

const whiteListNetEnv = {
    dev: ['ROPSTEN'],
    uat: ['RINKEBY'],
    production: ['RINKEBY'],
};

export const ignoreNetworkList = blackListNetworkEnv[env];

export const whiteNetwork = whiteListNetEnv[env];

export const BBOTestNetURL = getBBOTestNetURLList[env];

export default api;
