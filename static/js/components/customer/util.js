

export async function bookService(serviceId, professionalId) {
    try {
        const exists = this.serviceRequests.some(request => 
            request.service_id === serviceId && request.professional_id === professionalId 
        );
        
        if (exists) {
            alert("Service already booked with this professional.");
            return; // Stop the function execution
        }

        const confirmBooking = confirm("Are you sure you want to book this service?");
        if (!confirmBooking) return; // Stop execution if the user cancels

        

        const response = await fetch("/api/book_service", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                service_id: serviceId,
                professional_id: professionalId,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Service booked successfully!");
            this.fetchServiceRequests("dashboard");
            this.$emit("serviceBooked"); // Emit event if needed

            // Close the modal after successful booking
            const modal = bootstrap.Modal.getInstance(document.getElementById("serviceModal"));
            if (modal) {
                modal.hide();
            }
        } else {
            alert(`Failed to book service: ${data.message}`);
        }
    } catch (error) {
        console.error("Error booking service:", error);
        alert("An error occurred. Please try again.");
    }
}

export async function cancelRequest(requestId,loc) {
    if (confirm("Are you sure you want to cancel this service request?")) {
        try {
            const response = await fetch(`/api/cancel_service_request/${requestId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                alert("Request canceled successfully!");
                if(loc==='search'){
                    await this.fetchServiceRequests();
				    this.filtered = [...this.serviceRequests];
                }
                else {
                    this.fetchServiceRequests("dashboard"); // Refresh table after closing
                }
            } else {
                alert("Failed to cancel request.");
            }
        } catch (error) {
            console.error("Error canceling request:", error);
        }
    }
}

export async function closeRequest(loc) {
    try {
        const response = await fetch("/api/close_request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                request_id: this.requestIdToClose,
                rating: this.serviceRating,
                review: this.serviceReview,
            }),
        });

        if (response.ok) {
            alert("Service closed successfully!");
            if(loc==='search'){
                await this.fetchServiceRequests();
                this.filtered = [...this.serviceRequests];
            }
            else {
                this.fetchServiceRequests("dashboard"); // Refresh table after closing
            }
            const modal = bootstrap.Modal.getInstance(document.getElementById("reviewModal"));
            if (modal) {
                modal.hide();
            }
        } else {
            alert("Failed to close service.");
        }
    } catch (error) {
        console.error("Error closing request:", error);
    } finally {
        this.resetReviewForm();
    }
}

// Popup Functions
export function openReviewPopup(requestId) {
    this.requestIdToClose = requestId;
}

export async function openBookingPopup(serviceTypeId, serviceTypeName) {
    this.selectedServiceTypeId = serviceTypeId;
    this.selectedServiceTypeName = serviceTypeName;

    try {
        const response = await fetch(`/api/services/${serviceTypeId}`);
        if (response.ok) {
            const data = await response.json();
            this.services = data;
            console.log("Services after assignment:", this.services);
        } else {
            console.error("Failed to fetch services");
        }
    } catch (error) {
        console.error("Error fetching services:", error);
    }
}

export function setRating(star) {
    this.serviceRating = star; // Set the clicked star rating
}

export function resetReviewForm() {
    this.requestIdToClose = null;
    this.serviceRating = 0;
    this.serviceReview = "";
}