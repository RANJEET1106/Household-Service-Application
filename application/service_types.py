from flask import jsonify,request,make_response
from flask_restful import Resource

from application.models import db,ServiceType
from application.cache import cache

class AddServiceType(Resource):
    def post(self):
        data = request.get_json()
        service_type_name = data.get("service_type")

        if not service_type_name:
            return make_response(jsonify({"message": "Service type cannot be empty"}), 400)

        # Check if service type already exists
        existing_type = ServiceType.query.filter_by(service_type=service_type_name).first()
        if existing_type:
            return make_response(jsonify({"message": "Service type already exists"}), 409)

        new_service_type = ServiceType(service_type=service_type_name)
        db.session.add(new_service_type)
        db.session.commit()
        cache.delete("service_type_list")
        cache.delete(f"service_list_{new_service_type}")  # Delete specific type cache
        cache.delete("service_list_all")

        return make_response(jsonify({"message": "Service type added successfully"}), 201)

# **API to Update a Service Type**
class UpdateServiceType(Resource):
    def put(self, id):
        data = request.get_json()
        new_name = data.get("service_type")

        service_type = ServiceType.query.get(id)
        if not service_type:
            return make_response(jsonify({"message": "Service type not found"}), 404)

        service_type.service_type = new_name
        db.session.commit()
        cache.delete("service_type_list")
        cache.delete(f"service_list_{service_type}")  # Delete specific type cache
        cache.delete("service_list_all")
        return make_response(jsonify({"message": "Service type updated successfully"}), 200)

# **API to Delete a Service Type**
class DeleteServiceType(Resource):
    def delete(self, id):
        service_type = ServiceType.query.get(id)
        if not service_type:
            return make_response(jsonify({"message": "Service type not found"}), 404)
        
        

        db.session.delete(service_type)
        db.session.commit()
        cache.delete("service_type_list")
        cache.delete(f"service_list_{service_type}")  # Delete specific type cache
        cache.delete("service_list_all")
        return make_response(jsonify({"message": "Service type deleted successfully"}), 200)
