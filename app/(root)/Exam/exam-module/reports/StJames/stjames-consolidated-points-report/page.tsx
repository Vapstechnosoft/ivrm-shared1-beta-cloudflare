'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getStJamesConsolidatedPointsReport } from '@/server/exam/exam-module/reports/cumulative-report';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import StJamesConsolidatedPointsReportForm from './_components/report-form';
import StJamesConsolidatedPointsReportList from './_components/report-list';

export default function StJamesConsolidatedPointsReportPage() {
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
            console.log(' payload', payload);
            const response = await getStJamesConsolidatedPointsReport(payload);
            console.log('response', response);
            if (response?.data && response.data.getstudentmarksdetails?.length > 0) {
                const {
                    getstudentmarksdetails = [],
                    getstudentwisesubjectlistnew = [],
                    getstudentdetails = [],
                    getexamdetails = [],
                    getstudentwiseattendancedetails = [],
                    getexamwisetotaldetails = [],
                    getgroupexamdetails = []
                } = response.data;

                // 1. Prepare Subject Details
                const subjectMap = new Map();
                getstudentwisesubjectlistnew.forEach((dd: any) => {
                    const subId = String(dd.subid ?? dd.ismS_Id);
                    if (!subjectMap.has(subId)) {
                        subjectMap.set(subId, {
                            subid: subId,
                            subjectname: dd.subjectname || dd.ismS_SubjectName,
                            subjectorder: dd.subjectorder ?? dd.subjectorder_new,
                            EYCES_AplResultFlg: dd.EYCES_AplResultFlg,
                            ISMS_SubjectCode: dd.ISMS_SubjectCode,
                            complusoryflag: dd.complusoryflag
                        });
                    }
                });

                const tempsubjectdetails: any[] = Array.from(subjectMap.values()).sort(
                    (a: any, b: any) => (a.subjectorder || 999) - (b.subjectorder || 999)
                );

                // Add "Points" for non-compulsory subjects that apply to result
                const finalSubjects: any[] = [];
                tempsubjectdetails.forEach((sub) => {
                    finalSubjects.push(sub);
                    if (sub.complusoryflag !== 'C' && sub.EYCES_AplResultFlg === true) {
                        finalSubjects.push({
                            ...sub,
                            subjectname: 'Points',
                            isPointsColumn: true
                        });
                    }
                });

                // 2. Prepare Exam Details
                const finalExamDetails = [...getexamdetails];
                finalExamDetails.push({ empG_GroupName: 'Final Average', empsG_Order: 10001, empG_DistplayName: 'FI' });

                const finalGroupExamDetails = [...getgroupexamdetails];
                finalGroupExamDetails.push({
                    empG_GroupName: 'Final Average',
                    emE_Id: 50001,
                    emE_ExamName: 'Final Average',
                    empG_DistplayName: 'FI'
                });

                // 3. Map Data to Students
                const mappedStudents = getstudentdetails.map((stu: any) => {
                    const studentId = stu.amsT_Id;

                    // Marks
                    const marksdetails: any[] = [];
                    getstudentmarksdetails.forEach((subd: any) => {
                        if (studentId === subd.amsT_Id) {
                            marksdetails.push({ ...subd });
                            if (subd.empS_AppToResultFlg === true && subd.complusoryflag !== 'C') {
                                marksdetails.push({
                                    ...subd,
                                    ismS_SubjectName: 'Points'
                                });
                            }
                        }
                    });

                    // Totals
                    const totalgrade = getexamwisetotaldetails.filter((su: any) => studentId === su.amsT_Id);

                    // Attendance
                    const attendancedetails = getstudentwiseattendancedetails.filter((d: any) => studentId === d.amsT_Id);

                    return {
                        ...stu,
                        marks: marksdetails,
                        markstotal: totalgrade,
                        attendance: attendancedetails
                    };
                });

                setReportData({
                    ...response.data,
                    getstudentdetails: mappedStudents,
                    tempsubjectdetails: finalSubjects,
                    getexamdetails: finalExamDetails,
                    year: payload.asmaY_Year,
                    cla: payload.asmcL_ClassName,
                    sec: payload.asmC_SectionName,
                    StjamesPoints: payload.StjamesPoints
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
            <CollapsibleSection title='St.James Consolidated Points Report' defaultOpen>
                <StJamesConsolidatedPointsReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && institution && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <div ref={printRef}>
                        <StJamesConsolidatedPointsReportList data={reportData} institution={institution} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
