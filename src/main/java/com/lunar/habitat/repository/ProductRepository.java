package com.lunar.habitat.repository;

import com.lunar.habitat.entity.Product;
import com.lunar.habitat.enums.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    List<Product> findByActiveTrue();
    List<Product> findByProductType(ProductType productType);

    @Query("SELECT p FROM Product p WHERE " +
           "(:type IS NULL OR p.productType = :type) AND " +
           "(:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("type") ProductType type,
                                 @Param("query") String query,
                                 Pageable pageable);
}
