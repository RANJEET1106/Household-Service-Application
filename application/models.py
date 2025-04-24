from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from sqlalchemy.orm import Session
from sqlalchemy import event

from application.util import delete_file

db = SQLAlchemy()

class User(UserMixin,db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    password = db.Column(db.String(150), nullable=False)
    profile_photo = db.Column(db.String(255), nullable=True)  # Can store image path
    email=db.Column(db.String(255),nullable=False)
    address = db.Column(db.Text, nullable=False)
    pin_code = db.Column(db.String(10), nullable=False)
    mobile_no = db.Column(db.String(15), nullable=False)
    whatsapp_no = db.Column(db.String(15), nullable=True)
    role = db.Column(db.String(50), nullable=False)  # admin, professional, customer
    status = db.Column(db.String(50), nullable=False, default='unblocked')
    
    # Relationship to Professional table
    professional_profile = db.relationship('Professional', backref='user', uselist=False)
    
    
    def __repr__(self):
        return f"<User {self.username}>"

class Professional(db.Model):
    __tablename__ = 'professional'
    
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)  # Foreign key to User table
    date_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    description = db.Column(db.Text, nullable=True)
    service_type = db.Column(db.Integer, db.ForeignKey('service_type.id'), nullable=False)
    # price = db.Column(db.Float, nullable=False) 
    experience = db.Column(db.Integer, nullable=False)
    id_proof = db.Column(db.String(255), nullable=False)  # Can store image path for ID proof
    website = db.Column(db.String(255), nullable=True)
    total_rating = db.Column(db.Float, nullable=False, default=0.0)
    total_users_rated = db.Column(db.Integer, nullable=False, default=0)
    # status = db.Column(db.String(50), nullable=False, default='pending')
    
    def __repr__(self):
        return f"<Professional {self.id}>"

class ServiceType(db.Model):
    __tablename__ = 'service_type'
    
    id=db.Column(db.Integer, primary_key=True)
    service_type = db.Column(db.String(100), unique=True)
    
    # Relationship to Professional and Services
    professionals = db.relationship('Professional', backref='service_type_professionals', lazy=True, cascade="all, delete")
    services = db.relationship('Services', backref='service_type_services', lazy=True, cascade="all, delete")
    
    def __repr__(self):
        return f"<ServiceType {self.service_type}>"

class Services(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_name = db.Column(db.String(150), nullable=False)
    service_type = db.Column(db.Integer, db.ForeignKey('service_type.id'), nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.String(50), nullable=False)  # e.g., "2 hours", "30 minutes"

    # service_requests = db.relationship('ServiceRequest', backref='service', cascade="all, delete")
    service_requests = db.relationship(
        'ServiceRequest', 
        backref='service', 
        cascade="all, delete-orphan"
    )

    
    def __repr__(self):
        return f"<Services {self.service_name}>"

class ServiceRequest(db.Model):
    __tablename__ = 'service_request'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('user.id'),nullable=True)
    date_of_request = db.Column(db.DateTime, default=datetime.utcnow)
    date_of_completion = db.Column(db.DateTime, nullable=True)
    service_status = db.Column(db.String(50), nullable=False, default='requested')  # requested/rejected/assigned/closed
    rating = db.Column(db.Integer, nullable=True, default=0)
    review = db.Column(db.Text, nullable=True)
    
    # service = db.relationship('Services', backref='service_requests')
    customer = db.relationship('User', foreign_keys=[customer_id], backref='customer_requests')
    # professional = db.relationship('User', foreign_keys=[professional_id], backref='professional_requests', cascade="all, delete-orphan")
    professional = db.relationship('User', foreign_keys=[professional_id], backref=db.backref('service_requests', cascade="all, delete-orphan"))
    
    def __repr__(self):
        return f"<ServiceRequest {self.id}>"


@event.listens_for(Professional, "before_delete")
def delete_associated_user(mapper, connection, target):
    session = Session.object_session(target)  # Get the session
    user = session.get(User, target.id)  # Get the associated User
    if user:
        session.delete(user)

@event.listens_for(Professional, 'before_delete')
def delete_professional_files(mapper, connection, target):
    """Delete ID proof file before deleting Professional record"""
    if(target.id_proof):
        delete_file(target.id_proof)

@event.listens_for(User, 'before_delete')
def delete_user_files(mapper, connection, target):
    """Delete profile photo before deleting User record"""
    if(target.profile_photo):
        delete_file(target.profile_photo)
