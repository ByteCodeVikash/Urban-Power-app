package com.urbanpower.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    //private final JwtFilter jwtFilter;
    private final JwtAuthenticationFilter jwtAuthFilter;
    

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // Public APIs
                .requestMatchers("/api/auth/**").permitAll()

                // Admin only
              // .requestMatchers("/api/admin/**").hasRole("ADMIN")
             //  .requestMatchers("/api/admin/**").authenticated()
                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers("/api/services/**").permitAll()
                .requestMatchers("/api/bookings/**").permitAll()
                .requestMatchers("/api/rooms", "/api/rooms/**").permitAll()
                .requestMatchers("/api/cart/**").permitAll()
                
                .requestMatchers(
                	    "/api/products/**",
                	    "/api/product-categories/**",
                	    "/api/orders/**"
                	).permitAll()
                
                

                // Technician only
                .requestMatchers("/api/technician/**").hasRole("TECHNICIAN")

                // Logged-in users
                .requestMatchers(
                    "/api/user/**",
                    "/api/kabadi/**",
                    "/api/services/**"
                ).authenticated()
                

                // Everything else
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtAuthFilter,
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}