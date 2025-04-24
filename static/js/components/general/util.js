// export async function fetchServiceTypes() {
//     try {
//       const response = await fetch('/auth/service_types');
//       if (!response.ok) throw new Error("Failed to fetch service types");
//       return await response.json(); // Return the fetched service types
//     } catch (error) {
//       console.error("Error fetching service types:", error);
//       throw error; // Re-throw error for handling in the caller
//     }
// } 

export async function checkUsernameAvailability(username) {
    if (!username) return { available: false }; // Early return if no username provided
  
    try {
      const response = await fetch('/api/check_username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
  
      if (!response.ok) throw new Error("Failed to check username availability");
      return await response.json(); // Return the result (e.g., { available: true/false })
    } catch (error) {
      console.error("Error checking username availability:", error);
      throw error; // Re-throw error for handling in the caller
    }
}

export function validatePassword(password) {
    if (!/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[!@#\$%\^&\*]/.test(password) ||
        password.length < 8 ||
        password.length > 16) {
        return "Password must be 8-16 characters and include a mix of uppercase, lowercase, number, and special character.";
    }
    return '';
}

export function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email) ? '' : 'Please enter a valid email address.';
}

export function validateName(name) {
    const namePattern = /^[A-Za-z\s]+$/;
    return namePattern.test(name) ? '' : 'Name should contain only alphabets.';
}

export function validatePinCode(pinCode) {
    return /^\d{6}$/.test(pinCode) ? '' : 'Pin code must be exactly 6 digits.';
}

export function validateMobileNumber(mobileNumber) {
    return /^\d{10}$/.test(mobileNumber) ? '' : 'Mobile number must be exactly 10 digits.';
}

export function validateAddress(address) {
    return address && address.trim().length >= 10
        ? ''
        : 'Address must be at least 10 characters long.';
}

export function validateDescription(description, role) {
    if (role === 'professional' && (!description || description.trim().length < 20)) {
        return 'Description must be at least 20 characters long for professionals.';
    }
    return '';
}

export function validateExperience(experience) {
  const experienceInt = parseInt(experience, 10);
  if (isNaN(experienceInt) || experienceInt < 0 || experienceInt > 99) {
    return 'Experience must be an integer between 0 and 99.';
  }
  return ''; // Return an empty string if validation passes
}

export function validateRequiredFields(userData, role, profilePhotoFile, idProofFile) {
    const requiredFields = ['username', 'email', 'name', 'address', 'pin_code', 'mobile_no'];
    if (role === 'professional') {
      requiredFields.push('service_type', 'experience');
    }
  
    const errors = {};
  
    // Check for missing fields
    requiredFields.forEach((field) => {
      if (!userData[field]) {
        errors[field] = `${field.replace(/_/g, ' ')} is required.`;
      }
    });
  
    // Name validation
    if (userData.name && !/^[A-Za-z\s]+$/.test(userData.name)) {
      errors.name = 'Name should contain only alphabets.';
    }
  
    // Pin code validation
    if (userData.pin_code && !/^\d{6}$/.test(userData.pin_code)) {
      errors.pin_code = 'Pin code must be exactly 6 digits.';
    }
  
    // Mobile number validation
    if (userData.mobile_no && !/^\d{10}$/.test(userData.mobile_no)) {
      errors.mobile_no = 'Mobile number must be exactly 10 digits.';
    }
  
    if (userData.whatsapp_no && !/^\d{10}$/.test(userData.whatsapp_no)) {
      errors.whatsapp_no = 'WhatsApp number must be exactly 10 digits.';
    }
  
    // Address validation
    if (userData.address && userData.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters long.';
    }
  
    // Description validation (only for professionals)
    if (role === 'professional' && (!userData.description || userData.description.trim().length < 20)) {
      errors.description = 'Description must be at least 20 characters long for professionals.';
    }
  
    // ID proof validation (only for professionals)
    if (role === 'professional' && !idProofFile) {
      errors.id_proof = 'ID proof is required for professionals.';
    }
  
    // Profile photo validation (optional)
    // Uncomment if profile photo is required for all users
    // if (!profilePhotoFile) {
    //   errors.profile_photo = 'Profile photo is required.';
    // }
  
    return errors;
}



export async function checkLoginStatus() {
    try {
        const response = await fetch("/api/check_login", {
            method: "GET",
            credentials: "same-origin", // Ensures cookies are sent
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.ok) {
            const data = await response.json();
            return {
                isLoggedIn: true,
                role: data.role,
                id: data.id
            };
        } else {
            return { 
              isLoggedIn: false,
              role: null,
              id: null,

             };
        }
    } catch (error) {
        console.error("Error checking login status:", error);
        return { isLoggedIn: false, };
    }
}

export async function fetchProfile(profileId=null) {
  try {
    let response;
    if(profileId){
      response = await fetch(`/api/profile/${profileId}`);
    }
    else{
      response = await fetch("/api/profile");
    }
    
    if (response.ok) {
      const profileData = await response.json();
      this.profile = profileData;
      this.formData = { ...this.profile };
    } else {
      console.error("Failed to fetch profile:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
}

export async function fetchProfessional() {
  try {
    const response = await fetch("/api/professionals");
    if (response.ok) {
      this.professionals = await response.json();
    } else {
      console.error("Failed to fetch professionals");
    }
  } catch (error) {
    console.error("Error fetching professionals:", error);
  }
}

export async function fetchCustomer() {
  try {
    const response = await fetch("/api/customers");
    if (response.ok) {
      this.customers = await response.json();
    } else {
      console.error("Failed to fetch customers");
    }
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
}

export async function updateProfile() {
  try {
    const formData = new FormData();
    Object.entries(this.formData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (this.selectedFile) {
      formData.append("profile_photo", this.selectedFile);
    }

    const response = await fetch("/api/update_profile", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const updatedData = await response.json();
      // alert(updatedData.message);
      this.profile = { ...this.formData };
      if (updatedData.profile_photo) {
        this.profile.profile_photo = updatedData.profile_photo;
        window.location.reload();
      }
      window.location.reload();
    } else {
      const errorData = await response.json();
      alert(`Failed to update profile: ${errorData.message || "Please try again."}`);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("An error occurred. Please try again.");
  }
}

export async function fetchServiceTypes() {
  try {
    const response = await fetch("/api/service-types");
    if (response.ok) {
      const data = await response.json();
      this.serviceTypes = data.service_types;
    } else {
      console.error("Failed to fetch service types");
    }
  } catch (error) {
    console.error("Error fetching service types:", error);
  }
}

export async function fetchServices() {
  try {
    const response = await fetch("/api/services");
    if (response.ok) {
      this.services = await response.json();
      // this.services = data.service_types;
    } else {
      console.error("Failed to fetch services");
    }
  } catch (error) {
    console.error("Error fetching services:", error);
  }
}

export async function fetchServiceRequests(loc=null) {
  try {
    const response = await fetch(`/api/service-requests/${loc}`);
    if (response.ok) {
      const data = await response.json();
      this.serviceRequests = data.requests;
      console.log(this.serviceRequests)
    }
    else {
      console.error("Failed to fetch service request");
    }
  } catch (error) {
    console.error("Error fetching service requests:", error);
  }
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}


