package com.lunar.habitat.controller.web;

import com.lunar.habitat.dto.request.*;
import com.lunar.habitat.entity.*;
import com.lunar.habitat.enums.*;
import com.lunar.habitat.service.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping
public class WebCommercialController {

    private final ContactService contactService;
    private final ProductService productService;
    private final PurchaseOrderService purchaseOrderService;
    private final VendorBillService vendorBillService;
    private final SalesOrderService salesOrderService;
    private final InvoiceService invoiceService;
    private final PaymentService paymentService;
    private final HabitatZoneService habitatZoneService;

    public WebCommercialController(ContactService contactService,
                                   ProductService productService,
                                   PurchaseOrderService purchaseOrderService,
                                   VendorBillService vendorBillService,
                                   SalesOrderService salesOrderService,
                                   InvoiceService invoiceService,
                                   PaymentService paymentService,
                                   HabitatZoneService habitatZoneService) {
        this.contactService = contactService;
        this.productService = productService;
        this.purchaseOrderService = purchaseOrderService;
        this.vendorBillService = vendorBillService;
        this.salesOrderService = salesOrderService;
        this.invoiceService = invoiceService;
        this.paymentService = paymentService;
        this.habitatZoneService = habitatZoneService;
    }

    // --- Contacts ---
    @GetMapping("/contacts")
    public String contactsPage(@RequestParam(defaultValue = "0") int page,
                               @RequestParam(required = false) ContactType type,
                               Model model) {
        Page<Contact> contactsPage = contactService.searchContacts(type, null, PageRequest.of(page, 20));
        model.addAttribute("contactsPage", contactsPage);
        model.addAttribute("selectedType", type);
        model.addAttribute("contactRequest", new ContactRequest());
        model.addAttribute("activeNav", "contacts");
        return "commercial/contacts";
    }

