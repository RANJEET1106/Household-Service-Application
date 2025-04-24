from flask_restful import Api

from application.auth import Register,Login,CheckLogin,Logout,CheckUsername
from application.profile import fetchProfile,UpdateProfile,DeleteProfile,UpdateStatus
from application.list import ServiceListAPI,ServiceTypeListAPI,ProfessionalListAPI,ServiceRequestListAPI,CustomerListAPI
from application.service import Services_upload,UpdateService,DeleteService
from application.service_types import AddServiceType,DeleteServiceType,UpdateServiceType
from application.serviceRequest import BookService,CancelServiceRequest,AcceptServiceRequest,RejectServiceRequest,CloseServiceRequest
from application.summary import ServiceRequestStatus,ServiceRequestTypes,ServiceRequestServices
from application.report import ExportClosedRequestsAPI,ExportStatusAPI

UPLOAD_FOLDER_PROFILE = 'static/uploads/profile'

api = Api(prefix='/api')


api.add_resource(Register,'/register')
api.add_resource(Login,'/login')
api.add_resource(CheckUsername,'/check_username')
api.add_resource(CheckLogin,'/check_login')
api.add_resource(UpdateProfile,'/update_profile')
api.add_resource(Logout,'/logout')
api.add_resource(ServiceListAPI, '/services','/services/<int:type_id>')
api.add_resource(ProfessionalListAPI, '/professionals')
api.add_resource(CustomerListAPI,'/customers')
api.add_resource(ServiceRequestListAPI, '/service-requests/<string:loc>','/service-requests')
api.add_resource(fetchProfile, '/profile', '/profile/<int:user_id>') 
api.add_resource(DeleteProfile,'/profile/<int:user_id>')
api.add_resource(UpdateStatus,'/change_status/<int:user_id>')
api.add_resource(ServiceTypeListAPI,'/service-types')
api.add_resource(Services_upload,'/services')
api.add_resource(UpdateService,'/services/<int:id>')
api.add_resource(DeleteService, '/services/<int:id>')
api.add_resource(AddServiceType, "/service-types/add")
api.add_resource(UpdateServiceType, "/service-types/<int:id>/update")
api.add_resource(DeleteServiceType, "/service-types/<int:id>/delete")

api.add_resource(BookService,'/book_service')
api.add_resource(CancelServiceRequest,'/cancel_service_request/<int:request_id>')
api.add_resource(AcceptServiceRequest,'/accept_request/<int:request_id>')
api.add_resource(RejectServiceRequest,'/reject_request/<int:request_id>')
api.add_resource(CloseServiceRequest,'/close_request')

api.add_resource(ServiceRequestStatus,'/service-requests-status')
api.add_resource(ServiceRequestTypes,'/service-requests-types')
api.add_resource(ServiceRequestServices,'/service-requests-services')


api.add_resource(ExportClosedRequestsAPI, "/export-closed-requests")
api.add_resource(ExportStatusAPI, "/export-status/<string:task_id>")