import asyncComponent from '../components/_asynComponent';

const Freelancer = asyncComponent(() => import('../components/freelancer'));
const Hirer = asyncComponent(() => import('../components/hirer'));

const routersAuthen = [
    {
        title: 'Hire a Freelancer',
        path: '/hirer',
        component: Hirer,
    },
    {
        title: 'Find a Job',
        path: '/freelancer',
        component: Freelancer,
    },
];

export default routersAuthen;
