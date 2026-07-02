package com.urbanpower.dto.room;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomAvailabilityResponse {
    private boolean available;
    private List<TimeSlotDTO> unavailableSlots;
    private List<RoomAvailabilityDTO> bookingConflicts;
}
