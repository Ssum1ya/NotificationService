package com.example.JavaMainService.userProfile;

public class ProfileSql {

    public static final String getProfileByUserId = """
            select d.id as department_id, u.login, p.last_name, p.name, p.surname, p.username, p.communication, p.position, p.grade, d.name as department_name  from user_profiles p
            
            left join users u
            	on u.profile_id = p.id
            
            left join departament d
            	on d.id = u.departement_id
            
            where u.uuid = ?
            """;

    public static final String adminGetEmployeesByDepartment = """
            select u.uuid, p.last_name, p.name, p.position, p.grade, u.role  from user_profiles p
            
            left join users u
            	on u.profile_id = p.id
            
            left join departament d
            	on d.id = u.departement_id
            
            where d.id = ? and
            u.request_status_admin = 'APPROVED' and
            u.request_status_head = 'APPROVED'
            """;

    public static final String adminGetDepartmentRequests = """
            select u.uuid as user_id, p.last_name, p.name, p.surname, p.position, p.grade, u.request_status_head, d.id as department_id, d.name as department_name  from user_profiles p
            
            left join users u
            	on u.profile_id = p.id
            
            left join departament d
            	on d.id = u.departement_id
            
            where u.request_status_admin = 'PENDING'
            """;

    public static final String headGetDepartmentRequests = """
            select u.uuid as user_id, p.last_name, p.name, p.surname, p.position, p.grade, u.request_status_admin, d.id as department_id, d.name as department_name from user_profiles p
            
            left join users u
            	on u.profile_id = p.id
            
            left join departament d
            	on d.id = u.departement_id
            
            where u.request_status_head = 'PENDING' and u.departement_id = ?
            """;

    public static final String headGetEmployees = """
            select u.uuid as user_id, p.last_name, p.name, p.surname, p.position, p.grade, d.name as department_name, p.communication, p.username from user_profiles p
            
            left join users u
            	on u.profile_id = p.id
            
            left join departament d
            	on d.id = u.departement_id
            
            where u.login != ? and d.id = ? and u.request_status_admin = 'APPROVED' and
            u.request_status_head = 'APPROVED'
            """;

    public static final String headGetEmployeesForNotification = """
            select u.uuid as user_id, p.last_name, p.name, p.surname, p.position, p.grade from user_profiles p
            
            left join users u
            	on u.profile_id = p.id
            
            left join departament d
            	on d.id = u.departement_id
            
            where u.login != ? and d.id = ?  and u.request_status_admin = 'APPROVED' and
            u.request_status_head = 'APPROVED'
            """;

    public static final String getHeadEmployeesForNotify = """
            select u.uuid as user_id, p.last_name, p.name, p.surname, d.name as department_name from user_profiles p
            
            inner join users u
            	on u.profile_id = p.id
            
            inner join departament d
            	on d.head_id = u.uuid
            """;


    public static final String getProfileFromProducer = """
            select u.uuid as user_id, up.last_name, up.name, up.surname, up.grade, up.position, d.name as department_name  from user_profiles up
            
            full outer join users u
            	on u.profile_id = up.id
            
            full outer join departament d
            	on u.departement_id = d.id
            
            where u.login = ?
            """;

    public static final String getConsumerCommunication = """
            select communication, username from users u
            
            left join user_profiles up
            	on u.profile_id = up.id
            
            where u.uuid = ANY(?)
            """;

    public static final String getProducerName = """
            select CONCAT(up.last_name, ' ', up.name, ' ', up.surname) as from_name
            from user_profiles up
            
            join users u
            	on u.profile_id = up.id
            
            where u.uuid = ?
            """;
}
