package com.example.JavaMainService.departament;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartamentRepository extends JpaRepository<Departament, UUID> {

    Optional<Departament> findByName(String name);

    @Query("SELECT d FROM Departament d LEFT JOIN FETCH d.head left join fetch d.employees left join fetch d.employees.user")
    List<Departament> getAllDepartaments();
}
