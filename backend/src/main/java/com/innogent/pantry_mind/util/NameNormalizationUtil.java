package com.innogent.pantry_mind.util;

import java.text.Normalizer;
import java.util.List;

public class NameNormalizationUtil {
    
    public static String normalizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "";
        }
        
        // Convert to lowercase and trim
        String normalized = name.toLowerCase().trim();
        
        // Remove accents and special characters
        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "");
        
        // Remove non-alphabetic characters except spaces
        normalized = normalized.replaceAll("[^a-z\\s]", "");
        
        // Remove extra spaces
        normalized = normalized.replaceAll("\\s+", " ").trim();
        
        // Remove trailing 's' for plural
        if (normalized.endsWith("s") && normalized.length() > 1) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        
        return normalized;
    }
    
    public static int levenshteinDistance(String a, String b) {
        if (a == null || b == null) return Integer.MAX_VALUE;
        
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        
        for (int i = 0; i <= a.length(); i++) {
            for (int j = 0; j <= b.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + (a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1)
                    );
                }
            }
        }
        
        return dp[a.length()][b.length()];
    }
    
    public static boolean isFuzzyMatch(String name1, String name2, int maxDistance) {
        String normalized1 = normalizeName(name1);
        String normalized2 = normalizeName(name2);
        return levenshteinDistance(normalized1, normalized2) <= maxDistance;
    }
    
    public static String findBestMatch(String inputName, List<String> existingNames) {
        String normalizedInput = normalizeName(inputName);
        
        // First try exact match
        for (String existing : existingNames) {
            if (normalizeName(existing).equals(normalizedInput)) {
                return existing;
            }
        }
        
        // Then try fuzzy match with distance <= 2
        for (String existing : existingNames) {
            if (isFuzzyMatch(inputName, existing, 2)) {
                return existing;
            }
        }
        
        return null;
    }
    
    public static String capitalizeDisplayName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return name;
        }
        
        String[] words = name.trim().split("\\s+");
        StringBuilder result = new StringBuilder();
        
        for (int i = 0; i < words.length; i++) {
            if (i > 0) result.append(" ");
            String word = words[i].toLowerCase();
            if (word.length() > 0) {
                result.append(Character.toUpperCase(word.charAt(0)));
                if (word.length() > 1) {
                    result.append(word.substring(1));
                }
            }
        }
        
        return result.toString();
    }
}