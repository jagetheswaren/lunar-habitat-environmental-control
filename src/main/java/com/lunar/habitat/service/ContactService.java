package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.ContactRequest;
import com.lunar.habitat.entity.Contact;
import com.lunar.habitat.enums.ContactType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ContactService {
    Contact createContact(ContactRequest request);
    Contact updateContact(Long id, ContactRequest request);
    Contact getContactById(Long id);
    Contact getContactByCode(String code);
    List<Contact> getAllContacts();
    List<Contact> getContactsByType(ContactType type);
    Page<Contact> searchContacts(ContactType type, String query, Pageable pageable);
    void deleteContact(Long id);
    long countByType(ContactType type);
}
