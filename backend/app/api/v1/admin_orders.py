"""
admin_orders.py — Admin Order Management API

Provides admin-only endpoints that query ALL booking types directly from
the database using the admin's JWT token. No user impersonation needed.

Endpoints:
  GET  /admin/orders              → Paginated, filtered, normalized list
  GET  /admin/orders/statistics   → Counts by type & status
  GET  /admin/orders/{type}/{id}  → Full booking detail with history
  PATCH /admin/orders/{type}/{id} → Update status + store history
"""
from __future__ import annotations

import re
import uuid
import logging
from datetime import datetime
from typing import List, Optional, Tuple
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, String, cast

from app.core.database import get_db
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.scrap_booking import ScrapBooking, ScrapBookingStatus
from app.models.maintenance_booking import MaintenanceBooking, MaintenanceBookingStatus
from app.models.booking_status_history import BookingStatusHistory
from app.models.address import Address
from app.models.service import Service
from app.models.category import Category
from app.schemas.admin_orders import (
    AdminOrderItem,
    AdminOrderListResponse,
    AdminOrderDetail,
    AdminOrderStatusUpdate,
    AdminOrderStatistics,
    BookingTypeStats,
    StatusHistoryItem,
)
from app.api.deps import get_current_active_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/orders", tags=["admin-orders"])


# ── Status mapping tables ──────────────────────────────────────────────────────
# The admin UI sends human-friendly status strings (accepted, technician_on_the_way…)
# These must be mapped to the valid DB enum values for each booking type.

# Beautician: pending | confirmed | assigned | in_progress | completed | cancelled
_BEAUTICIAN_STATUS_MAP: dict = {
    # DB valid values — pass through unchanged
    "pending":             "pending",
    "confirmed":           "confirmed",
    "assigned":            "assigned",
    "in_progress":         "in_progress",
    "completed":           "completed",
    "cancelled":           "cancelled",
    # Admin UI extras → nearest DB equivalent
    "accepted":            "confirmed",
    "requested":           "pending",
    "technician_on_the_way": "in_progress",
    "reached":             "in_progress",
    "work_started":        "in_progress",
    "refund_requested":    "cancelled",
    "refunded":            "cancelled",
}

# Scrap: requested | assigned | in_progress | completed | cancelled
_SCRAP_STATUS_MAP: dict = {
    "requested":           "requested",
    "assigned":            "assigned",
    "in_progress":         "in_progress",
    "completed":           "completed",
    "cancelled":           "cancelled",
    # Extras
    "pending":             "requested",
    "accepted":            "assigned",
    "confirmed":           "assigned",
    "technician_on_the_way": "in_progress",
    "reached":             "in_progress",
    "work_started":        "in_progress",
    "refund_requested":    "cancelled",
    "refunded":            "cancelled",
}

# Maintenance: pending | confirmed | assigned | in_progress | completed | cancelled
_MAINTENANCE_STATUS_MAP: dict = {
    "pending":             "pending",
    "confirmed":           "confirmed",
    "assigned":            "assigned",
    "in_progress":         "in_progress",
    "completed":           "completed",
    "cancelled":           "cancelled",
    # Extras
    "accepted":            "confirmed",
    "requested":           "pending",
    "technician_on_the_way": "in_progress",
    "reached":             "in_progress",
    "work_started":        "in_progress",
    "refund_requested":    "cancelled",
    "refunded":            "cancelled",
}


# ── helpers ────────────────────────────────────────────────────────────────────

def _require_admin(current_user: User) -> None:
    """Raise 403 if caller is not admin or provider."""
    if current_user.role not in ("admin", "provider"):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Admin or provider role required",
        )


def _parse_technician_from_notes(notes: Optional[str]) -> Optional[str]:
    """Extract assigned technician from booking notes string."""
    if not notes:
        return None
    match = re.search(r"Technician:\s*([^,\n]+)", notes, re.IGNORECASE)
    if match:
        tech = match.group(1).strip()
        return None if tech.lower() == "none" else tech
    return None


def _parse_customer_name_from_notes(notes: Optional[str]) -> Optional[str]:
    if not notes:
        return None
    match = re.search(r"Customer Name:\s*([^,\n]+)", notes, re.IGNORECASE)
    return match.group(1).strip() if match else None


