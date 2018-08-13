import Login from '../components/_unAuthen/login';
import ResetPass from '../components/_unAuthen/resetPass';
import SignUp from '../components/_unAuthen/signUp';

const routersUnAuthen = [
    {
        title: 'Login',
        path: '/login',
        component: Login,
        exact: true
    },
    {
        title: 'Sign up',
        path: '/signup',
        component: SignUp
    },
    {
        title: 'Reset pass',
        path: '/resetpass',
        component: ResetPass
    }
];

export default routersUnAuthen;
