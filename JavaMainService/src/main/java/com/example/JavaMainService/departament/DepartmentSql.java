package com.example.JavaMainService.departament;

public class DepartmentSql {
    public static final String getAllDepartments =
            """
            select
                d.id,
                d.name as department_name,
                CONCAT(up.name, ' ', up.last_name, ' ', up.surname) as head_name,
                count(u2.uuid) as count_employees
            from departament d
            
            left join users u
                on u.uuid = d.head_id
            
            left join user_profiles up
                on up.id = u.profile_id
            
            left join users u2
                on u2.departement_id = d.id
               and u2.request_status_admin = 'APPROVED'
               and u2.request_status_head = 'APPROVED'
            
            group by d.id, d.name, up.name, up.last_name, up.surname
            """;

    public static final String getAllDepartmentsName = "select id, name from departament";

    public static final String getDepartmentByName = "select id from departament where name = ?";

    public static final String makeDepartmentHead = """
            update departament
            set head_id = ?
            where id = (select departement_id from users where uuid = ?)
            """;

    public static final String getHeadIdByUserId = """
            select head_id from departament
            where id = (select departement_id from users where uuid = ?)
            """;
}
