import asyncComponent from '../components/_asynComponent';

// import AsyncHome from '../components/Home';
// import AsyncAbout from '../components/About';
// import AsyncCatagories from '../components/Catagories';
// import AsyncProducts from '../components/Products';
// import AsyncMyComApi from '../components/myComApi';

const AsyncHome = asyncComponent(() => import('../components/home'));
const AsyncAbout = asyncComponent(() => import('../components/About'));
const AsyncCatagories = asyncComponent(() => import('../components/Categories'));
const AsyncProducts = asyncComponent(() => import('../components/Products'));
const AsyncMyComApi = asyncComponent(() => import('../components/myComApi'));

const routersAuthen = [
    {
        title: 'Home',
        path: '/',
        component: AsyncHome,
        exact: true,
    },
    {
        title: 'About',
        path: '/about',
        component: AsyncAbout,
    },
    {
        title: 'Categories',
        path: '/categories',
        component: AsyncCatagories,
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
