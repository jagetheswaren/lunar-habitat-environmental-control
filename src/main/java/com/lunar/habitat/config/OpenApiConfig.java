package com.lunar.habitat.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "basicAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Autonomous Lunar Habitat Infrastructure API")
                        .version("v1.0")
                        .description("REST API platform for Lunar Habitat environmental monitoring, automated threshold response, resource reclamation, commercial billing, and double-entry general ledger accounting.")
                        .contact(new Contact()
                                .name("Project Leap Mission Control")
                                .email("mission-control@lunar-habitat.internal"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://spring.io")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .schemaRequirement(securitySchemeName, new SecurityScheme()
                        .name(securitySchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("basic"));
    }
}
