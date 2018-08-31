export default [
    {
        value: '1',
        id: '1',
        min_sum: '10',
        max_sum: '30',
        currency: 'BBO',
        get label() {
            return 'Micro Project ( $' + this.max_sum + ' ' + this.currency + ')';
        },
        // get label() {
        //     return 'Micro Project ( $'+ this.max_sum + ' ' + this.currency + ')';
        // },
    },
    {
        value: '2',
        id: '2',
        min_sum: '30',
        max_sum: '250',
        currency: 'BBO',
        get label() {
            return 'Simple project ( $' + this.max_sum + ' ' + this.currency + ')';
        },
    },
    {
        value: '3',
        id: '3',
        min_sum: '250',
        max_sum: '750',
        currency: 'BBO',
        get label() {
            return 'Very small project ( $' + this.max_sum + ' ' + this.currency + ')';
        },
    },
    {
        value: '4',
        id: '4',
        min_sum: '750',
        max_sum: '1500',
        currency: 'BBO',
        get label() {
            return 'Small project ( $' + this.max_sum + ' ' + this.currency + ')';
        },
    },
    {
        value: '5',
        id: '5',
        min_sum: '1500',
        max_sum: '3000',
        currency: 'BBO',
        get label() {
            return 'Medium project ( $' + this.max_sum + ' ' + this.currency + ')';
        },
    },
    {
        value: '6',
        id: '6',
        min_sum: '3000',
        max_sum: '5000',
        currency: 'BBO',
        get label() {
            return 'Large project ( $' + this.max_sum + ' ' + this.currency + ')';
        },
    },
    {
        value: '7',
        id: '7',
        min_sum: '5000',
        max_sum: '10000',
        currency: 'BBO',
        get label() {
            return 'Larger project ( $' + this.max_sum + ' ' + this.currency + ')';
        },
    },
    {
        value: '8',
        id: '8',
        min_sum: '10000',
        max_sum: '20000',
        currency: 'BBO',
        get label() {
            return 'Very Large project ( $' + this.max_sum + ' ' + this.currency + ')';
        },
    },
    {
        value: '9',
        id: '9',
        min_sum: '20000',
        max_sum: '50000',
        currency: 'BBO',
        get label() {
            return 'Huge project ( $' + this.max_sum + ' ' + this.currency + ')';
        },
    },
    {
        value: '10',
        id: '10',
        min_sum: '50000',
        max_sum: null,
        currency: 'BBO',
        get label() {
            return 'Major project ( $' + this.min_sum + '+ ' + this.currency + ')';
        },
    },
];
