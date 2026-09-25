package com.lunar.habitat.controller.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lunar.habitat.dto.request.ContactRequest;
import com.lunar.habitat.entity.Contact;
import com.lunar.habitat.enums.ContactType;
import com.lunar.habitat.service.ContactService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ContactApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ContactService contactService;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/lunar/contacts/customers returns 200 OK and list of customer contacts")
    void testGetCustomersSuccess() throws Exception {
        Contact customer = new Contact("CUST-001", "Selene Mining Corp", "Selene Mining Corp", ContactType.CUSTOMER, "accounts@selene.luna");
        customer.setId(1L);

        when(contactService.getContactsByType(ContactType.CUSTOMER)).thenReturn(Collections.singletonList(customer));

        mockMvc.perform(get("/api/v1/lunar/contacts/customers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("CUST-001"))
                .andExpect(jsonPath("$[0].name").value("Selene Mining Corp"))
                .andExpect(jsonPath("$[0].contactType").value("CUSTOMER"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/lunar/contacts with valid payload returns 201 Created")
    void testCreateContactSuccess() throws Exception {
        ContactRequest request = new ContactRequest();
        request.setCode("CUST-002");
        request.setName("Mare Tranquillitatis Excavation");
        request.setOrganizationName("MTE Industries");
        request.setContactType(ContactType.CUSTOMER);
        request.setEmail("contact@mte.luna");
        request.setPhone("+1-555-MOON-01");

        Contact saved = new Contact("CUST-002", "Mare Tranquillitatis Excavation", "MTE Industries", ContactType.CUSTOMER, "contact@mte.luna");
        saved.setId(2L);

        when(contactService.createContact(any(ContactRequest.class))).thenReturn(saved);

        mockMvc.perform(post("/api/v1/lunar/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.code").value("CUST-002"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/lunar/contacts with missing required fields returns 400 Bad Request")
    void testCreateContactValidationFailure() throws Exception {
        ContactRequest invalidRequest = new ContactRequest();
        // Missing name, organization, code, email

        mockMvc.perform(post("/api/v1/lunar/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
