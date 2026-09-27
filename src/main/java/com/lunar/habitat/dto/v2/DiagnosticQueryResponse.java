package com.lunar.habitat.dto.v2;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class DiagnosticQueryResponse {

    private String query;
    private LocalDateTime timestamp;
    private String answer;
    private String severity; // INFO, WARNING, CRITICAL, NOMINAL
    private List<String> keyEvidence;
    private List<String> suggestedActions;
    private Map<String, Object> telemetrySnapshot;

    public DiagnosticQueryResponse() {}

    public DiagnosticQueryResponse(String query, LocalDateTime timestamp, String answer, String severity,
                                   List<String> keyEvidence, List<String> suggestedActions,
                                   Map<String, Object> telemetrySnapshot) {
        this.query = query;
        this.timestamp = timestamp;
        this.answer = answer;
        this.severity = severity;
        this.keyEvidence = keyEvidence;
        this.suggestedActions = suggestedActions;
        this.telemetrySnapshot = telemetrySnapshot;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public List<String> getKeyEvidence() { return keyEvidence; }
    public void setKeyEvidence(List<String> keyEvidence) { this.keyEvidence = keyEvidence; }

    public List<String> getSuggestedActions() { return suggestedActions; }
    public void setSuggestedActions(List<String> suggestedActions) { this.suggestedActions = suggestedActions; }

    public Map<String, Object> getTelemetrySnapshot() { return telemetrySnapshot; }
    public void setTelemetrySnapshot(Map<String, Object> telemetrySnapshot) { this.telemetrySnapshot = telemetrySnapshot; }
}
