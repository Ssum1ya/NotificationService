package com.example.JavaMainService.message;

import com.example.JavaMainService.user.userEntity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_id")
    private User from;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_id")
    private User to;

    @Column(name = "messageTime")
    private LocalDateTime messageTime;

    @Column(name = "batchId")
    private UUID batchId;

    public Message(String message, User from, User to, LocalDateTime time) {
        this.message = message;
        this.from = from;
        this.to = to;
        this.messageTime = time;
    }
}
