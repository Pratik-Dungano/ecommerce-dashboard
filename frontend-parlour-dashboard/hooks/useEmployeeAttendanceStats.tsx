'use client';

import { useState, useEffect } from 'react';
import { attendanceAPI, handleApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AttendanceStats {
  attendancePercentage: number;
  totalDays: number;
  presentDays: number;
}

export const useEmployeeAttendanceStats = () => {
  const [stats, setStats] = useState<AttendanceStats>({
    attendancePercentage: 0,
    totalDays: 0,
    presentDays: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAttendanceStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await attendanceAPI.getMyAttendance();
      
      if (response.success && response.data?.attendance) {
        const attendance = response.data.attendance;
        
        // Get employee joining date (assuming it's stored in user data or we can get it from attendance)
        // For now, we'll use the earliest attendance record as joining date
        const dates = attendance.map((record: any) => new Date(record.timestamp));
        const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const today = new Date();
        
        // Calculate total working days (excluding weekends)
        let totalWorkingDays = 0;
        let presentDays = 0;
        const workingDaysSet = new Set();
        
        // Count unique days with punch-ins
        attendance.forEach((record: any) => {
          const date = new Date(record.timestamp);
          const dateStr = date.toDateString();
          
          if (record.action === 'punch_in') {
            workingDaysSet.add(dateStr);
          }
        });
        
        presentDays = workingDaysSet.size;
        
        // Calculate total working days from joining date to today
        const currentDate = new Date(earliestDate);
        while (currentDate <= today) {
          // Skip weekends (Saturday = 6, Sunday = 0)
          if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            totalWorkingDays++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // If today is the joining date and employee has punched in, attendance should be 100%
        const isJoiningDay = earliestDate.toDateString() === today.toDateString();
        const hasPunchedInToday = attendance.some((record: any) => {
          const recordDate = new Date(record.timestamp);
          return recordDate.toDateString() === today.toDateString() && record.action === 'punch_in';
        });
        
        if (isJoiningDay && hasPunchedInToday && totalWorkingDays === 1) {
          // If it's the joining day and they've punched in, attendance is 100%
          setStats({
            attendancePercentage: 100,
            totalDays: 1,
            presentDays: 1,
          });
          return;
        }
        
        // Calculate attendance percentage
        let attendancePercentage = 0;
        
        if (totalWorkingDays > 0) {
          attendancePercentage = Math.round((presentDays / totalWorkingDays) * 100);
        } else if (isJoiningDay && hasPunchedInToday) {
          // If it's the joining day and they've punched in, attendance is 100%
          attendancePercentage = 100;
        }
        
        // Ensure percentage doesn't exceed 100%
        attendancePercentage = Math.min(attendancePercentage, 100);

        setStats({
          attendancePercentage,
          totalDays: totalWorkingDays || 1, // At least 1 day if it's joining day
          presentDays,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: handleApiError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStats();
  }, [user]);

  return { stats, isLoading, refetch: fetchAttendanceStats };
}; 