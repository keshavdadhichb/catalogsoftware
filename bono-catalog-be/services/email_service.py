"""
Email Service for batch job notifications
Uses Gmail SMTP
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
from typing import Optional
from pathlib import Path


class EmailService:
    def __init__(self):
        self.sender_email = os.getenv("SENDER_EMAIL", "kessssssssssssjjjj@gmail.com")
        self.sender_password = os.getenv("SENDER_PASS", "uynw yhdj bfmu gonj")
        self.recipient_email = os.getenv("RECIPIENT_EMAIL", "keshavdadhichb7@gmail.com")
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
    
    def send_batch_complete_notification(
        self,
        job_id: str,
        catalog_name: str,
        client_name: str,
        download_link: str,
        total_pages: int,
        failed_pages: int = 0
    ) -> bool:
        """Send email notification when batch job completes"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"✅ Catalog Ready: {catalog_name}"
            msg['From'] = self.sender_email
            msg['To'] = self.recipient_email
            
            # Create HTML email body
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 40px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 16px; padding: 32px; }}
                    .header {{ text-align: center; margin-bottom: 24px; }}
                    .badge {{ background: linear-gradient(135deg, #f39c12, #e74c3c); color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }}
                    h1 {{ color: #ffffff; margin: 16px 0 8px; font-size: 24px; }}
                    .subtitle {{ color: #888; font-size: 14px; }}
                    .details {{ background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 24px 0; }}
                    .detail-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }}
                    .detail-row:last-child {{ border-bottom: none; }}
                    .label {{ color: #888; }}
                    .value {{ color: #fff; font-weight: 600; }}
                    .btn {{ display: inline-block; background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; }}
                    .btn-container {{ text-align: center; margin: 32px 0; }}
                    .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 24px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <span class="badge">PRO</span>
                        <h1>🎉 Your Catalog is Ready!</h1>
                        <p class="subtitle">Batch generation completed successfully</p>
                    </div>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="label">Client</span>
                            <span class="value">{client_name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Catalog</span>
                            <span class="value">{catalog_name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Job ID</span>
                            <span class="value">{job_id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Pages Generated</span>
                            <span class="value">{total_pages - failed_pages} / {total_pages}</span>
                        </div>
                    </div>
                    
                    <div class="btn-container">
                        <a href="{download_link}" class="btn">📥 Download Catalog</a>
                    </div>
                    
                    <p style="text-align: center; color: #888; font-size: 14px;">
                        Or copy this link: <br/>
                        <a href="{download_link}" style="color: #f39c12;">{download_link}</a>
                    </p>
                    
                    <div class="footer">
                        <p>SnapCatalog Pro Studio</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text fallback
            text = f"""
            Your Catalog is Ready!
            
            Client: {client_name}
            Catalog: {catalog_name}
            Job ID: {job_id}
            Pages: {total_pages - failed_pages} / {total_pages}
            
            Download: {download_link}
            
            - SnapCatalog Pro Studio
            """
            
            part1 = MIMEText(text, 'plain')
            part2 = MIMEText(html, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, self.recipient_email, msg.as_string())
            
            print(f"✅ Email notification sent for job {job_id}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False
    
    def send_batch_failed_notification(
        self,
        job_id: str,
        catalog_name: str,
        client_name: str,
        error_message: str
    ) -> bool:
        """Send email notification when batch job fails"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"❌ Catalog Failed: {catalog_name}"
            msg['From'] = self.sender_email
            msg['To'] = self.recipient_email
            
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 40px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 16px; padding: 32px; }}
                    h1 {{ color: #e74c3c; text-align: center; }}
                    .error {{ background: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.5); padding: 16px; border-radius: 8px; margin: 24px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>❌ Generation Failed</h1>
                    <p style="text-align: center; color: #888;">Job ID: {job_id}</p>
                    <p><strong>Client:</strong> {client_name}</p>
                    <p><strong>Catalog:</strong> {catalog_name}</p>
                    <div class="error">
                        <p><strong>Error:</strong></p>
                        <p>{error_message}</p>
                    </div>
                    <p style="text-align: center; color: #888;">Please try again or check the dashboard for details.</p>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html, 'html'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, self.recipient_email, msg.as_string())
            
            print(f"✅ Failure notification sent for job {job_id}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False


# Singleton instance
email_service = EmailService()
