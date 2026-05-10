package com.example.JavaMainService.user;

import com.example.JavaMainService.user.userEntity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByLogin(String login);

    @Query(value = "select COUNT(*) from users where login = :login and profile_id is null", nativeQuery = true)
    Integer checkAccount(@Param("login") String login);

    @Query(value = "select u from User u join fetch u.profile join fetch u.department where u.profile.id = :id")
    User getUserByProfileId(@Param("id") UUID profileId);

    @Query(value = "select u from User u join fetch u.department where u.uuid = :id")
    User getUserByIdWithDepartment(@Param("id") UUID id);
}
