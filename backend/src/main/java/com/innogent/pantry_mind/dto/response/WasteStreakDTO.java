package com.innogent.pantry_mind.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasteStreakDTO {
    private Integer currentStreak;
    private Integer longestStreak;
    private LocalDate streakStartDate;
    private Integer daysToNextMilestone;
    private Integer nextMilestone;
    private List<RecentWin> recentWins;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentWin {
        private LocalDate date;
        private String itemName;
        private BigDecimal valueSaved;
        private String action;
    }
}