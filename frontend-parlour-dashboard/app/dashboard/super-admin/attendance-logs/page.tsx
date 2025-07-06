'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { attendanceAPI, handleApiError } from "@/lib/api";
import { Attendance } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export default function AttendanceLogsPage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await attendanceAPI.getAll();
      // The backend returns attendance in data.attendance, not data.items
      const attendanceData = (response as any).data?.attendance || response.data?.items;
      if (attendanceData) {
        setAttendance(attendanceData);
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
    fetchAttendance();
  }, []);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Logs</h1>
        <p className="text-gray-600">View all attendance records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attendance
          .filter(record => record.employee && record.employee.name) // Filter out records with null employee data
          .map((record) => (
          <Card key={record._id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{record.employee.name}</h3>
                  <p className="text-sm text-gray-600">{record.employee.position}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                record.action === 'punch_in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {record.action === 'punch_in' ? 'Checked In' : 'Checked Out'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <span className="text-gray-600 mr-2">📅 Date & Time:</span>
                <span className="font-medium text-gray-800">
                  {formatDateTime(record.timestamp)}
                </span>
              </div>
              {record.notes && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 mr-2">📝 Notes:</span>
                  <span className="font-medium text-gray-800">{record.notes}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading attendance records...</p>
        </div>
      )}

      {!isLoading && attendance.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No attendance records found.</p>
        </div>
      )}
    </div>
  );
} 