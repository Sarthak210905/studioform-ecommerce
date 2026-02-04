from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO
from datetime import datetime

from app.models.order import Order

def generate_invoice_pdf(order: Order) -> BytesIO:
    """Generate PDF invoice for an order"""
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2196F3'),
        spaceAfter=30,
    )
    elements.append(Paragraph("TAX INVOICE", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Company Info
    company_info = f"""
    <b>Premium Desktop Accessories</b><br/>
    123 Business Street<br/>
    Mumbai, Maharashtra 400001<br/>
    GSTIN: 27XXXXX1234X1ZX<br/>
    Phone: +91 1234567890<br/>
    Email: support@premiumdesk.com
    """
    elements.append(Paragraph(company_info, styles['Normal']))
    elements.append(Spacer(1, 0.3*inch))
    
    # Invoice Details
    invoice_data = [
        ['Invoice Number:', order.order_number],
        ['Invoice Date:', order.created_at.strftime('%d-%m-%Y')],
        ['Payment Method:', order.payment_method.upper()],
        ['Payment Status:', order.payment_status.upper()],
    ]
    
    invoice_table = Table(invoice_data, colWidths=[2*inch, 3*inch])
    invoice_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(invoice_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Billing Address
    addr = order.shipping_address
    billing_info = f"""
    <b>Bill To:</b><br/>
    {addr.get('full_name')}<br/>
    {addr.get('address_line1')}<br/>
    {addr.get('address_line2', '')}<br/>
    {addr.get('city')}, {addr.get('state')} - {addr.get('pincode')}<br/>
    Phone: {addr.get('phone')}
    """
    elements.append(Paragraph(billing_info, styles['Normal']))
    elements.append(Spacer(1, 0.3*inch))
    
    # Items Table
    items_data = [['#', 'Product', 'Qty', 'Price', 'Amount']]
    
    for idx, item in enumerate(order.items, 1):
        items_data.append([
            str(idx),
            item.product_name,
            str(item.quantity),
            f"₹{item.product_price:.2f}",
            f"₹{item.subtotal:.2f}"
        ])
    
    items_table = Table(items_data, colWidths=[0.5*inch, 3*inch, 0.8*inch, 1*inch, 1*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 10),
        ('FONT', (0, 1), (-1, -1), 'Helvetica', 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Totals
    totals_data = [
        ['Subtotal:', f"₹{order.subtotal:.2f}"],
        ['Discount:', f"-₹{order.discount_amount:.2f}"],
        ['Shipping:', f"₹{order.shipping_cost:.2f}"],
        ['Platform Fee (2%):', f"₹{order.tax:.2f}"],
        ['', ''],
        ['<b>Total Amount:</b>', f"<b>₹{order.total_amount:.2f}</b>"],
    ]
    
    totals_table = Table(totals_data, colWidths=[4*inch, 1.5*inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONT', (0, 0), (-1, -2), 'Helvetica', 10),
        ('FONT', (0, -1), (-1, -1), 'Helvetica-Bold', 12),
        ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 0.5*inch))
    
    # Footer
    footer_text = """
    <b>Terms & Conditions:</b><br/>
    1. Goods once sold will not be taken back or exchanged.<br/>
    2. All disputes are subject to Mumbai jurisdiction only.<br/>
    3. This is a computer-generated invoice and does not require a signature.
    """
    elements.append(Paragraph(footer_text, styles['Normal']))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
