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

    @OneToMany(mappedBy = "kitchen", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<User> users;
}
