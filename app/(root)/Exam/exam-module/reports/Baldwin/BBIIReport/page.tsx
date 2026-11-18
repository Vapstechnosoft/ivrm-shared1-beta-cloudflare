'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getExamReportCard } from '@/server/exam/exam-module/reports/cumulative-report';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import BBIIReportForm from './_components/add-form';
import BBIIReportView from './_components/report-view';

export default function BBIIReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [gradeRemarks, setGradeRemarks] = useState<any[]>([]);
    const [attendanceWork, setAttendanceWork] = useState<any[]>([]);
    const [attendancePresent, setAttendancePresent] = useState<any[]>([]);
    const [examName, setExamName] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [classTeacher, setClassTeacher] = useState('');
    const [showRemarks, setShowRemarks] = useState(true);
    const [showRankInSection, setShowRankInSection] = useState(false);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSuccess = async (payload: any) => {
        try {
            setIsLoading(true);
            setReportData([]);
            setIsReportVisible(false);
            setSelectedClass(payload.selectedClassName || '');
            setSelectedSection(payload.selectedSectionName || '');
            setShowRemarks(payload.showRemarks ?? true);
            setShowRankInSection(payload.showRankInSection ?? payload.showRank ?? false);

            const res = await getExamReportCard(payload);

            const apiData = res?.data;
            const flatRows: any[] = apiData?.list || (Array.isArray(apiData) ? apiData : []);

            if (res && res.success && Array.isArray(flatRows) && flatRows.length > 0) {
                const grade_details = apiData?.grade_details || (res as any).grade_details || [];
                const stud_work_attendence = apiData?.stud_work_attendence || (res as any).stud_work_attendence || [];
                const stud_present_attendence = apiData?.stud_present_attendence || (res as any).stud_present_attendence || [];
                const clstchname = apiData?.clstchname || (res as any).clstchname || [];

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
                            classheld: row.classheld || row.asA_ClassHeld || row.ASA_ClassHeld,
                            classatt: row.classatt || row.asA_Class_Attended || row.ASA_Class_Attended,
                            estmP_TotalGrade: row.estmP_TotalGrade || row.ESTMP_TotalGrade,
                            estmP_ClassRank: row.estmP_ClassRank || row.ESTMP_ClassRank,
                            estmP_SectionRank: row.estmP_SectionRank || row.ESTMP_SectionRank,
                            estmP_TotalGradeRemark: row.estmP_TotalGradeRemark || row.ESTMP_TotalGradeRemark,
                            stu_grandmin_marks: row.estmpssS_ObtainedMarks,
                            totaleyceS_MarksEntryMax: row.totaleyceS_MarksEntryMax,
                            totalestM_Marks: row.totalestM_Marks,
                            sub_list: []
                        });
                    } else {
                        const existing = studentMap.get(studentId);
                        if (
                            row.estmP_TotalGradeRemark &&
                            (!existing.estmP_TotalGradeRemark || existing.estmP_TotalGradeRemark.trim() === '')
                        ) {
                            existing.estmP_TotalGradeRemark = row.estmP_TotalGradeRemark;
                        }
                        if (row.estmP_TotalMaxMarks && !existing.estmP_TotalMaxMarks) {
                            existing.estmP_TotalMaxMarks = row.estmP_TotalMaxMarks;
                        }
                        if (row.estmP_TotalObtMarks && !existing.estmP_TotalObtMarks) {
                            existing.estmP_TotalObtMarks = row.estmP_TotalObtMarks;
                        }
                        if (row.estmP_Percentage && !existing.estmP_Percentage) {
                            existing.estmP_Percentage = row.estmP_Percentage;
                        }
                        if (row.estmP_TotalGrade && !existing.estmP_TotalGrade) {
                            existing.estmP_TotalGrade = row.estmP_TotalGrade;
                        }
                        if (row.estmP_SectionRank && !existing.estmP_SectionRank) {
                            existing.estmP_SectionRank = row.estmP_SectionRank;
                        }
                    }

                    if (row.ismS_Id) {
                        const rawObt = row.estM_Marks !== null && row.estM_Marks !== undefined ? row.estM_Marks : row.estmpS_ObtainedMarks;
                        const obtained = rawObt !== null && rawObt !== undefined && !isNaN(Number(rawObt)) ? Number(rawObt) : null;

                        const rawMax = row.eyceS_MarksEntryMax || row.eyceS_MaxMarks || row.estmpS_MaxMarks;
                        const max = rawMax !== null && rawMax !== undefined && !isNaN(Number(rawMax)) ? Number(rawMax) : null;

                        let subjectPercentage = '';
                        if (obtained !== null && max !== null && max > 0) {
                            subjectPercentage = ((obtained / max) * 100).toFixed(2);
                        }

                        studentMap.get(studentId).sub_list.push({
                            amsT_Id: studentId,
                            ismS_Id: row.ismS_Id ?? row.ISMS_Id ?? row.ISMS_ID,
                            ismS_SubjectName: row.ismS_SubjectName || row.ISMS_SubjectName,
                            eyceS_MaxMarks: row.eyceS_MaxMarks || row.estmpS_MaxMarks,
                            eyceS_MinMarks: row.eyceS_MinMarks || row.estmpS_MinMarks,
                            eyceS_MarksEntryMax: row.eyceS_MarksEntryMax,
                            estM_Marks: row.estM_Marks,
                            estmpS_ObtainedMarks: row.estmpS_ObtainedMarks,
                            estmpS_Percentage: subjectPercentage || '',
                            estmP_Percentage: row.estmP_Percentage || '',
                            estmpS_ObtainedGrade: row.estmpS_ObtainedGrade,
                            estmpS_PassFailFlg: row.estmpS_PassFailFlg,
                            eyceS_AplResultFlg: row.eyceS_AplResultFlg,
                            emgR_Id: row.emgR_Id,
                            EYCES_MarksDisplayFlg: row.EYCES_MarksDisplayFlg || row.eyceS_MarksDisplayFlg,
                            EYCES_GradeDisplayFlg: row.EYCES_GradeDisplayFlg || row.eyceS_GradeDisplayFlg,
                            emgD_Remarks: row.emgD_Remarks
                        });
                    }
                });

                setReportData(Array.from(studentMap.values()));
                setGradeRemarks(grade_details);
                setAttendanceWork(stud_work_attendence);
                setAttendancePresent(stud_present_attendence);
                setExamName(flatRows[0].emE_ExamName || 'Progress Card');
                setAcademicYear(flatRows[0].asmaY_Year || flatRows[0].amaY_Year || '');
                setClassTeacher(clstchname?.[0]?.hrmE_EmployeeFirstName || clstchname?.[0]?.clstchname || '');
                setShowRemarks(payload.showRemarks ?? true);
                setShowRankInSection(payload.showRankInSection ?? payload.showRank ?? false);
                setIsReportVisible(true);
                toast.success('Report generated successfully');

                if (payload.isPrint) {
                    setTimeout(() => {
                        window.print();
                    }, 400);
                }
            } else {
                toast.error('No record found');
                setIsReportVisible(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch report data');
            setIsReportVisible(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setReportData([]);
        setGradeRemarks([]);
        setAttendanceWork([]);
        setAttendancePresent([]);
        setExamName('');
        setAcademicYear('');
        setSelectedClass('');
        setSelectedSection('');
        setClassTeacher('');
        setShowRemarks(true);
        setShowRankInSection(false);
        setIsReportVisible(false);
    };

    return (
        <div className='flex flex-col gap-6 p-4'>
            <CollapsibleSection title='BBII Report Criteria' defaultOpen>
                <BBIIReportForm onSuccess={handleFormSuccess} onReset={handleReset} />
            </CollapsibleSection>

            {isLoading && (
                <div className='flex flex-col items-center justify-center gap-4 p-12'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    <p className='animate-pulse text-muted-foreground'>Generating BBII Reports...</p>
                </div>
            )}

            {isReportVisible && !isLoading && (
                <CollapsibleSection title='Report Preview' defaultOpen>
                    <BBIIReportView
                        reportData={reportData}
                        gradeRemarks={gradeRemarks}
                        attendanceWork={attendanceWork}
                        attendancePresent={attendancePresent}
                        examName={examName}
                        academicYear={academicYear}
                        selectedClass={selectedClass}
                        selectedSection={selectedSection}
                        classTeacher={classTeacher}
                        showRemarks={showRemarks}
                        showRank={showRankInSection}
                        showRankInSection={showRankInSection}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
