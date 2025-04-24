import HomePage from './components/general/Home.js';
import LoginForm from './pages/general/login.js';
import RegisterForm from './pages/general/register.js';

import AdminDashboard from './pages/admin/dashboard.js';
import ProfessionalDashboard from './pages/professional/dashboard.js';
import CustomerDashboard from './pages/customer/dashboard.js';

import AdminSearch from './pages/admin/search.js';
import CustomerSearch from './pages/customer/search.js'
import ProfessionalSearch from './pages/professional/search.js'

import AdminSummary from './pages/admin/summary.js'
import CustomerSummary from './pages/customer/summary.js'
import ProfessionalSummary from'./pages/professional/summary.js'

const routes = [
	{ path: '/', component: HomePage, name: 'HomePage' },
	{ path: '/login', component: LoginForm, name: 'Login' },
	{ path: '/register', component: RegisterForm, name: 'Register' },

	{ path: '/admin/dashboard', component: AdminDashboard, name: 'AdminDashboard' },
	{ path: '/professional/dashboard', component: ProfessionalDashboard, name: 'ProfessionalDashboard' },
	{ path: '/customer/dashboard', component: CustomerDashboard, name: 'CustomerDashboard' },

	{ path: '/admin/search', component:AdminSearch, name:'AdminSearch'},
	{ path: '/customer/search', component:CustomerSearch, name:'CustomerSearch'},
	{ path: '/professional/search', component:ProfessionalSearch, name:'ProfessionalSearch'},

	{ path: '/admin/summary', component:AdminSummary, name:'AdminSummary'},
	{ path: '/customer/summary', component:CustomerSummary, name:'CustomerSummary'},
	{ path: '/professional/summary',component:ProfessionalSummary, name:'ProfessionalSummary'},
];

const router = new VueRouter({
	routes,

});
export default router;