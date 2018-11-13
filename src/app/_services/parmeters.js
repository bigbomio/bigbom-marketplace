export default [
    {
        type: 'Payment Parameters',
        parameters: [
            {
                name: 'Payment duration',
                description: 'Maximum duration for accepting payment',
                value: 'hours',
                realParams: 'paymentLimitTimestamp',
            },
            {
                name: 'Dispute filing duration',
                description: 'Maximum duration to file a dispute after payment is rejected',
                value: 'hours',
                realParams: 'rejectedPaymentLimitTimestamp',
            },
        ],
    },
    {
        type: 'Voting Parameters',
        parameters: [
            {
                name: 'Min votes',
                description: 'Minimum votes can cast for a dispute',
                value: 'interger',
                realParams: 'minVotes',
            },
            {
                name: 'Max votes',
                description: 'Maximum votes can cast for a dispute',
                value: 'interger',
                realParams: 'maxVotes',
            },
            {
                name: 'Deposit for staking',
                description: 'Amount of Tokens needed to deposit before starting a dispute',
                value: 'interger',
                realParams: 'stakeDeposit',
            },
            {
                name: 'Time for evidence',
                description:
                    'Duration for putting evidences for a dispute. After this duration, it\'s not possible to submit evidences and being considered looser',
                value: 'hours',
                realParams: 'evidenceDuration',
            },
            {
                name: 'Commit duration',
                description: 'Duration for committing votes',
                value: 'hours',
                realParams: 'commitDuration',
            },
            {
                name: 'Reveal duration',
                description: 'Duration for revealing votes',
                value: 'hours',
                realParams: 'revealDuration',
            },
            {
                name: 'Additional bonus',
                description:
                    'Additional bonus from Bigbom by BBO. Voters on either winning or loosing bloc will get this reward for each poll they participated',
                value: 'interger',
                realParams: 'bboRewards',
            },
        ],
    },
];
