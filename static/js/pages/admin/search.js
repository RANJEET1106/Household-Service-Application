import dashboard from "./dashboard.js"
import UpdateService from "../../components/admin/UpdateService.js";
import viewProfessional from "../../components/admin/viewProfessional.js";
import { checkLoginStatus,
	fetchProfile,
    fetchProfessional,
	fetchCustomer,
	fetchServiceTypes,
	fetchServices,
	fetchServiceRequests,
	updateProfile ,
	formatDate,
} from "../../components/general/util.js";
import {handleUpdateService,
	openUpdateServiceModal,
	viewProfessionalProfile,
	deleteService,
	deleteUser,
	changeStatus,
	deleteServiceType,
	editService,
	cancelEdit,
	updateServiceType,
} from "../../components/admin/util.js";


export default{
	components: {
		UpdateService,
		viewProfessional,
	},
    data(){
        return{
            profile: {
				id:"",
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

				// Professional Data
				description: "",
				service_type: "",
				experience: 0,
				id_proof: "",
				website: "",
				total_rating: 0,
				total_users_rated: 0,
				
			},
			formData: {},
			isUpdating: false,
			selectedFile: null,
			services: [],
			selectedService: null,  // The service currently being updated
			updatedService: {},
			professionals: [],
			serviceRequests: [],
            customers:[],
			isLoggedIn: null,
			role: null,

			serviceName: "",
			serviceType: "",
			basePrice: "",
			timeRequired: "",
			description: "",
			serviceTypes: [], // For fetching available service types
			errorMessages: [],
			addingNew: false,
			newServiceType: "",
			editingId: null, // Stores the ID of the service type being edited
			editableServiceType: "",
            selectedCategory:"",
			
			searchQuery:"",
			filtered:[],
        };
    },
    methods:{
        async handleCategoryChange() {
            console.log("Selected Category:", this.selectedCategory);
            
            // Call a function based on the selected category
            switch (this.selectedCategory) {
              case "services":
                await this.fetchServices();
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
				this.filtered = this.services.filter((service) =>
				  Object.values(service).some((value) =>
					String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
				  )
				);
				break;
		  
			  case "serviceRequests":
				this.filtered = this.serviceRequests.filter((request) =>
				  Object.values(request).some((value) =>
					String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
				  )
				);
				break;
		  
			  case "professionals":
				this.filtered = this.professionals.filter((professional) =>
				  Object.values(professional).some((value) =>
					String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
				  )
				);
				break;
		  
			  case "customers":
				this.filtered = this.customers.filter((customer) =>
				  Object.values(customer).some((value) =>
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
		  

        dashboard,
		handleUpdateService,
		openUpdateServiceModal,
		viewProfessionalProfile,
		deleteService,
		deleteUser,
		changeStatus,
		deleteServiceType,
		editService,
		cancelEdit,
		updateServiceType,

		formatDate,
        checkLoginStatus,
	    fetchProfile,
        fetchProfessional,
		fetchCustomer,
	    fetchServiceTypes,
	    fetchServices,
	    fetchServiceRequests,
	    updateProfile ,
    },
    template:`
    <div class="container mt-3">
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
        <option value="services">Services</option>
        <option value="serviceRequests">Service Requests</option>
        <option value="professionals">Professionals</option>
        <option value="customers">Customers</option>
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
    <div class="container">
		<!-- Services Table -->
		<h2 v-if="selectedCategory==='services'" class="d-flex justify-content-between">
			<span>Services</span>

		</h2>
		<table v-if="selectedCategory==='services'" class="table table-bordered">
			<thead>
				<tr>
					<th>Service ID</th>
					<th>Service Name</th>
					<th>Service Type</th>
					<th>Base Price</th>
					<th>Time Required (in Hours)</th>
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
					<td> <button class="btn btn-warning btn-sm" type="button" @click="openUpdateServiceModal(service)">
							Update Service
						</button>
						<button class="btn btn-danger btn-sm" @click="deleteService(service.id)">
							Delete Service
						</button>
					</td>
				</tr>
			</tbody>

		</table>


        <!-- Professionals Table -->
		<h2 v-if="selectedCategory==='professionals'">Professionals</h2>
		<table v-if="selectedCategory==='professionals'" class="table table-bordered">
			<thead>
				<tr>
					<th>Professional ID</th>
					<th>Name</th>
					<th>Rating</th>
					<th>Status</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="professional in filtered" :key="professional.id">
					<td>{{ professional.id }}</td>
					<td>{{ professional.name }}</td>
					<td>{{ professional.rating }}</td>
					<td>{{ professional.status }}</td>
					<td> <button class="btn btn-primary btn-sm" type="button"
							@click="viewProfessionalProfile(professional.id)">
							View Profile
						</button>
						<button class="btn btn-danger btn-sm" @click="deleteUser(professional.id)">
							Delete
						</button>
						<button v-if="professional.status === 'pending'" class="btn btn-success btn-sm"
							@click="changeStatus(professional.id, 'unblocked')">
							Accept
						</button>

						<!-- Block button (if status is 'unblocked') -->
						<button v-else-if="professional.status === 'unblocked'" class="btn btn-warning btn-sm"
							@click="changeStatus(professional.id, 'blocked')">
							Block
						</button>

						<!-- Unblock button (if status is 'blocked') -->
						<button v-else-if="professional.status === 'blocked'" class="btn btn-success btn-sm"
							@click="changeStatus(professional.id, 'unblocked')">
							Unblock
						</button>
					</td>

				</tr>
			</tbody>
		</table>

        <!-- Customerss Table -->
		<h2 v-if="selectedCategory==='customers'">Customers</h2>
		<table v-if="selectedCategory==='customers'" class="table table-bordered">
			<thead>
				<tr>
					<th>Customer ID</th>
					<th>Name</th>
					<th>Status</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="customer in filtered" :key="customer.id">
					<td>{{ customer.id }}</td>
					<td>{{ customer.name }}</td>
					<td>{{ customer.total_rating }}</td>
					<td>{{ customer.status }}</td>
					<td> <button class="btn btn-primary btn-sm" type="button"
							@click="viewProfessionalProfile(customer.id)">
							View Profile
						</button>
						<button class="btn btn-danger btn-sm" @click="deleteUser(customer.id)">
							Delete
						</button>

						<!-- Block button (if status is 'unblocked') -->
						<button v-if="customer.status === 'unblocked'" class="btn btn-warning btn-sm"
							@click="changeStatus(customer.id, 'blocked')">
							Block
						</button>

						<!-- Unblock button (if status is 'blocked') -->
						<button v-else-if="customer.status === 'blocked'" class="btn btn-success btn-sm"
							@click="changeStatus(customer.id, 'unblocked')">
							Unblock
						</button>
					</td>

				</tr>
			</tbody>
		</table>

        <!-- Service Requests Table -->
		<h2 v-if="selectedCategory==='serviceRequests'">Service Requests</h2>
		<table v-if="selectedCategory==='serviceRequests'" class="table table-bordered">
			<thead>
                <tr>
                    <th>ID</th>
                    <th>Service Name</th>
					<th>Customer Name</th>
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
					<td>{{ request.customer_name }}</td>
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

		<div class="container mt-4">
            <h2 v-if="selectedCategory==='serviceTypes'">Service Types</h2>
			<table v-if="selectedCategory==='serviceTypes'" class="table table-bordered">
				<thead>
					<tr>
						<th>ID</th>
						<th>Service Type</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="service in filtered" :key="service.id">
						<td>{{ service.id }}</td>

						<!-- Editable Cell -->
						<td v-if="editingId === service.id">
							<input v-model="editableServiceType" class="form-control" ref="editInput" />
						</td>
						<td v-else>
							{{ service.name }}
						</td>

						<td>
							<button v-if="editingId === service.id" class="btn btn-success btn-sm"
								@click="updateServiceType(service.id)">
								Update
							</button>
							<button v-if="editingId === service.id" class="btn btn-secondary btn-sm"
								@click="cancelEdit">
								Cancel
							</button>

							<button v-else class="btn btn-warning btn-sm" @click="editService(service)">
								Edit
							</button>
							<button v-if="editingId !== service.id" class="btn btn-danger btn-sm"
								@click="deleteServiceType(service.id)">
								Delete
							</button>
						</td>
					</tr>
				</tbody>
			</table>

            </div>
		<update-service :service="selectedService" @update-service="handleUpdateService" />
		
		<viewProfessional :profile="profile" @delete-user="(id) => deleteUser(id)"
			@change-status="(id, status) => changeStatus(id, status)"></viewProfessional>
		

	</div>
    
    `
}