from datetime import time, datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

class TimeslotBase(BaseModel):
    """
    Base Pydantic schema for Timeslot containing shared attributes.
    """
    service_id: UUID = Field(..., description="Foreign key to the service this timeslot belongs to")
    start_time: time = Field(..., description="Start time of the timeslot")
    end_time: time = Field(..., description="End time of the timeslot")
    active: bool = Field(True, description="Indicates whether the timeslot is active")

class TimeslotCreate(TimeslotBase):
    """
    Pydantic schema for creating a new Timeslot.
    """
    pass

class TimeslotUpdate(BaseModel):
    """
    Pydantic schema for updating an existing Timeslot. All fields are optional.
    """
    start_time: Optional[time] = Field(None, description="Start time of the timeslot")
    end_time: Optional[time] = Field(None, description="End time of the timeslot")
    active: Optional[bool] = Field(None, description="Indicates whether the timeslot is active")

class TimeslotResponse(TimeslotBase):
    """
    Pydantic schema for returning Timeslot information.
    """
    id: UUID = Field(..., description="Unique identifier of the timeslot")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AvailableTimeslot(BaseModel):
    """
    Pydantic schema representing availability status of a timeslot.
    """
    id: UUID = Field(..., description="Unique identifier of the timeslot")
    start_time: time = Field(..., description="Start time of the timeslot")
    end_time: time = Field(..., description="End time of the timeslot")
    available: bool = Field(..., description="Whether the timeslot is available on the selected date")

class AvailableTimeslotsResponse(BaseModel):
    """
    Pydantic schema for returning a list of available timeslots.
    """
    available_timeslots: List[AvailableTimeslot]

