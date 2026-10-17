package com.jobportal.controller;

import com.jobportal.dto.response.AuthResponse;
import com.jobportal.dto.response.UserResponse;
import com.jobportal.entity.Role;
import com.jobportal.exception.DuplicateResourceException;
import com.jobportal.exception.GlobalExceptionHandler;
import com.jobportal.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Plain MockMvc test (no Spring context, no security): checks request validation and error mapping. */
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AuthController(authService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private AuthResponse authResponse() {
        UserResponse user = new UserResponse(1L, "Cathy", "cathy@mail.com", Role.CANDIDATE, true, null);
        return new AuthResponse("token-123", "Bearer", 86400000L, user);
    }

    @Test
    void register_withValidBody_returns201AndToken() throws Exception {
        when(authService.register(any())).thenReturn(authResponse());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Cathy","email":"cathy@mail.com","password":"secret123","role":"CANDIDATE"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("token-123"))
                .andExpect(jsonPath("$.data.user.role").value("CANDIDATE"));
    }

    @Test
    void register_withInvalidBody_returns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"","email":"not-an-email","password":"123","role":"CANDIDATE"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.email").exists())
                .andExpect(jsonPath("$.data.password").exists());
    }

    @Test
    void register_withExistingEmail_returns409() throws Exception {
        when(authService.register(any())).thenThrow(new DuplicateResourceException("Email is already registered"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Cathy","email":"cathy@mail.com","password":"secret123","role":"CANDIDATE"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email is already registered"));
    }

    @Test
    void login_withValidCredentials_returns200() throws Exception {
        when(authService.login(any())).thenReturn(authResponse());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"cathy@mail.com","password":"secret123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").value("token-123"));
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        when(authService.login(any())).thenThrow(new BadCredentialsException("bad"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"cathy@mail.com","password":"wrong-pass"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }
}