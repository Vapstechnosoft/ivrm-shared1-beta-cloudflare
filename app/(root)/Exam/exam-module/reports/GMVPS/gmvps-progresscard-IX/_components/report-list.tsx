'use client';

import { Button } from '@/components/ui/button';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    // --- Data Processing (Optimized Binding) ---
    const studentDetails = useMemo(() => data.getstudentdetails || [], [data]);
    const institution = useMemo(() => data.getinstitution?.[0] || {}, [data]);
    const studentWiseSubjects = useMemo(() => data.getstudentwisesubjectlist || [], [data]);
    const termDetails = useMemo(() => data.gettermdetails || [], [data]);
    const groupDetails = useMemo(() => data.getgroupdetails || [], [data]);
    const groupExamDetails = useMemo(() => data.getgroupexamdetails || [], [data]);
    const studentMarksDetails = useMemo(() => data.getstudentmarksdetails || [], [data]);
    const examMaxMarks = useMemo(() => data.getexammaxmarks || [], [data]);
    const classTeachers = useMemo(() => data.clstchname || [], [data]);
    const promotionRemarks = useMemo(() => data.getpromotionremarksdetails || [], [data]);
    const activityMainList = useMemo(() => data.getstudentwiseactiviteslist || [], [data]);

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
        // Add Total and Grade columns
        list.push({ EME_Id: 9800000, EMPG_DistplayName: 'Total', EME_ExamName: 'MARKS SCORED(100)', isTotal: true, isGrade: false });
        list.push({ EME_Id: 9800001, EMPG_DistplayName: 'Grade', EME_ExamName: 'GRADE', isTotal: false, isGrade: true });
        return list;
    }, [groupDetails, groupExamDetails]);

    const reportDate = params.date ? format(new Date(params.date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');
    return (
        <div className='printable-content space-y-6'>
            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='flex w-fit items-center gap-2'>
                    <Printer className='h-4 w-4' /> Print Report
                </Button>
            </div>

            <div ref={printRef} className='print-area' style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                {studentDetails.length > 0 ? (
                    studentDetails.map((report: any, index: number) => {
                        const studentID = report.amsT_Id || report.AMST_Id || report.studentId;

                        // Extract subjects for this student
                        const studentSubjects = Array.from(
                            new Set(
                                studentWiseSubjects
                                    .filter((s: any) => String(s.amsT_Id ?? s.AMST_Id ?? s.studentId) === String(studentID))
                                    .map((s: any) => s.subjectName || s.ISMS_SubjectName || s.ismS_SubjectName)
                            )
                        )
                            .map((name) => {
                                const subjObj = studentWiseSubjects.find(
                                    (s: any) =>
                                        String(s.amsT_Id ?? s.AMST_Id ?? s.studentId) === String(studentID) &&
                                        (s.subjectName === name || s.ISMS_SubjectName === name || s.ismS_SubjectName === name)
                                );
                                const appToResultVal =
                                    subjObj?.appToResultFlg ?? subjObj?.EMPS_AppToResultFlg ?? subjObj?.emps_AppToResultFlg;
                                const isAppToResult =
                                    appToResultVal !== undefined && appToResultVal !== null
                                        ? typeof appToResultVal === 'string'
                                            ? appToResultVal.trim().toLowerCase() === 'true'
                                            : !!appToResultVal
                                        : true;
                                return {
                                    subjectName: name,
                                    ismS_Id: subjObj?.ismS_Id || subjObj?.ISMS_Id || subjObj?.isms_Id || 0,
                                    EMPS_AppToResultFlg: isAppToResult,
                                    amsT_Id: subjObj?.amsT_Id || subjObj?.AMST_Id
                                };
                            })
                            .filter((subj) => subj.EMPS_AppToResultFlg);

                        const studentMarks = studentMarksDetails.filter(
                            (m: any) => String(m.amsT_Id ?? m.AMST_Id ?? m.studentId) === String(studentID)
                        );
                        const studentSummary =
                            examMaxMarks.find((emm: any) => String(emm.amsT_Id ?? emm.AMST_Id ?? emm.studentId) === String(studentID)) ||
                            {};
                        const remarksObj =
                            promotionRemarks.find(
                                (rem: any) => String(rem.amsT_Id ?? rem.AMST_Id ?? rem.studentId) === String(studentID)
                            ) || {};

                        const workAtt =
                            (data.work_attendence || []).find(
                                (a: any) => String(a.AMST_Id ?? a.amsT_Id ?? a.studentId ?? a.StudentId) === String(studentID)
                            ) || {};
                        const presentAtt =
                            (data.present_attendence || []).find(
                                (a: any) => String(a.AMST_Id ?? a.amsT_Id ?? a.studentId ?? a.StudentId) === String(studentID)
                            ) || {};
                        console.log('present Attendence', presentAtt);

                        // Graph data (Filter by appToResultFlg exactly like legacy code)
                        const graphSubjects = studentWiseSubjects.filter((s: any) => {
                            const matchStudent = String(s.amsT_Id ?? s.AMST_Id ?? s.studentId) === String(studentID);
                            const appToResultVal = s.appToResultFlg ?? s.EMPS_AppToResultFlg ?? s.emps_AppToResultFlg;
                            const isAppToResult =
                                appToResultVal !== undefined && appToResultVal !== null
                                    ? typeof appToResultVal === 'string'
                                        ? appToResultVal.trim().toLowerCase() === 'true'
                                        : !!appToResultVal
                                    : true;
                            return matchStudent && isAppToResult;
                        });
                        const graphLabels = graphSubjects.map((s: any) => s.subjectName || s.ISMS_SubjectName || s.ismS_SubjectName);
                        const graphScores = graphSubjects.map((s: any) => Number(s.subjectPercentage ?? s.TotalPercentage ?? 0));
                        const graphAverages = graphSubjects.map((s: any) =>
                            Number(s.classAverage ?? s.ESTMPPS_ClassAverage ?? s.estmpps_ClassAverage ?? 0)
                        );
                        const hasAverage = graphSubjects.some((s: any) => {
                            const avgVal = s.classAverage ?? s.ESTMPPS_ClassAverage ?? s.estmpps_ClassAverage;
                            return avgVal !== undefined && avgVal !== null;
                        });

                        // Co-scholastic activities data processing
                        const studentActivities = activityMainList.filter((act: any) => {
                            const actAmstId = act.AMST_Id ?? act.amsT_Id ?? act.studentId;
                            return String(actAmstId) === String(studentID);
                        });

                        // Extract unique activity categories (ECACT_SkillName / activityName) for this student
                        const activity_main_list_area: any[] = [];
                        studentActivities.forEach((act: any) => {
                            const catName = act.activityName ?? act.ECACT_SkillName;
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
                            const areaName = act.activityArea ?? act.ECACTA_SkillArea;
                            const catId = act.ecacT_Id ?? act.ECACT_Id;
                            if (areaName) {
                                const exists = activity_main_list.some(
                                    (item: any) => (item.activityArea ?? item.ECACTA_SkillArea) === areaName
                                );
                                if (!exists) {
                                    activity_main_list.push({
                                        ECACTA_SkillArea: areaName,
                                        activityArea: areaName,
                                        activityGrade: act.activityGrade,
                                        ECACT_Id: catId,
                                        ecacT_Id: catId
                                    });
                                }
                            }
                        });

                        // Build activity score details per term
                        activity_main_list.forEach((act: any) => {
                            const scores: any[] = [];
                            termDetails.forEach((term: any) => {
                                const termId = term.ecT_Id ?? term.ect_Id ?? term.ECT_Id;
                                const matchingAct = studentActivities.find((dd: any) => {
                                    const ddTermId = dd.activity_ECT_Id ?? dd.ECT_Id ?? dd.ecT_Id ?? dd.ect_Id;
                                    const actArea = act.activityArea ?? act.ECACTA_SkillArea;
                                    const ddArea = dd.activityArea ?? dd.ECACTA_SkillArea;
                                    return ddArea === actArea && String(ddTermId) === String(termId);
                                });
                                if (matchingAct) {
                                    scores.push({
                                        EMGD_Name: matchingAct.activityGrade ?? matchingAct.EMGD_Name ?? matchingAct.emgD_Name,
                                        activityGrade: matchingAct.activityGrade ?? matchingAct.EMGD_Name ?? matchingAct.emgD_Name,
                                        ecT_Id: termId
                                    });
                                }
                            });
                            act.activity_score_details = scores;
                        });

                        return (
                            <div
                                key={index}
                                className='page-break-before-always mx-auto mb-8 w-full max-w-5xl border border-gray-300 bg-white p-4 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none'>
                                <div className='mb-4 w-full'>
                                    <img
                                        src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/35f336e8-28d7-4fbe-94f6-4fdfd733ecf6.jpg'
                                        alt='Report Header'
                                        className='w-full object-contain'
                                    />
                                </div>

                                <h3 className='mb-6 text-center font-bold text-xl uppercase'>ACHIEVEMENT RECORD {data.asmaY_Year}</h3>

                                {/* Student Profile */}
                                <div className='relative mb-8 flex flex-row px-4'>
                                    <div className='flex-1 space-y-2 text-sm'>
                                        {[
                                            { label: 'Name of the Student', value: report.studentName || report.studentname },
                                            { label: 'Admission Number', value: report.admissionNo || report.admno },
                                            {
                                                label: 'Class & Section',
                                                value: `${report.className || report.classname} - ${report.sectionName || report.sectionname}`
                                            },
                                            { label: 'Date of Birth', value: report.dob },
                                            { label: "Mother's Name", value: report.motherName || report.mothername },
                                            { label: "Father's Name", value: report.fatherName || report.fathername }
                                        ].map((item, i) => (
                                            <div key={i} className='flex'>
                                                <div className='w-48 font-bold'>{item.label}</div>
                                                <div className='w-4'>:</div>
                                                <div className='font-bold uppercase'>{item.value || '-'}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='absolute top-[-20px] right-4'>
                                        {(report.studentPhoto || report.photo || report.AMST_Photoname) && (
                                            <img
                                                src={report.studentPhoto || report.photo || report.AMST_Photoname}
                                                alt='Student'
                                                className='h-[150px] w-[150px] border border-black object-cover'
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Scholastic Section */}
                                <h3 className='mb-2 text-center font-bold text-lg uppercase'>SCHOLASTIC REPORT</h3>
                                <div className='overflow-x-auto px-4'>
                                    <table className='mb-6 w-full border-collapse border border-gray-400 text-xs'>
                                        <thead>
                                            <tr>
                                                <th
                                                    rowSpan={2}
                                                    className='w-40 border border-gray-400 bg-[#BABABA] p-2 text-left text-black uppercase'>
                                                    <b>SUBJECT</b>
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
                                                            className='border border-gray-400 bg-[#BABABA] p-1 text-center font-bold text-black uppercase'>
                                                            {group.empG_GroupName || group.EMPG_GroupName}
                                                        </th>
                                                    );
                                                })}
                                                <th
                                                    rowSpan={2}
                                                    className='min-w-[100px] border border-gray-400 bg-[#BABABA] p-1 text-center font-bold text-black uppercase'>
                                                    MARKS SCORED(100)
                                                </th>
                                                <th
                                                    rowSpan={2}
                                                    className='min-w-[100px] border border-gray-400 bg-[#BABABA] p-1 text-center font-bold text-black uppercase'>
                                                    GRADE
                                                </th>
                                            </tr>
                                            <tr>
                                                {groupWiseExamList
                                                    .filter((e: any) => !e.isTotal && !e.isGrade)
                                                    .map((exam: any, i: number) => (
                                                        <th
                                                            key={i}
                                                            className='min-w-[60px] border border-gray-400 bg-[#BABABA] p-1 text-center text-black'>
                                                            <div className='font-bold uppercase'>{exam.EME_ExamName}</div>
                                                        </th>
                                                    ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentSubjects.map((subj: any, sIdx: number) => (
                                                <tr key={sIdx}>
                                                    <td className='border border-gray-400 p-2 text-left font-semibold uppercase'>
                                                        {subj.subjectName}
                                                    </td>
                                                    {groupWiseExamList.map((exam: any, eIdx: number) => {
                                                        const mark = studentMarks.find((m: any) => {
                                                            const mSubjId = m.ISMS_Id ?? m.ismS_Id ?? m.isms_Id;
                                                            const subjId = subj.ismS_Id ?? subj.ISMS_Id ?? subj.isms_Id;
                                                            const mExamId = m.EME_Id ?? m.emE_Id ?? m.eme_Id;
                                                            const examId = exam.EME_Id ?? exam.emE_Id ?? exam.eme_Id;

                                                            const mSubjName = m.subjectName ?? m.ismS_SubjectName ?? m.ISMS_SubjectName;
                                                            const subjName = subj.subjectName;
                                                            const mExamName = m.emE_ExamName ?? m.EME_ExamName ?? m.eme_ExamName;
                                                            const examName = exam.EME_ExamName;

                                                            const subjIdMatch =
                                                                mSubjId &&
                                                                subjId &&
                                                                Number(mSubjId) !== 0 &&
                                                                Number(subjId) !== 0 &&
                                                                Number(mSubjId) === Number(subjId);
                                                            const subjNameMatch =
                                                                mSubjName &&
                                                                subjName &&
                                                                mSubjName.trim().toLowerCase() === subjName.trim().toLowerCase();
                                                            const subjMatch = subjIdMatch || subjNameMatch;

                                                            const examIdMatch =
                                                                mExamId &&
                                                                examId &&
                                                                Number(mExamId) !== 0 &&
                                                                Number(examId) !== 0 &&
                                                                Number(mExamId) === Number(examId);
                                                            const examNameMatch =
                                                                mExamName &&
                                                                examName &&
                                                                mExamName.trim().toLowerCase() === examName.trim().toLowerCase();
                                                            const examMatch = examIdMatch || examNameMatch;

                                                            return !!(subjMatch && examMatch);
                                                        });
                                                        const summaryMark = graphSubjects.find((gs: any) => {
                                                            const gsSubjId = gs.ISMS_Id ?? gs.ismS_Id ?? gs.isms_Id;
                                                            const subjId = subj.ismS_Id ?? subj.ISMS_Id ?? subj.isms_Id;

                                                            const gsSubjName = gs.subjectName ?? gs.ismS_SubjectName ?? gs.ISMS_SubjectName;
                                                            const subjName = subj.subjectName;

                                                            const idMatch =
                                                                gsSubjId &&
                                                                subjId &&
                                                                Number(gsSubjId) !== 0 &&
                                                                Number(subjId) !== 0 &&
                                                                Number(gsSubjId) === Number(subjId);
                                                            const nameMatch =
                                                                gsSubjName &&
                                                                subjName &&
                                                                gsSubjName.trim().toLowerCase() === subjName.trim().toLowerCase();

                                                            return !!(idMatch || nameMatch);
                                                        });
                                                        let displayValue = '';
                                                        if (exam.isTotal) {
                                                            displayValue =
                                                                summaryMark?.subjectObtainedMarks ??
                                                                summaryMark?.TotalMarks ??
                                                                summaryMark?.ObtainedMarks ??
                                                                mark?.ObtainedMarks ??
                                                                mark?.obtainedMarks ??
                                                                '';
                                                        } else if (exam.isGrade) {
                                                            displayValue =
                                                                summaryMark?.subjectGrade ??
                                                                summaryMark?.TotalGrade ??
                                                                summaryMark?.ObtainedGrade ??
                                                                mark?.ObtainedGrade ??
                                                                mark?.obtainedGrade ??
                                                                '';
                                                        } else if (mark) {
                                                            const passFail = mark.PassFailFlag ?? mark.passFailFlag;
                                                            displayValue =
                                                                passFail === 'AB' || passFail === 'M' || passFail === 'L'
                                                                    ? passFail
                                                                    : String(mark.ObtainedMarks ?? mark.obtainedMarks ?? '');
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
                                <div className='mb-6 px-4'>
                                    <h3 className='mb-2 text-center font-bold text-lg uppercase underline'>SCHOLASTIC GRADING SCALE</h3>
                                    <table className='mx-auto w-3/4 border-collapse border border-gray-400 text-center text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 uppercase'>Grade</th>
                                                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D', 'E'].map((g) => (
                                                    <td key={g} className='border border-gray-400 p-2 font-bold'>
                                                        {g}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 font-bold uppercase'>Mark</th>
                                                {['91-100', '81-90', '71-80', '61-70', '51-60', '41-50', '33-40', '0-32'].map((m) => (
                                                    <td key={m} className='border border-gray-400 p-2'>
                                                        {m}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Graph */}
                                <div className='mt-10 mb-12 w-full px-4'>
                                    <h4 className='mb-4 text-center font-bold text-lg uppercase'>STUDENT PERFORMANCE INDEX</h4>
                                    <div className='mx-auto h-[400px] w-full max-w-4xl'>
                                        <Bar
                                            key={`chart-${studentID}`}
                                            id={`chart-${studentID}`}
                                            data={{
                                                labels: graphLabels,
                                                datasets: [
                                                    {
                                                        label: 'Student Score',
                                                        data: graphScores,
                                                        backgroundColor: '#FF5733',
                                                        borderColor: 'black',
                                                        borderWidth: 1
                                                    },
                                                    ...(hasAverage
                                                        ? [
                                                              {
                                                                  label: 'Class Average',
                                                                  data: graphAverages,
                                                                  backgroundColor: '#00c1e4',
                                                                  borderColor: 'black',
                                                                  borderWidth: 1
                                                              }
                                                          ]
                                                        : [])
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: { y: { beginAtZero: true, max: 100 } }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className='page-break-before-always mb-8' />

                                {/* Co-Scholastic activities */}
                                {activity_main_list_area.length > 0 && (
                                    <div className='mt-8 px-4'>
                                        <h4 className='mb-4 text-center font-bold text-lg uppercase underline'>Co-Scholastic Activities</h4>
                                        <div className='mx-auto w-full max-w-4xl'>
                                            {activity_main_list_area.map((acti: any, idx: number) => {
                                                const actiId = acti.ecacT_Id ?? acti.ECACT_Id;
                                                const subActivities = activity_main_list.filter((subjco: any) => {
                                                    const subjcoId = subjco.ecacT_Id ?? subjco.ECACT_Id;
                                                    return subjcoId === actiId;
                                                });
                                                return (
                                                    <div key={idx} className='mb-6'>
                                                        <h5 className='mb-2 text-center font-bold uppercase'>
                                                            {acti.activityName ?? acti.ECACT_SkillName}
                                                        </h5>
                                                        <table className='w-full border-collapse border border-gray-400 text-center text-xs'>
                                                            <thead className='bg-[#BABABA]'>
                                                                <tr>
                                                                    <th className='border border-gray-400 p-2 text-left font-bold uppercase'>
                                                                        Particulars
                                                                    </th>
                                                                    {termDetails.map((term: any, ti: number) => (
                                                                        <th
                                                                            key={ti}
                                                                            className='border border-gray-400 p-2 font-bold uppercase'>
                                                                            Grade
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {subActivities.map((subjco: any, ai: number) => (
                                                                    <tr key={ai}>
                                                                        <td className='border border-gray-400 p-2 text-left font-medium uppercase'>
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
                                                                                    className='border border-gray-400 p-2 font-bold'>
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
                                    </div>
                                )}

                                {/* Health Status */}
                                <div className='mt-8 px-4'>
                                    <h4 className='mb-4 text-center font-bold text-lg uppercase underline'>Health Status</h4>
                                    <table className='w-full border-collapse border border-gray-400 text-center text-xs'>
                                        <thead className='bg-[#BABABA]'>
                                            <tr>
                                                <th className='border border-gray-400 p-2 font-bold uppercase'>Height (in cm)</th>
                                                <th className='border border-gray-400 p-2 font-bold uppercase'>Weight (in kg)</th>
                                                <th className='border border-gray-400 p-2 font-bold uppercase'>Blood Group</th>
                                                <th className='border border-gray-400 p-2 font-bold uppercase'>Dental Hygiene</th>
                                                <th className='border border-gray-400 p-2 font-bold uppercase'>Vision (Right & Left)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{report.height || '-'}</td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{report.weight || '-'}</td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>
                                                    {report.bloodGroup || '-'}
                                                </td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>
                                                    {report.dentalHygiene || '-'}
                                                </td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>
                                                    {report.visionHygiene || '-'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Attendance */}
                                <div className='mt-8 px-4'>
                                    <h4 className='mb-4 text-center font-bold text-lg uppercase underline'>Attendance Details</h4>
                                    <table className='w-full border-collapse border border-gray-400 text-center text-xs'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 font-bold uppercase'>
                                                    Total number of working days
                                                </th>
                                                <td className='w-32 border border-gray-400 p-2 font-bold'>
                                                    {presentAtt.totalSchoolDays ?? ''}
                                                </td>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 font-bold uppercase'>
                                                    Number of days attended
                                                </th>
                                                <td className='w-32 border border-gray-400 p-2 font-bold'>
                                                    {presentAtt.totalWorkingDays ?? ''}
                                                </td>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 font-bold uppercase'>
                                                    Attendance Percentage
                                                </th>
                                                <td className='w-32 border border-gray-400 p-2 font-bold'>
                                                    {presentAtt.total_Percentage ?? ''}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Results & Signatures */}
                                <div className='mt-12 px-4'>
                                    <div className='mb-8 border border-gray-400 text-sm'>
                                        <div className='flex border-gray-400 border-b'>
                                            <div className='w-32 border-gray-400 border-r bg-[#BABABA] p-2 text-center font-bold uppercase'>
                                                Results
                                            </div>
                                            <div className='flex-1 p-2 font-bold uppercase'>
                                                {remarksObj.eprD_PromotionName || studentSummary.overallResult || '-'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='mt-24 grid grid-cols-3 gap-4 px-4'>
                                        <div className='flex flex-col items-start'>
                                            <img
                                                style={{ width: '150px' }}
                                                src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/7ca4aa81-6797-481d-aa9e-c2ae85080ed8.jpg'
                                                alt='Principal Sign'
                                                className='mb-2'
                                            />
                                            <p className='font-bold text-sm uppercase'>Principal Signature</p>
                                        </div>
                                        <div className='flex flex-col items-center justify-end pb-1'>
                                            <p className='font-bold text-sm uppercase'>Institution Seal</p>
                                        </div>
                                        <div className='flex flex-col items-end justify-end pb-1'>
                                            <p className='mb-1 font-bold text-sm uppercase italic underline'>
                                                {classTeachers?.[index]?.hrmE_EmployeeFirstName ||
                                                    classTeachers?.[0]?.hrmE_EmployeeFirstName ||
                                                    ''}
                                            </p>
                                            <p className='font-bold text-sm uppercase'>Class Teacher Signature</p>
                                            <p className='mt-1 font-bold text-sm uppercase'>Date: {reportDate}</p>
                                        </div>
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
                    .no-print { display: none !important; }
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                    .page-break-before-always { page-break-before: always !important; }
                    @page { size: A4 portrait; margin: 10mm; }
                }
                .print-area table { border-color: #000 !important; }
                .print-area th, .print-area td { border-color: #000 !important; }
            `}</style>
        </div>
    );
};
