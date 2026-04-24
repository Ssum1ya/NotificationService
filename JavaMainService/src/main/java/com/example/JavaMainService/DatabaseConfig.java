package com.example.JavaMainService;

import org.springframework.beans.factory.annotation.Value;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DbUtils {

    private static final String url = "jdbc:postgresql://db:5432/postgres";
    private static final String username = "postgres";
    private static final String password = "postgres";

    public static Connection getConnection() {
        Connection connection = null;

        try {
            connection = DriverManager.getConnection(url, username, password);
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return connection;
    }
}
