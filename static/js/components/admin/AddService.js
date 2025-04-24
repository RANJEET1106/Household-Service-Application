export default {
  data() {
    return {
      serviceName: "",
      serviceType: "",
      basePrice: "",
      timeRequired: "",
      description: "",
      serviceTypes: [],
      errorMessages: []
    };
  },

  // async created() {
  //   await this.fetchServiceTypes();
  // },

  methods: {
    async fetchServiceTypes() {
      try {
        const response = await fetch("/api/service-types");
        const data = await response.json();
        this.serviceTypes = data.service_types;
      } catch (error) {
        console.error("Error fetching service types:", error);
      }
    },

    async submitForm() {
      this.errorMessages = [];

      if (!this.serviceName || !this.serviceType || !this.basePrice || !this.timeRequired) {
        this.errorMessages.push("All fields are required.");
        return;
      }

      const newService = {
        service_name: this.serviceName,
        service_type: this.serviceType,
        base_price: parseFloat(this.basePrice),
        time_required: this.timeRequired,
        description: this.description,
      };

      try {
        const response = await fetch("/api/services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newService),
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          if (response.ok) {
            alert("Service added successfully!");
            const addServiceModal =bootstrap.Modal.getInstance(document.getElementById("addServiceModal"));
              if(addServiceModal){
                addServiceModal.hide();
              }
              setTimeout(() => {
                window.location.reload();  // Reload the page after modal is hidden
              }, 500);
            this.$emit("service-added"); // Emit event after success

          } else {
            this.errorMessages.push(result.message || "Failed to add service.");
          }
        } else {
          const text = await response.text();
          throw new Error(`Non-JSON response: ${text}`);
        }
      } catch (error) {
        console.error("Error submitting service:", error);
        this.errorMessages.push("An error occurred while adding the service.");
      }
    },

    async openModal() {
      await this.fetchServiceTypes();
      this.$emit("open-modal");
      
    }
  },

  template: `
<!-- Modal -->
<div class="modal fade" id="addServiceModal" tabindex="-1" aria-labelledby="addServiceModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="addServiceModalLabel">Add New Service</h5>
        <button 
          type="button" 
          class="btn-close" 
          data-bs-dismiss="modal" 
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <!-- Display error messages -->
        <div v-if="errorMessages.length" class="alert alert-danger">
          <ul>
            <li v-for="message in errorMessages" :key="message">{{ message }}</li>
          </ul>
        </div>

        <form @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="serviceName" class="form-label">Service Name</label>
            <input type="text" class="form-control" id="serviceName" v-model="serviceName" required />
          </div>
          <div class="mb-3">
            <label for="serviceType" class="form-label">Service Type</label>
            <select class="form-control" id="serviceType" v-model="serviceType" required>
              <option value="" disabled>Select Service Type</option>
              <option v-for="type in serviceTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label for="basePrice" class="form-label">Base Price</label>
            <input type="number" class="form-control" id="basePrice" v-model="basePrice" required />
          </div>
          <div class="mb-3">
            <label for="timeRequired" class="form-label">Time Required</label>
            <input type="text" class="form-control" id="timeRequired" v-model="timeRequired" required />
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button class="btn btn-secondary" data-bs-dismiss="modal" type="button">
              Close
            </button>
            <button type="submit" class="btn btn-primary">Add Service</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>


  `
};
