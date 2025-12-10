package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "kitchens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Kitchen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true)
    private String invitationCode;
    
    @Column(name = "alert_time_hour")
    private Integer alertTimeHour = 8; // Default 8 AM
    
    @Column(name = "alert_time_minute")
    private Integer alertTimeMinute = 0; // Default 0 minutes
    
    @Column(name = "alerts_enabled")
    private Boolean alertsEnabled = true;

    @OneToMany(mappedBy = "kitchen", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<User> users;
}
