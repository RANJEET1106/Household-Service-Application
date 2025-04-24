export default {
  props: ["profile"],
  emits: ['delete-user', 'change-status'],
  computed: {
    localProfile() {
      return { ...this.profile }; // Always reflect latest updates
    }
  },
  template: `
    <div 
      class="offcanvas offcanvas-end"
      tabindex="-1"
      id="viewProfessional"
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
        :src="profile.profile_photo"
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

    <!-- Show Professional Details if user is a professional -->
    <div v-if="profile.role === 'professional'">
      <hr>
      <h5 class="mt-3">Professional Details</h5>
      <table class="table">
        <tr><th>Service Type:</th><td>{{ profile.service_type }}</td></tr>
        <tr><th>Experience:</th><td>{{ profile.experience }} years</td></tr>
        <tr><th>Description:</th><td>{{ profile.description || 'N/A' }}</td></tr>
        <tr><th>Rating:</th><td>{{ profile.total_rating }} ⭐ ({{ profile.total_users_rated }} reviews)</td></tr>
        <tr><th>Status:</th><td>{{ profile.status }}</td></tr>
        <tr v-if="profile.website">
          <th>Website:</th>
          <td><a :href="profile.website" target="_blank">{{ profile.website }}</a></td>
        </tr>
        <tr>
          <th>ID Proof:</th>
          <td>
            <a :href="profile.id_proof" target="_blank">View ID Proof</a>
          </td>
        </tr>
      </table>
    </div>

    
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-secondary" data-bs-dismiss="offcanvas">Close</button>
          <button class="btn btn-primary btn-sm" @click="$emit('delete-user', localProfile.id)">Delete</button>
          <button v-if="localProfile.status === 'pending'" class="btn btn-success btn-sm"
            @click="$emit('change-status', localProfile.id, 'unblocked')">Accept</button>
          <button v-else-if="localProfile.status === 'unblocked'" class="btn btn-warning btn-sm"
            @click="$emit('change-status', localProfile.id, 'blocked')">Block</button>
          <button v-else-if="localProfile.status === 'blocked'" class="btn btn-success btn-sm"
            @click="$emit('change-status', localProfile.id, 'unblocked')">Unblock</button>
        </div>

  </div>
</div>

    `,
};
