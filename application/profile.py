import os

from flask import jsonify, request,make_response
from flask_restful import Resource
from flask_login import current_user,login_required

from application.util import get_next_filename
from application.models import db, User, Professional
from application.cache import cache

UPLOAD_FOLDER_PROFILE = 'static/uploads/profile'
UPLOAD_FOLDER_ID_PROOF = 'static/uploads/id_proof'

class fetchProfile(Resource):
    @login_required
    def get(self,user_id=None):
        print("inside fetch profile")
        if user_id is None:
            user = current_user  # Fetch current logged-in user
        else:
            user = User.query.get(user_id) 
        
        user_data = {
            "id":user.id,
            "username": str(user.username),
            "name": str(user.name),
            "email": str(user.email),
            "address": str(user.address),
            "pin_code": str(user.pin_code),
            "mobile_no": str(user.mobile_no),
            "whatsapp_no": str(user.whatsapp_no) if user.whatsapp_no else None,
            "role": str(user.role),
            "profile_photo": str(user.profile_photo) if user.profile_photo else '/static/uploads/profile/img_0.png',
            "status": str(user.status)
        }

        # Check if the user is a professional
        if user.role == 'professional' and user.professional_profile:
            professional_data = {
                "description": str(user.professional_profile.description) if user.professional_profile.description else "",
                "service_type": str(user.professional_profile.service_type_professionals.service_type),
                "experience": user.professional_profile.experience,
                "id_proof": str(user.professional_profile.id_proof) if user.professional_profile.id_proof else "",
                "website": str(user.professional_profile.website) if user.professional_profile.website else "",
                "total_rating": user.professional_profile.total_rating,
                "total_users_rated": user.professional_profile.total_users_rated,
                
                "date_created": user.professional_profile.date_created.strftime("%Y-%m-%d %H:%M:%S"),
            }
            # Combine user data with professional-specific data
            return jsonify({**user_data, **professional_data})

        return jsonify(user_data)

class UpdateProfile(Resource):
    @login_required
    def post(self):
            try:
                # data = request.form.to_dict()  # Get form data
                profile_photo = request.files.get('profile_photo')  # Get profile photo if uploaded
                user = User.query.get(current_user.id)  # Get current user from database
                # user_data = {key: data[key] for key in User.__table__.columns.keys() if key in data}

                # # Update user attributes from form data
                # for key, value in user_data.items():
                #     setattr(user, key, value)
                user.username = request.form.get('username')
                user.name = request.form.get('name')
                user.email = request.form.get('email')
                user.address = request.form.get('address')
                user.pin_code = request.form.get('pin_code')
                user.mobile_no = request.form.get('mobile_no')
                user.whatsapp_no = request.form.get('whatsapp_no')
                user.role = request.form.get('role')
                photo_path = user.profile_photo
                if profile_photo:
                    if user.profile_photo:
                        # Save new profile photo if user already has one
                        profile_photo.save(user.profile_photo)
                    else:
                        # Save new profile photo if the user doesn't have one
                        photo_filename = get_next_filename("img", UPLOAD_FOLDER_PROFILE)
                        photo_path = os.path.join(UPLOAD_FOLDER_PROFILE, photo_filename + '.jpg')
                        profile_photo.save(photo_path)
                    # Update the user record with new photo path
                    user.profile_photo = photo_path
                print(1)
                db.session.commit()
                if user.role == 'professional':
                    professional = Professional.query.get(user.id)  # Get the professional profile
                    if professional:
                        service_type = professional.service_type
                        cache.delete(f"service_list_{service_type}")  
                print(2)  # Commit changes to the database
                response_data = {
                    "message": "Profile updated successfully",
                    "profile_photo": photo_path  # Return the path to the photo
                }

                return make_response(jsonify(response_data), 200)  # Return the proper response
            except Exception as e:
                # Log the full traceback and error message
                print(f"Error updating profile: {str(e)}")
                # print(traceback.format_exc())
                response_data = {
                    "message": "Failed to update profile",
                    "error": str(e)  # Return the error message
                }
                return make_response(jsonify(response_data), 500)
            

class DeleteProfile(Resource):
    def delete(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return make_response(jsonify({"message": "User not found"}), 404)
        if(user.role=='professional'):
            professional=Professional.query.get(user_id)
            if(professional):
                db.session.delete(professional)
                db.session.commit()

        db.session.delete(user)
        db.session.commit()
        if user.role == 'professional':
            professional = Professional.query.get(user.id)  # Get the professional profile
            if professional:
                service_type = professional.service_type
                cache.delete(f"service_list_{service_type}")  

        return make_response(jsonify({"message": "User deleted successfully"}), 200)
    

class UpdateStatus(Resource):
    def post(self,user_id):
        data = request.json
        new_status = data.get("status")

        user = User.query.get(user_id)
        if user:
            print("inside if")
            user.status = new_status
            db.session.commit()
            if user.role == 'professional':
                professional = Professional.query.get(user.id)  # Get the professional profile
                if professional:
                    service_type = professional.service_type
                    cache.delete(f"service_list_{service_type}")  
            print("commited")
            return make_response(jsonify({"message": "Status updated successfully"}), 200)
        return make_response(jsonify({"error": "User not found"}), 404)
