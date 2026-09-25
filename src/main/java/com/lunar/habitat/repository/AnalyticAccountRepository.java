package com.lunar.habitat.repository;

import com.lunar.habitat.entity.AnalyticAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnalyticAccountRepository extends JpaRepository<AnalyticAccount, Long> {
    Optional<AnalyticAccount> findByCode(String code);
    Optional<AnalyticAccount> findByHabitatZoneId(Long habitatZoneId);
    List<AnalyticAccount> findByActiveTrue();
}
