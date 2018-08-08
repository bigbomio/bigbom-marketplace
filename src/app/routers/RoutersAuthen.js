import asyncComponent from '../components/_asynComponent';

// import AsyncHome from '../components/Home';
// import AsyncAbout from '../components/About';
// import AsyncCatagories from '../components/Catagories';
// import AsyncProducts from '../components/Products';
// import AsyncMyComApi from '../components/myComApi';
const Home = asyncComponent(() => import('../components/home'));
const AsyncAbout = asyncComponent(() => import('../components/About'));
const HirerCategories = asyncComponent(() => import('../components/HirerCategories'));
const AsyncProducts = asyncComponent(() => import('../components/Products'));
const AsyncMyComApi = asyncComponent(() => import('../components/myComApi'));

const routersAuthen = [
    {
        title: 'Home',
        path: '/',
        component: Home,
        exact: true,
    },
    {
        title: 'Hire a Freelancer',
        path: '/hirer',
        component: HirerCategories,
    },
    {
        title: 'Find a Job',
        path: '/about',
        component: AsyncAbout,
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
