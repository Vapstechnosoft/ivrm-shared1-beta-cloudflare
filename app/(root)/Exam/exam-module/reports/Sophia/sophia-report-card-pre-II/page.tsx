'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SophiaProgressReportPreIIForm from './_components/report-form';
import SophiaProgressReportPreIIView from './_components/report-list';

export default function SophiaProgressReportPreIIPage() {
    const [reportData, _setReportData] = useState<any[]>([]);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [institution, setInstitution] = useState<IMasterInstitution | Institution | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isReportVisible]);

    const handleReportSuccess = async (_payload: any) => {
        setIsReportVisible(true);
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
            <CollapsibleSection title='Progress Card Report' defaultOpen>
                <SophiaProgressReportPreIIForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && institution && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <div ref={printRef}>
                        <SophiaProgressReportPreIIView data={reportData} institution={institution} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
