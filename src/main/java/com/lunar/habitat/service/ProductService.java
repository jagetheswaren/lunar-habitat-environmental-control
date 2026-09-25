package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.ProductRequest;
import com.lunar.habitat.entity.Product;
import com.lunar.habitat.enums.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ProductService {
    Product createProduct(ProductRequest request);
    Product updateProduct(Long id, ProductRequest request);
    Product getProductById(Long id);
    Product getProductBySku(String sku);
    List<Product> getActiveProducts();
    List<Product> getProductsByType(ProductType type);
    Page<Product> searchProducts(ProductType type, String query, Pageable pageable);
    void deleteProduct(Long id);
}
