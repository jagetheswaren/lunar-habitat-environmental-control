package com.lunar.habitat.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class JournalEntryRequest {

    @NotNull(message = "Journal ID is required")
    private Long journalId;

    @NotNull(message = "Entry date is required")
    private LocalDate entryDate = LocalDate.now();

    @NotBlank(message = "Description is required")
    private String description;

    private String referenceType;
    private Long referenceId;

    @NotEmpty(message = "Journal entry must contain at least two lines")
    @Valid
    private List<JournalLineRequest> lines;

    public JournalEntryRequest() {}

    public Long getJournalId() {
        return journalId;
    }

    public void setJournalId(Long journalId) {
        this.journalId = journalId;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public List<JournalLineRequest> getLines() {
        return lines;
    }

    public void setLines(List<JournalLineRequest> lines) {
        this.lines = lines;
    }
}
