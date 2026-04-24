package com.example.JavaMainService.departament;

import com.example.JavaMainService.user.User;
import com.example.JavaMainService.userProfile.Profile;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "departament")
@Getter
@Setter
@NoArgsConstructor
public class Departament {
    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "name")
    private String name;

    @OneToOne(cascade = CascadeType.MERGE, fetch = FetchType.LAZY)
    @JoinColumn(name = "head_id")
    private User head;

    @OneToMany(mappedBy = "departament")
    private List<Profile> employees;

    public Departament(String name) {
        this.name = name;
    }
}
