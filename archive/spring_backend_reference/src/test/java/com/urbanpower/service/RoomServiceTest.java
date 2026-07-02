package com.urbanpower.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.urbanpower.dto.room.*;
import com.urbanpower.entity.Room;
import com.urbanpower.entity.RoomAvailability;
import com.urbanpower.entity.User;
import com.urbanpower.exception.BadRequestException;
import com.urbanpower.exception.ResourceNotFoundException;
import com.urbanpower.repository.RoomAvailabilityRepository;
import com.urbanpower.repository.RoomRepository;
import com.urbanpower.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomAvailabilityRepository roomAvailabilityRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RoomService roomService;

    private Room room;
    private User user;

    @BeforeEach
    void setUp() {
        room = Room.builder()
                .id(1L)
                .name("Conference Room A")
                .capacity(10)
                .description("Main Conference Room")
                .build();

        user = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .build();
    }

    @Test
    void createRoom_Success() {
        RoomRequest request = new RoomRequest("Conference Room A", "Main Conference Room", 10);
        when(roomRepository.findByName(request.getName())).thenReturn(Optional.empty());
        when(roomRepository.save(any(Room.class))).thenReturn(room);

        RoomResponse response = roomService.createRoom(request);

        assertNotNull(response);
        assertEquals(room.getName(), response.getName());
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    void createRoom_DuplicateName_ThrowsBadRequest() {
        RoomRequest request = new RoomRequest("Conference Room A", "Main Conference Room", 10);
        when(roomRepository.findByName(request.getName())).thenReturn(Optional.of(room));

        assertThrows(BadRequestException.class, () -> roomService.createRoom(request));
        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    void checkAvailability_Available_Success() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 10, 10, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 10, 12, 0);

        when(roomRepository.existsById(1L)).thenReturn(true);
        when(roomAvailabilityRepository.findOverlappingBookings(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        RoomAvailabilityResponse response = roomService.checkAvailability(1L, start, end);

        assertTrue(response.isAvailable());
        assertTrue(response.getBookingConflicts().isEmpty());
    }

    @Test
    void checkAvailability_InvalidDates_ThrowsBadRequest() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 10, 12, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 10, 10, 0);
        when(roomRepository.existsById(1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> roomService.checkAvailability(1L, start, end));
    }

    @Test
    void checkAvailability_RoomNotFound_ThrowsResourceNotFound() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 10, 10, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 10, 12, 0);
        when(roomRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> roomService.checkAvailability(1L, start, end));
    }

    @Test
    void checkAvailability_Conflicts_Success() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 10, 10, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 10, 12, 0);

        RoomAvailability conflict = RoomAvailability.builder()
                .id(100L)
                .room(room)
                .startDate(start)
                .endDate(end)
                .purpose("Existing Booking")
                .build();

        when(roomRepository.existsById(1L)).thenReturn(true);
        when(roomAvailabilityRepository.findOverlappingBookings(1L, start, end))
                .thenReturn(List.of(conflict));
        when(roomAvailabilityRepository.findOverlappingBookings(eq(1L), eq(start.toLocalDate().atStartOfDay()), eq(end.toLocalDate().atTime(java.time.LocalTime.MAX))))
                .thenReturn(List.of(conflict));

        RoomAvailabilityResponse response = roomService.checkAvailability(1L, start, end);

        assertFalse(response.isAvailable());
        assertEquals(1, response.getBookingConflicts().size());
        assertEquals(1, response.getUnavailableSlots().size());
        assertEquals("Existing Booking", response.getBookingConflicts().get(0).getPurpose());
    }

    @Test
    void bookRoom_Success() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 10, 10, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 10, 12, 0);
        RoomAvailabilityRequest request = new RoomAvailabilityRequest(1L, start, end, 1L, "Team Meeting");

        RoomAvailability savedBooking = RoomAvailability.builder()
                .id(101L)
                .room(room)
                .startDate(start)
                .endDate(end)
                .user(user)
                .purpose("Team Meeting")
                .status("BOOKED")
                .build();

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(roomAvailabilityRepository.findOverlappingBookings(1L, start, end)).thenReturn(Collections.emptyList());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(roomAvailabilityRepository.save(any(RoomAvailability.class))).thenReturn(savedBooking);

        RoomAvailabilityDTO response = roomService.bookRoom(request);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals("Team Meeting", response.getPurpose());
        verify(roomAvailabilityRepository, times(1)).save(any(RoomAvailability.class));
    }

    @Test
    void bookRoom_DoubleBooking_ThrowsBadRequest() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 10, 10, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 10, 12, 0);
        RoomAvailabilityRequest request = new RoomAvailabilityRequest(1L, start, end, 1L, "Team Meeting");

        RoomAvailability conflict = RoomAvailability.builder()
                .id(100L)
                .room(room)
                .startDate(start)
                .endDate(end)
                .purpose("Conflicting Booking")
                .build();

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(roomAvailabilityRepository.findOverlappingBookings(1L, start, end)).thenReturn(List.of(conflict));

        assertThrows(BadRequestException.class, () -> roomService.bookRoom(request));
        verify(roomAvailabilityRepository, never()).save(any(RoomAvailability.class));
    }
}
