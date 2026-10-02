import os
import requests
from dotenv import load_dotenv

load_dotenv()

MAILGUN_API_KEY = os.environ.get("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.environ.get("MAILGUN_DOMAIN")
MAILGUN_FROM = os.environ.get("MAILGUN_FROM", "Myraregemandi Bookstore <bookshop@myraregemandi.com>")


def send_order_confirmation(to_email: str, customer_name: str, order_id: int, order_details: dict):
    """Send an order confirmation email via Mailgun."""
    if not MAILGUN_API_KEY or not MAILGUN_DOMAIN:
        print("Mailgun not configured — skipping email")
        return

    items_html = "".join(
        f"<li>{item['emoji']} {item['title']} × {item['quantity']} — ${item['price'] * item['quantity']:.2f}</li>"
        for item in order_details["items"]
    )

    subject = f"📚 Order Confirmation — #{order_id}"
    text = f"""
Hi {customer_name},

Thank you for your order from Myraregemandi Bookstore!

Order #{order_id}
{'=' * 40}
{chr(10).join(f"  {item['emoji']} {item['title']} x{item['quantity']} — ${item['price'] * item['quantity']:.2f}" for item in order_details['items'])}

Subtotal: ${order_details['subtotal']:.2f}
Shipping: ${order_details['shipping_cost']:.2f}
Tax: ${order_details['tax']:.2f}
Total: ${order_details['total']:.2f}

Shipping to:
{order_details['address']}
{order_details['city']} {order_details['zip']}

We'll send you another email when your books are on their way!

Happy reading!
— The Myraregemandi Bookstore Team
""".strip()

    html = f"""
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 24px;">📚 Myraregemandi Bookstore</h1>
  </div>
  <div style="background: #fff; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #27ae60; margin-top: 0;">Order Confirmed!</h2>
    <p>Hi <strong>{customer_name}</strong>,</p>
    <p>Thank you for your order! Here are the details:</p>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <h3 style="margin-top: 0; color: #2c3e50;">Order #{order_id}</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        {items_html}
      </ul>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;" />
      <table style="width: 100%; font-size: 14px;">
        <tr><td style="padding: 4px 0; color: #666;">Subtotal</td><td style="text-align: right;">${order_details['subtotal']:.2f}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Shipping</td><td style="text-align: right;">${order_details['shipping_cost']:.2f}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Tax</td><td style="text-align: right;">${order_details['tax']:.2f}</td></tr>
        <tr><td style="padding: 8px 0 4px; font-weight: 700; font-size: 16px; border-top: 2px solid #e0e0e0;">Total</td><td style="text-align: right; font-weight: 700; font-size: 16px; border-top: 2px solid #e0e0e0;">${order_details['total']:.2f}</td></tr>
      </table>
    </div>

    <div style="margin: 16px 0;">
      <h3 style="color: #2c3e50; margin-bottom: 4px;">Shipping To</h3>
      <p style="margin: 0; color: #555;">
        {order_details['address']}<br />
        {order_details['city']} {order_details['zip']}
      </p>
    </div>

    <p style="color: #888; font-size: 13px; margin-top: 24px;">We'll send you another email when your books are on their way!</p>
    <p style="color: #888; font-size: 13px;">Happy reading!<br />— The Myraregemandi Bookstore Team 📖</p>
  </div>
</div>
""".strip()

    try:
        response = requests.post(
            f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages",
            auth=("api", MAILGUN_API_KEY),
            data={
                "from": MAILGUN_FROM,
                "to": to_email,
                "subject": subject,
                "text": text,
                "html": html,
            },
            timeout=10,
        )
        response.raise_for_status()
        print(f"Confirmation email sent to {to_email}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to send email: {e}")
