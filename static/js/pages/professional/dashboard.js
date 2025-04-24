import { checkLoginStatus,fetchProfile,updateProfile,fetchServiceRequests,formatDate } from "../../components/general/util.js";
import ViewProfile from "../../components/general/ViewProfile.js";
import UpdateProfile from "../../components/general/UpdateProfile.js";
import { acceptRequest,rejectRequest } from "../../components/professional/util.js";
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

				// Professional-Specific Data
				description: "",
				service_type: "",
				experience: 0, // Consider using a number to represent years of experience
				id_proof: "",
				website: "",
				total_rating: 0, // Represents the total rating
				total_users_rated: 0, // Number of users who rated this professional
				status: "", // blocked ,unblocked
				date_created: "", // Registration or profile creation date
			},
			isLoggedIn: false,
			role: null,
			formData: {},
			serviceRequests: [],
			acceptedRequests: [],
			requestedRequests: [],
		};
	},

	async created() {

		const response = await checkLoginStatus();
		this.isLoggedIn = response.isLoggedIn;
		this.role = response.role;
		if (this.isLoggedIn && this.role === "professional") {
			this.getServiceRequests();
			this.fetchProfile();
		} else {
			this.$router.push("/login");
		}
	},
	methods: {
		async getServiceRequests(){
			await this.fetchServiceRequests("dashboard");
			this.acceptedRequests = this.serviceRequests.filter(req => req.service_status === "accepted");
			this.requestedRequests = this.serviceRequests.filter(req => req.service_status === "requested");
		},
		acceptRequest,
		rejectRequest,
		formatDate,
		fetchProfile,
		updateProfile,
		fetchServiceRequests,
	},
	template: `
<div>
    <h1 class="text-center">Professional Dashboard</h1>
    <div class="d-flex justify-content-end">
        <img :src="profile.profile_photo " alt="Profile Picture"
            class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover; border: 2px solid #ddd;" />
        <button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#profilePanel">
            View Profile
        </button>
    </div>
    <!-- Requested Services Table -->
    <h3>Todays Services</h3>
    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th>ID</th>
                <th>Service Name</th>
                <th>Customer Name</th>
                <th>Date of Request</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="req in requestedRequests" :key="req.id">
                <td>{{ req.id}}
                <td>{{ req.service_name }}</td>
                <td>{{ req.customer_name }}</td>
                <td>{{ formatDate(req.date_of_request )}}</td>
                <td>
                <button 
                    class="btn btn-success btn-sm" 
                    type="button"
                    @click="acceptRequest(req.id)"
                  >
                    Accept
                  </button>
                  <button 
                    class="btn btn-danger btn-sm" 
                    type="button"
                    @click="rejectRequest(req.id)"
                  >
                    Reject
                  </button>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Accepted Services Table -->
    <h3>Accepted Services</h3>
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
            </tr>
        </thead>
        <tbody>
            <tr v-for="req in acceptedRequests" :key="req.id">
                <td>{{ req.id }}</td>
                <td>{{ req.service_name }}</td>
                <td>{{ req.customer_name }}</td>
                <td>{{ formatDate(req.date_of_request )}}</td>
                <td>{{ req.address }}</td>
                <td>{{ req.pin_code }}</td>
                <td>{{ req.contact_no }}</td>
                <td>{{ req.whatsapp_no }}</td>
            </tr>
        </tbody>
    </table>

    
    <ViewProfile :profile="profile" />

    <UpdateProfile :formData="formData" 
      @file-upload="(file) => { this.selectedFile = file }" 
      @update-profile="updateProfile" 
    />

</div>

    `
};
