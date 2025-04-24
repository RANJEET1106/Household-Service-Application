from flask import jsonify, current_app,make_response
from flask_restful import Resource

class ExportClosedRequestsAPI(Resource):
    def post(self):
        """Triggers the CSV export as an async job without importing task.py."""
        task = current_app.celery.send_task('task.generate_csv')  # Call Celery task by name
        return make_response(jsonify({"message": "Export started", "task_id": task.id}), 202)

class ExportStatusAPI(Resource):
    def get(self, task_id):
        """Check the status of the export task."""
        task = current_app.celery.AsyncResult(task_id)
        if task.state == 'PENDING':
            return make_response(jsonify({"status": "Pending"}), 200)
        elif task.state == 'SUCCESS':
            return make_response(jsonify({"status": "Completed", "file_url": task.result["file_url"]}), 200)
        return make_response(jsonify({"status": task.state}), 200)

