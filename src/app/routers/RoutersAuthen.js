import asyncComponent from '../components/_asynComponent';

// import AsyncHome from '../components/Home';
// import AsyncAbout from '../components/About';
// import AsyncCatagories from '../components/Catagories';
// import AsyncProducts from '../components/Products';
// import AsyncMyComApi from '../components/myComApi';

const Freelancer = asyncComponent(() => import('../components/freelancer'));
const Hirer = asyncComponent(() => import('../components/hirer'));
const AsyncProducts = asyncComponent(() => import('../components/Products'));
const AsyncMyComApi = asyncComponent(() => import('../components/myComApi'));

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
    {
        title: 'Products',
        path: '/products',
        component: AsyncProducts,
    },
    {
        title: 'Reddit api',
        path: '/mycomapi',
        component: AsyncMyComApi,
    },
];

export default routersAuthen;
