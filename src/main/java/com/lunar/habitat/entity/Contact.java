package com.lunar.habitat.entity;

import com.lunar.habitat.enums.ContactType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "organization_name", nullable = false, length = 150)
    private String organizationName;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_type", nullable = false, length = 20)
    private ContactType contactType;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Contact() {}

    public Contact(String code, String name, String organizationName, ContactType contactType, String email, String phone, String address) {
        this.code = code;
        this.name = name;
        this.organizationName = organizationName;
        this.contactType = contactType;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.status = "ACTIVE";
    }

    public Contact(String code, String name, String organizationName, ContactType contactType, String email) {
        this(code, name, organizationName, contactType, email, null, null);
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public ContactType getContactType() {
        return contactType;
    }

    public void setContactType(ContactType contactType) {
        this.contactType = contactType;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
