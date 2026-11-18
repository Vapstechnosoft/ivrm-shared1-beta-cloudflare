'use client';
import { useEmployeePunchAttendanceOnload } from '@/hooks/staff-portal/useEmployeePunchAttendance';
import { useState } from 'react';
import { EmployeePunchAttendanceFilter } from './_components/employee-punch-attendance-filter';
import { EmployeePunchAttendanceView } from './_components/employee-punch-attendance-view';

export default function EmployeePunchAttendancePage() {
    const { employeeDetails } = useEmployeePunchAttendanceOnload();
    const [reportData, setReportData] = useState<any>([]);

    return (
        <div className='container mx-auto max-w-5xl p-4'>
            <EmployeePunchAttendanceFilter employeeDetails={employeeDetails} setReportData={setReportData} />
            {reportData && reportData?.length > 0 && <EmployeePunchAttendanceView data={reportData} />}
        </div>
    );
}
