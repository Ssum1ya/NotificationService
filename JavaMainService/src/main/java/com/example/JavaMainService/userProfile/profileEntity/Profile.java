package com.example.JavaMainService.userProfile.profileEntity;

import com.example.JavaMainService.notifications.model.Communication;
import com.example.JavaMainService.user.userEntity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
public class Profile {
    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "lastName")
    private String lastName;

    @Column(name = "name")
    private String name;

    @Column(name = "surname")
    private String surname;

    @Column(name = "communication")
    @Enumerated(EnumType.STRING)
    private Communication communication;

    @Column(name = "username")
    private String username;

    @Column(name = "position")
    @Enumerated(EnumType.STRING)
    private Position position;

    @Column(name = "grade")
    @Enumerated(EnumType.STRING)
    private Grade grade;

    @JsonIgnore
    @OneToOne(mappedBy = "profile", cascade = CascadeType.ALL)
    private User user;

    public Profile(String lastName, String name, String surname, Communication communication, String username, Position position, Grade grade, User user) {
        this.lastName = lastName;
        this.name = name;
        this.surname = surname;
        this.communication = communication;
        this.username = username;
        this.position = position;
        this.grade = grade;
        this.user = user;
    }
}
