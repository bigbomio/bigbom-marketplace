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
        return reasons[id + 1];
    },
};

export default api;
