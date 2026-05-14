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
            throw new RuntimeException("DATABASE_URL environment variable is missing!");
        }

        HikariConfig config = new HikariConfig();
        
        try {
            // If Render provides a jdbc:postgresql:// style URL directly, use it as-is
            if (databaseUrl.startsWith("jdbc:")) {
                config.setJdbcUrl(databaseUrl);
                config.setDriverClassName("org.postgresql.Driver");
            } else {
                // Format: postgres://user:pass@host:port/database OR postgresql://user:pass@host:port/database
                // Normalize scheme to make URI parsing work
                String normalizedUrl = databaseUrl
                    .replace("postgres://", "postgresql://");
                
                URI dbUri = new URI(normalizedUrl);
                
                String userInfo = dbUri.getUserInfo();
                if (userInfo == null) {
                    throw new RuntimeException(
                        "DATABASE_URL is missing credentials (user:pass). Got: " + databaseUrl
                    );
                }
                
                String[] userParts = userInfo.split(":", 2);
                String username = userParts[0];
                String password = userParts.length > 1 ? userParts[1] : "";
                
                int port = dbUri.getPort();
                String host = dbUri.getHost();
                String path = dbUri.getPath();
                String jdbcUrl = "jdbc:postgresql://" + host + (port == -1 ? "" : ":" + port) + path;

                config.setJdbcUrl(jdbcUrl);
                config.setUsername(username);
                config.setPassword(password);
                config.setDriverClassName("org.postgresql.Driver");
            }
            
            // Connection pool optimization
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
            // SSL required for Render PostgreSQL
            config.addDataSourceProperty("sslmode", "require");

            return new HikariDataSource(config);
        } catch (URISyntaxException e) {
            throw new RuntimeException("Failed to parse DATABASE_URL: " + databaseUrl, e);
        }
    }
}
