import { checkLoginStatus } from "../../components/general/util.js";

export default {
    data() {
        return {
            searchValue: '',
            isLoggedIn: null,
            role: null,
            id: null,
        };
    },
    methods: {
        async assignRole() {
            const response = await checkLoginStatus();
            
                this.isLoggedIn = response.isLoggedIn;
                this.role = response.role;
                this.id=response.id;
            
        },
        search() {
            if (this.$route.name !== 'SearchResult') {
                this.$router.push({ name: 'SearchResult', query: { search_value: this.searchValue } });
            } else {
                const x = this.searchValue;
                this.$router.replace({ query: { search_value: x } });
            }
        },
        logOutUser() {
            let x = confirm('Are you sure to log out from the app?');
            if (!x) {
                return;
            }
            fetch('/api/logout', {
                method: 'POST',
                credentials: 'include', // Ensure cookies/session are included
            })
            .then(response => {
                if (response.ok) {
                    // Clear local storage
                    localStorage.removeItem('id');
                    localStorage.removeItem('role');
                    this.$router.push("/login"); 
                    // Refresh the page to update UI
                    window.dispatchEvent(new Event('storage'));
                } else {
                    console.error('Failed to log out on the backend');
                    alert('Logout failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error during logout:', error);
            });
        },
    },
    created() {
      this.assignRole();
        // this.isLoggedIn = !!localStorage.getItem('id');
        // this.role = localStorage.getItem('role');
        this.searchValue = this.$route.query.search_value;

        // Watch for storage changes
        window.addEventListener('storage', this.assignRole);
    },
    beforeDestroy() {
        // Clean up the event listener
        window.removeEventListener('storage', this.assignRole);
      },

    template: `
  <div>
    <nav class="navbar navbar-expand-lg  border-bottom border-bottom-2 ">
      <div class="container-fluid">
        <a class="navbar-brand" href="#"> <h2>Household Service Application</h2></a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <template v-if="!isLoggedIn">
              <li class="nav-item">
                <router-link to="/" tag="a" class="nav-link">
                  Home
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/login" tag="a" class="nav-link">
                  Login
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/register" tag="a" class="nav-link">
                  Register
                </router-link>
              </li>
                
            </template>
            <template v-if="isLoggedIn">
              <li class="nav-item">
              <router-link
                :to="role === 'admin' ? '/admin/dashboard' : role === 'customer' ? '/customer/dashboard' : role === 'professional' ? '/professional/dashboard' : '/'"
                tag="a"
                class="nav-link"
                v-if="isLoggedIn"
              >
                Dashboard
              </router-link>
              </li>
              <li class="nav-item">
              <router-link
                :to="role === 'admin' ? '/admin/search' : role === 'customer' ? '/customer/search' : role === 'professional' ? '/professional/search' : '/'"
                tag="a"
                class="nav-link"
                v-if="isLoggedIn"
              >
                Search
              </router-link>
              </li>
              <li class="nav-item">
              <router-link
                :to="role === 'admin' ? '/admin/summary' : role === 'customer' ? '/customer/summary' : role === 'professional' ? '/professional/summary' : '/'"
                tag="a"
                class="nav-link"
                v-if="isLoggedIn"
              >
                Summary
              </router-link>
              </li>
              <li class="nav-item ml-4">
                <button class="btn btn-outline-danger btn-sm mt-2 " @click="logOutUser()">Log Out</button>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  </div>
  `,
};
