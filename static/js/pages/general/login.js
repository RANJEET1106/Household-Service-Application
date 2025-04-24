

export default ({
    template: `
    <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow-lg" style="width: 25rem;">
        <div class="card-body">
            <h2 class="card-title text-center mb-4">Login</h2>
            <form @submit.prevent="submitLogin">
                <div class="mb-3">
                    <input type="text" class="form-control" v-model="username" placeholder="Username" required>
                </div>
                <div class="mb-3 position-relative">
    <input :type="showPassword ? 'text' : 'password'" 
           class="form-control" 
           v-model="password" 
           placeholder="Password" 
           required>
    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
       class="position-absolute top-50 end-0 translate-middle-y me-3"
       style="cursor: pointer;" 
       @click="showPassword = !showPassword"></i>
</div>

                <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary">Login</button>
                    <button type="button" class="btn btn-secondary" @click="closeForm">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</div>

  `,
    data() {
        return {
            username: '',
            password: '',
            showPassword: false,
        };
    },
    methods: {
        async submitLogin() {
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: this.username, // Use `this.username`
                        password: this.password, // Use `this.password`
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('id', data.id);
                    localStorage.setItem('role', data.role); // Or another role
                    window.dispatchEvent(new Event('storage'));
                    if (data.role === 'customer') {
                        this.$router.push({ path: '/customer/dashboard' })
                    }
                    else if (data.role === 'admin') {
                        this.$router.push({ path: '/admin/dashboard' })
                    }
                    else {
                        this.$router.push({ path: '/professional/dashboard' })
                    }
                    console.log('Login Successful');
                } else {
                    console.error(data.message);
                    alert(data.message); // Provide user feedback
                }
            } catch (error) {
                console.error('Error during login:', error);
            }
        },

        closeForm() {
            this.$emit('close');
        },
    }
});
