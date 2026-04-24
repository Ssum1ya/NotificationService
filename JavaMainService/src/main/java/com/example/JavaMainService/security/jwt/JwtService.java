package com.example.JavaMainService.security.jwt;

import com.example.JavaMainService.departament.Department;
import com.example.JavaMainService.user.userEntity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {
    @Value("${JWTSECRET}")
    private String secretKey;

    public String generateAccessToken(User user) {
        UUID departmentId = null;

        Department department = user.getDepartment();
        if (department != null) {
            departmentId = department.getId();
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUuid());
        claims.put("role", user.getRole());
        claims.put("departmentId", departmentId);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getLogin())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() +  60 * 60 * 1000))
                .signWith(getSecretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .setSubject(user.getLogin())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() +  24 * 60 * 60 * 1000))
                .signWith(getSecretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSecretKey() {
        byte[] key = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(key);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolvers) {
        final Claims claims = extractAllClaims(token);
        return claimsResolvers.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser().setSigningKey(getSecretKey()).parseClaimsJws(token)
                .getBody();
    }

    public String extractLogin(String token) {
        return extractClaim(token, claims -> claims.getSubject());
    }

    public String extractDepartmentId(String token) {
        return extractClaim(token, claims -> claims.get("departmentId", String.class));
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String emails = extractLogin(token);
        return (emails.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }
}
