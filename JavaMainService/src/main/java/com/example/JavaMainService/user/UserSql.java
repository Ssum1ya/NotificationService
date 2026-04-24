package com.example.JavaMainService.user;

public class UserSql {

    public static final String adminApproveRequest =
                """
                update users
                set request_status_admin = 'APPROVED'
                where uuid = ?
                """;

    public static final String adminDeclineRequest =
            """
            update users
            set request_status_admin = 'DECLINED'
            where uuid = ?
            """;

    public static final String headApproveRequest =
            """
            update users
            set request_status_head = 'APPROVED'
            where uuid = ?
            """;

    public static final String headDeclineRequest =
            """
            update users
            set request_status_head = 'DECLINED'
            where uuid = ?
            """;

    public static final String makeHeadStatus = """
            update users
            set request_status_head = 'APPROVED',
            request_status_admin = 'APPROVED',
            role = 'Head'
            where uuid = ?
            """;
}
