from celery import Celery

def make_celery(app):
    """Create and configure a Celery instance with Flask app context."""
    celery = Celery(
        app.import_name,
        broker=app.config['broker_url'],
        backend=app.config['result_backend']
    )
    celery.conf.update(app.config)
    celery.conf.timezone = 'Asia/Kolkata'


    # Ensure tasks run within Flask app context
    class ContextTask(celery.Task):
        abstract = True
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return super().__call__(*args, **kwargs)

    celery.Task = ContextTask
    return celery
