package com.example.JavaMainService.requests;

public class RequestSql {
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

    public static final String countDepartmentRequests = """
            select count(*) from user_profiles p
            
            left join users u
            	on u.profile_id = p.id
            
            where u.request_status_admin = 'PENDING'
            """;

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
}
