import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from html import escape as html_escape
import asyncio
from app.core.config import settings

async def send_email(to_email: str, subject: str, body: str):
    """Send email using Gmail SMTP with timeout and retry"""
    
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.EMAIL_FROM
    message["To"] = to_email
    
    # Create HTML version
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333;">StudioForm</h2>
          {body}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #777; font-size: 12px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      </body>
    </html>
    """
    
    part = MIMEText(html_body, "html")
    message.attach(part)
    
    # Try with retries and different TLS modes
    for attempt in range(3):
        try:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                start_tls=True,
                timeout=30,  # 30 second timeout per connection attempt
            )
            return True
        except asyncio.TimeoutError:
            print(f"Email send attempt {attempt + 1}/3 timed out for {to_email}")
            if attempt < 2:
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
        except aiosmtplib.SMTPConnectError as e:
            print(f"SMTP connect error (attempt {attempt + 1}/3): {e}")
            if attempt < 2:
                await asyncio.sleep(2 ** attempt)
        except Exception as e:
            print(f"Failed to send email (attempt {attempt + 1}/3): {e}")
            if attempt < 2:
                await asyncio.sleep(1)
    
    print(f"Failed to send email to {to_email} after 3 attempts")
    return False

async def send_otp_email(to_email: str, otp_code: str):
    """Send OTP email for password reset"""
    subject = "Password Reset OTP - Premium Desktop Accessories"
    body = f"""
    <h3 style="color: #333;">Password Reset Request</h3>
    <p>You have requested to reset your password.</p>
    <div style="background: white; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
      <p style="color: #777; margin-bottom: 10px;">Your OTP code is:</p>
      <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px; margin: 10px 0;">
        {otp_code}
      </h1>
      <p style="color: #777; margin-top: 10px; font-size: 14px;">
        This OTP will expire in 10 minutes.
      </p>
    </div>
    <p style="color: #777;">
      If you didn't request this, please ignore this email.
    </p>
    """
    return await send_email(to_email, subject, body)

async def send_order_confirmation_email(to_email: str, order_number: str, total_amount: float):
    """Send order confirmation email"""
    subject = f"Order Confirmation #{order_number} - Premium Desk Accessories"
    body = f"""
    <h3 style="color: #333;">Thank you for your order!</h3>
    <p>Your order has been successfully placed.</p>
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Order Number:</strong> {order_number}</p>
      <p><strong>Total Amount:</strong> ₹{total_amount:,.2f}</p>
    </div>
    <p>We'll send you another email when your order ships.</p>
    <p><a href="{settings.FRONTEND_URL}/orders" style="color: #4CAF50;">Track your order</a></p>
    """
    return await send_email(to_email, subject, body)

async def send_order_shipped_email(to_email: str, order_number: str, tracking_url: str = None):
    """Send order shipped notification"""
    subject = f"Order Shipped #{order_number} - Premium Desk Accessories"
    tracking_info = f'<p><a href="{tracking_url}" style="color: #4CAF50;">Track your shipment</a></p>' if tracking_url else ''
    
    body = f"""
    <h3 style="color: #333;">Your order is on the way!</h3>
    <p>Good news! Your order #{order_number} has been shipped.</p>
    {tracking_info}
    <p>You should receive it within 3-7 business days.</p>
    """
    return await send_email(to_email, subject, body)

async def send_order_delivered_email(to_email: str, order_number: str):
    """Send order delivered notification"""
    subject = f"Order Delivered #{order_number} - Premium Desk Accessories"
    body = f"""
    <h3 style="color: #333;">Your order has been delivered!</h3>
    <p>Your order #{order_number} has been successfully delivered.</p>
    <p>We hope you love your new desk accessories!</p>
    <p><a href="{settings.FRONTEND_URL}/orders/{order_number}" style="color: #4CAF50;">Leave a review</a></p>
    """
    return await send_email(to_email, subject, body)

async def send_cart_abandonment_email(to_email: str, cart_items: list):
    """Send cart abandonment reminder"""
    subject = "Don't forget your items! - Premium Desk Accessories"
    
    items_html = ""
    for item in cart_items[:3]:  # Show max 3 items
        items_html += f"""
        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
          <strong>{item.get('name', 'Product')}</strong> - ₹{item.get('price', 0):,.2f}
        </div>
        """
    
    body = f"""
    <h3 style="color: #333;">You left something behind!</h3>
    <p>We saved the items in your cart:</p>
    {items_html}
    <p style="margin-top: 20px;">
      <a href="{settings.FRONTEND_URL}/cart" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Complete your purchase
      </a>
    </p>
    """
    return await send_email(to_email, subject, body)

