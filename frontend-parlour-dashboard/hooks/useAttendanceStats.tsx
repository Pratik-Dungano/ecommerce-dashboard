'use client';

import { useState, useEffect, useCallback } from 'react';
import { attendanceAPI } from '../lib/api';
import socketManager from '../socket';

interface AttendanceStats {
  totalEmployees: number;
  presentEmployees: number;
  currentlyCheckedIn: number;
  attendancePercentage: number;
  date: string;
}

export const useAttendanceStats = () => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await attendanceAPI.getAttendanceStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch attendance statistics');
      }
    } catch (err: any) {
      console.error('Error fetching attendance stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch attendance statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle real-time attendance stats updates
  const handleStatsUpdate = useCallback((data: any) => {
    console.log('📊 Received real-time attendance stats update:', data);
    if (data.type === 'stats_update' && data.data) {
      setStats(data.data);
    }
  }, []);

  // Handle individual attendance updates (punch in/out)
  const handleAttendanceUpdate = useCallback((data: any) => {
    console.log('📡 Received attendance update:', data);
    if (data.type === 'punch_update') {
      // Refetch stats to ensure accuracy
      fetchStats();
    }
  }, [fetchStats]);

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Set up WebSocket listeners
    const socket = socketManager.connect();
    
    // Listen for attendance stats updates
    socket.on('attendance_stats_update', handleStatsUpdate);
    
    // Listen for individual attendance updates
    socket.on('attendance_update', handleAttendanceUpdate);

    // Cleanup on unmount
    return () => {
      socket.off('attendance_stats_update', handleStatsUpdate);
      socket.off('attendance_update', handleAttendanceUpdate);
    };
  }, [fetchStats, handleStatsUpdate, handleAttendanceUpdate]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};

export default useAttendanceStats; 