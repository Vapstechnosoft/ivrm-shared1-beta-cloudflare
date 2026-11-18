'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface StJamesXI_XIIReportListProps {
    data: any;
    reporttype: string;
    displayAttendance: boolean;
}

export default function StJamesXI_XIIReportList({ data, reporttype, displayAttendance }: StJamesXI_XIIReportListProps) {
    const handlePrint = () => {
        window.print();
    };

    if (!data) return null;

    const findKeyCaseInsensitive = (obj: any, targetKey: string) => {
        if (!obj) return undefined;
        const targetLower = targetKey.toLowerCase();
        const foundKey = Object.keys(obj).find((k) => k.toLowerCase() === targetLower);
        return foundKey ? obj[foundKey] : undefined;
    };

    const getVal = (obj: any, ...keys: string[]) => {
        for (const k of keys) {
            const val = findKeyCaseInsensitive(obj, k);
            if (val !== undefined) return val;
        }
        return undefined;
    };

    const findArraysContaining = (obj: any, substring: string) => {
        if (!obj) return [];
        const subLower = substring.toLowerCase();
        let combined: any[] = [];
        Object.keys(obj).forEach((k) => {
            if (k.toLowerCase().includes(subLower) && Array.isArray(obj[k])) {
                combined = [...combined, ...obj[k]];
            }
        });
        return combined;
    };

    const getstudentmarksdetails = (() => {
        const key = Object.keys(data).find((k) => k.toLowerCase() === 'getstudentmarksdetails');
        if (key && Array.isArray(data[key])) return data[key];
        return findArraysContaining(data, 'mark');
    })();

    const getstudentwisesubjectlistnew = (() => {
        const keyNew = Object.keys(data).find((k) => k.toLowerCase() === 'getstudentwisesubjectlistnew');
        if (keyNew && Array.isArray(data[keyNew])) return data[keyNew];

        const keyOld = Object.keys(data).find((k) => k.toLowerCase() === 'getstudentwisesubjectlist');
        if (keyOld && Array.isArray(data[keyOld])) return data[keyOld];

        return findArraysContaining(data, 'subject');
    })();

    const getstudentwiseattendancedetails = (() => {
        const key = Object.keys(data).find((k) => k.toLowerCase() === 'getstudentwiseattendancedetails');
        if (key && Array.isArray(data[key])) return data[key];
        return findArraysContaining(data, 'attend');
    })();

    const getexamwisetotaldetails = (() => {
        const key = Object.keys(data).find((k) => k.toLowerCase() === 'getexamwisetotaldetails');
        if (key && Array.isArray(data[key])) return data[key];
        return findArraysContaining(data, 'total');
    })();

    const getstudentdetails = (() => {
        let combined: any[] = [];
        Object.keys(data).forEach((k) => {
            const kLower = k.toLowerCase();
            if (
                kLower.includes('student') &&
                !kLower.includes('subject') &&
                !kLower.includes('mark') &&
                !kLower.includes('attend') &&
                !kLower.includes('total') &&
                Array.isArray(data[k])
            ) {
                combined = [...combined, ...data[k]];
            }
        });
        if (combined.length === 0) {
            const fallbackVal = findKeyCaseInsensitive(data, 'getstudentdetails');
            if (Array.isArray(fallbackVal)) return fallbackVal;
        }
        return combined;
    })();

    const getexamdetails = (() => {
        let combined: any[] = [];
        Object.keys(data).forEach((k) => {
            const kLower = k.toLowerCase();
            if (
                kLower.includes('exam') &&
                !kLower.includes('subject') &&
                !kLower.includes('mark') &&
                !kLower.includes('attend') &&
                !kLower.includes('total') &&
                !kLower.includes('student') &&
                Array.isArray(data[k])
            ) {
                combined = [...combined, ...data[k]];
            }
        });
        if (combined.length === 0) {
            const fallbackVal = findKeyCaseInsensitive(data, 'getexamdetails');
            if (Array.isArray(fallbackVal)) return fallbackVal;
        }
        return combined;
    })();

    const year = data?.year ?? findKeyCaseInsensitive(data, 'year');

    const getStudentId = (obj: any) => {
        if (!obj) return undefined;
        const keys = Object.keys(obj);
        const matchingKeys = keys.filter((k) => {
            const kLower = k.toLowerCase();
            return kLower === 'amst_id' || kLower === 'amstid';
        });
        for (const key of matchingKeys) {
            const val = obj[key];
            if (val && val !== 0 && val !== '0') {
                return val;
            }
        }
        for (const key of matchingKeys) {
            const val = obj[key];
            if (val === 0 || val === '0') {
                return 0;
            }
        }
        return undefined;
    };

    const tempexamdetails: any[] = [];
    if (reporttype === 'indi') {
        getexamdetails.forEach((exam: any) => {
            const examId = exam.emE_Id ?? exam.eme_Id ?? exam.emeId ?? 0;
            const _examName = exam.emE_ExamName ?? exam.eme_ExamName ?? exam.emE_Examname ?? '';
            const examCode = exam.emE_ExamCode ?? exam.eme_ExamCode ?? exam.emE_Examcode ?? '';
            const examDesc = exam.emE_ExamDescription ?? exam.eme_ExamDescription ?? exam.emE_Examdescription ?? '';

            tempexamdetails.push({
                ...exam,
                EME_Id: examId,
                columname: 'Marks',
                emE_ExamCode: examCode,
                emE_ExamDescription: examDesc
            });
            // According to legacy code, Point is not shown for UAT
            if (examDesc !== 'UAT') {
                tempexamdetails.push({
                    ...exam,
                    EME_Id: examId,
                    columname: 'Point',
                    emE_ExamCode: examCode,
                    emE_ExamDescription: examDesc
                });
            }
        });
    } else {
        // Promotion
        const promoExamDetails = [...getexamdetails, { empG_GroupName: 'Final Average', empsG_Order: 10001 }];
        promoExamDetails.forEach((dd: any) => {
            const groupName = dd.empG_GroupName ?? dd.empg_groupname ?? dd.GroupName ?? '';
            const order = dd.empsG_Order ?? dd.empsg_order ?? dd.Order ?? 0;
            tempexamdetails.push({ Groupname: groupName, columnid: order, columname: 'Marks' });
            tempexamdetails.push({ Groupname: groupName, columnid: order, columname: 'Point' });
        });
    }

    const students = getstudentdetails.map((student: any) => {
        const studentId = getStudentId(student);

        const filteredSubjects = getstudentwisesubjectlistnew.filter((sub: any) => {
            const subStudentId = getStudentId(sub);
            return subStudentId !== undefined && Number(subStudentId) === Number(studentId);
        });

        // Deduplicate subjects by ISMS_Id to prevent duplicate subject rows on the report card
        const subjectMap = new Map();
        filteredSubjects.forEach((sub: any) => {
            const subId = getVal(sub, 'subid', 'subId', 'isms_id', 'ismsid', 'isms_id');
            if (subId !== undefined) {
                subjectMap.set(Number(subId), sub);
            } else {
                subjectMap.set(Math.random().toString(), sub);
            }
        });

        const subjects = Array.from(subjectMap.values())
            .map((sub: any) => {
                const ismsSubjectName = getVal(sub, 'subjectname', 'subjectName', 'isms_subjectname') ?? '';
                const ismsId = getVal(sub, 'subid', 'subId', 'isms_id', 'ismsid', 'isms_id');
                const eycesAplResultFlg = getVal(sub, 'eyces_aplresultflg', 'eyceS_AplResultFlg', 'eyceS_AplResultflg') ?? true;
                const subjectOrder = getVal(sub, 'subjectorder', 'subjectOrder', 'isms_order', 'isms_order') ?? 9999;
                const ismsSubjectCode = getVal(sub, 'isms_subjectcode', 'ismssubjectcode', 'isms_subjectcode') ?? '';

                return {
                    ismS_SubjectName: ismsSubjectName,
                    ISMS_Id: ismsId,
                    eyceS_AplResultFlg:
                        eycesAplResultFlg === true ||
                        eycesAplResultFlg === 1 ||
                        String(eycesAplResultFlg).toLowerCase() === 'true' ||
                        String(eycesAplResultFlg).toLowerCase() === 'y',
                    subjectorder: Number(subjectOrder),
                    ismS_SubjectCode: ismsSubjectCode,
                    subid: ismsId
                };
            })
            .sort((a: any, b: any) => a.subjectorder - b.subjectorder);

        const marks = getstudentmarksdetails.filter((m: any) => {
            const mStudentId = getStudentId(m);
            return mStudentId !== undefined && Number(mStudentId) === Number(studentId);
        });

        const markstotal = getexamwisetotaldetails.filter((t: any) => {
            const tStudentId = getStudentId(t);
            return tStudentId !== undefined && Number(tStudentId) === Number(studentId);
        });

        const attendance = getstudentwiseattendancedetails.filter((a: any) => {
            const aStudentId = getStudentId(a);
            return aStudentId !== undefined && Number(aStudentId) === Number(studentId);
        });

        return { ...student, subjects, marks, markstotal, attendance };
    });

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return date;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const formatTeacherName = (name: string) => {
        if (!name) return '';
        return name
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const findMarks = (marks: any[], colm: any, subj: any) => {
        if (!marks || !colm || !subj) return undefined;

        const subjName = String(subj.ismS_SubjectName ?? '')
            .toLowerCase()
            .trim();
        const subjId = subj.ISMS_Id;

        return marks.find((m: any) => {
            const mSubId = getVal(m, 'subid', 'subId', 'isms_id', 'ismsid', 'isms_id');
            const mSubName = getVal(m, 'subjectname', 'subjectName', 'isms_subjectname', 'isms_subjectname');

            let isSubjMatch = false;
            if (subjId !== undefined && mSubId !== undefined && Number(mSubId) === Number(subjId)) {
                isSubjMatch = true;
            } else if (subjName && mSubName && String(mSubName).toLowerCase().trim() === subjName) {
                isSubjMatch = true;
            }

            if (!isSubjMatch) return false;

            if (reporttype === 'indi') {
                const mEmeId = getVal(m, 'emeid', 'eme_id', 'emeId');
                return mEmeId !== undefined && Number(mEmeId) === Number(colm.EME_Id);
            }
            const mGroupName = getVal(m, 'empsg_groupname', 'empG_GroupName', 'groupname');
            const colGroupName = colm.Groupname;
            return (
                mGroupName !== undefined &&
                colGroupName !== undefined &&
                String(mGroupName).toLowerCase().trim() === String(colGroupName).toLowerCase().trim()
            );
        });
    };

    const findTotal = (totals: any[], colm: any) => {
        if (!totals || !colm) return undefined;
        return totals.find((t: any) => {
            if (reporttype === 'indi') {
                const tEmeId = getVal(t, 'emeid', 'eme_id', 'emeId');
                return (
                    tEmeId !== undefined &&
                    Number(tEmeId) === Number(colm.EME_Id) &&
                    colm.emE_ExamCode !== 'IA1' &&
                    colm.emE_ExamCode !== 'IA2'
                );
            }
            const tGroupName = getVal(t, 'groupname', 'empsg_groupname', 'empG_GroupName');
            const colGroupName = colm.Groupname;
            return (
                tGroupName !== undefined &&
                colGroupName !== undefined &&
                String(tGroupName).toLowerCase().trim() === String(colGroupName).toLowerCase().trim()
            );
        });
    };

    const findAttendance = (attendance: any[], colm: any) => {
        if (!attendance || !colm) return undefined;
        return attendance.find((a: any) => {
            if (reporttype === 'indi') {
                const aEmeId = getVal(a, 'emeid', 'eme_id', 'emeId');
                return (
                    aEmeId !== undefined &&
                    Number(aEmeId) === Number(colm.EME_Id) &&
                    colm.emE_ExamCode !== 'IA1' &&
                    colm.emE_ExamCode !== 'IA2'
                );
            }
            const aGroupName = getVal(a, 'groupname', 'empsg_groupname', 'empG_GroupName');
            const colGroupName = colm.Groupname;
            return (
                aGroupName !== undefined &&
                colGroupName !== undefined &&
                String(aGroupName).toLowerCase().trim() === String(colGroupName).toLowerCase().trim()
            );
        });
    };

    const getMarksVal = (mrks: any, colm: any) => {
        if (!mrks) return '';
        const obtMarks =
            reporttype === 'indi'
                ? (getVal(mrks, 'obtainmarks', 'estmppsg_groupobtmarks') ?? '')
                : (getVal(mrks, 'estmppsg_groupobtmarks', 'obtainmarks') ?? '');
        const passFail =
            reporttype === 'indi' ? (getVal(mrks, 'passfailflg') ?? '') : (getVal(mrks, 'estmpps_passfailflg', 'passfailflg') ?? '');
        const obtPoints =
            reporttype === 'indi'
                ? (getVal(mrks, 'obtainedgradepoints', 'estmppsg_gradepoints') ?? '')
                : (getVal(mrks, 'estmppsg_gradepoints', 'obtainedgradepoints') ?? '');

        if (colm.columname === 'Marks') {
            if (passFail === 'AB') return passFail;
            if (passFail === 'Fail') return <span className='underline'>{obtMarks}</span>;
            return obtMarks;
        }
        if (colm.columname === 'Point') {
            if (passFail === 'AB') return passFail;
            if (passFail === 'Fail') return <span className='underline'>{obtPoints}</span>;
            return obtPoints;
        }
        return '';
    };

    const getGradeVal = (mrks: any, colm: any, isCCA: boolean) => {
        if (!mrks) return '';
        const obtGrade =
            reporttype === 'indi'
                ? (getVal(mrks, 'obtainedgrade', 'estmppsg_groupobtgrade') ?? '')
                : (getVal(mrks, 'estmppsg_groupobtgrade', 'obtainedgrade') ?? '');
        const obtMarks =
            reporttype === 'indi'
                ? (getVal(mrks, 'obtainmarks', 'estmppsg_groupobtmarks') ?? '')
                : (getVal(mrks, 'estmppsg_groupobtmarks', 'obtainmarks') ?? '');
        const passFail =
            reporttype === 'indi' ? (getVal(mrks, 'passfailflg') ?? '') : (getVal(mrks, 'estmpps_passfailflg', 'passfailflg') ?? '');

        if (colm.columname === 'Marks') {
            if (passFail === 'AB') return passFail;
            if (isCCA) return passFail === 'Fail' ? <span className='underline'>{obtMarks}</span> : obtMarks;
            return passFail === 'Fail' ? <span className='underline'>{obtGrade}</span> : obtGrade;
        }
        return '';
    };

    return (
        <div>
            <style>
                {`
          @media print {
            @page { margin: 10mm; }
            body {
              visibility: hidden;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #printable-area, #printable-area * {
              visibility: visible;
            }
            #printable-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none;
            }
            .page-break {
              page-break-before: always;
            }
            .table-bordered > tbody > tr > td {
              border-left: 1px solid black !important;
              border-right: 1px solid black !important;
              border-top: 0px !important;
              border-bottom: 0px solid black !important;
              padding: 8px 15px !important;
            }
          }
        `}
            </style>
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
            </div>

            <div className='w-full bg-white p-8' id='printable-area'>
                {students.map((report: any, idx: number) => (
                    <div key={idx} className={idx > 0 ? 'page-break mt-16' : ''}>
                        <div className='mb-6 flex flex-col text-sm'>
                            <div className='mb-6 text-center font-bold text-lg'>ACADEMIC YEAR {year}</div>

                            <div className='mb-2 flex justify-between font-bold'>
                                <div className='w-1/3'>{report.studentname}</div>
                                <div className='flex w-1/3 justify-between px-4'>
                                    <span>
                                        Class : {report.classname} {report.sectionname}
                                    </span>
                                    <span>Roll : {report.rollno}</span>
                                </div>
                                <div className='w-1/3 text-right'>Reg.No. : {report.admno}</div>
                            </div>
                            <div className='flex justify-between font-bold'>
                                <div className='w-1/3'>{report.spccmH_HouseName || report.SPCCMH_HouseName}</div>
                                <div className='w-1/3 text-center'>Number of boys in class : {report.totalboys}</div>
                                <div className='w-1/3 text-right'>D.O.B : {formatDate(report.dob)}</div>
                            </div>
                        </div>

                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse border-2 border-gray-400 font-bold text-sm'>
                                <thead className='border-4 border-gray-400 border-double'>
                                    <tr>
                                        <th className='w-[250px] border border-gray-400 p-2 text-left' rowSpan={2} />
                                        {getexamdetails.map((exam: any, eIdx: number) => {
                                            const colSpan = reporttype === 'indi' ? (exam.emE_ExamDescription === 'UAT' ? 1 : 2) : 2;
                                            return (
                                                <th key={eIdx} className='border border-gray-400 p-2 text-center' colSpan={colSpan}>
                                                    {reporttype === 'indi' ? exam.emE_ExamName : exam.empG_GroupName}
                                                </th>
                                            );
                                        })}
                                        {reporttype === 'promotion' && (
                                            <th className='border border-gray-400 p-2 text-center' colSpan={2}>
                                                Final Average
                                            </th>
                                        )}
                                    </tr>
                                    <tr>
                                        {tempexamdetails.map((colm: any, cIdx: number) => (
                                            <th key={cIdx} className='border border-gray-400 p-2 text-center'>
                                                {colm.emE_ExamDescription === 'UAT' && colm.columname === 'Marks'
                                                    ? 'Marks(50)'
                                                    : colm.columname}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className='border-4 border-gray-400 border-double'>
                                    {report.subjects
                                        .filter((s: any) => s.eyceS_AplResultFlg)
                                        .map((subj: any, sIdx: number) => (
                                            <tr key={sIdx}>
                                                <td className='border border-gray-400 p-2 pl-6 text-left'>{subj.ismS_SubjectName}</td>
                                                {tempexamdetails.map((colm: any, cIdx: number) => {
                                                    const mrks = findMarks(report.marks, colm, subj);
                                                    return (
                                                        <td key={cIdx} className='border border-gray-400 p-2 text-center'>
                                                            {getMarksVal(mrks, colm)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    {report.subjects
                                        .filter((s: any) => !s.eyceS_AplResultFlg)
                                        .map((subj: any, sIdx: number) => (
                                            <tr key={sIdx}>
                                                <td className='border border-gray-400 p-2 pl-6 text-left'>{subj.ismS_SubjectName}</td>
                                                {tempexamdetails.map((colm: any, cIdx: number) => {
                                                    const mrks = findMarks(report.marks, colm, subj);
                                                    return (
                                                        <td key={cIdx} className='border border-gray-400 p-2 text-center'>
                                                            {getGradeVal(mrks, colm, subj.ismS_SubjectCode === 'CCA')}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                </tbody>

                                <tbody>
                                    <tr className='border-none'>
                                        <td className='p-2' colSpan={tempexamdetails.length + 1}>
                                            &nbsp;
                                        </td>
                                    </tr>
                                </tbody>

                                <tbody className='border-4 border-gray-400 border-double'>
                                    <tr>
                                        <td className='border border-gray-400 p-2 pl-6 text-left font-bold'>Total (Eng + 3)</td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const totl = findTotal(report.markstotal, colm);
                                            const val = totl
                                                ? colm.columname === 'Marks'
                                                    ? reporttype === 'indi'
                                                        ? totl.estmP_TotalObtMarks
                                                        : totl.TOTALOBTAINEDMARKS
                                                    : reporttype === 'indi'
                                                      ? totl.estmP_GradePoints
                                                      : totl.GRANDTOTALPOINT
                                                : '';
                                            return (
                                                <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        <td className='border border-gray-400 p-2 pl-6 text-left font-bold'>Average (Eng + 3)</td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const totl = findTotal(report.markstotal, colm);
                                            const val =
                                                totl && colm.columname === 'Marks'
                                                    ? reporttype === 'indi'
                                                        ? totl.estmP_Percentage
                                                        : totl.PERCENTAGEOBTAINED
                                                    : '';
                                            return (
                                                <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    {displayAttendance && (
                                        <tr>
                                            <td className='border border-gray-400 p-2 pl-6 text-left font-bold'>Attendance</td>
                                            {tempexamdetails.map((colm: any, cIdx: number) => {
                                                const att = findAttendance(report.attendance, colm);
                                                const val =
                                                    att && colm.columname === 'Marks'
                                                        ? reporttype === 'indi'
                                                            ? `${att.percentage} %`
                                                            : `${att.PERCENTAGEOBTAINED} %`
                                                        : '';
                                                return (
                                                    <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>
                                                        {val}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    )}
                                    <tr>
                                        <td className='border border-gray-400 p-2 pl-6 text-left font-bold'>Position</td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const totl = findTotal(report.markstotal, colm);
                                            const val =
                                                totl && colm.columname === 'Marks'
                                                    ? reporttype === 'indi'
                                                        ? totl.estmP_SectionPosition
                                                        : totl.POSITION
                                                    : '';
                                            return (
                                                <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className='mt-8 font-bold text-sm'>
                            <div className='mb-12'>Class Teacher's Comment :</div>
                            <div className='mt-16 flex justify-between px-10'>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold'>Dr.T.H.Ireland</div>
                                    <div className='text-xs'>Principal/Secretary</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='link w-48 border-black border-t-[1.5px] pt-1 font-bold'>
                                        {formatTeacherName(report.classteacher || report.Classteacher) || <span>&nbsp;</span>}
                                    </div>
                                    <div className='font-bold text-xs'>Class Teacher</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-32 border-black border-t-[1.5px] pt-1 font-bold'>&nbsp;</div>
                                    <div className='text-xs'>Parent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
