package com.innogent.pantry_mind.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class StartupLogoutHandler {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Value("${spring.jpa.hibernate.ddl-auto:none}")
    private String ddlAuto;

    @EventListener(ApplicationReadyEvent.class)
    public void handleApplicationReady() {
        // Only send logout signal if database is being reset
        if ("create-drop".equals(ddlAuto)) {
            // Delay to allow WebSocket connections to establish
            new Thread(() -> {
                try {
                    Thread.sleep(2000); // Wait 2 seconds
                    // Send logout signal to all connected clients
                    messagingTemplate.convertAndSend("/topic/global", "DATABASE_RESET");
                    messagingTemplate.convertAndSend("/topic/logout", "FORCE_LOGOUT");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }).start();
        }
    }
}