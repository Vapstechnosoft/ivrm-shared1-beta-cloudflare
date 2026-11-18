'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getExamReportCard, getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IExamReportCard, IMasterInstitution, ISubject, Institution } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import BrsPreBoardReportCardForm from './_components/add-form';
import BrsPreBoardProgressCardReport from './_components/brs-preboard-progress-card-report';

export default function BrsPreBoardReportCardPage() {
    const [reportData, setReportData] = useState<IExamReportCard[]>([]);
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [headerInfo, setHeaderInfo] = useState<any>({});
    const [examName, setExamName] = useState<string>('');
    const [examCode] = useState<string>('');
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
            console.log(res, 'BRS PreBoard Report Response');

            const apiData = res?.data;
            const flatRows: any[] = apiData?.list || (Array.isArray(apiData) ? apiData : []);

            if (!res?.success || !Array.isArray(flatRows) || flatRows.length === 0) {
                toast.error('No records found');
                setIsReportVisible(false);
                return;
            }

            // Extract additional data from response (sub-subjects, sub-subject marks)
            const sub_subject: any[] =
                apiData?.sub_subject ||
                (res as any).sub_subject ||
                (apiData?.sub_subject_marks || (res as any).sub_subject_marks)?.reduce((acc: any[], m: any) => {
                    if (!acc.find((s: any) => s.EMSS_Id === m.EMSS_Id)) {
                        acc.push({ EMSS_Id: m.EMSS_Id, EMSS_SubSubjectName: m.EMSS_SubSubjectName });
                    }
                    return acc;
                }, []) ||
                [];

            const sub_subject_marks_raw: any[] = apiData?.sub_subject_marks || (res as any).sub_subject_marks || [];

            const studentMap = new Map<number, IExamReportCard & { sub_subject: any[]; sub_subjectmarks: any[] }>();
            const subjectMap = new Map<number, ISubject>();

            flatRows.forEach((row) => {
                const studentId = row.amsT_Id;

                // Build unique subjects list
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

                // Initialize student entry
                if (!studentMap.has(studentId)) {
                    studentMap.set(studentId, {
                        amsT_Id: studentId,
                        amsT_FirstName: row.amsT_FirstName?.trim() || '',
                        amsT_FatherName: row.amsT_FatherName || 'N/A',
                        amsT_MotherName: row.amsT_MotherName || row._MotherName || 'N/A',
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
                        estmP_TotalGradeRemark: row.emgD_Remarks || row.estmP_TotalGradeRemark || '',
                        // Extra fields used in BRS report
                        userName: row.userName, // House name
                        _MotherName: row._MotherName,
                        // Sub-subjects shared across the report
                        sub_subject: sub_subject,
                        sub_subjectmarks: sub_subject_marks_raw.filter((m: any) => m.AMST_Id === studentId)
                    } as any);
                }

                // Add subject marks row
                if (row.ismS_Id && row.estmpS_MaxMarks > 0) {
                    studentMap.get(studentId)!.sub_list.push({
                        ismS_Id: row.ismS_Id,
                        estmpS_MaxMarks: row.estmpS_MaxMarks,
                        estmpS_ObtainedMarks: row.estmpS_ObtainedMarks ?? null,
                        estmpS_MinMarks: row.estmpS_MinMarks,
                        estmpS_ObtainedGrade: row.estmpS_ObtainedGrade || '-',
                        estmpS_PassFailFlg: row.estmpS_PassFailFlg,
                        estmpS_ClassAverage: row.estmpS_ClassAverage,
                        ESTMPS_ClassHighest: row.ESTMPS_ClassHighest
                    } as any);
                }
            });

            // Filter to only subjects that have actual marks
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
            setExamName(firstRow.emE_ExamName || 'Progress Report');
            setYear(firstRow.asmaY_Year || new Date().getFullYear().toString());
            setIsReportVisible(true);
            toast.success(`${studentMap.size} progress card(s) generated successfully!`);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Error generating report');
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
            }
        };
        fetchInstitution();
    }, []);

    const handlePrint = () => window.print();

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Progress Card Report' defaultOpen>
                <BrsPreBoardReportCardForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <div ref={printRef}>
                    <CollapsibleSection title='Progress Cards Report' defaultOpen>
                        <BrsPreBoardProgressCardReport
                            reportData={reportData as any}
                            institution={institution}
                            subjects={subjects}
                            headerInfo={headerInfo}
                            examName={examName}
                            examCode={examCode}
                            year={year}
                            onPrint={handlePrint}
                        />
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
