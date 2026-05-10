package com.example.JavaMainService.notifications;

import com.example.JavaMainService.notifications.model.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaNotifyProducer {
    private final KafkaTemplate<String, NotificationDTO> kafkaTemplate;

    public void sendNotify(NotificationDTO notifications, String topic) {
        kafkaTemplate.send(topic, notifications);
        log.info("Notifications send to kafka, notifications: {}", notifications);
    }
}
