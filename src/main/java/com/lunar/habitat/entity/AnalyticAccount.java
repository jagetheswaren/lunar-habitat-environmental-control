package com.lunar.habitat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytic_accounts")
public class AnalyticAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habitat_zone_id")
    private HabitatZone habitatZone;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AnalyticAccount() {}

    public AnalyticAccount(String code, String name, HabitatZone habitatZone) {
        this.code = code;
        this.name = name;
        this.habitatZone = habitatZone;
        this.active = true;
    }

    public AnalyticAccount(String code, String name, String description) {
        this.code = code;
        this.name = name;
        this.active = true;
    }

    public AnalyticAccount(String code, String name) {
        this(code, name, (HabitatZone) null);
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

    public HabitatZone getHabitatZone() {
        return habitatZone;
    }

    public void setHabitatZone(HabitatZone habitatZone) {
        this.habitatZone = habitatZone;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
