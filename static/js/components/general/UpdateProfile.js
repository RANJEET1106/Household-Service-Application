export default {
    props: ['formData'],
    emits: ['file-upload', 'update-profile'],
    methods: {
      handleFileUpload(event) {
        const file = event.target.files[0];
        this.$emit('file-upload', file);
      },
      updateProfile() {
        this.$emit('update-profile');
      },
    },
    template: `
      <div 
        class="offcanvas offcanvas-end"
        tabindex="-1"
        id="updateProfilePanel"
      >
        <div class="offcanvas-header">
          <h5>Update Profile</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>
        <div class="offcanvas-body">
          <form @submit.prevent="updateProfile">
            <div class="mb-3">
              <label for="profilePhoto">Profile Photo</label>
              <img 
                :src="formData.profile_photo" 
                alt="Profile" 
                class="rounded-circle d-block mb-2"
                width="100" height="100" 
                style="object-fit: cover;"
              />
              <input 
                type="file" 
                id="profilePhoto" 
                class="form-control" 
                @change="handleFileUpload"
              />
            </div>
            <div class="mb-3">
              <label for="username">Username</label>
              <input 
                type="text" 
                id="username" 
                class="form-control" 
                v-model="formData.username" 
                disabled 
              />
            </div>
            <div class="mb-3">
              <label for="name">Name</label>
              <input 
                type="text" 
                id="name" 
                class="form-control" 
                v-model="formData.name" 
              />
            </div>
            <div class="mb-3">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                class="form-control" 
                v-model="formData.email" 
              />
            </div>
            <div class="mb-3">
              <label for="address">Address</label>
              <textarea 
                id="address" 
                class="form-control" 
                rows="3" 
                v-model="formData.address">
              </textarea>
            </div>
            <div class="mb-3">
              <label for="pinCode">Pin Code</label>
              <input 
                type="text" 
                id="pinCode" 
                class="form-control" 
                v-model="formData.pin_code" 
              />
            </div>
            <div class="mb-3">
              <label for="mobileNo">Mobile Number</label>
              <input 
                type="text" 
                id="mobileNo" 
                class="form-control" 
                v-model="formData.mobile_no" 
              />
            </div>
            <div class="mb-3">
              <label for="whatsappNo">WhatsApp Number</label>
              <input 
                type="text" 
                id="whatsappNo" 
                class="form-control" 
                v-model="formData.whatsapp_no" 
              />
            </div>
            <div class="mb-3">
              <label for="role">Role</label>
              <input 
                type="text" 
                id="role" 
                class="form-control" 
                v-model="formData.role" 
                disabled 
              />
            </div>
            <button type="submit" class="btn btn-success">Update</button>
          </form>
        </div>
      </div>
    `,
  };
  