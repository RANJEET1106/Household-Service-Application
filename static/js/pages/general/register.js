import {
  validatePassword,
  validateEmail,
  validateName,
  validatePinCode,
  validateMobileNumber,
  validateAddress,
  validateDescription,
  validateRequiredFields,
  fetchServiceTypes,
  checkUsernameAvailability,
  validateExperience
} from "../../components/general/util.js"

export default ({
  data() {
    return {
      formStep: 1,
      usernameAvailable: true,
      usernameChecked: false,  // Track if the username check has been completed
      serviceTypes: [],
      userData: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
        name: null,
        address: null,
        pin_code: '',
        mobile_no: '',
        whatsapp_no: '',
        profile_photo: '',
        description: '',
        service_type: '',
        profile_photo: null,  // For profile photo file
        id_proof: null,      // For id_proof file
        experience: '',
        id_proof: '',
        website: ''
      },
      passwordError: '',  // Error message for password constraints
      emailError: '', // Error message for email validation
      profilePhotoFile: null, // Temporary storage for profile photo file
      idProofFile: null,       // Temporary storage for ID proof file1
      profilePhotoError: '',
      idProofError: '',
      requiredFieldErrors: {}, // For required field validation
      experienceError: '',
      showPassword: false,
        showConfirmPassword: false,
    };
  },
  async created() {
      await this.fetchServiceTypes();
    },
  methods: {
    
    async checkUsernameAvailability() {
      if (this.userData.username) {
        try {
          const result = await checkUsernameAvailability(this.userData.username);
          this.usernameAvailable = result.available;
          this.usernameChecked = true; // Mark as checked
        } catch (error) {
          console.error("Failed to check username availability:", error);
        }
      }
    },
    validatePassword() {
      this.passwordError = validatePassword(this.userData.password);
      return !this.passwordError;
    },
    validateEmail() {
      this.emailError = validateEmail(this.userData.email);
      return !this.emailError;
    },
    validateName() {
      const error = validateName(this.userData.name);
      if (error) {
        this.requiredFieldErrors.name = error;
      } else {
        delete this.requiredFieldErrors.name;
      }
    },
    validatePinCode() {
      const error = validatePinCode(this.userData.pin_code);
      if (error) {
        this.requiredFieldErrors.pin_code = error;
      } else {
        delete this.requiredFieldErrors.pin_code;
      }
    },
    validateMobileNumber(field, errorField) {
      const error = validateMobileNumber(this.userData[field]);
      if (error) {
        this.requiredFieldErrors[errorField] = error;
      } else {
        delete this.requiredFieldErrors[errorField];
      }
    },
    validateAddress() {
      const error = validateAddress(this.userData.address);
      if (error) {
        this.requiredFieldErrors.address = error;
      } else {
        delete this.requiredFieldErrors.address;
      }
    },
    validateDescription() {
      const error = validateDescription(this.userData.description, this.userData.role);
      if (error) {
        this.requiredFieldErrors.description = error;
      } else {
        delete this.requiredFieldErrors.description;
      }
    },
    validateExperienceField() {
      // Use the validateExperience utility
      this.experienceError = validateExperience(this.userData.experience);
    },
    validateRequiredFields() {
      // Call the utility function
      const errors = validateRequiredFields(
        this.userData,
        this.userData.role,
        this.profilePhotoFile,
        this.idProofFile
      );

      // Update the local error object
      this.requiredFieldErrors = errors;

      // Return whether all validations passed
      return Object.keys(errors).length === 0;
    },
    onFileChange(field, event) {
      const file = event.target.files[0];
      if (!file) return;

      if (field === 'profile_photo') {
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
          this.profilePhotoError = 'Only image files are allowed for profile photos.';
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          this.profilePhotoError = 'Profile photo size must be under 2MB.';
          return;
        }
        this.profilePhotoError = '';
        this.profilePhotoFile = file;
      } else if (field === 'id_proof') {
        // Validate file type and size
        if (file.type !== 'application/pdf') {
          this.idProofError = 'Only PDF files are allowed for ID proof.';
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          this.idProofError = 'ID proof size must be under 5MB.';
          return;
        }
        this.idProofError = '';
        this.idProofFile = file;
      }
    },
    moveNextStep() {
      if (this.formStep === 1) {
        if (!this.validatePassword() || this.userData.password !== this.userData.confirmPassword) {
          if (this.userData.password !== this.userData.confirmPassword) {
            this.passwordError = 'Passwords do not match.';
          }
          return;
        }
        this.formStep = 2;
      } else if (this.formStep === 2 && this.validateEmail()) {
        if (this.userData.role === 'professional') {
          this.formStep = 3;
        } else {
          if (this.validateRequiredFields()) this.submitRegistration();
        }
      } else if (this.formStep === 3) {
        if (this.validateRequiredFields()) this.submitRegistration();
      }
    },
    async submitRegistration() {
      console.log("User Data:", this.userData);
      console.log("Profile Photo:", this.profilePhotoFile);
      console.log("ID Proof:", this.idProofFile);
    
      const formData = new FormData();
      for (const key in this.userData) {
        formData.append(key, this.userData[key]);
      }
      if (this.profilePhotoFile) {
        formData.append("profile_photo", this.profilePhotoFile);
      }
      if (this.idProofFile) {
        formData.append("id_proof", this.idProofFile);
      }
    
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          body: formData,
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server responded with error: ${errorText}`);
        }
    
        const result = await response.json();
        alert(result.message);
    
        if (result.message === "Registration successful") {
          // this.$emit("close");
          this.$router.push({path: '/login'});
        }
      } catch (error) {
        console.error("Error submitting registration:", error);
        alert("Registration failed: " + error.message);
      }
    }
    ,
    closeForm() {
      this.$emit('close');
    },
    fetchServiceTypes,
  },
  template: `
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow-lg" style="width: 30rem;">
        <div class="card-body">
            <h1 class="card-title text-center mb-4">Register</h1>

            <div v-if="formStep === 1">
                <h3 class="text-center mb-3">Step 1: Account Info</h3>
                <div class="mb-3">
                    <input type="text" class="form-control" v-model="userData.username" placeholder="Username" @blur="checkUsernameAvailability">
                    <small class="text-danger" v-if="usernameChecked && !usernameAvailable">Username is already taken</small>
                </div>
                <div class="mb-3 position-relative">
                    <input :type="showPassword ? 'text' : 'password'" class="form-control" 
                           v-model="userData.password" placeholder="Password" @input="validatePassword">
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                       class="position-absolute top-50 end-0 translate-middle-y me-3"
                       style="cursor: pointer;" @click="showPassword = !showPassword"></i>
                </div>

                <div class="mb-3 position-relative">
                    <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control" 
                           v-model="userData.confirmPassword" placeholder="Confirm Password">
                    <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                       class="position-absolute top-50 end-0 translate-middle-y me-3"
                       style="cursor: pointer;" @click="showConfirmPassword = !showConfirmPassword"></i>
                    <small class="text-danger" v-if="passwordError">{{ passwordError }}</small>
                </div>
                <button class="btn btn-primary w-100" @click="moveNextStep">Next</button>
            </div>

            <div v-if="formStep === 2">
                <h3 class="text-center mb-3">Step 2: User Details</h3>
                <div class="mb-3">
                    <input type="email" class="form-control" v-model="userData.email" placeholder="Email" @input="validateEmail">
                    <small class="text-danger" v-if="emailError">{{ emailError }}</small>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" v-model="userData.name" placeholder="Full Name" @input="validateName">
                    <small class="text-danger" v-if="requiredFieldErrors.name">{{ requiredFieldErrors.name }}</small>
                </div>
                <div class="mb-3">
                    <textarea class="form-control" v-model="userData.address" placeholder="Enter your address" rows="3" @input="validateAddress"></textarea>
                    <small class="text-danger" v-if="requiredFieldErrors.address">{{ requiredFieldErrors.address }}</small>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" v-model="userData.pin_code" placeholder="Pin Code" @input="validatePinCode">
                    <small class="text-danger" v-if="requiredFieldErrors.pin_code">{{ requiredFieldErrors.pin_code }}</small>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" v-model="userData.mobile_no" placeholder="Mobile Number" @input="validateMobileNumber('mobile_no', 'mobile_no')">
                    <small class="text-danger" v-if="requiredFieldErrors.mobile_no">{{ requiredFieldErrors.mobile_no }}</small>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" v-model="userData.whatsapp_no" placeholder="WhatsApp Number" @input="validateMobileNumber('whatsapp_no', 'whatsapp_no')">
                    <small class="text-danger" v-if="requiredFieldErrors.whatsapp_no">{{ requiredFieldErrors.whatsapp_no }}</small>
                </div>
                <div class="mb-3">
                    <label for="profilePhoto" class="form-label">Profile Photo</label>
                    <input type="file" class="form-control" @change="onFileChange('profile_photo', $event)" accept="image/*">
                    <small class="text-danger" v-if="profilePhotoError">{{ profilePhotoError }}</small>
                </div>
                <div class="mb-3">
                    <select class="form-select" v-model="userData.role">
                        <option value="customer">Customer</option>
                        <option value="professional">Professional</option>
                    </select>
                </div>
                <button class="btn btn-primary w-100" @click="moveNextStep">Next</button>
            </div>

            <div v-if="formStep === 3 && userData.role === 'professional'">
                <h3 class="text-center mb-3">Step 3: Professional Details</h3>
                <div class="mb-3">
                    <label for="serviceType">Select Service Type:</label>
                    <select class="form-select" v-model="userData.service_type" id="serviceType">
                        <option value="" disabled>-- Select Service Type --</option>
                        <option v-for="type in serviceTypes" :value="type.id" :key="type.id">
                            {{ type.name }}
                        </option>
                    </select>
                    <small class="text-danger" v-if="requiredFieldErrors.service_type">{{ requiredFieldErrors.service_type }}</small>
                </div>
                <div class="mb-3">
                    <textarea class="form-control" v-model="userData.description" placeholder="Enter a brief description (only for professionals)" rows="3" @input="validateDescription"></textarea>
                    <small class="text-danger" v-if="requiredFieldErrors.description">{{ requiredFieldErrors.description }}</small>
                </div>
                <div class="mb-3">
                    <label for="idProof" class="form-label">ID Proof</label>
                    <input type="file" class="form-control" @change="onFileChange('id_proof', $event)" accept="application/pdf">
                    <small class="text-danger" v-if="idProofError">{{ idProofError }}</small>
                    <small class="text-danger" v-if="requiredFieldErrors.id_proof">{{ requiredFieldErrors.id_proof }}</small>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" v-model="userData.experience" placeholder="Experience (years)">
                    <small class="text-danger" v-if="requiredFieldErrors.experience">{{ requiredFieldErrors.experience }}</small>
                </div>
                <button class="btn btn-success w-100" @click="moveNextStep">Submit</button>
            </div>
        </div>
    </div>
</div>

`
});
