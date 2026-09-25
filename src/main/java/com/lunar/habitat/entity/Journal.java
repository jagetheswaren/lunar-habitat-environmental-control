package com.lunar.habitat.entity;

import com.lunar.habitat.enums.JournalType;
import jakarta.persistence.*;

@Entity
@Table(name = "journals")
public class Journal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "journal_type", nullable = false, length = 20)
    private JournalType journalType;

    @Column(nullable = false)
    private boolean active = true;

    public Journal() {}

    public Journal(String code, String name, JournalType journalType) {
        this.code = code;
        this.name = name;
        this.journalType = journalType;
        this.active = true;
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

    public JournalType getJournalType() {
        return journalType;
    }

    public void setJournalType(JournalType journalType) {
        this.journalType = journalType;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
