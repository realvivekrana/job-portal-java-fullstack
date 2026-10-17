package com.jobportal.service.impl;

import com.jobportal.dto.response.PageResponse;
import com.jobportal.dto.response.UserResponse;
import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.mapper.UserMapper;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.UserService;
import com.jobportal.util.Constants;
import com.jobportal.util.TextUtil;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> search(Role role, String keyword, int page, int size) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (role != null) {
                p.add(cb.equal(root.get("role"), role));
            }
            if (TextUtil.hasText(keyword)) {
                String like = TextUtil.likePattern(keyword);
                p.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like, '\\'),
                        cb.like(cb.lower(root.get("email")), like, '\\')));
            }
            return cb.and(p.toArray(new Predicate[0]));
        };

        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), Constants.MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<User> result = userRepository.findAll(spec, pageable);
        return PageResponse.from(result.map(UserMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return UserMapper.toResponse(find(id));
    }

    @Override
    @Transactional
    public UserResponse setActive(Long adminId, Long userId, boolean active) {
        if (adminId.equals(userId)) {
            throw new BadRequestException("You cannot change the status of your own account");
        }
        User user = find(userId);
        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admin accounts cannot be enabled or disabled here");
        }
        user.setActive(active);
        return UserMapper.toResponse(userRepository.save(user));
    }

    private User find(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }
}