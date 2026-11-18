'use client';

import { Button } from '@/components/ui/button';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const getGradeFromPercentage = (pct: number) => {
    if (pct >= 91) return 'A1';
    if (pct >= 81) return 'A2';
    if (pct >= 71) return 'B1';
    if (pct >= 61) return 'B2';
    if (pct >= 51) return 'C1';
    if (pct >= 41) return 'C2';
    if (pct >= 33) return 'D';
    return 'E';
};

interface ReportListProps {
    data: any;
    academicYear: string;
    generatedDate?: Date;
}

export const ReportList = ({ data, academicYear, generatedDate }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    // --- Data Processing (Optimized Binding with GMGS compatibility) ---
    const groupDetails = useMemo(() => {
        if (data.getgroupdetails && data.getgroupdetails.length > 0) {
            return data.getgroupdetails;
        }
        if (data.studentMarks) {
            const groupsMap = new Map();
            data.studentMarks.forEach((m: any) => {
                const name = m.empsG_GroupName || m.empsG_DisplayName || m.EMPG_GroupName || m.EMPG_DistplayName;
                const order = m.empsG_Order ?? m.EMPG_Order ?? 0;
                const id = m.empsG_Id ?? m.EMPG_Id;
                if (name && !groupsMap.has(name)) {
                    groupsMap.set(name, {
                        empG_GroupName: name,
                        empG_DistplayName: name,
                        empG_Order: order,
                        EMPG_GroupName: name,
                        EMPG_DistplayName: name,
                        EMPG_Order: order,
                        empG_Id: id,
                        EMPG_Id: id
                    });
                }
            });
            return Array.from(groupsMap.values()).sort((a: any, b: any) => a.empG_Order - b.empG_Order);
        }
        return [];
    }, [data]);

    const groupExamDetails = useMemo(() => {
        if (data.getgroupexamdetails && data.getgroupexamdetails.length > 0) {
            return data.getgroupexamdetails;
        }
        if (data.studentMarks) {
            const examsMap = new Map();
            data.studentMarks.forEach((m: any) => {
                const groupName = m.empsG_GroupName || m.empsG_DisplayName || m.EMPG_GroupName || m.EMPG_DistplayName;
                const examName = m.emE_ExamName || m.EME_ExamName;
                const examId = m.emE_Id ?? m.EME_Id;
                const examOrder = m.emE_ExamOrder ?? m.EME_ExamOrder ?? 0;
                const maxMarks = m.empS_ConvertForMarks ?? m.EMPSGE_ForMaxMarkrs ?? 0;
                if (examId !== 9800000 && examId !== 9800001 && examId && groupName) {
                    const key = `${groupName}_${examId}`;
                    if (!examsMap.has(key)) {
                        examsMap.set(key, {
                            empG_GroupName: groupName,
                            empG_DistplayName: groupName,
                            EMPG_GroupName: groupName,
                            EMPG_DistplayName: groupName,
                            emE_Id: examId,
                            EME_Id: examId,
                            emE_ExamName: examName,
                            EME_ExamName: examName,
                            emE_ExamOrder: examOrder,
                            EME_ExamOrder: examOrder,
                            empsgE_ForMaxMarkrs: maxMarks,
                            EMPSGE_ForMaxMarkrs: maxMarks
                        });
                    }
                }
            });
            return Array.from(examsMap.values()).sort((a: any, b: any) => a.emE_ExamOrder - b.emE_ExamOrder);
        }
        return [];
    }, [data]);

    const studentDetails = useMemo(() => {
        if (data.getstudentdetails && data.getstudentdetails.length > 0) {
            return data.getstudentdetails;
        }
        if (data.studentSubjects) {
            const studentsMap = new Map();
            data.studentSubjects.forEach((subj: any) => {
                if (subj.amsT_Id && !studentsMap.has(subj.amsT_Id)) {
                    const populatedRow = data.studentSubjects.find((s: any) => s.amsT_Id === subj.amsT_Id && s.studentName) || subj;
                    studentsMap.set(subj.amsT_Id, {
                        amsT_Id: populatedRow.amsT_Id,
                        studentName: populatedRow.studentName || populatedRow.studentname,
                        admissionNo: populatedRow.admissionNo || populatedRow.admNo || populatedRow.admno,
                        className: populatedRow.className || populatedRow.classname,
                        sectionName: populatedRow.sectionName || populatedRow.sectionname,
                        dob: populatedRow.dob,
                        fatherName: populatedRow.fatherName || populatedRow.fathername,
                        motherName: populatedRow.motherName || populatedRow.mothername,
                        photo: populatedRow.photo,
                        height: populatedRow.height,
                        weight: populatedRow.weight,
                        bloodGroup: populatedRow.bloodGroup,
                        dentalHygiene: populatedRow.dentalHygiene,
                        visionHygiene: populatedRow.visionHygiene,
                        overallResult: populatedRow.overallResult || populatedRow.overallresult || populatedRow.overallResultFlg,
                        classRank: populatedRow.classRank,
                        sectionRank: populatedRow.sectionRank,
                        grandTotal: populatedRow.grandTotal,
                        totalPercentage: populatedRow.totalPercentage,
                        presentDays: populatedRow.presentDays,
                        totalWorkingDays: populatedRow.totalWorkingDays,
                        attendancePercentage: populatedRow.attendancePercentage
                    });
                }
            });
            return Array.from(studentsMap.values());
        }
        return [];
    }, [data]);

    console.log('studentdetails', studentDetails);

    const studentWiseSubjects = useMemo(() => {
        if (data.studentSubjects) {
            return data.studentSubjects.map((s: any) => ({
                ...s,
                AMST_Id: s.amsT_Id,
                ISMS_SubjectName: s.subjectName,
                ismS_SubjectName: s.subjectName,
                ismS_Id: s.ismS_Id ?? (data.studentMarks || []).find((m: any) => m.ismS_SubjectName === s.subjectName)?.ismS_Id,
                ISMS_Id: s.ismS_Id ?? (data.studentMarks || []).find((m: any) => m.ismS_SubjectName === s.subjectName)?.ismS_Id,
                empS_AppToResultFlg: s.appToResultFlg === 'true' || s.appToResultFlg === true,
                EMPS_AppToResultFlg: s.appToResultFlg === 'true' || s.appToResultFlg === true
            }));
        }
        return data.getstudentwisesubjectlist || [];
    }, [data]);

    const termDetails = useMemo(() => {
        if (data.gettermdetails && data.gettermdetails.length > 0) {
            return data.gettermdetails;
        }
        return (groupDetails || []).map((g: any) => ({
            ecT_Id: g.empG_GroupName || g.EMPG_GroupName,
            ect_Id: g.empG_GroupName || g.EMPG_GroupName,
            ECT_Id: g.empG_GroupName || g.EMPG_GroupName,
            ecT_TermName: g.empG_GroupName || g.EMPG_GroupName
        }));
    }, [data, groupDetails]);

    const studentMarksDetails = useMemo(() => {
        return data.studentMarks || data.getstudentmarksdetails || data.savelist || [];
    }, [data]);

    const promotionRemarks = useMemo(() => {
        if (data.getpromotionremarksdetails && data.getpromotionremarksdetails.length > 0) {
            return data.getpromotionremarksdetails;
        }
        if (data.studentSubjects) {
            const map = new Map();
            data.studentSubjects.forEach((s: any) => {
                if (s.amsT_Id && !map.has(s.amsT_Id)) {
                    map.set(s.amsT_Id, {
                        amsT_Id: s.amsT_Id,
                        eprD_Remarks: s.overallResult || s.overallResultFlg || 'pass'
                    });
                }
            });
            return Array.from(map.values());
        }
        return [];
    }, [data]);

    const activityMainListArea = useMemo(() => data.getstudentwiseactiviteslist || [], [data]);

    const workAttendence = useMemo(() => {
        if (data.work_attendence && data.work_attendence.length > 0) {
            return data.work_attendence;
        }
        if (data.studentSubjects) {
            const map = new Map();
            data.studentSubjects.forEach((s: any) => {
                if (s.amsT_Id && !map.has(s.amsT_Id)) {
                    map.set(s.amsT_Id, {
                        amsT_Id: s.amsT_Id,
                        TotalWorkingDays: s.totalWorkingDays,
                        totalWorkingDays: s.totalWorkingDays,
                        TotalSchoolDays: s.totalWorkingDays,
                        totalSchoolDays: s.totalWorkingDays
                    });
                }
            });
            return Array.from(map.values());
        }
        return [];
    }, [data]);

    const presentAttendence = useMemo(() => {
        if (data.present_attendence && data.present_attendence.length > 0) {
            return data.present_attendence;
        }
        if (data.studentSubjects) {
            const map = new Map();
            data.studentSubjects.forEach((s: any) => {
                if (s.amsT_Id && !map.has(s.amsT_Id)) {
                    map.set(s.amsT_Id, {
                        amsT_Id: s.amsT_Id,
                        TotalPresentDays: s.presentDays,
                        totalPresentDays: s.presentDays,
                        presentDays: s.presentDays,
                        TotalPercentage: s.attendancePercentage,
                        totalPercentage: s.attendancePercentage,
                        Total_Percentage: s.attendancePercentage,
                        total_Percentage: s.attendancePercentage
                    });
                }
            });
            return Array.from(map.values());
        }
        return [];
    }, [data]);

    const institutionDetails = useMemo(() => data.getinstitution || [], [data]);
    const classTeacherName = useMemo(() => data.clstchname || [], [data]);

    // Build the dynamic columns for the scholastic table
    const groupWiseExamList = useMemo(() => {
        const list: any[] = [];
        if (groupDetails.length > 0) {
            groupDetails.forEach((group: any) => {
                const exams = groupExamDetails.filter(
                    (ge: any) => (ge.empG_DistplayName || ge.EMPG_DistplayName) === (group.empG_DistplayName || group.EMPG_DistplayName)
                );
                exams.forEach((exam: any) => {
                    list.push({
                        ...exam,
                        EMPG_GroupName: exam.empG_GroupName || exam.EMPG_GroupName,
                        EME_Id: exam.emE_Id || exam.EME_Id,
                        EME_ExamName: exam.emE_ExamName || exam.EME_ExamName,
                        EMPSGE_ForMaxMarkrs: exam.empsgE_ForMaxMarkrs || exam.EMPSGE_ForMaxMarkrs,
                        isTotal: false,
                        isGrade: false
                    });
                });
            });
        }
        // Add Total and Grade columns based on Angular Logic
        list.push({
            EME_Id: 9800000,
            EMPG_DistplayName: 'Total',
            EME_ExamName: 'Total',
            EME_Marks: 'Total',
            isTotal: true,
            isGrade: false
        });
        list.push({
            EME_Id: 9800001,
            EMPG_DistplayName: 'Grade',
            EME_ExamName: 'Grade',
            EME_Marks: 'Grade',
            isTotal: false,
            isGrade: true
        });
        return list;
    }, [groupDetails, groupExamDetails]);

    return (
        <div className='printable-content space-y-6 print:space-y-0'>
            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='flex w-fit items-center gap-2'>
                    <Printer className='h-4 w-4' /> Print Report
                </Button>
            </div>

            <div ref={printRef} className='print-area' style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                {studentDetails.length > 0 ? (
                    studentDetails.map((report: any, index: number) => {
                        const studentID = report.amsT_Id || report.AMST_Id;

                        // Extract subjects for this student
                        const studentSubjects = studentWiseSubjects.filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentID);
                        const studentMarks = studentMarksDetails.filter((m: any) => (m.amsT_Id || m.AMST_Id) === studentID);

                        // Co-scholastic activities data processing
                        const studentActivities = activityMainListArea.filter((act: any) => {
                            const actAmstId = act.AMST_Id ?? act.amsT_Id ?? act.studentId;
                            return String(actAmstId) === String(studentID);
                        });

                        // Extract unique activity categories (ECACT_SkillName / activityName) for this student
                        const activity_main_list_area: any[] = [];
                        studentActivities.forEach((act: any) => {
                            const catName = act.activityName ?? act.ECACT_SkillName ?? act.ecacT_SkillName;
                            const catId = act.ecacT_Id ?? act.ECACT_Id;
                            if (catName) {
                                const exists = activity_main_list_area.some(
                                    (item: any) => (item.activityName ?? item.ECACT_SkillName) === catName
                                );
                                if (!exists) {
                                    activity_main_list_area.push({
                                        ECACT_SkillName: catName,
                                        activityName: catName,
                                        ECACT_Id: catId,
                                        ecacT_Id: catId
                                    });
                                }
                            }
                        });

                        // Extract unique activity skill areas (ECACTA_SkillArea / activityArea) for this student
                        const activity_main_list: any[] = [];
                        studentActivities.forEach((act: any) => {
                            const areaName = act.activityArea ?? act.ECACTA_SkillArea ?? act.ecactA_SkillArea;
                            const catId = act.ecacT_Id ?? act.ECACT_Id;
                            if (areaName) {
                                const exists = activity_main_list.some(
                                    (item: any) => (item.activityArea ?? item.ECACTA_SkillArea) === areaName
                                );
                                if (!exists) {
                                    activity_main_list.push({
                                        ECACTA_SkillArea: areaName,
                                        activityArea: areaName,
                                        activityGrade: act.activityGrade ?? act.EMGD_Name ?? act.emgD_Name ?? act.ecsactT_Score,
                                        ECACT_Id: catId,
                                        ecacT_Id: catId,
                                        activity_score_details: []
                                    });
                                }
                            }
                        });

                        // Build activity score details per term
                        activity_main_list.forEach((act: any) => {
                            termDetails.forEach((term: any) => {
                                const termId = term.ecT_Id ?? term.ect_Id ?? term.ECT_Id;
                                const matchingAct = studentActivities.find((dd: any) => {
                                    const ddTermId = dd.activity_ECT_Id ?? dd.ECT_Id ?? dd.ecT_Id ?? dd.ect_Id;
                                    const actArea = act.activityArea ?? act.ECACTA_SkillArea;
                                    const ddArea = dd.activityArea ?? dd.ECACTA_SkillArea ?? dd.ecactA_SkillArea;
                                    return ddArea === actArea && String(ddTermId) === String(termId);
                                });
                                if (matchingAct) {
                                    act.activity_score_details.push({
                                        EMGD_Name:
                                            matchingAct.activityGrade ??
                                            matchingAct.EMGD_Name ??
                                            matchingAct.emgD_Name ??
                                            matchingAct.ecsactT_Score,
                                        activityGrade:
                                            matchingAct.activityGrade ??
                                            matchingAct.EMGD_Name ??
                                            matchingAct.emgD_Name ??
                                            matchingAct.ecsactT_Score,
                                        ecT_Id: termId
                                    });
                                }
                            });
                        });

                        // Health details from report
                        const height = report.amsT_height || report.AMST_height;
                        const weight = report.amsT_Weight || report.AMST_Weight;
                        const bloodGroup = report.amsT_BloodGroup || report.AMST_BloodGroup;

                        // Attendance details
                        const workAtt = workAttendence.find((a: any) => (a.amsT_Id || a.AMST_Id) === studentID) || {};
                        const presentAtt = presentAttendence.find((a: any) => a.studentId === studentID) || {};

                        // Remarks
                        const remarkObj = promotionRemarks.find((r: any) => (r.amsT_Id || r.AMST_Id) === studentID);
                        console.log('remarkObj', remarkObj);
                        // Graph data for Class Average vs Student Score
                        const graphSubjects = studentSubjects.filter(
                            (s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg || s.subjectName
                        );
                        const graphLabels =
                            data.graph1_Labels || graphSubjects.map((s: any) => s.ISMS_SubjectName || s.ismS_SubjectName || s.subjectName);

                        // Default to GMVPS logic if properties exist on subject
                        const graphScores =
                            data.graph1_Scores && studentDetails.length === 1
                                ? data.graph1_Scores
                                : graphSubjects.map((s: any) => {
                                    const subjScore = s.subjectObtainedMarks ?? s.subjectPercentage ?? s.ESTMPPS_ObtainedMarks;
                                    if (subjScore !== undefined) return Number(subjScore);

                                    // Otherwise calculate sum of marks across all groups
                                    let total = 0;
                                    groupWiseExamList
                                        .filter((e) => e.isTotal)
                                        .forEach((groupTotalExam: any) => {
                                            const groupExams = groupWiseExamList.filter(
                                                (e) =>
                                                    !e.isTotal &&
                                                    !e.isGrade &&
                                                    (e.EMPG_DistplayName || e.empG_DistplayName) ===
                                                    (groupTotalExam.EMPG_DistplayName || groupTotalExam.empG_DistplayName)
                                            );
                                            groupExams.forEach((ge) => {
                                                const mark = studentMarks.find((m: any) => {
                                                    const ismsMatch =
                                                        (m.ISMS_Id || m.ismS_Id) &&
                                                        (s.ISMS_Id || s.ismS_Id) &&
                                                        (m.ISMS_Id || m.ismS_Id) === (s.ISMS_Id || s.ismS_Id);
                                                    const nameMatch =
                                                        (m.ismS_SubjectName || m.ISMS_SubjectName) &&
                                                        (s.subjectName || s.ISMS_SubjectName) &&
                                                        (m.ismS_SubjectName || m.ISMS_SubjectName).toLowerCase() ===
                                                        (s.subjectName || s.ISMS_SubjectName).toLowerCase();
                                                    return (ismsMatch || nameMatch) && (m.EME_Id || m.emE_Id) === ge.EME_Id;
                                                });
                                                if (mark) total += mark.ObtainedMarks || mark.obtainedMarks || 0;
                                            });
                                        });
                                    return total;
                                });

                        const graphClassAverages =
                            data.graph1_Averages && studentDetails.length === 1
                                ? data.graph1_Averages
                                : graphSubjects.map((s: any) => {
                                    const subjAvg = s.classAverage ?? s.ESTMPPS_ClassAverage ?? s.estmpps_ClassAverage;
                                    if (subjAvg !== undefined) return Number(subjAvg);

                                    // If missing, look for it in studentMarks
                                    let avg = 0;
                                    const markWithAvg = studentMarks.find((m: any) => {
                                        const ismsMatch =
                                            (m.ISMS_Id || m.ismS_Id) &&
                                            (s.ISMS_Id || s.ismS_Id) &&
                                            (m.ISMS_Id || m.ismS_Id) === (s.ISMS_Id || s.ismS_Id);
                                        const nameMatch =
                                            (m.ismS_SubjectName || m.ISMS_SubjectName) &&
                                            (s.subjectName || s.ISMS_SubjectName) &&
                                            (m.ismS_SubjectName || m.ISMS_SubjectName).toLowerCase() ===
                                            (s.subjectName || s.ISMS_SubjectName).toLowerCase();
                                        return (
                                            (ismsMatch || nameMatch) &&
                                            (m.ESTMPPS_ClassAverage || m.estmpps_ClassAverage || m.classAverage)
                                        );
                                    });
                                    if (markWithAvg)
                                        avg =
                                            markWithAvg.ESTMPPS_ClassAverage ||
                                            markWithAvg.estmpps_ClassAverage ||
                                            markWithAvg.classAverage;
                                    return avg;
                                });

                        // Graph 2: Performance Analysis (Term wise)
                        const groupedMarksBySubject = graphSubjects.map((subj: any) => {
                            const subjObj: any = { subject: subj.ISMS_SubjectName || subj.ismS_SubjectName || subj.subjectName, terms: {} };
                            groupDetails.forEach((group: any) => {
                                const groupName = group.EMPG_DistplayName || group.empG_DistplayName;
                                const examsInGroup = groupExamDetails.filter(
                                    (ge: any) => (ge.EMPG_DistplayName || ge.empG_DistplayName) === groupName
                                );
                                let groupTotal = 0;
                                examsInGroup.forEach((exam: any) => {
                                    const mark = studentMarks.find((m: any) => {
                                        const ismsMatch =
                                            (m.ISMS_Id || m.ismS_Id) &&
                                            (subj.ISMS_Id || subj.ismS_Id) &&
                                            (m.ISMS_Id || m.ismS_Id) === (subj.ISMS_Id || subj.ismS_Id);
                                        const nameMatch =
                                            (m.ismS_SubjectName || m.ISMS_SubjectName) &&
                                            (subj.subjectName || subj.ISMS_SubjectName) &&
                                            (m.ismS_SubjectName || m.ISMS_SubjectName).toLowerCase() ===
                                            (subj.subjectName || subj.ISMS_SubjectName).toLowerCase();
                                        return (ismsMatch || nameMatch) && (m.EME_Id || m.emE_Id) === (exam.EME_Id || exam.emE_Id);
                                    });
                                    if (mark) groupTotal += mark.ObtainedMarks || mark.obtainedMarks || 0;
                                });
                                subjObj.terms[groupName] = groupTotal;
                            });
                            return subjObj;
                        });

                        const graph2Labels = groupedMarksBySubject.map((item: any) => item.subject);
                        const allTerms = groupDetails.map((g: any) => g.EMPG_DistplayName || g.empG_DistplayName);
                        const termColors: any = { 'TERM I': '#1cc405', 'TERM II': '#770396' };
                        const graph2Datasets = (
                            data.graph2_Datasets && studentDetails.length === 1
                                ? data.graph2_Datasets
                                : allTerms.map((term: any, idx: number) => ({
                                    label: term as string,
                                    data: groupedMarksBySubject.map((subject: any) => subject.terms[term] || 0),
                                    backgroundColor: termColors[term as string] || (idx === 0 ? '#1cc405' : '#770396'),
                                    borderColor: 'black',
                                    borderWidth: 1
                                }))
                        ).map((dataset: any) => ({
                            ...dataset,
                            barPercentage: 0.2,
                            categoryPercentage: 0.5
                        }));

                        // console.log(`Student ${studentID} API DATA:`, {
                        //     studentSubjects,
                        //     studentMarks,
                        //     graph1_Labels: graphLabels,
                        //     graph1_Scores: graphScores,
                        //     graph1_Averages: graphClassAverages,
                        //     graph2_GroupedMarks: groupedMarksBySubject,
                        //     graph2_Datasets: graph2Datasets
                        // });

                        return (
                            <div
                                key={index}
                                className={`mx-auto mb-8 w-[90%] max-w-[90%] border border-gray-300 bg-white p-2 shadow-sm print:mx-0 print:w-full print:max-w-full print:border-none print:p-0 print:shadow-none ${index > 0 ? 'page-break-before-always' : ''}`}
                                style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                                <div className='mb-4 flex w-full justify-center'>
                                    <img
                                        src={
                                            institutionDetails.length > 0 && institutionDetails[0].mI_Logo
                                                ? institutionDetails[0].mI_Logo
                                                : 'https://vapsclg.blob.core.windows.net/files/3/InstitutionLogo/6ef102c1-0117-446e-93fa-9b6d9cad9fda.jpg'
                                        }
                                        alt='Report Header'
                                        className='w-full object-contain'
                                    />
                                </div>

                                <h3 className='mb-6 text-center font-bold text-xl uppercase'>ACHIEVEMENT RECORD {academicYear}</h3>

                                {/* Student Profile */}
                                <div className='relative mb-8 px-8'>
                                    <div className='flex w-3/4 flex-col space-y-1 text-[15px]'>
                                        {[
                                            { label: 'Name of the Student', value: report.studentname || report.studentName },
                                            { label: 'Admission Number', value: report.admno || report.admNo || report.admissionNo },
                                            {
                                                label: 'Class & Section',
                                                value: `${report.classname || report.className}    ${report.sectionname || report.sectionName}`
                                            },
                                            { label: 'Date of Birth', value: report.dob },
                                            { label: "Mother's Name", value: report.mothername || report.motherName },
                                            { label: "Father's Name", value: report.fathername || report.fatherName }
                                        ].map((item, i) => (
                                            <div key={i} className='flex'>
                                                <div className='w-48 font-bold'>{item.label}</div>
                                                <div className='w-4 font-bold'>:</div>
                                                <div className='ml-2 font-bold'>{item.value || ''}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='absolute top-[-20px] right-8'>
                                        <div className='flex h-[130px] w-[110px] items-center justify-center self-center border border-gray-400 bg-gray-100 p-1'>
                                            {report.photo || report.AMST_Photoname || report.amsT_Photoname ? (
                                                <img
                                                    src={report.photo || report.AMST_Photoname || report.amsT_Photoname}
                                                    alt='Student Photo'
                                                    className='h-full w-full object-cover'
                                                />
                                            ) : (
                                                <span className='font-bold text-gray-500 text-xs'>PHOTO</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Scholastic Section */}
                                <h3 className='mb-2 text-center font-bold text-[#1a3b7c] text-xl uppercase'>SCHOLASTIC REPORT</h3>
                                <div className='px-4'>
                                    <table className='mb-6 w-full border-collapse border border-gray-400 text-sm'>
                                        <thead>
                                            <tr>
                                                <th className='w-48 border border-gray-400 bg-[#BABABA] p-2 text-left text-black'>
                                                    <b>&nbsp;</b>
                                                </th>
                                                {groupDetails.map((group: any, gi: number) => {
                                                    const examsInGroup = groupExamDetails.filter(
                                                        (ge: any) =>
                                                            (ge.empG_DistplayName || ge.EMPG_DistplayName) ===
                                                            (group.empG_DistplayName || group.EMPG_DistplayName)
                                                    );
                                                    return (
                                                        <th
                                                            key={gi}
                                                            colSpan={examsInGroup.length}
                                                            className='max-w-[150px] break-words border border-gray-400 bg-[#BABABA] p-2 text-center font-bold text-black'>
                                                            <strong>{group.empG_GroupName || group.EMPG_GroupName}</strong>
                                                        </th>
                                                    );
                                                })}
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-center font-bold text-black'></th>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-center font-bold text-black'></th>
                                            </tr>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-left font-bold text-black uppercase'>
                                                    SUBJECT
                                                </th>
                                                {groupWiseExamList.map((exam: any, i: number) => (
                                                    <th
                                                        key={i}
                                                        className='max-w-[150px] break-words border border-gray-400 bg-[#BABABA] p-2 text-center text-black'>
                                                        <strong>{exam.EME_ExamName}</strong>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentSubjects
                                                .filter((s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg || s.subjectName)
                                                .map((subj: any, sIdx: number) => (
                                                    <tr key={sIdx}>
                                                        <td className='break-words border border-gray-400 p-2 text-left'>
                                                            {subj.ISMS_SubjectName || subj.ismS_SubjectName || subj.subjectName}
                                                        </td>
                                                        {groupWiseExamList.map((exam: any, eIdx: number) => {
                                                            const mark = studentMarks.find((m: any) => {
                                                                const ismsMatch =
                                                                    (m.ISMS_Id || m.ismS_Id) &&
                                                                    (subj.ISMS_Id || subj.ismS_Id) &&
                                                                    (m.ISMS_Id || m.ismS_Id) === (subj.ISMS_Id || subj.ismS_Id);
                                                                const nameMatch =
                                                                    (m.ismS_SubjectName || m.ISMS_SubjectName) &&
                                                                    (subj.subjectName || subj.ISMS_SubjectName) &&
                                                                    (m.ismS_SubjectName || m.ISMS_SubjectName).toLowerCase() ===
                                                                    (subj.subjectName || subj.ISMS_SubjectName).toLowerCase();
                                                                return (ismsMatch || nameMatch) && (m.EME_Id || m.emE_Id) === exam.EME_Id;
                                                            });

                                                            let displayValue = '';

                                                            if (exam.isTotal) {
                                                                const totalMarks = studentMarks
                                                                    .filter((m: any) => {
                                                                        const ismsMatch =
                                                                            (m.ISMS_Id || m.ismS_Id) &&
                                                                            (subj.ISMS_Id || subj.ismS_Id) &&
                                                                            (m.ISMS_Id || m.ismS_Id) === (subj.ISMS_Id || subj.ismS_Id);
                                                                        const nameMatch =
                                                                            (m.ismS_SubjectName || m.ISMS_SubjectName) &&
                                                                            (subj.subjectName || subj.ISMS_SubjectName) &&
                                                                            (m.ismS_SubjectName || m.ISMS_SubjectName).toLowerCase() ===
                                                                            (subj.subjectName || subj.ISMS_SubjectName).toLowerCase();
                                                                        return (
                                                                            (ismsMatch || nameMatch) &&
                                                                            (m.EME_Id || m.emE_Id) !== 9800000 &&
                                                                            (m.EME_Id || m.emE_Id) !== 9800001
                                                                        );
                                                                    })
                                                                    .reduce(
                                                                        (acc: number, curr: any) =>
                                                                            acc + (curr.ObtainedMarks || curr.obtainedMarks || 0),
                                                                        0
                                                                    );
                                                                displayValue =
                                                                    totalMarks > 0
                                                                        ? totalMarks.toString()
                                                                        : subj.subjectObtainedMarks
                                                                            ? subj.subjectObtainedMarks.toString()
                                                                            : '';
                                                            } else if (exam.isGrade) {
                                                                if (subj.subjectGrade) {
                                                                    displayValue = subj.subjectGrade;
                                                                } else {
                                                                    const maxMarks = subj.subjectMaxMarks || 200;
                                                                    const totalMarks = studentMarks
                                                                        .filter((m: any) => {
                                                                            const ismsMatch =
                                                                                (m.ISMS_Id || m.ismS_Id) &&
                                                                                (subj.ISMS_Id || subj.ismS_Id) &&
                                                                                (m.ISMS_Id || m.ismS_Id) === (subj.ISMS_Id || subj.ismS_Id);
                                                                            const nameMatch =
                                                                                (m.ismS_SubjectName || m.ISMS_SubjectName) &&
                                                                                (subj.subjectName || subj.ISMS_SubjectName) &&
                                                                                (m.ismS_SubjectName || m.ISMS_SubjectName).toLowerCase() ===
                                                                                (
                                                                                    subj.subjectName || subj.ISMS_SubjectName
                                                                                ).toLowerCase();
                                                                            return (
                                                                                (ismsMatch || nameMatch) &&
                                                                                (m.EME_Id || m.emE_Id) !== 9800000 &&
                                                                                (m.EME_Id || m.emE_Id) !== 9800001
                                                                            );
                                                                        })
                                                                        .reduce(
                                                                            (acc: number, curr: any) =>
                                                                                acc + (curr.ObtainedMarks || curr.obtainedMarks || 0),
                                                                            0
                                                                        );
                                                                    const pct = (totalMarks / maxMarks) * 100;
                                                                    if (totalMarks > 0) {
                                                                        displayValue = getGradeFromPercentage(pct);
                                                                    }
                                                                }
                                                            } else if (mark) {
                                                                const pfFlag = mark.PassFailFlag || mark.passFailFlag;
                                                                if (pfFlag === 'AB' || pfFlag === 'M' || pfFlag === 'L') {
                                                                    displayValue = pfFlag;
                                                                } else {
                                                                    displayValue = (
                                                                        mark.ObtainedMarks ??
                                                                        mark.obtainedMarks ??
                                                                        ''
                                                                    ).toString();
                                                                }
                                                            }

                                                            return (
                                                                <td key={eIdx} className='border border-gray-400 p-2 text-center'>
                                                                    {displayValue}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Grading Scale */}
                                <div className='mt-6 mb-6 px-4'>
                                    <h3 className='mb-2 text-left font-bold text-[#1a3b7c] text-lg uppercase underline'>
                                        SCHOLASTIC GRADING SCALE
                                    </h3>
                                    <table className='w-full border-collapse border border-gray-400 text-center text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 font-bold'>Grade</th>
                                                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D', 'E'].map((g) => (
                                                    <th key={g} className='border border-gray-400 p-2 font-bold'>
                                                        {g}
                                                    </th>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className='border border-gray-400 bg-[#BABABA] p-2 font-bold'>Mark</td>
                                                {['91-100', '81-90', '71-80', '61-70', '51-60', '41-50', '33-40', '0-32'].map((m) => (
                                                    <td key={m} className='border border-gray-400 p-2'>
                                                        {m}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Graph 1 */}
                                <div className='mt-10 mb-10 flex w-full justify-center px-4'>
                                    <div className='flex w-3/4 flex-col items-center'>
                                        <h4 className='mb-4 text-center font-bold text-[#1a3b7c] text-lg uppercase'>
                                            STUDENT PERFORMANCE INDEX
                                        </h4>
                                        <div className='flex h-[300px] w-full justify-center'>
                                            <Bar
                                                data={{
                                                    labels: graphLabels,
                                                    datasets: [
                                                        {
                                                            label: 'Class Average',
                                                            data: graphClassAverages,
                                                            backgroundColor: '#FF5733',
                                                            borderColor: 'black',
                                                            borderWidth: 1
                                                        },
                                                        {
                                                            label: 'Student Score',
                                                            data: graphScores,
                                                            backgroundColor: '#00c1e4',
                                                            borderColor: 'black',
                                                            borderWidth: 1
                                                        }
                                                    ]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { position: 'top' as const },
                                                        tooltip: { enabled: true }
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            ticks: { color: 'red' }
                                                        },
                                                        x: {
                                                            ticks: { color: 'blue' }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Co-Scholastic activities & Graph 2 */}
                                <div className='mt-8 grid grid-cols-2 gap-8 px-4'>
                                    <div>
                                        <h3 className='mb-4 text-center font-bold text-[#1a3b7c] text-lg uppercase'>
                                            Co-SCHOLASTIC ACTIVITIES
                                        </h3>
                                        {activity_main_list_area.map((acti: any, idx: number) => {
                                            const actiId = acti.ecacT_Id ?? acti.ECACT_Id;
                                            const subActivities = activity_main_list.filter((subjco: any) => {
                                                const subjcoId = subjco.ecacT_Id ?? subjco.ECACT_Id;
                                                return subjcoId === actiId;
                                            });

                                            return (
                                                <div key={idx} className='mb-6'>
                                                    <h4 className='mb-2 text-center font-bold text-[#1a3b7c] text-lg uppercase'>
                                                        {acti.activityName ?? acti.ECACT_SkillName}
                                                    </h4>
                                                    <table className='w-full border-collapse border border-gray-400 text-sm'>
                                                        <thead className='bg-[#BABABA]'>
                                                            <tr>
                                                                <th className='border border-gray-400 p-2 text-left font-bold text-black uppercase'>
                                                                    Particulars
                                                                </th>
                                                                {termDetails.map((term: any, ti: number) => (
                                                                    <th
                                                                        key={ti}
                                                                        className='border border-gray-400 p-2 text-center font-bold text-black uppercase'>
                                                                        {term.ecT_TermName}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {subActivities.map((subjco: any, ai: number) => (
                                                                <tr key={ai}>
                                                                    <td className='break-words border border-gray-400 p-2 text-left font-bold uppercase'>
                                                                        {subjco.activityArea ?? subjco.ECACTA_SkillArea}
                                                                    </td>
                                                                    {termDetails.map((term: any, ti: number) => {
                                                                        const termId = term.ecT_Id ?? term.ect_Id ?? term.ECT_Id;
                                                                        const score = (subjco.activity_score_details || []).find(
                                                                            (s: any) => String(s.ecT_Id) === String(termId)
                                                                        );
                                                                        return (
                                                                            <td
                                                                                key={ti}
                                                                                className='border border-gray-400 p-2 text-center font-bold'>
                                                                                {score?.activityGrade ?? score?.EMGD_Name ?? ''}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className='flex flex-col items-center pl-6'>
                                        <h4 className='mb-4 text-center font-bold text-[#1a3b7c] text-lg uppercase'>
                                            STUDENT PERFORMANCE ANALYSIS
                                        </h4>
                                        <div className='h-[400px] w-[350px]'>
                                            <Bar
                                                data={{
                                                    labels: graph2Labels,
                                                    datasets: graph2Datasets
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { position: 'top' as const },
                                                        tooltip: { enabled: true }
                                                    },
                                                    scales: {
                                                        y: { beginAtZero: true },
                                                        x: {
                                                            ticks: { minRotation: 40, maxRotation: 40 }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Health Status */}
                                <div className='mt-10 px-4'>
                                    <h4 className='mb-4 text-center font-bold text-[#1a3b7c] text-lg uppercase underline'>HEALTH STATUS</h4>
                                    <table className='w-full border-collapse border border-gray-400 text-center text-sm'>
                                        <tbody>
                                            <tr className='bg-[#BABABA] font-bold text-black'>
                                                <td className='border border-gray-400 p-2'>Height (in cm)</td>
                                                <td className='border border-gray-400 p-2'>Weight (in kg)</td>
                                                <td className='border border-gray-400 p-2'>Blood Group</td>
                                                <td className='border border-gray-400 p-2'>Dental Hygiene</td>
                                                <td className='border border-gray-400 p-2'>Vision ( Right & Left )</td>
                                            </tr>
                                            <tr>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>
                                                    {report.height ||
                                                        report.SPCCSHW_Height ||
                                                        report.AMST_height ||
                                                        report.AMST_Height ||
                                                        ''}
                                                </td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>
                                                    {report.weight || report.SPCCSHW_Weight || report.AMST_Weight || ''}
                                                </td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>
                                                    {report.bloodGroup || report.AMST_BloodGroup || ''}
                                                </td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>
                                                    {report.dentalHygiene || report.HMDNHY_DentalHygiene || '-'}
                                                </td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>
                                                    {report.visionHygiene || report.HMVSN_VisionHygiene || ''}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Attendance */}
                                <div className='mt-10 px-4'>
                                    <h3 className='mb-4 text-center font-bold text-[#1a3b7c] text-lg uppercase underline'>
                                        ATTENDANCE DETAILS
                                    </h3>
                                    <table className='w-full border-collapse border border-gray-400 text-center text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='w-1/6 border border-gray-400 bg-[#BABABA] p-2 text-black'>
                                                    Total number of <br /> working days
                                                </th>
                                                <td className='w-1/6 border border-gray-400 p-2 font-bold'>
                                                    {presentAtt.totalSchoolDays ?? ''}
                                                </td>
                                                <th className='w-1/6 border border-gray-400 bg-[#BABABA] p-2 text-black'>
                                                    Number of days <br /> attended
                                                </th>
                                                <td className='w-1/6 border border-gray-400 p-2 font-bold'>
                                                    {presentAtt.totalWorkingDays ?? ''}
                                                </td>
                                                <th className='w-1/6 border border-gray-400 bg-[#BABABA] p-2 text-black'>
                                                    Attendance <br /> Percentage
                                                </th>
                                                <td className='w-1/6 border border-gray-400 p-2 font-bold'>
                                                    {presentAtt.total_Percentage ?? ''}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Remarks */}
                                <div className='mt-12 px-4'>
                                    <table className='w-full border-collapse border border-gray-400 text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='w-32 border border-gray-400 bg-[#BABABA] p-2 text-left text-black uppercase'>
                                                    REMARKS
                                                </th>
                                                <th className='border border-gray-400 p-2 text-left font-bold uppercase'>
                                                    {remarkObj?.eprD_Remarks || 'pass'}
                                                </th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Result */}
                                <div className='mt-8 px-4'>
                                    <table className='w-full border-collapse border border-gray-400 text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-black w-32 text-left uppercase'>RESULT</th>
                                                <th className='border border-gray-400 p-2 text-left font-bold uppercase'>{remarkObj?.eprD_PromotionName || report?.estmP_Result || report?.overallResult || '-'}</th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Signatures */}
                                <div
                                    className='mt-12 flex w-full items-end justify-between px-8 font-bold'
                                    style={{ fontFamily: 'sans-serif' }}>
                                    {/* Principal Column */}
                                    <div className='flex h-[140px] w-1/3 flex-col items-start justify-end text-left'>
                                        <div className='flex-1'></div> {/* Spacer */}
                                        <span>Principal’s Signature</span>
                                    </div>

                                    {/* Institution Seal Column */}
                                    <div className='flex h-[140px] w-1/3 flex-col items-center justify-end'>
                                        <div className='mb-2 flex flex-1 items-center justify-center'>
                                            <img
                                                src='https://vapsclg.blob.core.windows.net/files/50/managersign/ebca00dc-ae10-43fe-a6ea-99658b662e07.jpg'
                                                style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                                                alt='Manager Sign'
                                            />
                                        </div>
                                        <span>Institution Seal</span>
                                    </div>

                                    {/* Class Teacher Column */}
                                    <div className='flex h-[140px] w-1/3 flex-col items-end justify-end text-right'>
                                        <div className='mb-2 flex flex-1 flex-col items-end justify-end'>
                                            {classTeacherName.length > 0 && (
                                                <span className='uppercase'>{classTeacherName[0].hrmE_EmployeeFirstName}</span>
                                            )}
                                        </div>
                                        <span>Class Teacher’s Signature</span>
                                        <span className='font-normal text-sm'>
                                            Date: {generatedDate ? format(generatedDate, 'dd/MM/yyyy') : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className='p-10 text-center text-gray-500'>No student records found to display the report.</div>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    /* Completely hide non-printed elements so they occupy 0px space */
                    header, footer, nav, form, section:has(form),
                    [class*="navigation"], [class*="navbar"], [class*="footer"], 
                    [class*="stability"], [class*="chatbot"], [class*="Toaster"],
                    .no-print { 
                        display: none !important; 
                    }
                    
                    body { 
                        background: white !important; 
                        -webkit-print-color-adjust: exact;
                        visibility: hidden !important;
                    }
                    
                    /* Reset flex and layout wrapper margins/paddings on print */
                    html, body, main, 
                    body :has(.printable-content),
                    div[class*="flex"], 
                    div[class*="min-h-screen"],
                    .flex-1 {
                        margin: 0 !important;
                        padding: 0 !important;
                        position: static !important;
                        overflow: visible !important;
                        height: auto !important;
                        min-height: 0 !important;
                        box-shadow: none !important;
                        transform: none !important;
                        gap: 0 !important;
                    }
                    
                    .printable-content,
                    .printable-content * {
                        visibility: visible !important;
                    }
                    
                    .printable-content {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    .page-break-before-always { 
                        page-break-before: always !important; 
                        break-before: page !important;
                    }
                    
                    @page { 
                        size: A4 portrait; 
                        margin: 15mm 10mm 15mm 10mm; 
                    }
                }
                .print-area table { border-color: #000 !important; }
                .print-area th, .print-area td { border-color: #000 !important; }
            `}</style>
        </div>
    );
};
