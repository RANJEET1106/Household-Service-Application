import requests, csv, os
from datetime import datetime

from flask import current_app,render_template

from celery.schedules import crontab
from app import celery
from application.models import ServiceRequest, Professional, User, Services, ServiceType, db
from mail_service import *

# Google Chat Webhook URL (replace with actual webhook)
WEBHOOK_URL = "<Enter Your Webhook URL>"


EXPORTS_DIR = os.path.join("static", "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)


@celery.task
def send_daily_reminders():
    """Check pending service requests and notify professionals via Google Chat."""
    with current_app.app_context(): 
        print("Running send_daily_reminders...")

        pending_requests = ServiceRequest.query.filter_by(service_status="requested").all()
        if not pending_requests:
            print("No pending requests. Skipping notification.")
            return

        professionals_to_notify = {}
        for request in pending_requests:
            professional_id = request.professional_id
            if professional_id:
                professionals_to_notify.setdefault(professional_id, []).append(request)

        for prof_id, requests in professionals_to_notify.items():
            professional = Professional.query.get(prof_id)
            if professional:
                message = f"Reminder:@{professional.user.name} You have {len(requests)} pending service requests. Check your dashboard."
                print(f"Sending notification to {professional.user.name}")
                send_gchat_notification(message)


@celery.task
def send_monthly_reports():
    """Scheduled task to send reports to all users."""
    users = User.query.all()

    for user in users:
        send_monthly_report(user.id, user.email, user.role)

    print("Monthly Reports Sent to All Users!")


@celery.task
def generate_csv():
    """Async task to generate CSV for closed service requests."""
    filename = f"closed_requests_{datetime.now().strftime('%Y%m%d%H%M%S')}.csv"
    file_path = os.path.join(EXPORTS_DIR, filename)

    # Fetch closed service requests
    closed_requests = db.session.query(ServiceRequest).filter(ServiceRequest.service_status == 'closed').all()

    with open(file_path, 'w', newline='') as csvfile:
        fieldnames = ["request_id", "service_id", "customer_id", "professional_id", "date_of_request", "date_of_completion", "rating","review"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for request in closed_requests:
            writer.writerow({
                "request_id": request.id,
                "service_id": request.service_id,
                "customer_id": request.customer_id,
                "professional_id": request.professional_id,
                "date_of_request": request.date_of_request,
                "date_of_completion": request.date_of_completion,
                "rating": request.rating,
                "review": request.review
            })

    return {"message": "Export completed", "file_url": f"/static/exports/{filename}"}

def send_gchat_notification(message):
    """Send notification to Google Chat."""
    payload = {"text": message}
    response = requests.post(WEBHOOK_URL, json=payload)
    if response.status_code == 200:
        print("Message sent successfully")
    else:
        print(f"Failed to send message: {response.text}")


def fetch_monthly_activity(user_id, role):
    """Fetch monthly service activity based on user role (customer/professional)."""
    start_date = datetime.now().replace(day=1)  # First day of the month
    end_date = datetime.now()  # Current date

    if role == "customer":
        requests = ServiceRequest.query.filter(
            ServiceRequest.customer_id == user_id,
            ServiceRequest.date_of_request >= start_date,
            ServiceRequest.date_of_request <= end_date
        ).all()
    elif role == "professional":
        requests = ServiceRequest.query.filter(
            ServiceRequest.professional_id == user_id,
            ServiceRequest.date_of_request >= start_date,
            ServiceRequest.date_of_request <= end_date
        ).all()
    else:
        return None

    total_requests = len(requests)
    completed_requests = sum(1 for r in requests if r.service_status == "closed")

    # Get service categories
    service_types = {}
    for request in requests:
        service = Services.query.get(request.service_id)
        if service:
            service_type = ServiceType.query.get(service.service_type)
            if service_type:
                service_types[service_type.service_type] = service_types.get(service_type.service_type, 0) + 1

    top_categories = sorted(service_types, key=service_types.get, reverse=True)[:3]

    return {
        "total_requests": total_requests,
        "completed_requests": completed_requests,
        "top_categories": top_categories,
        "month": start_date.strftime("%B"),
    }


def send_monthly_report(user_id, user_email, user_role):
    """Generate and send a monthly activity report."""
    report_data = fetch_monthly_activity(user_id, user_role)

    if not report_data:
        print(f"No report generated for {user_email} (Role: {user_role})")
        return

    # Render HTML report
    html_content = render_template("monthly_report.html", data=report_data)

    # Email details
    subject = f"Monthly Activity Report - {report_data['month']}"

    # Create email message
    msg = MIMEMultipart()
    msg["To"] = user_email
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg.attach(MIMEText(html_content, 'html'))

    # Send Email
    try:
        client = SMTP(host=SMTP_HOST, port=SMTP_PORT)
        client.send_message(msg)
        client.quit()
        print(f"Monthly Report Sent to {user_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")


# Schedule the task to run daily at 6 PM
celery.conf.beat_schedule = {
    'send-reminders-every-day': {
        'task': 'task.send_daily_reminders',
        'schedule': crontab(minute='*/1'),  # 6:00 PM IST
    },
    'send_monthly_reports': {
        'task': 'task.send_monthly_reports',  # Import path to your task
        # 'schedule': crontab(minute=0, hour=8, day_of_month=1),  # 8:00 AM on 1st of every month
        'schedule': crontab(minute='*/1'),
    },
}
