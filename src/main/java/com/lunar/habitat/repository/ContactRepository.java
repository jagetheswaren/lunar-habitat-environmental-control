package com.lunar.habitat.repository;

import com.lunar.habitat.entity.Contact;
import com.lunar.habitat.enums.ContactType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    Optional<Contact> findByCode(String code);
    List<Contact> findByContactType(ContactType contactType);
    long countByContactType(ContactType contactType);

    @Query("SELECT c FROM Contact c WHERE " +
           "(:contactType IS NULL OR c.contactType = :contactType) AND " +
           "(:query IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.organizationName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.code) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Contact> searchContacts(@Param("contactType") ContactType contactType,
                                 @Param("query") String query,
                                 Pageable pageable);
}
