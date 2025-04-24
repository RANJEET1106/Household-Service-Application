export default {
  props: ['service'], // Receive the service data
  data() {
    return {
      updatedService: { ...this.service }, // Copy the service data for editing
    };
  },
  watch: {
    service: {
      immediate: true,
      handler(newService) {
        this.updatedService = { ...newService }; // Sync updatedService when prop changes
      },
    },
  },
  methods: {
    // Emit the updated service to the parent
    submitForm() {
      this.$emit('update-service', this.updatedService); // Notify the parent
    },
  },
  template: `
  <div 
  class="modal fade" 
  id="updateServiceModal" 
  tabindex="-1" 
  aria-labelledby="updateServiceModalLabel" 
  aria-hidden="true"
>
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="updateServiceModalLabel">Update Service</h5>
        <button 
          type="button" 
          class="btn-close" 
          data-bs-dismiss="modal" 
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="service_name" class="form-label">Service Name</label>
            <input 
              type="text" 
              class="form-control" 
              id="service_name" 
              v-model="updatedService.service_name"
              required
            />
          </div>
          <div class="mb-3">
            <label for="service_type" class="form-label">Service Type</label>
            <input 
              type="text" 
              class="form-control" 
              id="service_type" 
              v-model="updatedService.service_type"
              required
              disabled
            />
          </div>
          <div class="mb-3">
            <label for="base_price" class="form-label">Base Price</label>
            <input 
              type="number" 
              class="form-control" 
              id="base_price" 
              v-model="updatedService.base_price"
              required
            />
          </div>
          <div class="mb-3">
            <label for="time_required" class="form-label">Time Required</label>
            <input 
              type="text" 
              class="form-control" 
              id="time_required" 
              v-model="updatedService.time_required"
            />
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
              type="button"
            >
              Close
            </button>
            <button type="submit" class="btn btn-primary">Update Service</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

  `,
};
