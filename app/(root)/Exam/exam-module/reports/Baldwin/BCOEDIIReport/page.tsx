'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getExamReportCard } from '@/server/exam/exam-module/reports/cumulative-report';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import BCOEDIIReportForm from './_components/add-form';
import BCOEDIIReportView from './_components/report-view';

export default function BCOEDIIReportPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [gradeRemarks, setGradeRemarks] = useState<any[]>([]);
    const [attendanceWork, setAttendanceWork] = useState<any[]>([]);
    const [attendancePresent, setAttendancePresent] = useState<any[]>([]);
    const [examName, setExamName] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [classTeacher, setClassTeacher] = useState('');
    const [showRemarks, setShowRemarks] = useState(true);
    const [showRank, setShowRank] = useState(true);
    const [showLogo, setShowLogo] = useState(false);
    const [hidePercentage, setHidePercentage] = useState(false);

    const handleFormSuccess = async (payload: any) => {
        try {
            setIsLoading(true);
            setReportData([]);
            setIsReportVisible(false);
            const res = await getExamReportCard(payload);
            console.log('response', res);

            const apiData = res?.data;
            const flatRows: any[] = apiData?.list || (Array.isArray(apiData) ? apiData : []);

            if (res && res.success && Array.isArray(flatRows) && flatRows.length > 0) {
                // Group by student
                const studentMap = new Map<number, any>();

                flatRows.forEach((row: any) => {
                    const studentId =
                        row.amsT_Id ?? row.AMST_Id ?? row.AMST_ID ?? row.amst_Id ?? row.student_id ?? row.studentId ?? row.StudentId;
                    if (!studentId) return;

                    if (!studentMap.has(studentId)) {
                        studentMap.set(studentId, {
                            student_id: studentId,
                            amsT_FirstName: row.amsT_FirstName || row.AMST_FirstName || row.studentName || '',
                            amsT_DOB: row.amsT_DOB || row.AMST_DOB || '',
                            amsT_AdmNo: row.amsT_AdmNo || row.AMST_AdmNo || '',
                            amaY_RollNo: row.amaY_RollNo || row.AMAY_RollNo || '',
                            asmcL_ClassName: row.asmcL_ClassName || row.ASMCL_ClassName || '',
                            asmC_SectionName: row.asmC_SectionName || row.ASMC_SectionName || '',
                            estmP_TotalMaxMarks: row.estmP_TotalMaxMarks ?? row.ESTMP_TotalMaxMarks,
                            estmP_TotalObtMarks: row.estmP_TotalObtMarks ?? row.ESTMP_TotalObtMarks,
                            estmP_Percentage: row.estmP_Percentage ?? row.ESTMP_Percentage,
                            estmP_TotalGrade: row.estmP_TotalGrade || row.ESTMP_TotalGrade,
                            estmP_TotalGradeRemark: row.estmP_TotalGradeRemark || row.ESTMP_TotalGradeRemark,
                            estmP_SectionRank: row.estmP_SectionRank || row.ESTMP_SectionRank,
                            classheld: row.classheld || row.asA_ClassHeld || row.ASA_ClassHeld,
                            classatt: row.classatt || row.asA_Class_Attended || row.ASA_Class_Attended,
                            sub_list: []
                        });
                    } else {
                        const existing = studentMap.get(studentId);
                        const remark = row.estmP_TotalGradeRemark || row.ESTMP_TotalGradeRemark;
                        if (remark && (!existing.estmP_TotalGradeRemark || existing.estmP_TotalGradeRemark.trim() === '')) {
                            existing.estmP_TotalGradeRemark = remark;
                        }
                        const maxMarks = row.estmP_TotalMaxMarks ?? row.ESTMP_TotalMaxMarks;
                        if (maxMarks && !existing.estmP_TotalMaxMarks) {
                            existing.estmP_TotalMaxMarks = maxMarks;
                        }
                        const obtMarks = row.estmP_TotalObtMarks ?? row.ESTMP_TotalObtMarks;
                        if (obtMarks && !existing.estmP_TotalObtMarks) {
                            existing.estmP_TotalObtMarks = obtMarks;
                        }
                        const pct = row.estmP_Percentage ?? row.ESTMP_Percentage;
                        if (pct && !existing.estmP_Percentage) {
                            existing.estmP_Percentage = pct;
                        }
                        const grade = row.estmP_TotalGrade || row.ESTMP_TotalGrade;
                        if (grade && !existing.estmP_TotalGrade) {
                            existing.estmP_TotalGrade = grade;
                        }
                        const rank = row.estmP_SectionRank || row.ESTMP_SectionRank;
                        if (rank && !existing.estmP_SectionRank) {
                            existing.estmP_SectionRank = rank;
                        }
                    }

                    const student = studentMap.get(studentId);
                    student.sub_list.push({
                        ismS_Id: row.ismS_Id ?? row.ISMS_Id ?? row.ISMS_ID,
                        ismS_SubjectName: row.ismS_SubjectName || row.ISMS_SubjectName,
                        emgR_Id: row.emgR_Id ?? row.EMGR_Id ?? row.EMGR_ID,
                        eyceS_MarksEntryMax: row.eyceS_MarksEntryMax ?? row.EYCES_MarksEntryMax,
                        eyceS_MaxMarks: row.eyceS_MaxMarks ?? row.EYCES_MaxMarks,
                        eyceS_MinMarks: row.eyceS_MinMarks ?? row.EYCES_MinMarks,
                        estM_Marks: row.estM_Marks ?? row.ESTM_Marks,
                        estmpS_ObtainedMarks: row.estmpS_ObtainedMarks ?? row.ESTMPS_ObtainedMarks,
                        estmpS_ObtainedGrade: row.estmpS_ObtainedGrade || row.ESTMPS_ObtainedGrade,
                        estmpS_Percentage: row.estmpS_Percentage ?? row.ESTMPS_Percentage,
                        estmpS_PassFailFlg: row.estmpS_PassFailFlg || row.ESTMPS_PassFailFlg,
                        eyceS_AplResultFlg: row.eyceS_AplResultFlg ?? row.EYCES_AplResultFlg,
                        EYCES_GradeDisplayFlg: row.eyceS_GradeDisplayFlg ?? row.EYCES_GradeDisplayFlg,
                        EYCES_MarksDisplayFlg: row.eyceS_MarksDisplayFlg ?? row.EYCES_MarksDisplayFlg,
                        emgD_Remarks: row.emgD_Remarks || row.EMGD_Remarks
                    });
                });

                const grade_details = apiData?.grade_details || (res as any).grade_details || [];
                const stud_work_attendence =
                    apiData?.stud_work_attendence ||
                    apiData?.work_attendence ||
                    (res as any).stud_work_attendence ||
                    (res as any).work_attendence ||
                    [];
                const stud_present_attendence =
                    apiData?.stud_present_attendence ||
                    apiData?.present_attendence ||
                    (res as any).stud_present_attendence ||
                    (res as any).present_attendence ||
                    [];
                const clstchname = apiData?.clstchname || (res as any).clstchname || [];

                setReportData(Array.from(studentMap.values()));
                setGradeRemarks(grade_details);
                setAttendanceWork(stud_work_attendence);
                setAttendancePresent(stud_present_attendence);
                setExamName(flatRows[0].emE_ExamName || '');
                setAcademicYear(payload.asmaY_Year || '');
                setClassTeacher(clstchname?.[0]?.hrmE_EmployeeFirstName || clstchname?.[0]?.hrme_EmployeeFirstName || '');
                setShowRemarks(payload.showRemarks);
                setShowRank(payload.showRank);
                setShowLogo(payload.showLogo);
                setHidePercentage(payload.hidePercentage);

                setIsReportVisible(true);
            } else {
                toast.error('No records found for the selected criteria');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex flex-col gap-6 p-4'>
            <CollapsibleSection title='BCOEDII Report Criteria' defaultOpen>
                <BCOEDIIReportForm onSuccess={handleFormSuccess} onReset={() => window.location.reload()} />
            </CollapsibleSection>

            {isLoading && (
                <div className='flex flex-col items-center justify-center gap-4 p-12'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    <p className='animate-pulse text-muted-foreground'>Generating BCOEDII Reports...</p>
                </div>
            )}

            {isReportVisible && !isLoading && (
                <CollapsibleSection title='Report Preview' defaultOpen>
                    <BCOEDIIReportView
                        reportData={reportData}
                        gradeRemarks={gradeRemarks}
                        attendanceWork={attendanceWork}
                        attendancePresent={attendancePresent}
                        examName={examName}
                        academicYear={academicYear}
                        classTeacher={classTeacher}
                        showRemarks={showRemarks}
                        showRank={showRank}
                        showLogo={showLogo}
                        hidePercentage={hidePercentage}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
