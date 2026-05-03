package com.example.JavaMainService.message;

public class MessageSql {

    public static final String saveMessage = """
            INSERT INTO public.messages(
            	id, message, message_time, from_id, to_id, batch_id)
            	VALUES (?, ?, ?, ?, ?, ?);
            """;

    public static final String getSendingHistoryById = """
            SELECT
            	m.message_time,
                array_agg(
                    CONCAT(up.last_name, ' ', up.name, ' ', up.surname)
                ) AS recipients,
            	m.message
            FROM messages m
            JOIN users u
                ON u.uuid = m.to_id
            JOIN user_profiles up
                ON up.id = u.profile_id
            WHERE m.from_id = ?
            GROUP BY m.batch_id, m.message_time, m.message
            ORDER BY m.message_time;
            """;

    public static final String getNotificationHistory = """
            select m.message, m.message_time, CONCAT(up.last_name, ' ', up.name, ' ', up.surname) as from_name
            from messages m
            
            join users u
            	on u.uuid = m.from_id
            
            join user_profiles up
            	on up.id = u.profile_id
            
            where m.to_id = ?
            ORDER BY m.message_time
            """;
}
