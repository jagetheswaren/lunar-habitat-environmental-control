package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.ProductRequest;
import com.lunar.habitat.entity.Product;
import com.lunar.habitat.enums.ProductType;
import com.lunar.habitat.service.ProductService;
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
@RequestMapping("/api/v1/lunar/products")
@Tag(name = "Products", description = "Product and Resource Master API")
public class ProductApiController {

    private final ProductService productService;

    public ProductApiController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Search Products", description = "Retrieves paginated list of products with optional type and name/SKU filter")
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam(required = false) ProductType type,
            @RequestParam(required = false) String query,
            Pageable pageable) {
        return ResponseEntity.ok(productService.searchProducts(type, query, pageable));
    }

    @GetMapping("/active")
    @Operation(summary = "List Active Products", description = "Retrieves all currently active goods and services")
    public ResponseEntity<List<Product>> getActiveProducts() {
        return ResponseEntity.ok(productService.getActiveProducts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Product by ID", description = "Retrieves product details by ID")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    @Operation(summary = "Create Product", description = "Registers a new product, resource, or service")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        Product created = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Product", description = "Modifies existing product details")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Product", description = "Removes a product from the master catalog")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
