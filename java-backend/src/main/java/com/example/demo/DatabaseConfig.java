package com.example.demo;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

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
        config.setDriverClassName("org.postgresql.Driver");

        // If already in JDBC format, use directly
        if (databaseUrl.startsWith("jdbc:")) {
            config.setJdbcUrl(databaseUrl);
        } else {
            // Handle postgres:// or postgresql:// URLs
            // CRITICAL: Password may contain '@' (e.g. Yoyomiku@9337)
            // So we must split on the LAST '@', not the first!

            // Strip the scheme prefix
            String stripped = databaseUrl
                .replaceFirst("^postgres://", "")
                .replaceFirst("^postgresql://", "");

            // Split on LAST '@' to separate "user:pass" from "host:port/db"
            int lastAt = stripped.lastIndexOf('@');
            if (lastAt == -1) {
                throw new RuntimeException("DATABASE_URL missing '@' separator: " + databaseUrl);
            }

            String userInfo = stripped.substring(0, lastAt);    // "user:pass@word"
            String hostPart = stripped.substring(lastAt + 1);   // "host:5432/dbname"

            // Split userinfo on FIRST ':' only (password may contain ':' too)
            int firstColon = userInfo.indexOf(':');
            String username, password;
            if (firstColon == -1) {
                username = userInfo;
                password = "";
            } else {
                username = userInfo.substring(0, firstColon);
                password = userInfo.substring(firstColon + 1);  // preserves '@' in password
            }

            config.setJdbcUrl("jdbc:postgresql://" + hostPart);
            config.setUsername(username);
            config.setPassword(password);
        }

        // Connection pool settings
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("sslmode", "require");

        return new HikariDataSource(config);
    }
}
