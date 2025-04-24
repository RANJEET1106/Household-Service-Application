import os

from flask import jsonify, request,session,make_response
from flask_restful import Resource
from flask_login import login_user,logout_user,current_user
from flask_bcrypt import Bcrypt

from application.util import get_next_filename,allowed_file
from application.models import db, User, Professional


UPLOAD_FOLDER_PROFILE = 'static/uploads/profile'
UPLOAD_FOLDER_ID_PROOF = 'static/uploads/id_proof'

# Initialize bcrypt locally
bcrypt = Bcrypt()

class Register(Resource):
    def post(self):

        data = request.form.to_dict()
        print("Form Data:", request.form)
        print("Files:", request.files)

        # Check if username or email already exists
        if User.query.filter_by(username=data['username']).first():
            return make_response(jsonify({"message": "Username is already taken"}), 400)
        if User.query.filter_by(email=data['email']).first():
            return make_response(jsonify({"message": "Email is already registered"}), 400)
        if(not allowed_file):
            return make_response(jsonify('{"message:"File type not allowed"}'),400)

        profile_photo = request.files.get('profile_photo')
        id_proof = request.files.get('id_proof')

        # Process profile photo
        if profile_photo:

            photo_filename = get_next_filename("img", UPLOAD_FOLDER_PROFILE)
            photo_path = os.path.join(UPLOAD_FOLDER_PROFILE, photo_filename + '.jpg')
            profile_photo.save(photo_path)
            data['profile_photo'] = photo_path
        else:
            data['profile_photo']=""

        # Process ID proof
        if id_proof:
            id_proof_filename = get_next_filename("doc", UPLOAD_FOLDER_ID_PROOF)
            id_proof_path = os.path.join(UPLOAD_FOLDER_ID_PROOF, id_proof_filename + '.pdf')
            id_proof.save(id_proof_path)
            data['id_proof'] = id_proof_path
        elif data.get('role') == 'professional':
            return make_response(jsonify('{"message:"id_proof not uploded"}'),400)

        # Hash the password
        data['password']=bcrypt.generate_password_hash(data['password'])
        if data.get('role')=='professional':
            data['status']='pending'

        user_data = {key: data[key] for key in User.__table__.columns.keys() if key in data}
        user = User(**user_data)
        db.session.add(user)
        db.session.commit()
        if data.get('role') == 'professional':
            professional_data = {
                "id": user.id,  # Link to the User table
                "description": data.get("description"),
                "service_type": data.get("service_type"),
                # "price": data.get("price"),
                "experience": data.get("experience"),
                "id_proof": data.get("id_proof"),
                "website": data.get("website")
            }
            professional = Professional(**professional_data)
            db.session.add(professional)
            db.session.commit()
        message ={"message": "Registration successful", "username": data['username']}
        return make_response(jsonify(message),200)

class Login(Resource):
    def post(self):
        print("inside login")
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"message": "Invalid request data"}), 400

        username = data.get('username')
        password = data.get('password')
        user = User.query.filter_by(username=username).first()

        if user:
            validpass = bcrypt.check_password_hash(user.password, password)
            if validpass:
                login_user(user)
                session['user_id'] = user.id
                return make_response(jsonify({
                    'id': user.id,
                    'role': user.role  
                }), 200)
            else:
                return make_response(jsonify({"message": "Wrong username or password"}), 401)
        else:
            return make_response(jsonify({"message": "Wrong username or password"}), 401)



class CheckLogin(Resource):
    # @login_required
    def get(self):
        if current_user.is_authenticated:
            print(f"Current user: {current_user.role}")
            return make_response(jsonify({
                'id': current_user.id,
                'role': current_user.role
            }),200)
        else:
            print("unauthorized")
            return make_response(jsonify({'message': 'Unauthorized'}), 401)


class Logout(Resource):
    def post(self):
        logout_user()
        return make_response(jsonify({"message":"Logged Out Successfully"}),200)
    

class CheckUsername(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        user = User.query.filter_by(username=username).first()
        available = user is None
        return make_response(jsonify({"available": available}))

