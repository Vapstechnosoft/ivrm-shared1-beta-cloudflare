'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getStJamesTransitionReport } from '@/server/exam/exam-module/reports/cumulative-report';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import StJamesTransitionReportForm from './_components/report-form';
import StJamesTransitionReportList from './_components/report-list';

export default function StJamesTransitionReportPage() {
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
            const response = await getStJamesTransitionReport(payload);

            if (response?.data && response.data.getstudentdetails?.length > 0) {
                const {
                    getstudentdetails,
                    getstudentmarksdetails = [],
                    getstudentwisesubjectlist = [],
                    getstudentwiseattendancedetails = [],
                    examwiseremarks = [],
                    clstchname = []
                } = response.data;

                // Map data to students
                const mappedStudents = getstudentdetails.map((stu: any) => {
                    const studentId = stu.AMST_Id || stu.amsT_Id;

                    // Marks
                    const stdmarks = getstudentmarksdetails.filter((m: any) => m.AMST_Id === studentId);

                    // Attendance
                    const attendance = getstudentwiseattendancedetails.find((a: any) => a.AMST_Id === studentId);

                    // Remarks
                    const remark = examwiseremarks.find((r: any) => r.amsT_Id === studentId);

                    return {
                        ...stu,
                        stdmarks,
                        TOTALWORKINGDAYS: attendance?.TOTALWORKINGDAYS || 0,
                        PRESENTDAYS: attendance?.PRESENTDAYS || 0,
                        ATTENDANCEPERCENTAGE: attendance?.ATTENDANCEPERCENTAGE || 0,
                        remaks: remark?.emeR_Remarks || ''
                    };
                });

                const ctName = clstchname?.[0]?.hrmE_EmployeeFirstName || '';

                setReportData({
                    ...response.data,
                    getstudentdetails: mappedStudents,
                    year: payload.asmaY_Year,
                    exam: payload.emE_ExamName,
                    displayattendance: payload.displayattendance,
                    readmit: payload.readmit,
                    clastechname: ctName
                });
                setIsReportVisible(true);
            } else {
                toast.error('No records found');
                setIsReportVisible(false);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
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
            <CollapsibleSection title='St.James Transition Progress Card Report' defaultOpen>
                <StJamesTransitionReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && institution && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <div ref={printRef}>
                        <StJamesTransitionReportList data={reportData} institution={institution} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
