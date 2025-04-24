import dashboard from "./dashboard.js"
import { checkLoginStatus,
	fetchServiceRequests,
    formatDate,
} from "../../components/general/util.js";
import { acceptRequest,rejectRequest } from "../../components/professional/util.js";


export default{
	async created() {

		const response = await checkLoginStatus();
		this.isLoggedIn = response.isLoggedIn;
		this.role = response.role;
		if (this.isLoggedIn && this.role === "professional") {
			this.getServiceRequests();
		} else {
			this.$router.push("/login");
		}
	},
    data(){
        return{
			serviceRequests: [],
			isLoggedIn: null,
			role: null,


			selectedCategory:"",
			searchQuery:"",
			filtered:[],
        };
    },
    methods:{
        async getServiceRequests(){
			await this.fetchServiceRequests();
		},
        async handleCategoryChange() {
            console.log("Selected Category:", this.selectedCategory);
            
            // Call a function based on the selected category
            switch (this.selectedCategory) {
              case "serviceRequests":
                await this.fetchServiceRequests();
				this.filtered = [...this.serviceRequests]
                break;
            }
          },
		  handleSearchChange() {
			console.log("Search Query Changed:", this.searchQuery);
		  
			switch (this.selectedCategory) {
		  
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
		  

        dashboard,
        formatDate,
        acceptRequest,
        rejectRequest,
        checkLoginStatus,
	    fetchServiceRequests,
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
        <option value="customers">Customers</option>
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

        <!-- Service Requests Table -->
		<h2 v-if="selectedCategory==='serviceRequests'">Service Requests</h2>
		<table class="table table-striped table-hover">
        <thead>
            <tr>
                <th>ID</th>
                <th>Service Name</th>
                <th>Customer Name</th>
                <th>Date of Request</th>
                <th>Address</th>
                <th>Pin Code</th>
                <th>Mobile No</th>
                <th>Whatsapp No</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="req in filtered" :key="req.id">
                <td>{{ req.id }}</td>
                <td>{{ req.service_name }}</td>
                <td>{{ req.customer_name }}</td>
                <td>{{ formatDate(req.date_of_request )}}</td>
                <td>{{ req.address }}</td>
                <td>{{ req.pin_code }}</td>
                <td>{{ req.contact_no }}</td>
                <td>{{ req.whatsapp_no }}</td>
<td>
  <button v-if="req.service_status === 'requested'"
    class="btn btn-success btn-sm" 
    type="button"
    @click="acceptRequest(req.id,'search')">
    Accept
  </button>
  <button v-if="req.service_status === 'requested'"
    class="btn btn-danger btn-sm" 
    type="button"
    @click="rejectRequest(req.id,'search')">
    Reject
  </button>
  
  <span v-else>{{ req.service_status || "No status" }}</span> 
</td>

            </tr>
        </tbody>
    </table>		

	</div>
    
    `
}