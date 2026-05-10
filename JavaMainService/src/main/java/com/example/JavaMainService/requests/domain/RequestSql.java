package com.example.JavaMainService.requests.domain;

public class RequestSql {

    // Admin
    public static final String adminGetDepartmentRequests = """
            select u.uuid as user_id, p.last_name, p.name, p.surname, p.position, p.grade, u.request_status_head, d.id as department_id, d.name as department_name  from user_profiles p
            
            left join users u
            	on u.profile_id = p.id
            
            left join departament d
            	on d.id = u.departement_id
            
            where u.request_status_admin = 'PENDING'
            ORDER BY u.uuid
            LIMIT ? OFFSET ?
            """;

    public static final String countAdminGetDepartmentRequests = """
            select count(*) from user_profiles p
            
            left join users u
            	on u.profile_id = p.id
            
            where u.request_status_admin = 'PENDING'
            """;

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

    // Head
    public static final String headGetDepartmentRequests = """
            select u.uuid as user_id, p.last_name, p.name, p.surname, p.position, p.grade, u.request_status_admin, d.id as department_id, d.name as department_name from user_profiles p
            
            left join users u
            	on u.profile_id = p.id
            
            left join departament d
            	on d.id = u.departement_id
            
            where u.request_status_head = 'PENDING' and u.departement_id = ?
            ORDER BY u.uuid
            LIMIT ? OFFSET ?
            """;

    public static final String countHeadGetDepartmentRequests = """
            select count(*) from user_profiles p
            left join users u
            	on u.profile_id = p.id
            where u.request_status_head = 'PENDING' and u.departement_id = ?
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
}
