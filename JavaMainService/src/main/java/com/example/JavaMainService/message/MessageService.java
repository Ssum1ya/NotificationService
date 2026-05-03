package com.example.JavaMainService.message;

import com.example.JavaMainService.message.model.MessageHistoryDTO;
import com.example.JavaMainService.message.model.NotificationHistoryDTO;
import com.example.JavaMainService.notifications.model.request.NotifyRequestDTO;
import com.example.JavaMainService.userProfile.ProfileJdbcRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {
    private final MessageJdbcRepository messageJdbcRepository;
    private final ProfileJdbcRepository profileJdbcRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String REDIS_PREFIX_KEY = "new_message:";
    private final ObjectMapper objectMapper;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void saveMessage(NotifyRequestDTO request, LocalDateTime now) {
        UUID batchId = UUID.randomUUID();

        List<UUID> userIds = request.listUserIds();
        for (UUID id: userIds) {
            messageJdbcRepository.saveMessage(request.fromId(), request.message(), id, batchId, now);
        }
    }

    public void saveMessageToCache(NotifyRequestDTO requestDTO, LocalDateTime now) {
        String message = requestDTO.message();
        String fromName = profileJdbcRepository.getProducerName(requestDTO.fromId())
                .orElseThrow(() -> new RuntimeException("Producer name with id %s not found".formatted(requestDTO.fromId())));
        String formatNow = now
                .atZone(ZoneId.of("Asia/Yekaterinburg"))
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        List<UUID> userIds = requestDTO.listUserIds();
        for (UUID id: userIds) {
            String key = REDIS_PREFIX_KEY + id;
            NotificationHistoryDTO notification = new NotificationHistoryDTO(message, fromName, formatNow);
            Long size = redisTemplate.opsForList().leftPush(key, notification);
            if (size != null && size == 1) {
                redisTemplate.expire(key, Duration.ofHours(24));
            }
        }
    }

    public List<MessageHistoryDTO> getSendingHistoryById(UUID userId) {
        return messageJdbcRepository.getSendingHistoryById(userId);
    }

    public List<NotificationHistoryDTO> getNotificationHistoryByUserId(UUID userId) {
        return messageJdbcRepository.getNotificationHistoryByUserId(userId);
    }

    public List<NotificationHistoryDTO> getYoungNotifications(UUID userId) {
        List<Object> objectNotificationList =
                redisTemplate.opsForList().range(REDIS_PREFIX_KEY + userId, 0, -1);

        redisTemplate.delete(REDIS_PREFIX_KEY + userId);

        return objectNotificationList.stream()
                .map(obj -> objectMapper.convertValue(obj, NotificationHistoryDTO.class))
                .toList();
    }
}
