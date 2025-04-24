from collections import defaultdict
import logging

from flask import jsonify
from flask_restful import Resource
from flask_security import current_user
from flask_login import login_required

from application.models import Services,ServiceType,db,Professional,User,ServiceRequest
from application.cache import cache

logging.basicConfig(level=logging.INFO)

class ServiceListAPI(Resource):
    @login_required
    # @cache.cached(timeout=300,key_prefix="service_list")
    
    def get(self, type_id=None):
        cache_key = f"service_list_{type_id}" if type_id else "service_list_all"
        cached_data = cache.get("service_list")
        cached_data = cache.get(cache_key)
        if cached_data:
            print(f"Cache HIT ({cache_key}): Data is coming from cache")
            return jsonify(cached_data)  # Return cached response

        print(f"Cache MISS ({cache_key}): Querying database")
        if type_id:
            # service_type = ServiceType.query.get(type_id)
            services = Services.query.filter_by(service_type=type_id).all()
        else:
            services = Services.query.all()
            services_list = [{
                "id": service.id,
                "service_name": service.service_name,
                "service_type": service.service_type_services.service_type,
                "base_price": service.base_price,
                "time_required": service.time_required
            } for service in services]
            
            return jsonify(services_list)
        response = []
        for service in services:
            professionals = (Professional.query
                .join(User)  # Join with User table
                .filter(Professional.service_type == service.service_type, User.status == 'unblocked')
                .all()
            )
            if(professionals):
                response.append({
                    "id": service.id,
                    "service_name": service.service_name,
                    "service_type": service.service_type_services.service_type,
                    "base_price": service.base_price,
                    "time_required": service.time_required,
                    "professionals": [{
                        "id": pro.id,
                        "name": pro.user.name,
                        "total_rating": pro.total_rating/pro.total_users_rated if pro.total_users_rated>0 else 0,
                    } for pro in professionals]
                })
        cache.set(cache_key, response, timeout=300)

        return jsonify(response)

    
class ServiceTypeListAPI(Resource):
    @cache.cached(timeout=300,key_prefix="service_type_list")
    def get(self):
        # Fetch all service types from the database
        service_types = ServiceType.query.all()

        # Format the result as a list of dictionaries
        service_type_list = [{"id": type.id,"name": type.service_type} for type in service_types]

        # Return the data in JSON format
        return jsonify({"service_types": service_type_list})

class ProfessionalListAPI(Resource):
    @login_required
    def get(self):
        professionals = db.session.query(Professional,User).join(User, User.id == Professional.id).all()

        return jsonify([{
            "id": p.id,
            "name": p.user.name,
            "service_type": p.service_type_professionals.service_type,
            "experience": p.experience,
            "rating": p.total_rating/p.total_users_rated if p.total_users_rated>0 else 0,
            "status": u.status
        } for p,u in professionals])
    
class CustomerListAPI(Resource):
    @login_required
    def get(self):
        customers = db.session.query(User).filter(User.role=='customer').all()
        return jsonify([{
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "Contact": u.mobile_no,
            "status": u.status
        } for u in customers])

class ServiceRequestListAPI(Resource):
    @login_required
    def get(self,loc=None, mode=None):
        # requests = ServiceRequest.query.all()
        query = ServiceRequest.query

        # Apply filter if the user is a professional
        if current_user.role == 'professional':
            professional = Professional.query.filter_by(id=current_user.id).first()
            if not professional:
                return jsonify({"message": "Professional profile not found"}), 404

            # Filter requests where:
            # 1. professional_id = current_user.id OR
            # 2. professional_id is NULL AND service_type matches professional's service_type
            query = query.filter_by(professional_id = current_user.id)
            if loc == "dashboard":
                query = query.filter(ServiceRequest.service_status.in_(["accepted", "requested"]))
            response = query.all()

        # Prepare the response
            requests = [{
                "id": r.id,
                "service_name": r.service.service_name,
                "customer_name": r.customer.name,
                # "professional_name": r.professional.name if r.professional else None,
                "date_of_request": r.date_of_request.isoformat(),
                "date_of_completion": r.date_of_completion.isoformat() if r.date_of_completion else None,
                "service_status": r.service_status,
                "address": r.customer.address,
                "pin_code":r.customer.pin_code,
                "contact_no": r.customer.mobile_no,
                "whatsapp_no":r.customer.whatsapp_no if r.customer.whatsapp_no else None,
            } for r in  response]

        if (current_user.role =='customer' or current_user.role=='admin'):
            if(current_user.role=='customer'):
                query = query.filter(ServiceRequest.customer_id == current_user.id)
            if loc == "dashboard":
                query = query.filter(ServiceRequest.service_status.in_(["accepted", "requested"]))

            response = query.all()


        
        # Prepare the response
            requests = [{
                "id": r.id,
                "service_id":r.service.id,
                "service_name": r.service.service_name,
                "customer_name": r.customer.name,
                "professional_id":r.professional.id if r.professional else None,
                "professional_name": r.professional.name if r.professional else None,
                "date_of_request": r.date_of_request.isoformat(),
                "date_of_completion": r.date_of_completion.isoformat() if r.date_of_completion else None,
                "service_status": r.service_status,
                "rating": r.rating,
                "review": r.review,
            } for r in  response]

        # Fetch all matching requests
        
        if mode == "status":
            status_counts = defaultdict(int)
            for req in response:
                status_counts[req.service_status] += 1
            return jsonify(status_counts)

        # If mode is "type", return a count based on service types
        if mode == "type":
            type_counts = defaultdict(int)
            for req in response:
                type_counts[req.service.service_type_services.service_type] += 1
            return jsonify(type_counts)
        
        if mode == "service":
            service_name_counts = defaultdict(int)
            for req in response:
                service_name_counts[req.service.service_name] += 1
            return jsonify(service_name_counts)

        return jsonify({"requests": requests})
