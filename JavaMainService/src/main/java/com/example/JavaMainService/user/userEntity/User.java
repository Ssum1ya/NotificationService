package com.example.JavaMainService.user;

import com.example.JavaMainService.departament.Department;
import com.example.JavaMainService.userProfile.profileEntity.Profile;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @UuidGenerator
    private UUID uuid;

    @Column(name = "login", unique = true)
    private String login;

    @Column(name = "password")
    private String password;

    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "requestStatusHead")
    @Enumerated(EnumType.STRING)
    private RequestStatus requestStatusHead;

    @Column(name = "requestStatusAdmin")
    @Enumerated(EnumType.STRING)
    private RequestStatus requestStatusAdmin;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinColumn(name = "departement_id")
    private Department department;

    public User(String login, String password) {
        this.login = login;
        this.password = password;
    }
}
