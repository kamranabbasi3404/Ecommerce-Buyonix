/**
 * API Configuration Utility
 * Centralized API URL management for frontend
 */

export const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

export const API_URL = getApiUrl();

/**
 * Usage in components:
 * import { API_URL } from '@/utils/apiConfig';
 * 
 * const response = await fetch(`${API_URL}/auth/login`, {...});
 */
