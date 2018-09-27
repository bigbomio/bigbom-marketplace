import Utils from '../_utils/utils';

export default [
    {
        value: '1',
        id: '1',
        min_sum: '200000',
        max_sum: '200000',
        currency: 'BBO',
        get label() {
            return 'Small project ( ' + Utils.currencyFormat(this.max_sum) + ' ' + this.currency + ')';
        },
    },
    {
        value: '2',
        id: '2',
        min_sum: '1000000',
        max_sum: '1000000',
        currency: 'BBO',
        get label() {
            return 'Medium project ( ' + Utils.currencyFormat(this.max_sum) + ' ' + this.currency + ')';
        },
    },
    {
        value: '3',
        id: '3',
        min_sum: '1500000',
        max_sum: '1500000',
        currency: 'BBO',
        get label() {
            return 'Medium-Large project ( ' + Utils.currencyFormat(this.max_sum) + ' ' + this.currency + ')';
        },
    },
    {
        value: '4',
        id: '4',
        min_sum: '3000000',
        max_sum: '3000000',
        currency: 'BBO',
        get label() {
            return 'Large project ( ' + Utils.currencyFormat(this.max_sum) + ' ' + this.currency + ')';
        },
    },
    {
        value: '5',
        id: '5',
        min_sum: '10000000',
        max_sum: '10000000',
        currency: 'BBO',
        get label() {
            return 'Very Large project ( ' + Utils.currencyFormat(this.max_sum) + ' ' + this.currency + ')';
        },
    },
    {
        value: '0',
        id: 'custom',
        min_sum: '0',
        max_sum: null,
        currency: 'BBO',
        get label() {
            return 'Custom';
        },
    },
];
