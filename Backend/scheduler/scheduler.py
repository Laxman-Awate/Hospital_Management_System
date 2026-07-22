from apscheduler.schedulers.background import BackgroundScheduler

from scheduler.reminder_jobs import send_appointment_reminders
from scheduler.followup_jobs import send_followup_reminders

scheduler = BackgroundScheduler()


def start_scheduler():

    scheduler.add_job(
        send_appointment_reminders,
        trigger="interval",
        hours=24,
        id="appointment_reminders",
        replace_existing=True
    )

    scheduler.add_job(
        send_appointment_reminders,
        trigger="cron",
        hour=8,
        minute=0,
        id="appointment_reminders",
        replace_existing=True
    )

    scheduler.add_job(
        send_followup_reminders,
        trigger="cron",
        hour=9,
        minute=0,
        id="followup_reminders",
        replace_existing=True
    )

    if not scheduler.running:
        scheduler.start()

    print("Scheduler started successfully.")