def _parse_phone_from_notes(notes: Optional[str]) -> Optional[str]:
    if not notes:
        return None
    match = re.search(r"Phone:\s*([^,\n]+)", notes, re.IGNORECASE)
    return match.group(1).strip() if match else None


def _format_address(addr: Optional[Address]) -> Optional[str]:
    if not addr:
        return None
    parts = [
        f"#{addr.house_number}" if addr.house_number else None,
        addr.street,
        f"(Near {addr.landmark})" if addr.landmark else None,
        addr.city,
        addr.state,
        f"PIN {addr.pincode}" if addr.pincode else None,
    ]
    return ", ".join(p for p in parts if p)


def _normalize_beautician(b: Booking) -> AdminOrderItem:
    cname = (
        _parse_customer_name_from_notes(b.notes)
        or (b.user.full_name if b.user else None)
        or "Unknown"
    )
    cphone = (
        _parse_phone_from_notes(b.notes)
        or (b.user.phone if b.user else None)
    )
    svc_name = b.service.name if b.service else "Service Booking"
    cat_name = b.service.category.name if (b.service and b.service.category) else "General"
    addr_str = _format_address(b.address)
    tech = _parse_technician_from_notes(b.notes)
    return AdminOrderItem(
        booking_id=str(b.id),
        booking_reference=b.booking_reference,
        booking_type="beautician",
        customer_name=cname,
        customer_phone=cphone,
        address=addr_str,
        service_name=svc_name,
        category=cat_name,
        price=float(b.total_price),
        status=b.status.value if hasattr(b.status, "value") else str(b.status),
        created_at=b.created_at,
        assigned_technician=tech,
        payment_method=b.payment_method,
    )


def _normalize_scrap(s: ScrapBooking) -> AdminOrderItem:
    cname = (s.user.full_name if s.user else None) or "Unknown"
    cphone = s.user.phone if s.user else None
    addr_str = s.address_text or _format_address(s.address) if hasattr(s, "address") else s.address_text
    tech = _parse_technician_from_notes(s.notes)
    return AdminOrderItem(
        booking_id=str(s.id),
        booking_reference=s.booking_reference,
        booking_type="scrap",
        customer_name=cname,
        customer_phone=cphone,
        address=addr_str,
        service_name=s.item_name or "Scrap Pickup",
        category=s.category_name or "Scrap",
        price=float(s.estimated_value or 0),
        status=s.status.value if hasattr(s.status, "value") else str(s.status),
        created_at=s.created_at,
        assigned_technician=tech,
    )


def _normalize_maintenance(m: MaintenanceBooking) -> AdminOrderItem:
    cname = m.customer_name or (m.user.full_name if m.user else None) or "Unknown"
    cphone = m.customer_phone or (m.user.phone if m.user else None)
    addr_str = m.address_text or (_format_address(m.address) if hasattr(m, "address") else None)
    svc_name = (m.service_names[0] if m.service_names else None) or "Maintenance"
    tech = _parse_technician_from_notes(m.notes)
    return AdminOrderItem(
        booking_id=str(m.id),
        booking_reference=m.booking_reference,
        booking_type="maintenance",
        customer_name=cname,
        customer_phone=cphone,
        address=addr_str,
        service_name=svc_name,
        category="Maintenance",
        price=float(m.total_price),
        status=m.status.value if hasattr(m.status, "value") else str(m.status),
        created_at=m.created_at,
        assigned_technician=tech,
    )


def _matches_search(item: AdminOrderItem, search: str) -> bool:
    s = search.lower()
    return (
        (item.booking_reference and s in item.booking_reference.lower())
        or (item.customer_name and s in item.customer_name.lower())
        or (item.customer_phone and s in item.customer_phone.lower())
        or (item.booking_id and s in item.booking_id.lower())
    )


