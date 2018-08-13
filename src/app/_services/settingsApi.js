import categories from './categories';
import currencies from './currency';
import budgets from './budgets';

const api = {
    getCategories: () => {
        return categories;
    },
    getCurrencies: () => {
        return currencies;
    },
    getBudgets: () => {
        return budgets;
    },
};

export default api;
