import { useState, useCallback } from 'react';
import BACKEND_URL from '../config/api';

/**
 * Custom hook for fetching practice exercises
 * Handles all loading, error, and pagination logic
 */
export const usePracticeExercises = (section) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  const fetchExercises = useCallback(async (page = 1, filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page,
        limit: filters.limit || 10,
        ...(filters.level && filters.level !== 'all' && { level: filters.level }),
        ...(filters.search && { search: filters.search }),
        ...(filters.type && filters.type !== 'all' && { type: filters.type }),
        ...(filters.theme && filters.theme !== 'all' && { theme: filters.theme }),
        ...(filters.accent && filters.accent !== 'all' && { accent: filters.accent }),
      });

      const response = await fetch(`${BACKEND_URL}/api/${section}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${section} exercises`);
      }

      const data = await response.json();
      setExercises(data.data || []);
      setPagination({
        currentPage: data.pagination?.page || 1,
        totalPages: data.pagination?.pages || 1,
        total: data.pagination?.total || 0,
        limit: data.pagination?.limit || 10
      });
    } catch (err) {
      setError(err.message);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [section]);

  const getSingleExercise = useCallback(async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/${section}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch exercise');
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [section]);

  const createExercise = useCallback(async (exerciseData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/${section}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exerciseData)
      });
      if (!response.ok) throw new Error('Failed to create exercise');
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [section]);

  const updateExercise = useCallback(async (id, exerciseData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/${section}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exerciseData)
      });
      if (!response.ok) throw new Error('Failed to update exercise');
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [section]);

  const deleteExercise = useCallback(async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/${section}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete exercise');
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [section]);

  return {
    exercises,
    loading,
    error,
    pagination,
    fetchExercises,
    getSingleExercise,
    createExercise,
    updateExercise,
    deleteExercise
  };
};

export default usePracticeExercises;
