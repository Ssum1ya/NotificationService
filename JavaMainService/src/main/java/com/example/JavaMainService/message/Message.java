package com.example.JavaMainService.message;

import com.example.JavaMainService.user.userEntity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
public class Message {
    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "message")
    private String message;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_id")
    private User from;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_id")
    private User to;

    public Message(String message, User from, User to) {
        this.message = message;
        this.from = from;
        this.to = to;
    }
}
