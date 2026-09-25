package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.ContactRequest;
import com.lunar.habitat.entity.Contact;
import com.lunar.habitat.enums.ContactType;
import com.lunar.habitat.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lunar/contacts")
@Tag(name = "Contacts", description = "Contact Master API for Customers and Vendors")
public class ContactApiController {

    private final ContactService contactService;

    public ContactApiController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    @Operation(summary = "Search Contacts", description = "Retrieves paginated list of contacts with optional filtering by type and search query")
    public ResponseEntity<Page<Contact>> searchContacts(
            @RequestParam(required = false) ContactType type,
            @RequestParam(required = false) String query,
            Pageable pageable) {
        return ResponseEntity.ok(contactService.searchContacts(type, query, pageable));
    }

    @GetMapping("/all")
    @Operation(summary = "List All Contacts", description = "Retrieves all active contacts")
    public ResponseEntity<List<Contact>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    @GetMapping("/customers")
    @Operation(summary = "List Customers", description = "Retrieves all registered customer contacts")
    public ResponseEntity<List<Contact>> getCustomers() {
        return ResponseEntity.ok(contactService.getContactsByType(ContactType.CUSTOMER));
    }

    @GetMapping("/vendors")
    @Operation(summary = "List Vendors", description = "Retrieves all registered vendor contacts")
    public ResponseEntity<List<Contact>> getVendors() {
        return ResponseEntity.ok(contactService.getContactsByType(ContactType.VENDOR));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Contact by ID", description = "Retrieves contact details by primary key ID")
    public ResponseEntity<Contact> getContactById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @PostMapping
    @Operation(summary = "Create Contact", description = "Registers a new customer or vendor in the system")
    public ResponseEntity<Contact> createContact(@Valid @RequestBody ContactRequest request) {
        Contact created = contactService.createContact(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Contact", description = "Modifies existing contact details")
    public ResponseEntity<Contact> updateContact(@PathVariable Long id, @Valid @RequestBody ContactRequest request) {
        return ResponseEntity.ok(contactService.updateContact(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Contact", description = "Removes a contact from the system")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}
