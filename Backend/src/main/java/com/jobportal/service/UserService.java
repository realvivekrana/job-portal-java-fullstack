package com.jobportal.service;

import com.jobportal.dto.response.PageResponse;
import com.jobportal.dto.response.UserResponse;
import com.jobportal.entity.Role;

public interface UserService {

    /** Admin user list. Role and keyword (name or email) filters are optional. */
    PageResponse<UserResponse> search(Role role, String keyword, int page, int size);

    UserResponse getById(Long id);

    /** Enable or disable an account. Disabled users cannot log in and their token stops working. */
    UserResponse setActive(Long adminId, Long userId, boolean active);
}