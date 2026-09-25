package com.lunar.habitat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class HabitatZoneRequest {

    @NotBlank(message = "Zone code is required")
    @Size(max = 50, message = "Code must be at most 50 characters")
    private String code;

    @NotBlank(message = "Zone name is required")
    @Size(max = 150, message = "Name must be at most 150 characters")
    private String name;

    private String description;
    private String locationDescription;
    private String status = "OPERATIONAL";

    public HabitatZoneRequest() {}

    public HabitatZoneRequest(String code, String name, String description, String locationDescription) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.locationDescription = locationDescription;
        this.status = "OPERATIONAL";
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocationDescription() {
        return locationDescription;
    }

    public void setLocationDescription(String locationDescription) {
        this.locationDescription = locationDescription;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
