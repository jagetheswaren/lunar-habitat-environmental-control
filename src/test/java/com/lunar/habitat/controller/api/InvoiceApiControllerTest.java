package com.lunar.habitat.controller.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lunar.habitat.dto.request.ConsumptionBillingRequest;
import com.lunar.habitat.entity.Invoice;
import com.lunar.habitat.enums.InvoiceStatus;
import com.lunar.habitat.service.InvoiceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InvoiceApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InvoiceService invoiceService;

    @Test
    @WithMockUser(roles = "ACCOUNTANT")
    @DisplayName("POST /api/v1/lunar/invoices/consumption-bill generates invoice from telemetry readings and returns 201 Created")
    void testGenerateConsumptionInvoice() throws Exception {
        ConsumptionBillingRequest req = new ConsumptionBillingRequest();
        req.setCustomerId(1L);
        req.setHabitatZoneId(1L);
        req.setBillingPeriodStart(LocalDate.of(2026, 1, 1));
        req.setBillingPeriodEnd(LocalDate.of(2026, 1, 31));

        Invoice invoice = new Invoice();
        invoice.setId(100L);
        invoice.setInvoiceNumber("INV-20260131-A1B2");
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setTotal(new BigDecimal("8100.00"));

        when(invoiceService.generateConsumptionInvoice(any(ConsumptionBillingRequest.class))).thenReturn(invoice);

        mockMvc.perform(post("/api/v1/lunar/invoices/consumption-bill")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.invoiceNumber").value("INV-20260131-A1B2"))
                .andExpect(jsonPath("$.total").value(8100.00))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    @WithMockUser(roles = "ACCOUNTANT")
    @DisplayName("POST /api/v1/lunar/invoices/{id}/post transitions invoice to POSTED and posts ledger entry")
    void testPostInvoiceEndpoint() throws Exception {
        Invoice posted = new Invoice();
        posted.setId(100L);
        posted.setInvoiceNumber("INV-20260131-A1B2");
        posted.setStatus(InvoiceStatus.POSTED);
        posted.setTotal(new BigDecimal("8100.00"));

        when(invoiceService.postInvoice(eq(100L))).thenReturn(posted);

        mockMvc.perform(post("/api/v1/lunar/invoices/100/post")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.status").value("POSTED"));
    }
}
