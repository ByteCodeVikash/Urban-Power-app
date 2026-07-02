package com.urbanpower.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.urbanpower.dto.BookingRequest;
import com.urbanpower.dto.booking.BookingResponse;
import com.urbanpower.entity.Booking;
import com.urbanpower.entity.BookingStatus;
import com.urbanpower.entity.ServiceEntity;
import com.urbanpower.entity.User;
import com.urbanpower.entity.UserAddress;
import com.urbanpower.exception.ResourceNotFoundException;
import com.urbanpower.repository.BookingRepository;
import com.urbanpower.repository.ServiceRepository;
import com.urbanpower.repository.UserAddressRepository;
import com.urbanpower.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final UserAddressRepository userAddressRepository;

    public BookingResponse createBooking(BookingRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Service not found"));
        String finalAddress = request.getAddress();

        if (finalAddress == null || finalAddress.isBlank()) {

            List<UserAddress> addresses =
                    userAddressRepository.findByUserId(
                            request.getUserId()
                    );

            for (UserAddress ua : addresses) {
                if (Boolean.TRUE.equals(ua.getIsDefault())) {
                    finalAddress = ua.getFullAddress();
                    break;
                }
            }
        }

        Booking booking = Booking.builder()
                .user(user)
                .service(service)
                .date(request.getBookingDate())
                .timeSlot(request.getTimeSlot())
                //.address(request.getAddress())
                .address(finalAddress)
                .notes(request.getNotes())
                .price(service.getPrice())
                .status(BookingStatus.REQUESTED)
                .build();

        Booking saved = bookingRepository.save(booking);

        return new BookingResponse(
                saved.getId(),
                saved.getUser().getName(),          // if error use getFullName()
                saved.getService().getName(),
                saved.getDate().toString(),
                saved.getTimeSlot(),
                saved.getAddress(),
                saved.getStatus().name(),
                saved.getTechnician() != null
                        ? saved.getTechnician().getName()   // if error use getFullName()
                        : null
        );
    }

    public Booking assignTechnician(Long bookingId, Long technicianId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Technician not found"));

        booking.setTechnician(technician);
        booking.setStatus(BookingStatus.ASSIGNED);

        if (booking.getAddress() == null || booking.getAddress().isBlank()) {
            booking.setAddress(booking.getUser().getAddress());
        }

        if (booking.getPrice() == null && booking.getService() != null) {
            booking.setPrice(booking.getService().getPrice());
        }

        return bookingRepository.save(booking);
    }

    public Booking updateStatus(Long bookingId, String status) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.valueOf(status.toUpperCase()));

        return bookingRepository.save(booking);
    }
    
    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }
    
    public Booking cancelBooking(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.CANCELLED);

        return bookingRepository.save(booking);
    }
    
    public List<Booking> getTechnicianJobs(Long technicianId) {
        return bookingRepository.findByTechnicianId(technicianId);
    }
    
    public Booking completeBooking(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.COMPLETED);

        return bookingRepository.save(booking);
    }
    
    public List<String> getAvailableSlots(LocalDate date) {

        List<String> allSlots = List.of(
                "09:00 AM",
                "11:00 AM",
                "01:00 PM",
                "03:00 PM",
                "05:00 PM"
        );

        List<String> bookedSlots = bookingRepository.findByDate(date)
                .stream()
                .map(Booking::getTimeSlot)
                .toList();

        return allSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .toList();
    }
    
    // Rescheduling 
    
    public Booking rescheduleBooking(
            Long bookingId,
            java.time.LocalDate date,
            String timeSlot) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        booking.setDate(date);
        booking.setTimeSlot(timeSlot);

        return bookingRepository.save(booking);
    }
    
    // update liveStatus
    
    public Booking updateLiveStatus(
            Long bookingId,
            String liveStatus) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        booking.setLiveStatus(liveStatus);

        return bookingRepository.save(booking);
    }
    
}