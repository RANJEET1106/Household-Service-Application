export default {
    props: ['profile'],
    template: `
      <div 
        class="offcanvas offcanvas-end"
        tabindex="-1"
        id="profilePanel"
      >
        <div class="offcanvas-header">
          <h5>Profile</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>
        <div class="offcanvas-body">
          <div class="text-center">
            <img
              :src="profile.profile_photo "
              alt="Profile"
              class="rounded-circle"
              width="100"
              height="100"
            />
          </div>
          <table class="table">
            <tr><th>Username:</th><td>{{ profile.username }}</td></tr>
            <tr><th>Name:</th><td>{{ profile.name }}</td></tr>
            <tr><th>Email:</th><td>{{ profile.email }}</td></tr>
            <tr><th>Address:</th><td>{{ profile.address }}</td></tr>
            <tr><th>Pin Code:</th><td>{{ profile.pin_code }}</td></tr>
            <tr><th>Mobile No:</th><td>{{ profile.mobile_no }}</td></tr>
            <tr><th>WhatsApp No:</th><td>{{ profile.whatsapp_no || 'N/A' }}</td></tr>
            <tr><th>Role:</th><td>{{ profile.role }}</td></tr>
          </table>
          <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-secondary" data-bs-dismiss="offcanvas">Close</button>
          <button 
            class="btn btn-primary" 
            data-bs-toggle="offcanvas" 
            data-bs-target="#updateProfilePanel">
            Update Profile
          </button>
        </div>
        </div>
      </div>
    `,
  };
  