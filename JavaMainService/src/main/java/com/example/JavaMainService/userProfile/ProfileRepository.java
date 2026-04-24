package com.example.JavaMainService.userProfile;

import com.example.JavaMainService.user.userEntity.RequestStatus;
import com.example.JavaMainService.userProfile.profileEntity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    @Query("select p from Profile p join fetch p.user join fetch p.user.department where p.user.department.id = :depId and p.user.requestStatusHead = :status and p.user.requestStatusAdmin = :status")
    List<Profile> getEmployeesByDepartmentId(@Param("depId") UUID depId, @Param("status") RequestStatus status);

    @Query("select p from Profile p join fetch p.user join fetch p.user.department where p.user.requestStatusAdmin = :status and p.user.requestStatusHead = :status")
    List<Profile> adminGetDepartmentRequests(@Param("status") RequestStatus status);

    @Query("select p from Profile p join fetch p.user join p.user.department where p.user.uuid = :id")
    Profile getProfileByUserId(UUID id);

    @Query("select p from Profile p join fetch p.user join fetch p.user.department where p.user.department.id = :id and p.user.requestStatusHead = :status")
    List<Profile> headGetDepartmentRequests(@Param("id") UUID depId, @Param("status") RequestStatus status);

    @Query(value = "select p from Profile p join fetch p.user join fetch p.user.department where p.user.department.id = :depId and p.user.requestStatusHead = :status and p.user.requestStatusAdmin = :status")
    List<Profile> headGetEmployeesByDepartmentId(@Param("depId") UUID depId, @Param("status") RequestStatus status);
}
