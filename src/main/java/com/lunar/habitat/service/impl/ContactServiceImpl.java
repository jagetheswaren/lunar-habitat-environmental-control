package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.ContactRequest;
import com.lunar.habitat.entity.Contact;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.enums.ContactType;
import com.lunar.habitat.exception.DuplicateResourceException;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.repository.ContactRepository;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.ContactService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final AuditLogService auditLogService;

    public ContactServiceImpl(ContactRepository contactRepository, AuditLogService auditLogService) {
        this.contactRepository = contactRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public Contact createContact(ContactRequest request) {
        if (contactRepository.findByCode(request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Contact with code " + request.getCode() + " already exists");
        }

        Contact contact = new Contact(
                request.getCode(),
                request.getName(),
                request.getOrganizationName(),
                request.getContactType(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress()
        );
        if (request.getStatus() != null) {
            contact.setStatus(request.getStatus());
        }

        Contact saved = contactRepository.save(contact);
        auditLogService.log(AuditAction.CREATE, "Contact", saved.getId().toString(), "Created contact " + saved.getName());
        return saved;
    }

    @Override
    public Contact updateContact(Long id, ContactRequest request) {
        Contact contact = getContactById(id);

        if (!contact.getCode().equals(request.getCode()) && contactRepository.findByCode(request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Contact code " + request.getCode() + " is already taken");
        }

        contact.setCode(request.getCode());
        contact.setName(request.getName());
        contact.setOrganizationName(request.getOrganizationName());
        contact.setContactType(request.getContactType());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            contact.setStatus(request.getStatus());
        }

        Contact updated = contactRepository.save(contact);
        auditLogService.log(AuditAction.UPDATE, "Contact", updated.getId().toString(), "Updated contact " + updated.getName());
        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public Contact getContactById(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Contact getContactByCode(String code) {
        return contactRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with code: " + code));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Contact> getContactsByType(ContactType type) {
        return contactRepository.findByContactType(type);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Contact> searchContacts(ContactType type, String query, Pageable pageable) {
        return contactRepository.searchContacts(type, query, pageable);
    }

    @Override
    public void deleteContact(Long id) {
        Contact contact = getContactById(id);
        contactRepository.delete(contact);
        auditLogService.log(AuditAction.DELETE, "Contact", id.toString(), "Deleted contact " + contact.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public long countByType(ContactType type) {
        return contactRepository.countByContactType(type);
    }
}
