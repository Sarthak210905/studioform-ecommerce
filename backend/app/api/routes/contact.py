from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from typing import List
from datetime import datetime

from app.models.contact import ContactSubmission
from app.models.user import User
from app.schemas.contact import ContactSubmissionCreate, ContactSubmissionResponse, ContactSubmissionUpdate
from app.services.auth import get_current_superuser
from app.services.email import send_email
from app.core.config import settings

router = APIRouter()


@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_contact_form(submission: ContactSubmissionCreate):
    """Submit a contact form (public)"""
    
    # Save to database
    contact = ContactSubmission(**submission.model_dump())
    await contact.insert()
    
    # Send email notification to admin
    try:
        admin_email_body = f"""
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> {submission.name} ({submission.email})</p>
        <p><strong>Subject:</strong> {submission.subject}</p>
        <p><strong>Message:</strong></p>
        <p>{submission.message}</p>
        <hr>
        <p><small>Submitted at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</small></p>
        <p><small>View in admin dashboard to respond</small></p>
        """
        
        await send_email(
            to_email=settings.ADMIN_EMAIL,
            subject=f"New Contact: {submission.subject}",
            body=admin_email_body
        )
    except Exception as e:
        print(f"Failed to send admin notification email: {e}")
    
    # Send confirmation email to user
    try:
        user_email_body = f"""
        <h2>Thank you for contacting us!</h2>
        <p>Dear {submission.name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <p><em>{submission.subject}</em></p>
        <p>{submission.message}</p>
        <hr>
        <p>Best regards,<br>Premium Desk Accessories Team</p>
        """
        
        await send_email(
            to_email=submission.email,
            subject="We received your message - Premium Desk Accessories",
            body=user_email_body
        )
    except Exception as e:
        print(f"Failed to send confirmation email: {e}")
    
    return {
        "message": "Contact form submitted successfully",
        "id": str(contact.id)
    }


@router.get("/admin/submissions", response_model=List[ContactSubmissionResponse])
async def get_all_submissions(
    status_filter: str = None,
    current_user: User = Depends(get_current_superuser)
):
    """Admin: Get all contact submissions"""
    
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    submissions = await ContactSubmission.find(query).sort([("created_at", -1)]).to_list()
    
    return [
        ContactSubmissionResponse(
            id=str(sub.id),
            name=sub.name,
            email=sub.email,
            subject=sub.subject,
            message=sub.message,
            status=sub.status,
            admin_notes=sub.admin_notes,
            created_at=sub.created_at,
            updated_at=sub.updated_at
        )
        for sub in submissions
    ]


@router.get("/admin/submissions/{submission_id}", response_model=ContactSubmissionResponse)
async def get_submission(
    submission_id: str,
    current_user: User = Depends(get_current_superuser)
):
    """Admin: Get a specific contact submission"""
    
    submission = await ContactSubmission.get(PydanticObjectId(submission_id))
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Mark as read if it was new
    if submission.status == "new":
        submission.status = "read"
        submission.updated_at = datetime.utcnow()
        await submission.save()
    
    return ContactSubmissionResponse(
        id=str(submission.id),
        name=submission.name,
        email=submission.email,
        subject=submission.subject,
        message=submission.message,
        status=submission.status,
        admin_notes=submission.admin_notes,
        created_at=submission.created_at,
        updated_at=submission.updated_at
    )


@router.patch("/admin/submissions/{submission_id}", response_model=ContactSubmissionResponse)
async def update_submission(
    submission_id: str,
    update_data: ContactSubmissionUpdate,
    current_user: User = Depends(get_current_superuser)
):
    """Admin: Update contact submission status/notes"""
    
    submission = await ContactSubmission.get(PydanticObjectId(submission_id))
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Update fields
    if update_data.status:
        submission.status = update_data.status
    if update_data.admin_notes is not None:
        submission.admin_notes = update_data.admin_notes
    
    submission.updated_at = datetime.utcnow()
    await submission.save()
    
    return ContactSubmissionResponse(
        id=str(submission.id),
        name=submission.name,
        email=submission.email,
        subject=submission.subject,
        message=submission.message,
        status=submission.status,
        admin_notes=submission.admin_notes,
        created_at=submission.created_at,
        updated_at=submission.updated_at
    )


@router.delete("/admin/submissions/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_submission(
    submission_id: str,
    current_user: User = Depends(get_current_superuser)
):
    """Admin: Delete a contact submission"""
    
    submission = await ContactSubmission.get(PydanticObjectId(submission_id))
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    await submission.delete()
    return None
