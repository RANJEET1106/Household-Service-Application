from flask import jsonify,request,make_response
from flask_restful import Resource

from application.models import db,Services
from application.cache import cache
from application.list import ServiceListAPI

class Services_upload(Resource):
    def post(self):
        # Parse the incoming JSON data
        data = request.get_json()

        # Validate the data (you can add more validation as per your needs)
        if not data.get('service_name') or not data.get('service_type') or not data.get('base_price') or not data.get('time_required'):
            return jsonify({"error": "Missing required fields"}), 400

        # Create a new Service instance and add it to the database
        new_service = Services(
            service_name=data['service_name'],
            service_type=data['service_type'],
            base_price=data['base_price'],
            time_required=data['time_required']
        )

        try:
            db.session.add(new_service)
            db.session.commit()
            cache.delete(f"service_list_{new_service.service_type}")  # Delete specific type cache
            cache.delete("service_list_all")
            message={"message": "Service added successfully!", "service": new_service.id}
            return make_response(jsonify(message),200)
        except Exception as e:
            db.session.rollback()
            message={"error": str(e)}
            return make_response(jsonify(message),500)
        

class UpdateService(Resource):
    def put(self,id):
        data = request.get_json()
        print("inside update service")
        # Find the service by ID
        service = Services.query.get(id)
        if service:
            service.service_name = data.get('service_name')
            service.base_price = data.get('base_price')
            service.time_required = data.get('time_required')

            # Commit the changes to the database
            db.session.commit()
            cache.delete(f"service_list_{service.service_type}")  # Delete specific type cache
            cache.delete("service_list_all")
            return make_response(jsonify({"success": True, "message": "Service updated successfully"}),200)
        else:
            return make_response(jsonify({"success": False, "message": "Service not found"}), 404)

        
class DeleteService(Resource):
    def delete(self, id):
        service = Services.query.get(id)
        if not service:
            return make_response(jsonify({"message": "Service not found"}), 404)
        db.session.delete(service)
        db.session.commit()
        cache.delete(f"service_list_{service.service_type}")  # Delete specific type cache
        cache.delete("service_list_all")
        return make_response(jsonify({"message": "Service deleted successfully"}), 200)