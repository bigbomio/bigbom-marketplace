import asyncComponent from '../components/_asynComponent';

const Freelancer = asyncComponent(() => import('../components/freelancer'));
const Client = asyncComponent(() => import('../components/client'));
const Voter = asyncComponent(() => import('../components/voter'));

const routersAuthen = [
    {
        title: 'View as a Client',
        path: '/client',
        component: Client,
    },
    {
        title: 'View as a Freelancer',
        path: '/freelancer',
        component: Freelancer,
    },
    {
        title: 'View as a Voter',
        path: '/voter',
        component: Voter,
    },
];

export default routersAuthen;
