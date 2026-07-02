package com.urbanpower.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.urbanpower.dto.room.*;
import com.urbanpower.service.JwtService;
import com.urbanpower.service.RoomService;

@WebMvcTest(RoomController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
public class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RoomService roomService;

    @MockBean
    private com.urbanpower.config.JwtAuthenticationFilter jwtAuthFilter;

    @MockBean
    private com.urbanpower.config.JwtFilter jwtFilter;

    @Test
    void createRoom_Success() throws Exception {
        RoomRequest request = new RoomRequest("Conference Room A", "Main Room", 10);
        RoomResponse response = new RoomResponse(1L, "Conference Room A", "Main Room", 10);

        when(roomService.createRoom(any(RoomRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Room created successfully"))
                .andExpect(jsonPath("$.data.id").value(1L))
                .andExpect(jsonPath("$.data.name").value("Conference Room A"));
    }

    @Test
    void createRoom_InvalidRequest_Returns400() throws Exception {
        // Name cannot be blank, capacity must be positive
        RoomRequest request = new RoomRequest("", "Main Room", -5);

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllRooms_Success() throws Exception {
        RoomResponse room1 = new RoomResponse(1L, "Room A", "Desc A", 10);
        RoomResponse room2 = new RoomResponse(2L, "Room B", "Desc B", 20);

        when(roomService.getAllRooms()).thenReturn(List.of(room1, room2));

        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Room A"))
                .andExpect(jsonPath("$.data[1].name").value("Room B"));
    }

    @Test
    void checkAvailability_Success() throws Exception {
        LocalDateTime start = LocalDateTime.of(2026, 6, 10, 10, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 10, 12, 0);
        RoomAvailabilityResponse response = RoomAvailabilityResponse.builder()
                .available(true)
                .unavailableSlots(Collections.emptyList())
                .bookingConflicts(Collections.emptyList())
                .build();

        when(roomService.checkAvailability(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(response);

        mockMvc.perform(get("/api/rooms/availability")
                        .param("roomId", "1")
                        .param("startDate", "2026-06-10T10:00:00")
                        .param("endDate", "2026-06-10T12:00:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.available").value(true));
    }

    @Test
    void bookRoom_Success() throws Exception {
        LocalDateTime start = LocalDateTime.of(2026, 6, 10, 10, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 10, 12, 0);
        RoomAvailabilityRequest request = new RoomAvailabilityRequest(1L, start, end, 1L, "Team Meeting");
        RoomAvailabilityDTO response = new RoomAvailabilityDTO(100L, 1L, "Room A", start, end, "Team Meeting", "BOOKED", 1L, "John Doe");

        when(roomService.bookRoom(any(RoomAvailabilityRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/rooms/availability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(100L))
                .andExpect(jsonPath("$.data.purpose").value("Team Meeting"));
    }

    @Test
    void bookRoom_InvalidRequest_Returns400() throws Exception {
        // roomId is null
        RoomAvailabilityRequest request = new RoomAvailabilityRequest(null, null, null, null, "");

        mockMvc.perform(post("/api/rooms/availability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
