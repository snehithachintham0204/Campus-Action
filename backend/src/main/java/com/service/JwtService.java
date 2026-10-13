
package com.campusaction.backend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey = Keys.hmacShaKeyFor(
        "CampusActionDemoSecretKey2026MustBeAtLeast32Bytes"
            .getBytes(StandardCharsets.UTF_8)
    );

    public String generateToken(String email) {
        long currentTime = System.currentTimeMillis();

        return Jwts.builder()
            .subject(email)
            .issuedAt(new Date(currentTime))
            .expiration(new Date(currentTime + 86400000))
            .signWith(secretKey)
            .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }
}
