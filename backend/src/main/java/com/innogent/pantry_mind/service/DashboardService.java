package com.innogent.pantry_mind.service;

import java.util.Map;

public interface DashboardService {
    Map<String, Object> getDashboardStats(String username);
}