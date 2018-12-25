import categories from './categories';
import skills from './skills';
import currencies from './currency';
import budgets from './budgets';
import reasons from './reasons';

const api = {
    getCategories: () => {
        return categories;
    },
    getSkills: () => {
        return skills;
    },
    getCurrencies: () => {
        return currencies;
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

export default api;
