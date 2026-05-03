package com.example.JavaMainService.message;

import com.example.JavaMainService.message.model.MessageHistoryDTO;
import com.example.JavaMainService.message.model.NotificationHistoryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class MessageJdbcRepository {
    private final JdbcTemplate jdbcTemplate;

    public void saveMessage(UUID fromId, String message, UUID toId, UUID batchId, LocalDateTime now) {
        jdbcTemplate.update(
                MessageSql.saveMessage,
                UUID.randomUUID(),
                message,
                now,
                fromId,
                toId,
                batchId
        );
    }

    public List<MessageHistoryDTO> getSendingHistoryById(UUID fromId) {
        return jdbcTemplate.query(MessageSql.getSendingHistoryById, (rs, rowNum) ->
                        new MessageHistoryDTO(
                                rs.getObject("message_time", OffsetDateTime.class)
                                        .atZoneSameInstant(ZoneId.of("Asia/Yekaterinburg"))
                                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                                (String[]) rs.getArray("recipients").getArray(),
                                rs.getString("message")
                        ),
                fromId
        );
    }

    public List<NotificationHistoryDTO> getNotificationHistoryByUserId(UUID toId) {
        return jdbcTemplate.query(MessageSql.getNotificationHistory, (rs, rowNum) ->
                        new NotificationHistoryDTO(
                                rs.getString("message"),
                                rs.getString("from_name"),
                                rs.getObject("message_time", OffsetDateTime.class)
                                        .atZoneSameInstant(ZoneId.of("Asia/Yekaterinburg"))
                                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        ),
                toId
        );
    }
}
