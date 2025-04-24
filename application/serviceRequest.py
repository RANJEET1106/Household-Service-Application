from datetime import date

from flask import jsonify,request,make_response
from flask_restful import Resource
from flask_security import current_user
from flask_login import login_required

from application.models import db,ServiceRequest,Professional


class BookService(Resource):
    @login_required
    def post(self):
        data = request.get_json()
        service_id = data.get("service_id")
        professional_id= data.get("professional_id")
        customer_id = current_user.id

        if not service_id or not customer_id:
            return make_response(jsonify({"message": "Service ID and Customer ID are required"}), 400)

        # Create a new service request
        new_request = ServiceRequest(
            service_id=service_id,
            customer_id=customer_id,
            professional_id=professional_id,
            date_of_request=date.today(),
        )

        db.session.add(new_request)
        db.session.commit()

        return make_response(jsonify({"message": "Service booked successfully!"}), 201)
    
class CancelServiceRequest(Resource):
    @login_required
    def delete(self, request_id):
        try:
            service_request = ServiceRequest.query.get(request_id)
            if not service_request:
                return make_response(jsonify({"message": "Service request not found"}), 400)
            db.session.delete(service_request)
            db.session.commit()

            return make_response(jsonify({"message": "Service request canceled successfully"}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({"message": f"An error occurred: {str(e)}"}), 500)
        
class AcceptServiceRequest(Resource):
    @login_required
    def put(self,request_id):
        service_request = ServiceRequest.query.get(request_id)
    
        if not service_request:
            return make_response(jsonify({"message": "Service request not found"}), 404)
    
    # Ensure only professionals can accept requests
        if current_user.role != 'professional':
            return make_response(jsonify({"message": "Unauthorized"}), 403)
    
        service_request.service_status = "accepted"
        db.session.commit()

        return make_response(jsonify({"message": "Request accepted successfully"}), 200)
    
class RejectServiceRequest(Resource):
    @login_required
    def put(self,request_id):
        service_request = ServiceRequest.query.get(request_id)
    
        if not service_request:
            return make_response(jsonify({"message": "Service request not found"}), 404)
    
    # Ensure only professionals can accept requests
        if current_user.role != 'professional':
            return make_response(jsonify({"message": "Unauthorized"}), 403)
    
        service_request.service_status = "rejected"
        db.session.commit()

        return make_response(jsonify({"message": "Request rejected successfully"}), 200)
    
class CloseServiceRequest(Resource):
    @login_required
    def post(self):
        if current_user.role!='customer':
            return make_response(jsonify({"message": "Unauthorized"}), 403)
        data = request.get_json()
        id=data.get('request_id')
        rating=data.get('rating')
        review=data.get('review')
        service_request = ServiceRequest.query.get(id)
    
        if not service_request:
            return make_response(jsonify({"message": "Service request not found"}), 404)
        service_request.rating=rating
        service_request.review=review
        service_request.service_status='closed'
        service_request.date_of_completion=date.today()
        db.session.commit()
        
        if(rating!=0):
            id=service_request.professional_id
            professional = Professional.query.get(id)
            professional.total_rating+=rating
            professional.total_users_rated+=1
            db.session.commit()
        
        return make_response(jsonify({"message": "Service closed successfully!"}), 201)


        
