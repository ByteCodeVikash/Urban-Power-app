package com.urbanpower.service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbanpower.dto.room.*;
import com.urbanpower.entity.Room;
import com.urbanpower.entity.RoomAvailability;
import com.urbanpower.entity.User;
import com.urbanpower.exception.BadRequestException;
import com.urbanpower.exception.ResourceNotFoundException;
import com.urbanpower.repository.RoomAvailabilityRepository;
import com.urbanpower.repository.RoomRepository;
import com.urbanpower.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomAvailabilityRepository roomAvailabilityRepository;
    private final UserRepository userRepository;

    public RoomResponse createRoom(RoomRequest request) {
        if (roomRepository.findByName(request.getName()).isPresent()) {
            throw new BadRequestException("Room name already exists");
        }

        Room room = Room.builder()
                .name(request.getName())
                .description(request.getDescription())
                .capacity(request.getCapacity())
                .build();

        Room saved = roomRepository.save(room);
        return mapToRoomResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToRoomResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoomAvailabilityResponse checkAvailability(Long roomId, LocalDateTime startDate, LocalDateTime endDate) {
        if (!roomRepository.existsById(roomId)) {
            throw new ResourceNotFoundException("Room not found");
        }

        if (startDate == null || endDate == null) {
            throw new BadRequestException("Start date and end date are required");
        }

        if (!startDate.isBefore(endDate)) {
            throw new BadRequestException("Start date must be before end date");
        }

        // 1. Direct overlaps = Booking conflicts
        List<RoomAvailability> conflicts = roomAvailabilityRepository.findOverlappingBookings(roomId, startDate, endDate);
        boolean available = conflicts.isEmpty();

        // 2. Daily bookings = Unavailable slots (bookings overlapping the day(s) queried)
        LocalDateTime startOfDay = startDate.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = endDate.toLocalDate().atTime(LocalTime.MAX);
        List<RoomAvailability> dayBookings = roomAvailabilityRepository.findOverlappingBookings(roomId, startOfDay, endOfDay);

        List<RoomAvailabilityDTO> conflictDTOs = conflicts.stream()
                .map(this::mapToDTO)
                .toList();

        List<TimeSlotDTO> unavailableSlots = dayBookings.stream()
                .map(b -> new TimeSlotDTO(b.getStartDate(), b.getEndDate()))
                .toList();

        return RoomAvailabilityResponse.builder()
                .available(available)
                .unavailableSlots(unavailableSlots)
                .bookingConflicts(conflictDTOs)
                .build();
    }

    public RoomAvailabilityDTO bookRoom(RoomAvailabilityRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new BadRequestException("Start date and end date are required");
        }

        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new BadRequestException("Start date must be before end date");
        }

        // Prevent double booking
        List<RoomAvailability> conflicts = roomAvailabilityRepository.findOverlappingBookings(
                request.getRoomId(), request.getStartDate(), request.getEndDate());
        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Room is already booked for the selected time range");
        }

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }

        RoomAvailability booking = RoomAvailability.builder()
                .room(room)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .user(user)
                .purpose(request.getPurpose())
                .status("BOOKED")
                .build();

        RoomAvailability saved = roomAvailabilityRepository.save(booking);
        return mapToDTO(saved);
    }

    private RoomResponse mapToRoomResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .capacity(room.getCapacity())
                .build();
    }

    private RoomAvailabilityDTO mapToDTO(RoomAvailability availability) {
        return RoomAvailabilityDTO.builder()
                .id(availability.getId())
                .roomId(availability.getRoom().getId())
                .roomName(availability.getRoom().getName())
                .startDate(availability.getStartDate())
                .endDate(availability.getEndDate())
                .purpose(availability.getPurpose())
                .status(availability.getStatus())
                .userId(availability.getUser() != null ? availability.getUser().getId() : null)
                .userName(availability.getUser() != null ? availability.getUser().getName() : null)
                .build();
    }
}
