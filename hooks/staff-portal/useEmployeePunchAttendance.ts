import {
    getEmployeePunchAttendanceInitialData,
    getEmployeePunchAttendanceReport
} from '@/server/staff-portal/biometric-report/employee-punch-attendance.actions';
import type { IEmployeeDetails } from '@/types/staff-portal/biometric-report/employee-punch-attendance.types';
import { useEffect, useState } from 'react';

export const useEmployeePunchAttendanceOnload = () => {
    const [employeeDetails, setEmployeeDetails] = useState<IEmployeeDetails | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getEmployeePunchAttendanceInitialData();
                if (response.data && response.data?.length > 0) {
                    setEmployeeDetails(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchInitialData();
    }, []);

    return { employeeDetails };
};

export const useEmployeePunchAttendanceReport = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getReport = async (payload: { fromdate: string; todate: string }) => {
        setIsLoading(true);
        try {
            const response = await getEmployeePunchAttendanceReport(payload);
            return response;
        } catch (error) {
            console.error('Error fetching report:', error);
            return { success: false, message: 'An error occurred', data: [] };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        getReport,
        isLoading
    };
};
