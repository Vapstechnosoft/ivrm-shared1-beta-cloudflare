'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getStJamesTransitionReport } from '@/server/exam/exam-module/reports/cumulative-report';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import StJamesI_IIIReportForm from './_components/report-form';
import StJamesI_IIIReportList from './_components/report-list';

export default function StJamesI_IIIReportPage() {
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
            console.log('response', response);

            if (response?.data && response.data.getstudentdetails?.length > 0) {
                const {
                    getstudentdetails,
                    getstudentmarksdetails = [],
                    getstudentwiseattendancedetails = [],
                    examwiseremarks = [],
                    clstchname = [],
                    studentwisemarks = []
                } = response.data;

                // Map data to students
                const mappedStudents = getstudentdetails.map((stu: any) => {
                    const studentId = stu.AMST_Id || stu.amsT_Id;

                    // Marks (Subjects)
                    const stdmarks = getstudentmarksdetails.filter((m: any) => m.AMST_Id === studentId);

                    // Attendance
                    const attendance = getstudentwiseattendancedetails.find((a: any) => a.AMST_Id === studentId);

                    // Remarks
                    const remark = examwiseremarks.find((r: any) => r.amsT_Id === studentId);

                    // Total Marks / Grade (studentwisemarks)
                    const totalMarks = studentwisemarks.find((tm: any) => tm.AMST_Id === studentId);

                    return {
                        ...stu,
                        stdmarks,
                        TOTALWORKINGDAYS: attendance?.TOTALWORKINGDAYS || 0,
                        PRESENTDAYS: attendance?.PRESENTDAYS || 0,
                        ATTENDANCEPERCENTAGE: attendance?.ATTENDANCEPERCENTAGE || 0,
                        remaks: remark?.emeR_Remarks || '',
                        ESTMP_TotalMaxMarks: totalMarks?.estmP_TotalMaxMarks,
                        ESTMP_TotalObtMarks: totalMarks?.estmP_TotalObtMarks,
                        ESTMP_TotalGrade: totalMarks?.estmP_TotalGrade,
                        ESTMP_GradePoints: totalMarks?.estmP_GradePoints
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
                    displayMarks: payload.displayMarks,
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
            <CollapsibleSection title='St.James Classes I-III Progress Card Report' defaultOpen>
                <StJamesI_IIIReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && institution && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <div ref={printRef}>
                        <StJamesI_IIIReportList data={reportData} institution={institution} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
