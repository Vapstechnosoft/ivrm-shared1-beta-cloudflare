'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getStJamesExamReport } from '@/server/exam/exam-module/reports/cumulative-report';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import StJamesXI_XIIDataForm from './_components/report-form';
import StJamesXI_XIIReportList from './_components/report-list';

export default function StJamesXI_XIIProgressCardPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [_institution, setInstitution] = useState<IMasterInstitution | Institution | null>(null);
    const [reportType, setReportType] = useState('indi');
    const [displayAttendance, setDisplayAttendance] = useState(true);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isReportVisible]);

    const handleReportSuccess = async (payload: any) => {
        try {
            const response = await getStJamesExamReport(payload);
            if (response?.data && response.success) {
                setReportData({
                    ...response.data,
                    year: payload.asmaY_Year
                });
                setReportType(payload.reporttype);
                setDisplayAttendance(payload.displayAttendance);
                setIsReportVisible(true);
            } else {
                toast.error(response?.message || 'No data found');
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Failed to generate report');
        }
    };

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const institution_res = await getMasterInstitution();
                const { data: institution_data } = institution_res;
                setInstitution(institution_data);
            } catch (error) {
                console.error('Error fetching institution:', error);
            }
        };

        fetchInstitution();
    }, []);

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='St.James XI-XII Progress Card' defaultOpen>
                <StJamesXI_XIIDataForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && reportData && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <div ref={printRef}>
                        <StJamesXI_XIIReportList data={reportData} reporttype={reportType} displayAttendance={displayAttendance} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
