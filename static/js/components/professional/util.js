export async function acceptRequest(requestId,page) {
    if (!confirm("Are you sure you want to accept this request?")) {
        return;
    }

    try {
        const response = await fetch(`/api/accept_request/${requestId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        if (response.ok) {
            alert("Request accepted successfully!")
            if(page==='search'){
                await this.fetchServiceRequests();
                this.filtered = [...this.serviceRequests];
            }
            else {
                this.getServiceRequests("dashboard"); // Refresh table after closing
            }
        } else {
            alert(`Failed to accept request: ${data.message}`);
        }
    } catch (error) {
        console.error("Error accepting request:", error);
        alert("An error occurred. Please try again.");
    }
}

export async function rejectRequest(requestId,page) {
    if (!confirm("Are you sure you want to reject this request?")) {
        return;
    }

    try {
        const response = await fetch(`/api/reject_request/${requestId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        if (response.ok) {
            alert("Request rejected successfully!");
            if(page==='search'){
                await this.fetchServiceRequests();
                this.filtered = [...this.serviceRequests];
            }
            else {
                this.getServiceRequests("dashboard"); // Refresh table after closing
            }
        } else {
            alert(`Failed to reject request: ${data.message}`);
        }
    } catch (error) {
        console.error("Error rejecting request:", error);
        alert("An error occurred. Please try again.");
    }
}