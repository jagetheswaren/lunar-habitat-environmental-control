package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.ProductRequest;
import com.lunar.habitat.entity.Product;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.enums.ProductType;
import com.lunar.habitat.exception.DuplicateResourceException;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.repository.ProductRepository;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;

    public ProductServiceImpl(ProductRepository productRepository, AuditLogService auditLogService) {
        this.productRepository = productRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public Product createProduct(ProductRequest request) {
        if (productRepository.findBySku(request.getSku()).isPresent()) {
            throw new DuplicateResourceException("Product with SKU " + request.getSku() + " already exists");
        }

        Product product = new Product(
                request.getSku(),
                request.getName(),
                request.getDescription(),
                request.getProductType(),
                request.getUnitOfMeasure(),
                request.getUnitPrice(),
                request.getTaxRate()
        );
        product.setActive(request.isActive());

        Product saved = productRepository.save(product);
        auditLogService.log(AuditAction.CREATE, "Product", saved.getId().toString(), "Created product " + saved.getName());
        return saved;
    }

    @Override
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);

        if (!product.getSku().equals(request.getSku()) && productRepository.findBySku(request.getSku()).isPresent()) {
            throw new DuplicateResourceException("Product SKU " + request.getSku() + " is already taken");
        }

        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setProductType(request.getProductType());
        product.setUnitOfMeasure(request.getUnitOfMeasure());
        product.setUnitPrice(request.getUnitPrice());
        product.setTaxRate(request.getTaxRate());
        product.setActive(request.isActive());

        Product updated = productRepository.save(product);
        auditLogService.log(AuditAction.UPDATE, "Product", updated.getId().toString(), "Updated product " + updated.getName());
        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> getProductsByType(ProductType type) {
        return productRepository.findByProductType(type);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> searchProducts(ProductType type, String query, Pageable pageable) {
        return productRepository.searchProducts(type, query, pageable);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
        auditLogService.log(AuditAction.DELETE, "Product", id.toString(), "Deleted product " + product.getName());
    }
}