    @PostMapping("/contacts")
    public String createContact(@ModelAttribute ContactRequest request, RedirectAttributes redirectAttributes) {
        try {
            contactService.createContact(request);
            redirectAttributes.addFlashAttribute("successMessage", "Contact registered successfully.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/contacts";
    }

    // --- Products ---
    @GetMapping("/products")
    public String productsPage(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<Product> productsPage = productService.searchProducts(null, null, PageRequest.of(page, 20));
        model.addAttribute("productsPage", productsPage);
        model.addAttribute("productRequest", new ProductRequest());
        model.addAttribute("activeNav", "products");
        return "commercial/products";
    }

    @PostMapping("/products")
    public String createProduct(@ModelAttribute ProductRequest request, RedirectAttributes redirectAttributes) {
        try {
            productService.createProduct(request);
            redirectAttributes.addFlashAttribute("successMessage", "Product registered successfully.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/products";
    }

    // --- Purchase Orders ---
    @GetMapping("/purchase-orders")
    public String purchaseOrdersPage(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<PurchaseOrder> poPage = purchaseOrderService.searchPurchaseOrders(null, null, null, PageRequest.of(page, 20));
        List<Contact> vendors = contactService.getContactsByType(ContactType.VENDOR);
        List<Product> products = productService.getActiveProducts();

        model.addAttribute("poPage", poPage);
        model.addAttribute("vendors", vendors);
        model.addAttribute("products", products);
        model.addAttribute("activeNav", "purchase-orders");
        return "commercial/purchase-orders";
    }

    @PostMapping("/purchase-orders/{id}/submit")
    public String submitPo(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            purchaseOrderService.submitPurchaseOrder(id);
            redirectAttributes.addFlashAttribute("successMessage", "Purchase order submitted.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/purchase-orders";
    }

    @PostMapping("/purchase-orders/{id}/approve")
    public String approvePo(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            purchaseOrderService.approvePurchaseOrder(id);
            redirectAttributes.addFlashAttribute("successMessage", "Purchase order approved.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/purchase-orders";
    }

    // --- Vendor Bills ---
    @GetMapping("/vendor-bills")
    public String vendorBillsPage(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<VendorBill> billsPage = vendorBillService.searchVendorBills(null, null, null, PageRequest.of(page, 20));
        model.addAttribute("billsPage", billsPage);
        model.addAttribute("activeNav", "vendor-bills");
        return "commercial/vendor-bills";
    }

    @PostMapping("/vendor-bills/{id}/post")
    public String postVendorBill(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            vendorBillService.postVendorBill(id);
            redirectAttributes.addFlashAttribute("successMessage", "Vendor bill posted to General Ledger (Scrubber Maintenance / Creditors).");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/vendor-bills";
    }

    // --- Sales Orders ---
    @GetMapping("/sales-orders")
    public String salesOrdersPage(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<SalesOrder> soPage = salesOrderService.searchSalesOrders(null, null, null, PageRequest.of(page, 20));
        List<Contact> customers = contactService.getContactsByType(ContactType.CUSTOMER);
        List<HabitatZone> zones = habitatZoneService.getAllZones();
        List<Product> products = productService.getActiveProducts();

        model.addAttribute("soPage", soPage);
        model.addAttribute("customers", customers);
        model.addAttribute("zones", zones);
        model.addAttribute("products", products);
        model.addAttribute("activeNav", "sales-orders");
        return "commercial/sales-orders";
    }

    @PostMapping("/sales-orders/{id}/confirm")
    public String confirmSo(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            salesOrderService.confirmSalesOrder(id);
            redirectAttributes.addFlashAttribute("successMessage", "Sales order confirmed.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/sales-orders";
    }

    // --- Invoices ---
    @GetMapping("/invoices")
    public String invoicesPage(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<Invoice> invoicesPage = invoiceService.searchInvoices(null, null, null, null, null, PageRequest.of(page, 20));
        List<Contact> customers = contactService.getContactsByType(ContactType.CUSTOMER);
        List<HabitatZone> zones = habitatZoneService.getAllZones();

        model.addAttribute("invoicesPage", invoicesPage);
        model.addAttribute("customers", customers);
        model.addAttribute("zones", zones);
        model.addAttribute("activeNav", "invoices");
        return "commercial/invoices";
    }

    @PostMapping("/invoices/consumption-bill")
    public String generateConsumptionBill(@ModelAttribute ConsumptionBillingRequest request, RedirectAttributes redirectAttributes) {
        try {
            Invoice inv = invoiceService.generateConsumptionInvoice(request);
            redirectAttributes.addFlashAttribute("successMessage", "Generated telemetry utility invoice " + inv.getInvoiceNumber() + " Total: ₹" + inv.getTotal());
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/invoices";
    }

    @PostMapping("/invoices/{id}/post")
    public String postInvoice(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            invoiceService.postInvoice(id);
            redirectAttributes.addFlashAttribute("successMessage", "Invoice posted to General Ledger (Receivable / Revenue). Total Debit == Total Credit verified.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/invoices";
    }

    // --- Payments ---
    @GetMapping("/payments")
    public String paymentsPage(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<Payment> paymentsPage = paymentService.searchPayments(null, null, null, null, PageRequest.of(page, 20));
        List<Invoice> postedInvoices = invoiceService.getAllInvoices().stream()
                .filter(i -> i.getStatus() == InvoiceStatus.POSTED || i.getStatus() == InvoiceStatus.PARTIALLY_PAID)
                .toList();
        List<Contact> contacts = contactService.getAllContacts();

        model.addAttribute("paymentsPage", paymentsPage);
        model.addAttribute("postedInvoices", postedInvoices);
        model.addAttribute("contacts", contacts);
        model.addAttribute("paymentRequest", new PaymentRequest());
        model.addAttribute("activeNav", "payments");
        return "commercial/payments";
    }

    @PostMapping("/payments")
    public String recordPayment(@ModelAttribute PaymentRequest request, RedirectAttributes redirectAttributes) {
        try {
            Payment p = paymentService.recordPayment(request);
            redirectAttributes.addFlashAttribute("successMessage", "Payment recorded successfully (Ref: " + p.getPaymentReference() + "). Cash/Bank double-entry journal created.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/payments";
    }
}
