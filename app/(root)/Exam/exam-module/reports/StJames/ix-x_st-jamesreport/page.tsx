'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getStJamesExamReport } from '@/server/exam/exam-module/reports/cumulative-report';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import StJamesIXXReportForm from './_components/report-form';
import StJamesIXXReportList from './_components/report-list';

export default function StJamesIXXReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [institution, setInstitution] = useState<IMasterInstitution | Institution | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isReportVisible]);

    const handleReportSuccess = async (payload: any) => {
        try {
            console.log('payload', payload);
            const response = await getStJamesExamReport(payload);
            console.log('response', response);
            if (response?.data && response.data.getstudentdetails?.length > 0) {
                setReportData({
                    ...response.data,
                    reporttype: payload.reporttype,
                    year: payload.asmaY_Year,
                    displayAttendance: payload.displayAttendance
                });
                setIsReportVisible(true);
            } else {
                toast.error('No records found');
                setIsReportVisible(false);
            }
        } catch (error) {
            toast.error('Failed to generate report');
            setIsReportVisible(false);
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
                toast.error('Failed to fetch the institution');
            }
        };

        fetchInstitution();
    }, []);

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='St.James Progress Card IX-X Report' defaultOpen>
                <StJamesIXXReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && institution && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <div ref={printRef}>
                        <StJamesIXXReportList data={reportData} institution={institution} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
