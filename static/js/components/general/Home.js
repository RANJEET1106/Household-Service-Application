export default {
    template: `
      <div class="container mt-5">
  <div class="card shadow-lg">
    <div class="card-body text-center">
      <h1 class="display-4">Welcome to Household Services</h1>
      <p class="lead">Your one-stop solution for home services and repairs</p>
      <div class="d-flex justify-content-center mt-4">
        <router-link to="/register" tag="a" class="btn btn-primary mx-2">
                  Register
        </router-link>
        <router-link to="/login" tag="a" class="btn btn-outline-secondary mx-2">
                  Login
        </router-link>
      </div>
    </div>
  </div>

  <div class="row mt-5">
    <div class="col-md-4">
      <div class="card h-100 shadow">
        <div class="card-body text-center">
          <h5 class="card-title">For Customers</h5>
          <p class="card-text">Find verified professionals for all your household needs.</p>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card h-100 shadow">
        <div class="card-body text-center">
          <h5 class="card-title">For Professionals</h5>
          <p class="card-text">Showcase your skills and connect with customers easily.</p>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card h-100 shadow">
        <div class="card-body text-center">
          <h5 class="card-title">For Admin</h5>
          <p class="card-text">Manage users, services, and reports seamlessly.</p>
        </div>
      </div>
    </div>
  </div>
</div>

    `,
  };
  