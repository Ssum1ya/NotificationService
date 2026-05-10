package com.example.JavaMainService.user.domain;

public class UserSql {
    public static final String makeHeadStatus = """
            update users
            set request_status_head = 'APPROVED',
            request_status_admin = 'APPROVED',
            role = 'Head'
            where uuid = ?
            """;

    public static final String adminUpdateUser = """
            update users
            set request_status_admin = ?,
            request_status_head = ?,
            role = ?,
            departement_id = ?
            where uuid = ?
            """;

    public static final String headKickEmployee = """
            update users
            set departement_id = null
            where uuid = ?
            """;

    public static final String deleteDepartmentFromUser = """
            update users
            set departement_id = null
            where departement_id = ?
            """;
}
