import router from './router.js';
import NavBar from './pages/general/NavBar.js';

export default new Vue({
  el: '#app',
  router,
  components: {
    NavBar,
  },
  template: `
    <div>
      <NavBar />
      <router-view />
    </div>
  `,
});

