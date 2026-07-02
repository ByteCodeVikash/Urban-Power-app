package com.urbanpower.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urbanpower.dto.BookingRequest;
import com.urbanpower.dto.booking.BookingResponse;
import com.urbanpower.dto.common.ApiResponse;
import com.urbanpower.entity.Booking;
import com.urbanpower.service.BookingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @RequestBody BookingRequest request) {

        BookingResponse response =
                bookingService.createBooking(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Booking created successfully",
                        response
                )
        );
    }

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<Booking>> assign(
            @RequestParam Long bookingId,
            @RequestParam Long technicianId) {

        Booking booking =
                bookingService.assignTechnician(
                        bookingId,
                        technicianId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Technician assigned successfully",
                        booking
                )
        );
    }

    @PutMapping("/status")
    public ResponseEntity<ApiResponse<Booking>> updateStatus(
            @RequestParam Long bookingId,
            @RequestParam String status) {

        Booking booking =
                bookingService.updateStatus(
                        bookingId,
                        status
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Booking status updated",
                        booking
                )
        );
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getUserBookings(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Bookings fetched successfully",
                        bookingService.getUserBookings(userId)
                )
        );
    }
    
    @PutMapping("/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(
            @RequestParam Long bookingId) {

        Booking booking = bookingService.cancelBooking(bookingId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Booking cancelled successfully",
                        booking
                )
        );
    }
    
    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getTechnicianJobs(
            @PathVariable Long technicianId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Jobs fetched successfully",
                        bookingService.getTechnicianJobs(technicianId)
                )
        );
    }
    
    @PutMapping("/complete")
    public ResponseEntity<ApiResponse<Booking>> completeBooking(
            @RequestParam Long bookingId) {

        Booking booking = bookingService.completeBooking(bookingId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Job completed successfully",
                        booking
                )
        );
    }
    
    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<String>>> getSlots(
            @RequestParam LocalDate date) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Available slots fetched",
                        bookingService.getAvailableSlots(date)
                )
        );
    }
    
    @PutMapping("/reschedule")
    public ResponseEntity<ApiResponse<Booking>> reschedule(
            @RequestParam Long bookingId,
            @RequestParam java.time.LocalDate date,
            @RequestParam String timeSlot) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Booking rescheduled successfully",
                        bookingService.rescheduleBooking(
                                bookingId,
                                date,
                                timeSlot
                        )
                )
        );
    }
    
    @PutMapping("/live-status")
    public ResponseEntity<ApiResponse<Booking>> updateLiveStatus(
            @RequestParam Long bookingId,
            @RequestParam String liveStatus) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Live status updated successfully",
                        bookingService.updateLiveStatus(
                                bookingId,
                                liveStatus
                        )
                )
        );
    }
    
}