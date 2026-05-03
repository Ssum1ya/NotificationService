package com.example.JavaMainService;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class TestController {
    public static void main(String[] args) {
        LocalDateTime ldt = LocalDateTime.now();

        String odt = ldt
                .atZone(ZoneId.of("Asia/Yekaterinburg"))
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        System.err.println(odt);
    }

}
