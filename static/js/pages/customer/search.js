import { checkLoginStatus,fetchProfile,updateProfile,fetchServiceTypes,fetchServiceRequests,formatDate } from "../../components/general/util.js";
import ViewProfile from "../../components/general/ViewProfile.js";
import UpdateProfile from "../../components/general/UpdateProfile.js";
import {
    bookService,
cancelRequest,
closeRequest,
openReviewPopup,
openBookingPopup,
setRating,
resetReviewForm,
} from "../../components/customer/util.js"
export default {
    components: {
        ViewProfile,
        UpdateProfile,
    },
    data() {
        return {
            profile: {
                // General User Data
                username: "",
                name: "",
                email: "",
                address: "",
                pin_code: "",
                mobile_no: "",
                whatsapp_no: "",
                role: "",
                profile_photo: "",
                status: "",
            },
            //for updating profile
            selectedFile: null,
            formData: {},
            isLoggedIn: false,
            role: null,

            serviceTypes: [], // List of service types
            services: [], // Services belonging to selected service type
            serviceRequests: [],

            selectedServiceTypeId: null, // For booking service
            selectedServiceTypeName: "",

            requestIdToClose: null,
            serviceRating: 0,
            serviceReview: null,

            selectedCategory: null,
            searchQuery:"",
			filtered:[],
        };
    },

    async created() {
        const response = await checkLoginStatus();
        this.isLoggedIn = response.isLoggedIn;
        this.role = response.role;
        if (this.isLoggedIn && this.role === "customer") {
            this.fetchServiceTypes();
            this.fetchProfile();
            this.fetchServiceRequests("dashboard")
        } else {
            this.$router.push("/login");
        }
    },
    methods: {

        async handleCategoryChange() {
            console.log("Selected Category:", this.selectedCategory);
            
            // Call a function based on the selected category
            switch (this.selectedCategory) {
              case "services":
                // await this.fetchServices();
				this.filtered = [...this.services]
                break;
              case "serviceRequests":
                await this.fetchServiceRequests();
				this.filtered = [...this.serviceRequests]
                break;
              case "professionals":
                await this.fetchProfessional();
				this.filtered = [...this.professionals]
                break;
              case "customers":
                await this.fetchCustomer();
				this.filtered = [...this.customers]
                break;
              case "serviceTypes":
                await this.fetchServiceTypes();
				this.filtered = [...this.serviceTypes]
                break;
            }
          },
		  handleSearchChange() {
			console.log("Search Query Changed:", this.searchQuery);
		  
			switch (this.selectedCategory) {
                case "services":
                    this.filtered = this.services
                        .map((service) => {
                            const matchingProfessionals = service.professionals.filter((professional) =>
                                professional.name.toLowerCase().includes(this.searchQuery.toLowerCase())
                            );
                        
                            // If professionals match, return a modified service with only matching professionals
                            if (matchingProfessionals.length > 0) {
                                return { ...service, professionals: matchingProfessionals };
                            }
                        
                            // If no professionals match, check if the service fields match
                            const serviceMatches = Object.values(service).some((value) =>
                                String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
                            );
                        
                            // If service matches, return it with all professionals
                            return serviceMatches ? service : null;
                        })
                        .filter((service) => service !== null); // Remove null values (non-matching services)
                    break;

                  

                  
		  
			  case "serviceRequests":
				this.filtered = this.serviceRequests.filter((request) =>
				  Object.values(request).some((value) =>
					String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
				  )
				);
				break;
		  
			  case "serviceTypes":
				this.filtered = this.serviceTypes.filter((type) =>
				  Object.values(type).some((value) =>
					String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
				  )
				);
				break;
			}
		  },

          async selecedServiceType(id,name){
                this.selectedCategory='services';
                
                await this.openBookingPopup(id, name);
                await this.handleCategoryChange();
                
                const modal = new bootstrap.Modal(document.getElementById("serviceModal"));
                modal.show();
          },

        bookService,
        cancelRequest,
        closeRequest,
        openReviewPopup,
        openBookingPopup,
        setRating,
        resetReviewForm,

        
        formatDate,
        updateProfile,
        fetchProfile,
        fetchServiceTypes,
        fetchServiceRequests,
    },
    template: `
<div>
    <h1 class="text-center">Customer Dashboard</h1>
<div class="row">
  <div class="col-md-6">
    <!-- Use d-flex to align elements horizontally -->
    <div class="d-flex align-items-center">
      

      <!-- Dropdown for Search Category -->
      <select 
        v-model="selectedCategory" 
        class="form-select" 
        @change="handleCategoryChange"
      >
	  	<option value="" disabled>Select a Category</option> 
        
        <option value="serviceRequests">Service Requests</option>
        <option value="serviceTypes">Service Types</option>
      </select>

	  <!-- Search Input -->
      <input 
        type="text" 
        v-model="searchQuery" 
        @input="handleSearchChange" 
        class="form-control me-2" 
        placeholder="Enter search term..."
      />
    </div>
  </div>
</div>
    
    <div>

        <h2 v-if="selectedCategory==='serviceRequests'">Service Requests</h2>
		<table v-if="selectedCategory==='serviceRequests'" class="table table-bordered">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Service Name</th>
                    <th>Professional Name</th>
                    <th>Date of Request</th>
                    <th>Service Status</th>
                    <th>Action</th>
                    <th>Rating</th>
                    <th>Review</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="request in filtered" :key="request.id">
                    <td>{{ request.id }}</td>
                    <td>{{ request.service_name }}</td>
                    <td>{{ request.professional_name || 'Not Assigned' }}</td>
                    <td>{{ formatDate(request.date_of_request) }}</td>
                    <td>{{ request.service_status }}</td>
                    <td>
                        <button v-if="request.service_status === 'requested'" class="btn btn-danger btn-sm"
                            @click="cancelRequest(request.id,'search')">
                            Cancel Request
                        </button>
                        <button v-if="request.service_status === 'accepted'" class="btn btn-success btn-sm" 
                            data-bs-toggle="modal" data-bs-target="#reviewModal"
                            @click="openReviewPopup(request.id)">
                            Close It
                        </button>
                    </td>
                    <td>{{ request.rating}} </td>
                    <td>{{ request.review}} </td>
                </tr>
            </tbody>
        </table>


        <div class="modal fade" id="reviewModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Rate & Review</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <label for="rating">Rating:</label>
                        <div class="d-flex gap-1">
                            <span v-for="star in 5" :key="star" @click="setRating(star)" class="fs-3 text-warning">
                                <i :class="['bi', star <= serviceRating ? 'bi-star-fill' : 'bi-star']"></i>
                            </span>
                        </div>

                        <label for="review" class="mt-2">Review:</label>
                        <textarea v-model="serviceReview" class="form-control"
                            placeholder="Write your feedback"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                            @click="resetReviewForm">Cancel</button>
                        <button type="button" class="btn btn-primary" @click="closeRequest(requestIdToClose,'search')">Close
                            Service</button>
                    </div>
                </div>
            </div>
        </div>


        <!-- Service Type Buttons -->
        <h3 v-if="selectedCategory==='serviceTypes'">Select a Service Type</h3>
        <div v-if="selectedCategory==='serviceTypes'">
            <button class="btn btn-primary m-2" v-for="type in filtered" :key="type.id"
                @click="selecedServiceType(type.id, type.name)" >
                {{ type.name }}
            </button>
        </div>

        <!-- Modal for Services -->
        <div v-if="selectedCategory==='services'" class="modal fade" id="serviceModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg"> <!-- Larger modal -->
                <div class="modal-content">
                    <div class="modal-header">

                        <h5 class="modal-title">{{ selectedServiceTypeName }}</h5>
                        <input 
        type="text" 
        v-model="searchQuery" 
        @input="handleSearchChange" 
        class="form-control me-2" 
        placeholder="Enter search term..."
      />
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p v-if="services.length === 0" class="text-center text-muted">No services available</p>
                        <div v-else class="table-responsive"> <!-- Makes table scrollable -->
                            <table class="table table-bordered table-hover">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Service ID</th>
                                        <th>Service Name</th>
                                        <th>Service Type</th>
                                        <th>Base Price</th>
                                        <th>Time Required (Hours)</th>
                                        <th>Professional Name</th>
                                        <th>Rating</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="service in filtered" :key="service.id">
                                        <td>{{ service.id }}</td>
                                        <td>{{ service.service_name }}</td>
                                        <td>{{ service.service_type }}</td>
                                        <td>{{ service.base_price }}</td>
                                        <td>{{ service.time_required }}</td>
                                        <td colspan="3">
                                            <span v-if="service.professionals.length > 0">
                                                <!-- Grid for Last 3 Columns -->
                                                <div v-for="(pro, index) in service.professionals" :key="pro.id"
                                                    class="d-grid align-items-center text-center"
                                                    style="grid-template-columns: 50% 25% 20%; gap: 5px;">
                                                    <div class="text-start">{{ pro.name }}</div>
                                                    <div>{{ pro.total_rating.toFixed(1) }} ⭐</div>
                                                    <div>
                                                        <button class="btn btn-warning btn-sm" type="button"
                                                            @click="bookService(service.id, pro.id)">
                                                            Book Service
                                                        </button>
                                                    </div>
                                                    <!-- Horizontal line between professionals -->
                                                    <hr v-if="index < service.professionals.length - 1" class="my-1 w-100">
                                                </div>
                                            </span>
                                            <span v-else class="text-center w-100">No Professionals Available</span>
                                        </td>
                                    </tr>
                                </tbody>
</table>


                        </div>
                    </div>
                </div>
            </div>
        </div>


    </div>
</div>
    `
};
