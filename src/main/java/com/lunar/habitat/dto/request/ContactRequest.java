package com.lunar.habitat.dto.request;

import com.lunar.habitat.enums.ContactType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ContactRequest {

    @NotBlank(message = "Contact code is required")
    @Size(max = 50, message = "Code must be at most 50 characters")
    private String code;

    @NotBlank(message = "Contact name is required")
    @Size(max = 150, message = "Name must be at most 150 characters")
    private String name;

    @NotBlank(message = "Organization name is required")
    @Size(max = 150, message = "Organization name must be at most 150 characters")
    private String organizationName;

    @NotNull(message = "Contact type (CUSTOMER or VENDOR) is required")
    private ContactType contactType;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    private String phone;
    private String address;
    private String status = "ACTIVE";

    public ContactRequest() {}

    public ContactRequest(String code, String name, String organizationName, ContactType contactType, String email, String phone, String address) {
        this.code = code;
        this.name = name;
        this.organizationName = organizationName;
        this.contactType = contactType;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.status = "ACTIVE";
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
}
