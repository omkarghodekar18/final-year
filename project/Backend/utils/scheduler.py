"""
Background scheduler – runs fetch_jobs() every day at midnight (00:00)
in a separate daemon thread so the main Flask thread is never blocked.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

_scheduler = BackgroundScheduler(daemon=True)


def _run_job_fetcher():
    """Wrapper that imports and calls fetch_jobs at runtime
    (avoids circular imports)."""
    try:
        from utils.job_fetcher import fetch_jobs

        print("⏰ Scheduled job-fetch started …")
        fetch_jobs()
        print("✅ Scheduled job-fetch completed.")
    except Exception as e:
        print(f"❌ Scheduled job-fetch failed: {e}")


def start_scheduler():
    """Register the cron job and start the background scheduler.
    Safe to call multiple times – will not start twice."""
    if _scheduler.running:
        return

    _scheduler.add_job(
        _run_job_fetcher,
        trigger=CronTrigger(hour=0, minute=0),   # every day at 00:00
        id="daily_job_fetch",
        name="Fetch jobs from JSearch API",
        replace_existing=True,
    )

    _scheduler.start()
    print("🕛 Job-fetch scheduler started – next run at midnight.")
