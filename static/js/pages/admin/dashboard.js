import { checkLoginStatus,
	fetchProfile,
	fetchProfessional,
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

import ViewProfile from "../../components/general/ViewProfile.js";
import UpdateProfile from "../../components/general/UpdateProfile.js";
import UpdateService from "../../components/admin/UpdateService.js";
import AddService from "../../components/admin/AddService.js";
import viewProfessional from "../../components/admin/viewProfessional.js";
// import dashboard from "../customer/dashboard.js";

export default {
	components: {
		ViewProfile,
		UpdateProfile,
		UpdateService,
		AddService,
		viewProfessional,
	},
	data() {
		return {
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
			userProfilePhoto: null,
			formData: {},
			isUpdating: false,
			selectedFile: null,
			services: [],
			selectedService: null,  // The service currently being updated
			updatedService: {},
			professionals: [],
			serviceRequests: [],
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

			exportDownloadUrl: null,
		};
	},
	async created() {
		await this.fetchServiceTypes();
		const response = await checkLoginStatus();
		this.isLoggedIn = response.isLoggedIn;
		this.role = response.role;
		if (this.isLoggedIn && this.role === "admin") {
			await this.fetchProfile();
			await this.fetchServiceRequests("dashboard");
			await this.fetchServices();
			await this.fetchProfessional();
			await this.fetchServiceTypes();
			this.userProfilePhoto=this.profile.profile_photo;
		} else {
			this.$router.push("/login");
		}
	},
	methods: {

		async openAddServiceModal() {
			await this.$refs.addServiceModal.fetchServiceTypes();
			// This method will be triggered when the button is clicked
			const modal = new bootstrap.Modal(document.getElementById('addServiceModal'));
			modal.show();
		},

		// Handle opening the modal from the child component
		openModal() {
			this.openAddServiceModal();
		},
		handleServiceAdded() {
			window.location.reload();
		},
		addServiceType() {
			if (!this.newServiceType.trim()) {
				alert("Please enter a service type.");
				return;
			}

			fetch("/api/service-types/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ service_type: this.newServiceType }),
			})
				.then((response) => response.json())
				.then((result) => {
					alert(result.message);
					this.newServiceType = ""; 
					this.fetchServiceTypes();
					this.addingNew = false;
					this.showInput = false;
				})
				.catch((error) => console.error("Error adding service type:", error));
		},
		async triggerExport() {
			try {
				const response = await fetch("/api/export-closed-requests", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
				});
				const result = await response.json();
				if (response.status === 202) {
					alert("Export started. Please wait...");
					this.checkExportStatus(result.task_id);
				} else {
					alert("Failed to start export: " + result.message);
				}
			} catch (error) {
				console.error("Error triggering export:", error);
			}
		},

		async checkExportStatus(taskId) {
			const interval = setInterval(async () => {
				try {
					const response = await fetch(`/api/export-status/${taskId}`);
					const result = await response.json();
					
					if (result.status === "Completed") {
						clearInterval(interval);
						alert("Export completed! Click OK to download.");
						this.exportDownloadUrl = result.file_url; 
					}
				} catch (error) {
					console.error("Error checking export status:", error);
				}
			}, 5000); // Check every 5 seconds
		},

		fetchProfile,
		updateProfile,
		fetchProfessional,
		fetchServiceTypes,
		fetchServiceRequests,
		fetchServices,

		formatDate,
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
	},
	template: `
<div>
	<h1 class="text-center">Admin Dashboard</h1>
	<div class="d-flex justify-content-end">
		<img :src="this.userProfilePhoto " alt="Profile Picture"
			class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover; border: 2px solid #ddd;" />
		<button class="btn btn-primary" type="button" @click="fetchProfile()" data-bs-toggle="offcanvas"
			data-bs-target="#profilePanel">
			View Profile
		</button>
	</div>

	<div class="container">
		<!-- Services Table -->
		<h2 class="d-flex justify-content-between">
			<span>Services</span>

			<button type="button" class="btn btn-primary btn-sm" @click="openAddServiceModal">Add New Service</button>

			<!-- Add Service Component (Child Component) -->

		</h2>
		<table class="table table-bordered">
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
				<tr v-for="service in services" :key="service.id">
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
		<h2>Professionals</h2>
		
		<div>
			<button class="btn btn-success" @click="triggerExport">
				Export Closed Requests
			</button>
			<a v-if="exportDownloadUrl" :href="exportDownloadUrl" class="btn btn-primary mt-2" download>
				Download CSV
			</a>
		</div>
		<table class="table table-bordered">
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
				<tr v-for="professional in professionals" :key="professional.id">
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

		<!-- Service Requests Table -->
		<h2>Service Requests</h2>
		<table class="table table-bordered">
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
                <tr v-for="request in serviceRequests" :key="request.id">
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
			<div class="d-flex justify-content-between align-items-center">
				<h2>Service Types</h2>
				<button class="btn btn-primary btn-sm" @click="addingNew = true">
					<i class="bi bi-plus-circle"></i> Add Service Type
				</button>
			</div>
			<table class="table table-bordered">
				<thead>
					<tr>
						<th>ID</th>
						<th>Service Type</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="addingNew">
						<td>New</td>
						<td>
							<input type="text" v-model="newServiceType" class="form-control"
								placeholder="Enter service type" />
						</td>
						<td class="text-center">
							<button class="btn btn-success btn-sm" @click="addServiceType">Add
								<i class="bi bi-check-circle"></i>
							</button>
							<button class="btn btn-secondary btn-sm" @click="addingNew = false">Close
								<i class="bi bi-x-circle"></i>
							</button>
						</td>
					</tr>
					<tr v-for="service in serviceTypes" :key="service.id">
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
		<add-service ref="addServiceModal" @open-modal="openModal" @service-added="handleServiceAdded" />
		<viewProfessional :profile="profile" @delete-user="(id) => deleteUser(id)"
			@change-status="(id, status) => changeStatus(id, status)"></viewProfessional>
		<ViewProfile :profile="profile" />
		<UpdateProfile :formData="formData" @file-upload="(file) => { this.selectedFile = file }"
			@update-profile="updateProfile" />

	</div>
</div>

		`
};
