package com.example.demo;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
@Profile("!dev")
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            // Fallback for local development if needed, but in Railway it will exist
            throw new RuntimeException("DATABASE_URL environment variable is missing!");
        }

        HikariConfig config = new HikariConfig();
        
        try {
            // Format: postgresql://user:pass@host:port/database
            URI dbUri = new URI(databaseUrl);
            String username = dbUri.getUserInfo().split(":")[0];
            String password = dbUri.getUserInfo().split(":")[1];
            
            int port = dbUri.getPort();
            String host = dbUri.getHost();
            String path = dbUri.getPath();
            // If port is -1, we omit it from the JDBC URL so the driver uses the default (5432)
            String dbUrl = "jdbc:postgresql://" + host + (port == -1 ? "" : ":" + port) + path;

            config.setJdbcUrl(dbUrl);
            config.setUsername(username);
            config.setPassword(password);
            config.setDriverClassName("org.postgresql.Driver");
            
            // Connection pool optimization
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

            return new HikariDataSource(config);
        } catch (URISyntaxException e) {
            throw new RuntimeException("Failed to parse DATABASE_URL: " + databaseUrl, e);
        }
    }
}
