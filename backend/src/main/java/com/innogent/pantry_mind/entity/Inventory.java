package com.innogent.pantry_mind.entity;

import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.innogent.pantry_mind.util.NameNormalizationUtil;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Data
@Entity
@Table(name = "inventory", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"normalized_name", "category_id", "unit_id", "kitchen_id"})
})
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "normalized_name")
    private String normalizedName;
    
    @PrePersist
    @PreUpdate
    public void updateNormalizedName() {
        if (this.name != null) {
            this.normalizedName = NameNormalizationUtil.normalizeName(this.name);
        }
        setDefaultMinStock();
    }
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;
    
    @Column(name = "kitchen_id", nullable = false)
    private Long kitchenId;
    
    @Column(name = "total_quantity", nullable = false)
    private Long totalQuantity = 0L;
    
    @Column(name = "item_count", nullable = false)
    @Builder.Default
    private Integer itemCount = 0;
    
    @Column(name = "min_expiry_days_alert")
    @Builder.Default
    private Integer minExpiryDaysAlert = 3;
    
    @Column(name = "min_stock")
    private Long minStock;
    
    public void setDefaultMinStock() {
        if (this.minStock == null) {
            if (this.unit != null) {
                String unitName = this.unit.getName().toLowerCase();
                if (unitName.contains("gm") || unitName.contains("gram")) {
                    this.minStock = 250L;
                } else if (unitName.contains("ml") || unitName.contains("liter")) {
                    this.minStock = 250L;
                } else if (unitName.contains("piece") || unitName.contains("pcs")) {
                    this.minStock = 5L;
                } else {
                    this.minStock = 250L; // default
                }
            } else {
                this.minStock = 250L; // default when unit is null
            }
        }
    }
    
    @OneToMany(mappedBy = "inventory", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InventoryItem> items;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private Date createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Date updatedAt;
}