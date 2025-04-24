

export function openUpdateServiceModal(service) {
    this.selectedService = service;
    this.updatedService = { ...service }; // Make a copy of the service to update

    // Show the modal
    const updateServiceModal = new bootstrap.Modal(document.getElementById('updateServiceModal'));
    updateServiceModal.show();
}

export function handleUpdateService(updatedService) {
    fetch(`/api/services/${updatedService.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedService),
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.success) {
                alert('Service updated successfully!');
                // Refresh the services list
                this.fetchServices();
                this.fetchServiceRequests("dashboard");
                const updateServiceModal = bootstrap.Modal.getInstance(
                    document.getElementById('updateServiceModal')
                );
                if (updateServiceModal) {
                    updateServiceModal.hide();
                }
            } else {
                alert('Failed to update service.');
            }
        })
        .catch((error) => {
            console.error('Error updating service:', error);
        });
}

export async function viewProfessionalProfile(professionalId) {
    try {
        // Fetch the profile data using the professional ID
        await this.fetchProfile(professionalId);
        // Ensure the DOM is updated before initializing the Offcanvas
        this.$nextTick(() => {
            const offcanvasElement = document.getElementById("viewProfessional");
            if (offcanvasElement) {
                const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
                offcanvas.show();
            } else {
                console.error("Offcanvas element not found!");
            }
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}


export function deleteService(id) {
    let x = confirm('Are you sure to delete the service with id ' + id);
    if (!x) {
        return;
    }
    
    fetch(`/api/services/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message); 
            this.fetchServices(); 
        })
        .catch(error => {
            console.error('Error:', error); 
        });
}
export function deleteUser(id){
    let x=confirm('Are you sure to delete the user with id '+id);
    if (!x) {
        return;
    }
    
    fetch(`/api/profile/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            this.fetchDashboardData();  
            const deleteuseroffcanvas = bootstrap.Offcanvas.getInstance(
                document.getElementById("viewProfessional")
            );
            if (deleteuseroffcanvas) {
                deleteuseroffcanvas.hide();
            }
            
        })
        .catch(error => {
            console.error('Error:', error); 
        });
}

export async function changeStatus(userId, newStatus) {
    console.log(userId);
    let x=confirm('Are you sure to update the user status with id '+userId);
    if (!x) {
        return;
    }
    try {
        const response = await fetch(`/api/change_status/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
            alert("Status updated successfully!");

            
            const professional = this.professionals.find(p => p.id === userId);
            if (professional) {
                professional.status = newStatus;
            }
            this.profile.status=newStatus;
        } else {
            alert("Failed to update status.");
        }
    } catch (error) {
        console.error("Error updating status:", error);
    }
}


export function deleteServiceType(id) {
    if (confirm("Are you sure you want to delete this service type?")) {
        fetch(`/api/service-types/${id}/delete`, { method: "DELETE" })
            .then((response) => response.json())
            .then((result) => {
                alert(result.message);
                this.fetchServiceTypes();
                this.fetchServiceRequests("dashboard");
                this.fetchServices();
            })
            .catch((error) => console.error("Error deleting service type:", error));
    }
}

export function editService(service) {
    this.editingId = service.id;
    this.editableServiceType = service.name;
    
    this.$nextTick(() => {
        this.$refs.editInput[0].focus(); // Auto-focus on input field
    });
}

// Cancel editing
export function cancelEdit() {
    this.editingId = null;
    this.editableServiceType = "";
}

// Update service type
export function updateServiceType(id) {
    fetch(`/api/service-types/${id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_type: this.editableServiceType })
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            this.fetchServiceTypes(); // Refresh table
            this.fetchServices();
            this.cancelEdit();
        })
        .catch(error => console.error("Error updating service type:", error));
}