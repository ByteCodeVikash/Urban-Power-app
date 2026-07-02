package com.urbanpower.dto.room;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomAvailabilityDTO {
    private Long id;
    private Long roomId;
    private String roomName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String purpose;
    private String status;
    private Long userId;
    private String userName;
}
