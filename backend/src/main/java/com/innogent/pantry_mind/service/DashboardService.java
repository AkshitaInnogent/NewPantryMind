package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.response.*;

import java.util.Map;

public interface DashboardService {
    Map<String, Object> getDashboardStats(String username);
    FinancialSummaryDTO getFinancialSummary(String username);
    MostUsedIngredientsDTO getMostUsedIngredients(String username);
    CategoryBreakdownDTO getCategoryBreakdown(String username);
    MoneyFlowDTO getMoneyFlow(String username);
    ExpiryAlertSuccessDTO getExpiryAlertSuccess(String username);
    WasteStreakDTO getWasteStreak(String username);
    MonthlyProgressDTO getMonthlyProgress(String username);
}