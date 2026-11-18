'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getExamReportCard, getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IExamReportCard, IMasterInstitution, ISubject, Institution } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ProgressCardReportForm from './_components/add-form';
import ProgressCardReport from './_components/progress-card-report';

export default function ProgressCardReportPage() {
    const [reportData, setReportData] = useState<IExamReportCard[]>([]);
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [headerInfo, setHeaderInfo] = useState<any>({});
    const [examName, setExamName] = useState<string>('');
    const [examCode] = useState<string>('FA1');
    const [year, setYear] = useState<string>('');
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [institution, setInstitution] = useState<IMasterInstitution | Institution | null>();
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    const handleReportSuccess = async (payload: any) => {
        try {
            const res = await getExamReportCard(payload);
            const apiData = res?.data;
            const flatRows: any[] = apiData?.list || (Array.isArray(apiData) ? apiData : []);

            if (!res?.success || !Array.isArray(flatRows) || flatRows.length === 0) {
                setIsReportVisible(false);
                return;
            }

            // Extra data from response
            const activity_main_list_area = apiData?.activity_main_list_area || (res as any).activity_main_list_area || [];
            const getstudentwiseactiviteslist = apiData?.getstudentwiseactiviteslist || (res as any).getstudentwiseactiviteslist || [];
            const strudentwisedentalandvision = apiData?.strudentwisedentalandvision || (res as any).strudentwisedentalandvision || [];
            const stud_work_attendence = apiData?.stud_work_attendence || (res as any).stud_work_attendence || [];
            const stud_present_attendence = apiData?.stud_present_attendence || (res as any).stud_present_attendence || [];
            const studentdetailsgraph = apiData?.studentdetailsgraph || (res as any).studentdetailsgraph || [];
            const promotion_remarks = apiData?.promotion_remarks || (res as any).promotion_remarks || [];

            const studentMap = new Map<number, IExamReportCard>();
            const subjectMap = new Map<number, ISubject>();

            flatRows.forEach((row) => {
                const studentId = row.amsT_Id;

                // Build unique subjects
                if (row.ismS_Id && !subjectMap.has(row.ismS_Id)) {
                    subjectMap.set(row.ismS_Id, {
                        ismS_Id: row.ismS_Id,
                        ismS_SubjectName: row.ismS_SubjectName,
                        eyceS_AplResultFlg: row.eyceS_AplResultFlg ?? true,
                        eyceS_MarksDisplayFlg: row.eyceS_MarksDisplayFlg ?? true,
                        eyceS_GradeDisplayFlg: row.eyceS_GradeDisplayFlg ?? true,
                        eyceS_SubjectOrder: row.eyceS_SubjectOrder ?? 999,
                        type: row.eyceS_GradeDisplayFlg ? 'Grade' : 'Marks'
                    });
                }

                // Initialize student
                if (!studentMap.has(studentId)) {
                    studentMap.set(studentId, {
                        amsT_Id: studentId,
                        amsT_FirstName: row.amsT_FirstName?.trim() || '',
                        amsT_FatherName: row.amsT_FatherName || 'N/A',
                        amsT_MotherName: row.amsT_MotherName || 'N/A',
                        amsT_DOB: row.amsT_DOB,
                        amsT_Photoname: row.amsT_Photoname || '',
                        amaY_RollNo: row.amaY_RollNo,
                        amsT_AdmNo: row.amsT_AdmNo,
                        amsT_RegistrationNo: row.amsT_RegistrationNo,
                        asmcL_ClassName: row.asmcL_ClassName,
                        asmC_SectionName: row.asmC_SectionName,
                        sub_list: [],
                        estmP_TotalMaxMarks: row.estmP_TotalMaxMarks,
                        estmP_TotalObtMarks: row.estmP_TotalObtMarks,
                        estmP_Percentage: row.estmP_Percentage,
                        estmP_TotalGrade: row.estmP_TotalGrade,
                        estmP_Result: row.estmP_Result,
                        estmP_ClassRank: row.estmP_ClassRank,
                        estmP_SectionRank: row.estmP_SectionRank,
                        classheld: row.asA_ClassHeld,
                        classatt: row.asA_Class_Attended,
                        estmP_TotalGradeRemark: row.emgD_Remarks || row.estmP_TotalGradeRemark || 'Good',

                        // Add filtered data for this student
                        activity_main_list_area: activity_main_list_area,
                        getstudentwiseactiviteslist: getstudentwiseactiviteslist.filter((a: any) => a.AMST_Id === studentId),
                        strudentwisedentalandvision: strudentwisedentalandvision.filter((h: any) => h.AMST_Id === studentId),
                        stud_work_attendence: stud_work_attendence.filter((at: any) => at.AMST_Id === studentId),
                        stud_present_attendence: stud_present_attendence.filter((at: any) => at.AMST_Id === studentId),
                        studentdetailsgraph: studentdetailsgraph.filter((g: any) => g.AMST_Id === studentId),
                        promotion_remarks: promotion_remarks.filter((p: any) => p.amsT_Id === studentId)
                    });
                }

                // Only add subjects with actual marks
                if (row.ismS_Id && row.estmpS_MaxMarks > 0) {
                    studentMap.get(studentId)!.sub_list.push({
                        ismS_Id: row.ismS_Id,
                        estmpS_MaxMarks: row.estmpS_MaxMarks,
                        estmpS_MinMarks: row.eyceS_MinMarks,
                        estmpS_ObtainedMarks: row.estmpS_ObtainedMarks ?? null,
                        estmpS_ObtainedGrade: row.estmpS_ObtainedGrade || '-',
                        estmpS_PassFailFlg: row.estmpS_PassFailFlg
                    });
                }
            });

            // Filter subjects that actually have marks
            const validSubjectIds = new Set(Array.from(studentMap.values()).flatMap((s) => s.sub_list.map((m) => m.ismS_Id)));

            const filteredSubjects = Array.from(subjectMap.values())
                .filter((s) => validSubjectIds.has(s.ismS_Id))
                .sort((a, b) => (a.eyceS_SubjectOrder ?? 999) - (b.eyceS_SubjectOrder ?? 999));

            const firstRow = flatRows[0];

            setSubjects(filteredSubjects);
            setReportData(Array.from(studentMap.values()));
            setHeaderInfo({
                cla: firstRow.asmcL_ClassName,
                sec: firstRow.asmC_SectionName
            });
            setExamName(firstRow.emE_ExamName || 'Progress Card');
            setYear(firstRow.asmaY_Year || new Date().getFullYear().toString());
            setIsReportVisible(true);
            toast.success(`${studentMap.size} progress card(s) generated successfully!`);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Error generating report');
            setIsReportVisible(false);
        }
    };

    // 🔥 STATIC MOCK DATA (5 Students × 5 Subjects)
    const _generateStaticData = () => {
        const subjects = [
            { id: 101, name: 'Mathematics', order: 1 },
            { id: 102, name: 'Science', order: 2 },
            { id: 103, name: 'English', order: 3 },
            { id: 104, name: 'Social', order: 4 },
            { id: 105, name: 'Computer', order: 5 }
        ];

        const rows: any[] = [];

        for (let i = 1; i <= 5; i++) {
            const totalMax = subjects.length * 100;
            let totalObt = 0;

            subjects.forEach((sub) => {
                const marks = Math.floor(Math.random() * 60) + 40; // 40–100
                totalObt += marks;

                rows.push({
                    // Student Info
                    amsT_Id: 15000 + i,
                    amsT_FirstName: `Student ${i}`,
                    amsT_FatherName: `Father ${i}`,
                    amsT_MotherName: `Mother ${i}`,
                    amsT_DOB: '2016-01-01T00:00:00',
                    amsT_Photoname:
                        'https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/6a4bad20-fd91-45ff-b0cd-b152f3d07edc.jpg',
                    amaY_RollNo: i,
                    amsT_AdmNo: `ADM${i}`,
                    amsT_RegistrationNo: `REG${i}`,

                    // Class Info
                    asmcL_ClassName: 'Grade X',
                    asmC_SectionName: 'Section A',
                    emE_ExamName: 'Annual Exam',
                    asmaY_Year: '2025-26',

                    // Subject Info
                    ismS_Id: sub.id,
                    ismS_SubjectName: sub.name,
                    eyceS_AplResultFlg: true,
                    eyceS_MarksDisplayFlg: true,
                    eyceS_GradeDisplayFlg: false,
                    eyceS_SubjectOrder: sub.order,

                    // Marks
                    estmpS_MaxMarks: 100,
                    eyceS_MinMarks: 35,
                    estmpS_ObtainedMarks: marks,
                    estmpS_ObtainedGrade: marks >= 90 ? 'A1' : marks >= 80 ? 'A2' : marks >= 70 ? 'B1' : 'B2',
                    estmpS_PassFailFlg: marks >= 35,

                    // Totals
                    estmP_TotalMaxMarks: totalMax,
                    estmP_TotalObtMarks: 0, // temp
                    estmP_Percentage: 0,
                    estmP_TotalGrade: '',
                    estmP_Result: '',
                    estmP_ClassRank: i,
                    estmP_SectionRank: i,
                    asA_ClassHeld: 200,
                    asA_Class_Attended: 180,
                    emgD_Remarks: 'Good Performance'
                });
            });

            // Update totals for this student
            const percentage = Math.round((totalObt / totalMax) * 100);
            const grade = percentage >= 90 ? 'A+' : percentage >= 75 ? 'A' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'D';

            rows.filter((r) => r.amsT_Id === 15000 + i).forEach((r) => {
                r.estmP_TotalObtMarks = totalObt;
                r.estmP_Percentage = percentage;
                r.estmP_TotalGrade = grade;
                r.estmP_Result = percentage >= 35 ? 'Pass' : 'Fail';
            });
        }

        return rows;
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

    const handlePrint = () => window.print();

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Progress Card Report' defaultOpen>
                <ProgressCardReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <ProgressCardReport
                        reportData={reportData}
                        institution={institution}
                        subjects={subjects}
                        headerInfo={headerInfo}
                        examName={examName}
                        examCode={examCode}
                        year={year}
                        onPrint={handlePrint}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
