package com.urbanpower.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.urbanpower.dto.AddressRequest;
import com.urbanpower.entity.User;
import com.urbanpower.entity.UserAddress;
import com.urbanpower.exception.ResourceNotFoundException;
import com.urbanpower.repository.UserAddressRepository;
import com.urbanpower.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserAddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    public UserAddress addAddress(AddressRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        UserAddress address = UserAddress.builder()
                .label(request.getLabel())
                .fullAddress(request.getFullAddress())
                .city(request.getCity())
                .pincode(request.getPincode())
                .isDefault(false)
                .user(user)
                .build();

        return addressRepository.save(address);
    }
    
    public void deleteAddress(Long addressId) {

        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Address not found"));

        addressRepository.delete(address);
    }

    public List<UserAddress> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }
    
    public UserAddress setDefaultAddress(Long userId, Long addressId) {

        List<UserAddress> addresses =
                addressRepository.findByUserId(userId);

        for (UserAddress address : addresses) {
            address.setIsDefault(false);
        }

        UserAddress selected = addressRepository.findById(addressId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Address not found"));

        selected.setIsDefault(true);

        addressRepository.saveAll(addresses);

        return addressRepository.save(selected);
    }
}