def _get_status_history(
    db: Session, booking_id: str, booking_type: str
) -> List[StatusHistoryItem]:
    rows = (
        db.query(BookingStatusHistory)
        .filter(
            BookingStatusHistory.booking_id == booking_id,
            BookingStatusHistory.booking_type == booking_type,
        )
        .order_by(BookingStatusHistory.created_at.desc())
        .all()
    )
    return [
        StatusHistoryItem(
            status=r.status,
            updated_by=r.updated_by,
            updated_by_name=r.updated_by_name,
            notes=r.notes,
            created_at=r.created_at,
        )
        for r in rows
    ]


def _write_history(
    db: Session,
    booking_id: str,
    booking_type: str,
    new_status: str,
    admin_user: User,
    notes: Optional[str] = None,
) -> None:
    entry = BookingStatusHistory(
        id=uuid.uuid4(),
        booking_id=booking_id,
        booking_type=booking_type,
        status=new_status,
        updated_by=str(admin_user.id),
        updated_by_name=admin_user.full_name or admin_user.email,
        notes=notes,
    )
    db.add(entry)


# ── GET /admin/orders ──────────────────────────────────────────────────────────

@router.get("/", response_model=AdminOrderListResponse)
def list_admin_orders(
    # Pagination
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=500, description="Records per page"),
    # Filters
    booking_type: Optional[str] = Query(None, description="beautician | scrap | maintenance"),
    status: Optional[str] = Query(None, description="Filter by booking status"),
    search: Optional[str] = Query(None, description="Search by reference, name, or phone"),
    date_from: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    customer: Optional[str] = Query(None, description="Filter by customer name (partial)"),
    phone: Optional[str] = Query(None, description="Filter by customer phone (partial)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    service_name: Optional[str] = Query(None, description="Filter by service name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> AdminOrderListResponse:
    """
    Admin-only: list ALL bookings (beautician + scrap + maintenance) normalized,
    sorted newest-first, with server-side filtering and pagination.
    """
    _require_admin(current_user)

    all_items: List[AdminOrderItem] = []

    # ── Beautician bookings ──────────────────────────────────────────────────
    if not booking_type or booking_type == "beautician":
        q = (
            db.query(Booking)
            .options(
                joinedload(Booking.user),
                joinedload(Booking.service).joinedload(Service.category),
                joinedload(Booking.address),
            )
        )
        if status:
            q = q.filter(Booking.status == status)
        if date_from:
            try:
                q = q.filter(Booking.created_at >= datetime.strptime(date_from, "%Y-%m-%d"))
            except ValueError:
                pass
        if date_to:
            try:
                q = q.filter(Booking.created_at <= datetime.strptime(date_to + "T23:59:59", "%Y-%m-%dT%H:%M:%S"))
            except ValueError:
                pass
        rows = q.order_by(Booking.created_at.desc()).all()
        for b in rows:
            item = _normalize_beautician(b)
            all_items.append(item)

    # ── Scrap bookings ───────────────────────────────────────────────────────
    if not booking_type or booking_type == "scrap":
        q = (
            db.query(ScrapBooking)
            .options(joinedload(ScrapBooking.user))
        )
        if status:
            q = q.filter(ScrapBooking.status == status)
        if date_from:
            try:
                q = q.filter(ScrapBooking.created_at >= datetime.strptime(date_from, "%Y-%m-%d"))
            except ValueError:
                pass
        if date_to:
            try:
                q = q.filter(ScrapBooking.created_at <= datetime.strptime(date_to + "T23:59:59", "%Y-%m-%dT%H:%M:%S"))
            except ValueError:
                pass
        rows = q.order_by(ScrapBooking.created_at.desc()).all()
        for s in rows:
            item = _normalize_scrap(s)
            all_items.append(item)

    # ── Maintenance bookings ─────────────────────────────────────────────────
    if not booking_type or booking_type == "maintenance":
        q = (
            db.query(MaintenanceBooking)
            .options(joinedload(MaintenanceBooking.user))
        )
        if status:
            q = q.filter(MaintenanceBooking.status == status)
        if date_from:
            try:
                q = q.filter(MaintenanceBooking.created_at >= datetime.strptime(date_from, "%Y-%m-%d"))
            except ValueError:
                pass
        if date_to:
            try:
                q = q.filter(MaintenanceBooking.created_at <= datetime.strptime(date_to + "T23:59:59", "%Y-%m-%dT%H:%M:%S"))
            except ValueError:
                pass
        rows = q.order_by(MaintenanceBooking.created_at.desc()).all()
        for m in rows:
            item = _normalize_maintenance(m)
            all_items.append(item)

    # ── Sort all types together newest-first ─────────────────────────────────
    all_items.sort(key=lambda x: x.created_at, reverse=True)

    # ── In-memory post-filters (search, customer, phone, category, service) ──
    if search:
        all_items = [i for i in all_items if _matches_search(i, search)]
    if customer:
        cl = customer.lower()
        all_items = [i for i in all_items if i.customer_name and cl in i.customer_name.lower()]
    if phone:
        all_items = [i for i in all_items if i.customer_phone and phone in i.customer_phone]
    if category:
        cl = category.lower()
        all_items = [i for i in all_items if i.category and cl in i.category.lower()]
    if service_name:
        sl = service_name.lower()
        all_items = [i for i in all_items if i.service_name and sl in i.service_name.lower()]

    # ── Pagination ────────────────────────────────────────────────────────────
    total = len(all_items)
    total_pages = ceil(total / page_size) if total else 1
    start = (page - 1) * page_size
    end = start + page_size
    page_items = all_items[start:end]

    return AdminOrderListResponse(
        items=page_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# ── GET /admin/orders/statistics ─────────────────────────────────────────────

@router.get("/statistics", response_model=AdminOrderStatistics)
def get_admin_order_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> AdminOrderStatistics:
    """
    Admin-only: booking counts broken down by type and status.
    """
    _require_admin(current_user)

    def _count_status(model, status_val: str) -> int:
        return db.query(func.count(model.id)).filter(model.status == status_val).scalar() or 0

    def _build_stats(model) -> BookingTypeStats:
        total = db.query(func.count(model.id)).scalar() or 0
        # Map all variant status names
        statuses = ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled",
                    "requested", "accepted", "technician_on_the_way", "reached", "work_started",
                    "refund_requested", "refunded"]
        counts: dict = {}
        for s in statuses:
            counts[s] = _count_status(model, s)

        pending = counts["pending"] + counts.get("requested", 0)
        confirmed = counts["confirmed"] + counts.get("accepted", 0)
        assigned = counts["assigned"]
        in_progress = (counts["in_progress"] + counts.get("technician_on_the_way", 0)
                       + counts.get("reached", 0) + counts.get("work_started", 0))
        completed = counts["completed"]
        cancelled = (counts["cancelled"] + counts.get("refund_requested", 0)
                     + counts.get("refunded", 0))
        return BookingTypeStats(
            total=total,
            pending=pending,
            confirmed=confirmed,
            assigned=assigned,
            in_progress=in_progress,
            completed=completed,
            cancelled=cancelled,
        )

    b_stats = _build_stats(Booking)
    s_stats = _build_stats(ScrapBooking)
    m_stats = _build_stats(MaintenanceBooking)
    total_all = b_stats.total + s_stats.total + m_stats.total

    # Recent statuses across all types
    recent: dict = {}
    for model in [Booking, ScrapBooking, MaintenanceBooking]:
        rows = db.query(model.status, func.count(model.id)).group_by(model.status).all()
        for st, cnt in rows:
            key = st.value if hasattr(st, "value") else str(st)
            recent[key] = recent.get(key, 0) + cnt

    return AdminOrderStatistics(
        total_all=total_all,
        beautician=b_stats,
        scrap=s_stats,
        maintenance=m_stats,
        recent_statuses=recent,
    )


# ── GET /admin/orders/{booking_type}/{id} ─────────────────────────────────────

@router.get("/{booking_type}/{booking_id}", response_model=AdminOrderDetail)
def get_admin_order_detail(
    booking_type: str,
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> AdminOrderDetail:
    """
    Admin-only: retrieve full detail for a single booking.
    booking_type: beautician | scrap | maintenance
    """
    _require_admin(current_user)

    try:
        bid = uuid.UUID(booking_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid booking ID format")

    history = _get_status_history(db, booking_id, booking_type)

    if booking_type == "beautician":
        b = (
            db.query(Booking)
            .options(
                joinedload(Booking.user),
                joinedload(Booking.service).joinedload(Service.category),
                joinedload(Booking.address),
            )
            .filter(Booking.id == bid)
            .first()
        )
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        cname = (_parse_customer_name_from_notes(b.notes)
                 or (b.user.full_name if b.user else None) or "Unknown")
        cphone = (_parse_phone_from_notes(b.notes)
                  or (b.user.phone if b.user else None))
        return AdminOrderDetail(
            booking_id=str(b.id),
            booking_reference=b.booking_reference,
            booking_type="beautician",
            customer_name=cname,
            customer_phone=cphone,
            customer_email=b.user.email if b.user else None,
            customer_id=str(b.user_id),
            address=_format_address(b.address),
            address_id=str(b.address_id) if b.address_id else None,
            service_name=b.service.name if b.service else None,
            service_id=str(b.service_id),
            category=b.service.category.name if (b.service and b.service.category) else None,
            timeslot_id=str(b.timeslot_id) if b.timeslot_id else None,
            price=float(b.total_price),
            payment_method=b.payment_method,
            status=b.status.value if hasattr(b.status, "value") else str(b.status),
            assigned_technician=_parse_technician_from_notes(b.notes),
            photos=b.photos or [],
            notes=b.notes,
            booking_date=b.booking_date,
            created_at=b.created_at,
            updated_at=b.updated_at,
            status_history=history,
        )

    elif booking_type == "scrap":
        s = (
            db.query(ScrapBooking)
            .options(joinedload(ScrapBooking.user))
            .filter(ScrapBooking.id == bid)
            .first()
        )
        if not s:
            raise HTTPException(status_code=404, detail="Scrap booking not found")

        addr = None
        if s.address_id:
            addr = db.query(Address).filter(Address.id == s.address_id).first()

        return AdminOrderDetail(
            booking_id=str(s.id),
            booking_reference=s.booking_reference,
            booking_type="scrap",
            customer_name=s.user.full_name if s.user else "Unknown",
            customer_phone=s.user.phone if s.user else None,
            customer_email=s.user.email if s.user else None,
            customer_id=str(s.user_id),
            address=s.address_text or _format_address(addr),
            address_id=str(s.address_id) if s.address_id else None,
            service_name=s.item_name or "Scrap Pickup",
            category=s.category_name or "Scrap",
            item_name=s.item_name,
            category_name=s.category_name,
            estimated_weight_kg=s.estimated_weight_kg,
            estimated_value=s.estimated_value,
            time_slot=s.time_slot,
            price=float(s.estimated_value or 0),
            status=s.status.value if hasattr(s.status, "value") else str(s.status),
            assigned_technician=_parse_technician_from_notes(s.notes),
            photos=s.photos or [],
            notes=s.notes,
            booking_date=s.booking_date,
            created_at=s.created_at,
            updated_at=s.updated_at,
            status_history=history,
        )

    elif booking_type == "maintenance":
        m = (
            db.query(MaintenanceBooking)
            .options(joinedload(MaintenanceBooking.user))
            .filter(MaintenanceBooking.id == bid)
            .first()
        )
        if not m:
            raise HTTPException(status_code=404, detail="Maintenance booking not found")

        addr = None
        if m.address_id:
            addr = db.query(Address).filter(Address.id == m.address_id).first()

        return AdminOrderDetail(
            booking_id=str(m.id),
            booking_reference=m.booking_reference,
            booking_type="maintenance",
            customer_name=m.customer_name or (m.user.full_name if m.user else "Unknown"),
            customer_phone=m.customer_phone or (m.user.phone if m.user else None),
            customer_email=m.user.email if m.user else None,
            customer_id=str(m.user_id),
            address=m.address_text or _format_address(addr),
            address_id=str(m.address_id) if m.address_id else None,
            service_name=(m.service_names[0] if m.service_names else None) or "Maintenance",
            category="Maintenance",
            service_names=m.service_names,
            service_ids=[str(sid) for sid in (m.service_ids or [])],
            price=float(m.total_price),
            status=m.status.value if hasattr(m.status, "value") else str(m.status),
            assigned_technician=_parse_technician_from_notes(m.notes),
            photos=m.photos or [],
            notes=m.notes,
            booking_date=m.booking_date,
            created_at=m.created_at,
            updated_at=m.updated_at,
            status_history=history,
        )

    else:
        raise HTTPException(status_code=400, detail=f"Unknown booking_type: {booking_type}")


# ── PATCH /admin/orders/{booking_type}/{id} ───────────────────────────────────

@router.patch("/{booking_type}/{booking_id}", response_model=AdminOrderDetail)
def update_admin_order(
    booking_type: str,
    booking_id: str,
    payload: AdminOrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> AdminOrderDetail:
    """
    Admin-only: update booking status and/or assigned technician.
    Stores an entry in booking_status_history on every call.
    """
    _require_admin(current_user)

    try:
        bid = uuid.UUID(booking_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid booking ID format")

    if booking_type == "beautician":
        b = db.query(Booking).filter(Booking.id == bid).first()
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Map admin status string → valid BookingStatus DB enum value
        db_status = _BEAUTICIAN_STATUS_MAP.get(payload.status.lower(), "pending")
        try:
            b.status = BookingStatus(db_status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status '{payload.status}' for beautician booking")

        # Update technician in notes
        if payload.assigned_technician is not None:
            existing_notes = b.notes or ""
            existing_notes = re.sub(r",?\s*Technician:\s*[^,\n]+", "", existing_notes)
            existing_notes = existing_notes.strip(", ")
            if payload.assigned_technician:
                existing_notes = (
                    existing_notes + f", Technician: {payload.assigned_technician}"
                    if existing_notes
                    else f"Technician: {payload.assigned_technician}"
                )
            b.notes = existing_notes

        # History stores the human-readable admin status (not mapped)
        _write_history(db, booking_id, "beautician", payload.status, current_user, payload.notes)
        db.commit()
        db.refresh(b)

    elif booking_type == "scrap":
        s = db.query(ScrapBooking).filter(ScrapBooking.id == bid).first()
        if not s:
            raise HTTPException(status_code=404, detail="Scrap booking not found")

        db_status = _SCRAP_STATUS_MAP.get(payload.status.lower(), "requested")
        try:
            s.status = ScrapBookingStatus(db_status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status '{payload.status}' for scrap booking")

        if payload.assigned_technician is not None:
            existing_notes = s.notes or ""
            existing_notes = re.sub(r",?\s*Technician:\s*[^,\n]+", "", existing_notes)
            existing_notes = existing_notes.strip(", ")
            if payload.assigned_technician:
                existing_notes = (
                    existing_notes + f", Technician: {payload.assigned_technician}"
                    if existing_notes
                    else f"Technician: {payload.assigned_technician}"
                )
            s.notes = existing_notes

        _write_history(db, booking_id, "scrap", payload.status, current_user, payload.notes)
        db.commit()
        db.refresh(s)

    elif booking_type == "maintenance":
        m = db.query(MaintenanceBooking).filter(MaintenanceBooking.id == bid).first()
        if not m:
            raise HTTPException(status_code=404, detail="Maintenance booking not found")

        db_status = _MAINTENANCE_STATUS_MAP.get(payload.status.lower(), "pending")
        try:
            m.status = MaintenanceBookingStatus(db_status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status '{payload.status}' for maintenance booking")

        if payload.assigned_technician is not None:
            existing_notes = m.notes or ""
            existing_notes = re.sub(r",?\s*Technician:\s*[^,\n]+", "", existing_notes)
            existing_notes = existing_notes.strip(", ")
            if payload.assigned_technician:
                existing_notes = (
                    existing_notes + f", Technician: {payload.assigned_technician}"
                    if existing_notes
                    else f"Technician: {payload.assigned_technician}"
                )
            m.notes = existing_notes

        _write_history(db, booking_id, "maintenance", payload.status, current_user, payload.notes)
        db.commit()
        db.refresh(m)

    else:
        raise HTTPException(status_code=400, detail=f"Unknown booking_type: {booking_type}")

    # Return full detail
    return get_admin_order_detail(booking_type, booking_id, db, current_user)
