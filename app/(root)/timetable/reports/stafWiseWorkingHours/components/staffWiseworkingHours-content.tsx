'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import StaffWiseWorkingHoursForm from './add-form';
import StaffWiseReportGrid from './report';
import StaffWiseWorkingHoursPrintable from './staffwiseWorkinghours-printtable';

export default function StaffWiseReportContent() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = (response: any, payload: any) => {
        console.info('Report response received:', response);

        // Extract records with robust normalization
        const rawData = response.data ?? response;
        let records = Array.isArray(rawData)
            ? rawData
            : ((rawData as any)?.$values ?? (Array.isArray((response as any)?.data) ? (response as any).data : []));

        // Final check for $values if nested
        if (!Array.isArray(records) && (records as any)?.$values) {
            records = (records as any).$values;
        }

        const finalizedRecords = Array.isArray(records) ? records : [];
        const hasData = finalizedRecords.length > 0;

        if (hasData) {
            processReportData(finalizedRecords);
            setIsReportVisible(true);
            toast.success('Report generated successfully');
        } else {
            toast.error('TimeTable is Not Generated For Selected Details !!!!');
            setReportData([]);
            setIsReportVisible(false);
        }
    };

    const processReportData = (records: any[]) => {
        const grouped = new Map<string, { header: string; staffCode?: string; rows: any[] }>();

        records.forEach((rec: any) => {
            const staffCode = rec.hrmE_EmployeeCode ?? rec.hrmE_Code ?? rec.hrmE_Id;
            const staffName = rec.empName ?? rec.staffName ?? '';

            const key = String(staffCode ?? staffName ?? 'UNKNOWN');

            if (!grouped.has(key)) {
                grouped.set(key, { header: staffName, staffCode, rows: [] });
            }

            grouped.get(key)!.rows.push({
                dayName: rec.ttmD_DayName ?? rec.dayName ?? '',
                ttPeriods: rec.ttPeriods ?? rec.ttmD_Periods ?? 0,
                pwMins: rec.pwMins ?? rec.pwMins_ ?? 0,
                workingHrs: rec.workingHrs ?? rec.workingHours ?? ''
            });
        });

        setReportData(Array.from(grouped.values()));
    };

    const handleCancel = () => {
        setReportData([]);
        setIsReportVisible(false);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Staff Wise TimeTable Report' defaultOpen={true}>
                <StaffWiseWorkingHoursForm onReportGenerated={handleReportGenerated} onCancel={handleCancel} />
            </CollapsibleSection>

            {isReportVisible && reportData.length > 0 && (
                <CollapsibleSection title='Report Grid' defaultOpen={true}>
                    <StaffWiseReportGrid reportData={reportData} onPrint={handlePrint} />
                    <StaffWiseWorkingHoursPrintable ref={printRef} reportData={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
