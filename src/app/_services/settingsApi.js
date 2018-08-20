import categories from './categories';
import skills from './skills';
import currencies from './currency';
import budgets from './budgets';

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
};

export default api;
