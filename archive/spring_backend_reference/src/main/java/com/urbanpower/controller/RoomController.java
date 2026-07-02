package com.urbanpower.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.urbanpower.dto.common.ApiResponse;
import com.urbanpower.dto.room.*;
import com.urbanpower.service.RoomService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(
            @Valid @RequestBody RoomRequest request) {
        RoomResponse response = roomService.createRoom(request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Room created successfully", response)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAllRooms() {
        List<RoomResponse> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Rooms fetched successfully", rooms)
        );
    }

    @GetMapping("/availability")
    public ResponseEntity<ApiResponse<RoomAvailabilityResponse>> checkAvailability(
            @RequestParam Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        RoomAvailabilityResponse response = roomService.checkAvailability(roomId, startDate, endDate);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Room availability checked successfully", response)
        );
    }

    @PostMapping("/availability")
    public ResponseEntity<ApiResponse<RoomAvailabilityDTO>> bookRoom(
            @Valid @RequestBody RoomAvailabilityRequest request) {

        RoomAvailabilityDTO response = roomService.bookRoom(request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Room booked successfully", response)
        );
    }
}
