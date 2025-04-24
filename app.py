from os import urandom

from flask import Flask, render_template
from flask_login import LoginManager

from application.models import User, db
from application.resources import api
from application.auth import bcrypt
from application.cache import cache
from celery_config import make_celery  # Import Celery setup

app = Flask(__name__)
app.secret_key = urandom(24)

# Configure Flask
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hsav2.sqlite3'
app.config['broker_url'] = 'redis://localhost:6379/0'
app.config['result_backend'] = 'redis://localhost:6379/0'

app.config['CACHE_TYPE'] = 'RedisCache'
app.config['CACHE_REDIS_HOST'] = 'localhost'
app.config['CACHE_REDIS_PORT'] = 6379
app.config['CACHE_DEFAULT_TIMEOUT'] = 300

# Initialize Flask Extensions
db.init_app(app)
bcrypt.init_app(app)

# Create App Context & DB Tables
with app.app_context():
    db.create_all()

# Initialize Celery
celery=make_celery(app)
app.celery = celery

cache.init_app(app)


# Flask-Login Setup
login_manager = LoginManager()
login_manager.login_view = '/api/login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

# Initialize Flask-RESTful API
api.init_app(app)

@app.route('/')
def home():
    return render_template('index.html')

# Main Driver Function
if __name__ == '__main__':
    app.run(debug=True)
