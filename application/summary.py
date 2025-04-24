from flask_restful import Resource
from flask_login import login_required

from application.list import ServiceRequestListAPI


class ServiceRequestStatus(Resource):
    @login_required
    def get(self):
        return ServiceRequestListAPI().get(mode="status")

class ServiceRequestTypes(Resource):
    @login_required
    def get(self):
        return ServiceRequestListAPI().get(mode="type")
    
class ServiceRequestServices(Resource):
    @login_required
    def get(self):
        return ServiceRequestListAPI().get(mode="service")
