'use client';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type React from 'react';

interface StJamesNewReportListProps {
    data: any;
    reporttype: string;
    displayAttendance: boolean;
}

export default function StJamesNewReportList({ data, reporttype, displayAttendance }: StJamesNewReportListProps) {
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

    const year = data?.year ?? findKeyCaseInsensitive(data, 'year') ?? '';

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
            const examName = exam.emE_ExamName ?? exam.eme_ExamName ?? exam.emE_Examname ?? '';
            const examCode = exam.emE_ExamCode ?? exam.eme_ExamCode ?? exam.emE_Examcode ?? '';
            const examDesc = exam.emE_ExamDescription ?? exam.eme_ExamDescription ?? exam.emE_Examdescription ?? '';
            const examId = exam.emE_Id ?? exam.eme_Id ?? exam.emeId ?? 0;

            tempexamdetails.push({
                ...exam,
                columname: 'Paper',
                EME_Id: examId,
                emE_ExamName: examName,
                emE_ExamCode: examCode,
                emE_ExamDescription: examDesc
            });
            tempexamdetails.push({
                ...exam,
                columname: 'Subject',
                EME_Id: examId,
                emE_ExamName: examName,
                emE_ExamCode: examCode,
                emE_ExamDescription: examDesc
            });
        });
    } else {
        // Promotion
        const promoExamDetails = [...getexamdetails, { empG_GroupName: 'Final Average', empsG_Order: 10001 }];
        promoExamDetails.forEach((dd: any) => {
            const groupName = dd.empG_GroupName ?? dd.empg_GroupName ?? '';
            const groupOrder = dd.empsG_Order ?? dd.empsg_Order ?? 0;
            const displayName = dd.empG_DistplayName ?? dd.empg_DistplayName ?? '';

            tempexamdetails.push({
                Groupname: groupName,
                columnid: groupOrder,
                columname: 'Paper',
                empG_DistplayName: displayName
            });
            tempexamdetails.push({
                Groupname: groupName,
                columnid: groupOrder,
                columname: 'Subject',
                empG_DistplayName: displayName
            });
        });
    }

    const students = getstudentdetails.map((student: any) => {
        const studentId = getStudentId(student);

        const filteredSubjects = getstudentwisesubjectlistnew.filter((sub: any) => {
            const subStudentId = getStudentId(sub);
            return subStudentId !== undefined && Number(subStudentId) === Number(studentId);
        });

        // Deduplicate subjects by subjectName (lowercase trimmed) to prevent duplicate subject rows on the report card
        const subjectMap = new Map();
        filteredSubjects.forEach((sub: any) => {
            const nameVal = getVal(sub, 'subjectName', 'subjectname', 'isms_subjectname');
            const trimmedName = String(nameVal ?? '')
                .trim()
                .toLowerCase();
            if (trimmedName) {
                if (!subjectMap.has(trimmedName)) {
                    subjectMap.set(trimmedName, sub);
                } else {
                    const existing = subjectMap.get(trimmedName);
                    const existingOrder = Number(
                        getVal(existing, 'subjectorder_new', 'subjectOrder_new', 'subjectOrder', 'subjectorder') ?? 9999
                    );
                    const currentOrder = Number(
                        getVal(sub, 'subjectorder_new', 'subjectOrder_new', 'subjectOrder', 'subjectorder') ?? 9999
                    );
                    if (currentOrder < existingOrder) {
                        subjectMap.set(trimmedName, sub);
                    }
                }
            } else {
                subjectMap.set(Math.random().toString(), sub);
            }
        });

        const subjects = Array.from(subjectMap.values())
            .map((sub: any) => {
                const ismsSubjectName = getVal(sub, 'subjectName', 'subjectname', 'isms_subjectname') ?? '';
                const ismsId = getVal(sub, 'subId', 'subid', 'isms_id', 'ismsid');
                const eycesAplResultFlg = getVal(sub, 'eyces_aplresultflg', 'emps_apptoresultflg') ?? true;
                const subjectOrder =
                    getVal(sub, 'subjectorder_new', 'subjectOrder_new', 'subjectOrder', 'subjectorder', 'isms_order', 'emps_subjorder') ??
                    9999;
                const ismsSubjectCode = getVal(sub, 'isms_subjectcode', 'ismssubjectcode') ?? '';

                return {
                    ismS_SubjectName: ismsSubjectName,
                    ISMS_Id: ismsId,
                    eyceS_AplResultFlg:
                        eycesAplResultFlg === true ||
                        eycesAplResultFlg === 1 ||
                        String(eycesAplResultFlg).toLowerCase() === 'true' ||
                        String(eycesAplResultFlg).toLowerCase() === 'y',
                    subjectorder: Number(subjectOrder),
                    ismS_SubjectCode: ismsSubjectCode
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

        return {
            ...student,
            subjects,
            marks,
            markstotal,
            attendance
        };
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

    const getMarksVal = (mrks: any, colm: any) => {
        if (!mrks) return '';
        const obtMarks = reporttype === 'indi' ? getVal(mrks, 'obtainmarks') : getVal(mrks, 'estmppsg_groupobtmarks');
        const passFail = reporttype === 'indi' ? getVal(mrks, 'passfailflg') : getVal(mrks, 'estmpps_passfailflg');
        const comp = getVal(mrks, 'compulsoryflag', 'complusoryflag') ?? '';

        const style: React.CSSProperties = passFail === 'Fail' ? { textDecoration: 'underline' } : {};

        if (colm.columname === 'Paper') {
            if (passFail === 'AB' && comp === 'C') return passFail;
            if (passFail === 'Fail' && comp === 'C') return <span style={style}>{obtMarks}</span>;
            if (comp === 'C') return obtMarks;
        } else if (colm.columname === 'Subject') {
            if (passFail === 'AB' && comp !== 'C') return passFail;
            if (passFail === 'Fail' && comp !== 'C') return <span style={style}>{obtMarks}</span>;
            if (comp !== 'C') return obtMarks;
        }
        return '';
    };

    const getGradeVal = (mrks: any, colm: any, isCCA: boolean) => {
        if (!mrks) return '';
        const obtGrade = reporttype === 'indi' ? getVal(mrks, 'obtainedgrade') : getVal(mrks, 'estmppsg_groupobtgrade');
        const obtMarks = reporttype === 'indi' ? getVal(mrks, 'obtainmarks') : getVal(mrks, 'estmppsg_groupobtmarks');
        const passFail = reporttype === 'indi' ? getVal(mrks, 'passfailflg') : getVal(mrks, 'estmpps_passfailflg');

        const style: React.CSSProperties = passFail === 'Fail' ? { textDecoration: 'underline' } : {};

        const isPaperCol = colm.columname === 'Paper';
        const isSubjectCol = colm.columname === 'Subject';

        if (isCCA) {
            if (isSubjectCol) {
                if (passFail === 'AB') return 'AB';
                return passFail === 'Fail' ? <span style={style}>{obtMarks}</span> : obtMarks;
            }
        } else {
            if (isPaperCol) {
                if (passFail === 'AB') return 'AB';
                return passFail === 'Fail' ? <span style={style}>{obtGrade}</span> : obtGrade;
            }
        }
        return '';
    };

    const formatTeacherName = (name: string) => {
        if (!name) return '';
        return name
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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
          }
          .td-250 { width: 250px; }
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
                        {/* Header Section */}
                        <div className='mb-6 flex flex-col text-sm'>
                            <div className='mb-6 text-center font-bold text-lg'>ACADEMIC YEAR {year}</div>

                            <div className='mb-2 flex justify-between font-bold'>
                                <div className='w-[30%] text-left'>{report.studentname}</div>
                                <div className='w-[25%] text-left'>
                                    Class : {report.classname} {report.sectionname}
                                </div>
                                <div className='flex w-[15%] flex-col text-left'>
                                    <span>Roll :</span>
                                    <span>{report.rollno}</span>
                                </div>
                                <div className='w-[30%] text-right'>Reg.No. : {report.admno}</div>
                            </div>
                            <div className='flex justify-between font-bold'>
                                <div className='w-[30%] text-left'>{report.spccmH_HouseName || report.SPCCMH_HouseName}</div>
                                <div className='w-[25%] text-left'>Number of boys in class : {report.totalboys}</div>
                                <div className='w-[15%] text-left' />
                                <div className='w-[30%] text-right'>D.O.B : {formatDate(report.dob)}</div>
                            </div>
                        </div>

                        {/* Grades Table */}
                        <div className='mb-6 overflow-x-auto'>
                            <table
                                className='w-full text-center font-bold text-sm'
                                style={{
                                    borderCollapse: 'collapse',
                                    border: '3px double black'
                                }}>
                                <thead style={{ borderBottom: '3px double black' }}>
                                    <tr>
                                        <th className='w-[250px] border border-black bg-white p-2 text-left' rowSpan={2} />
                                        {getexamdetails.map((exam: any, eIdx: number) => (
                                            <th
                                                key={`exam-${eIdx}`}
                                                colSpan={2}
                                                className='border border-black bg-white p-2 text-center'
                                                style={eIdx < getexamdetails.length - 1 ? { borderRight: '3px double black' } : {}}>
                                                {reporttype === 'indi' ? exam.emE_ExamName : exam.empG_GroupName}
                                            </th>
                                        ))}
                                        {reporttype === 'promotion' && (
                                            <th className='border border-black bg-white p-2 text-center' colSpan={2}>
                                                Final Average
                                            </th>
                                        )}
                                    </tr>
                                    <tr>
                                        {tempexamdetails.map((colm: any, cIdx: number) => (
                                            <th
                                                key={`col-${cIdx}`}
                                                className='border border-black bg-white p-2 text-center'
                                                style={
                                                    cIdx % 2 === 1 && cIdx < tempexamdetails.length - 1
                                                        ? { borderRight: '3px double black' }
                                                        : {}
                                                }>
                                                {colm.columname}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Subjects with AplResultFlg */}
                                    {report.subjects
                                        .filter((s: any) => s.eyceS_AplResultFlg)
                                        .map((subj: any, sIdx: number) => (
                                            <tr key={`subj-${sIdx}`}>
                                                <td
                                                    className='td-250 border-black border-r border-l p-2 pl-6 text-left'
                                                    style={{ borderTop: 0, borderBottom: 0 }}
                                                    width='250'>
                                                    <b>{subj.ismS_SubjectName}</b>
                                                </td>
                                                {tempexamdetails.map((colm: any, cIdx: number) => {
                                                    const mrks = report.marks.find((m: any) => {
                                                        if (reporttype === 'indi') {
                                                            const mId = getVal(m, 'emeid', 'eme_id');
                                                            if (mId === undefined || Number(mId) !== Number(colm.EME_Id)) return false;
                                                        } else {
                                                            const mGroup = getVal(m, 'empsg_groupname', 'empsg_groupName');
                                                            if (
                                                                mGroup === undefined ||
                                                                String(mGroup).toLowerCase().trim() !==
                                                                    String(colm.Groupname).toLowerCase().trim()
                                                            )
                                                                return false;
                                                        }
                                                        const mSubName = getVal(m, 'subjectname', 'isms_subjectname');
                                                        return (
                                                            mSubName !== undefined &&
                                                            String(mSubName).toLowerCase().trim() ===
                                                                subj.ismS_SubjectName.toLowerCase().trim()
                                                        );
                                                    });
                                                    return (
                                                        <td
                                                            key={`mark-${cIdx}`}
                                                            className='border-black border-r border-l p-2 text-center'
                                                            style={{
                                                                borderTop: 0,
                                                                borderBottom: 0,
                                                                ...(cIdx % 2 === 1 && cIdx < tempexamdetails.length - 1
                                                                    ? { borderRight: '3px double black' }
                                                                    : {})
                                                            }}>
                                                            {getMarksVal(mrks, colm)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}

                                    {/* Subjects without AplResultFlg */}
                                    {report.subjects
                                        .filter((s: any) => !s.eyceS_AplResultFlg)
                                        .map((subj: any, sIdx: number) => (
                                            <tr key={`subj-non-${sIdx}`}>
                                                <td
                                                    className='td-250 border-black border-r border-l p-2 pl-6 text-left'
                                                    style={{ borderTop: 0, borderBottom: 0 }}
                                                    width='250'>
                                                    <b>{subj.ismS_SubjectName}</b>
                                                </td>
                                                {tempexamdetails.map((colm: any, cIdx: number) => {
                                                    const mrks = report.marks.find((m: any) => {
                                                        if (reporttype === 'indi') {
                                                            const mId = getVal(m, 'emeid', 'eme_id');
                                                            if (mId === undefined || Number(mId) !== Number(colm.EME_Id)) return false;
                                                        } else {
                                                            const mGroup = getVal(m, 'empsg_groupname', 'empsg_groupName');
                                                            if (
                                                                mGroup === undefined ||
                                                                String(mGroup).toLowerCase().trim() !==
                                                                    String(colm.Groupname).toLowerCase().trim()
                                                            )
                                                                return false;
                                                        }
                                                        const mSubName = getVal(m, 'subjectname', 'isms_subjectname');
                                                        return (
                                                            mSubName !== undefined &&
                                                            String(mSubName).toLowerCase().trim() ===
                                                                subj.ismS_SubjectName.toLowerCase().trim()
                                                        );
                                                    });
                                                    return (
                                                        <td
                                                            key={`mark-non-${cIdx}`}
                                                            className='border-black border-r border-l p-2 text-center'
                                                            style={{
                                                                borderTop: 0,
                                                                borderBottom: 0,
                                                                ...(cIdx % 2 === 1 && cIdx < tempexamdetails.length - 1
                                                                    ? { borderRight: '3px double black' }
                                                                    : {})
                                                            }}>
                                                            {getGradeVal(mrks, colm, subj.ismS_SubjectCode === 'CCA')}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Table */}
                        <div className='overflow-x-auto'>
                            <table
                                className='w-full text-center font-bold text-sm'
                                style={{
                                    borderCollapse: 'collapse',
                                    border: '3px double black'
                                }}>
                                <tbody>
                                    {/* Totals */}
                                    <tr>
                                        <td className='td-250 border border-black p-2 pl-6 text-left font-bold' width='250'>
                                            Total
                                        </td>
                                        {(reporttype === 'indi'
                                            ? getexamdetails
                                            : [...getexamdetails, { empG_GroupName: 'Final Average' }]
                                        ).map((exam: any, eIdx: number) => {
                                            const totl = report.markstotal.find((t: any) =>
                                                reporttype === 'indi'
                                                    ? Number(getVal(t, 'eme_id', 'emeid')) === Number(exam.emE_Id) &&
                                                      exam.emE_ExamCode !== 'IA1' &&
                                                      exam.emE_ExamCode !== 'IA2' &&
                                                      exam.emE_ExamDescription !== 'UAT'
                                                    : getVal(t, 'groupname')?.toLowerCase().trim() ===
                                                          exam.empG_GroupName?.toLowerCase().trim() &&
                                                      exam.empG_GroupName !== 'Internal Assessment'
                                            );
                                            const val = totl
                                                ? reporttype === 'indi'
                                                    ? getVal(totl, 'estmp_totalobtmarks')
                                                    : getVal(totl, 'totalobtainedmarks')
                                                : '';
                                            return (
                                                <td
                                                    key={`tot-${eIdx}`}
                                                    className='p-2 text-center font-bold'
                                                    colSpan={2}
                                                    style={{
                                                        borderTop: '1px solid black',
                                                        borderBottom: '1px solid black',
                                                        borderLeft: eIdx === 0 ? '1px solid black' : '0',
                                                        borderRight: '0'
                                                    }}>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Average */}
                                    <tr>
                                        <td className='td-250 border border-black p-2 pl-6 text-left font-bold' width='250'>
                                            Average %
                                        </td>
                                        {(reporttype === 'indi'
                                            ? getexamdetails
                                            : [...getexamdetails, { empG_GroupName: 'Final Average' }]
                                        ).map((exam: any, eIdx: number) => {
                                            const totl = report.markstotal.find((t: any) =>
                                                reporttype === 'indi'
                                                    ? Number(getVal(t, 'eme_id', 'emeid')) === Number(exam.emE_Id) &&
                                                      exam.emE_ExamCode !== 'IA1' &&
                                                      exam.emE_ExamCode !== 'IA2' &&
                                                      exam.emE_ExamDescription !== 'UAT'
                                                    : getVal(t, 'groupname')?.toLowerCase().trim() ===
                                                          exam.empG_GroupName?.toLowerCase().trim() &&
                                                      exam.empG_GroupName !== 'Internal Assessment'
                                            );
                                            const val = totl
                                                ? reporttype === 'indi'
                                                    ? getVal(totl, 'estmp_percentage')
                                                    : getVal(totl, 'percentageobtained')
                                                : '';
                                            return (
                                                <td
                                                    key={`avg-${eIdx}`}
                                                    className='p-2 text-center font-bold'
                                                    colSpan={2}
                                                    style={{
                                                        borderTop: '1px solid black',
                                                        borderBottom: '1px solid black',
                                                        borderLeft: eIdx === 0 ? '1px solid black' : '0',
                                                        borderRight: '0'
                                                    }}>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Attendance */}
                                    {displayAttendance && (
                                        <tr>
                                            <td className='td-250 border border-black p-2 pl-6 text-left font-bold' width='250'>
                                                Attendance
                                            </td>
                                            {(reporttype === 'indi'
                                                ? getexamdetails
                                                : [...getexamdetails, { empG_GroupName: 'Final Average' }]
                                            ).map((exam: any, eIdx: number) => {
                                                const att = report.attendance.find((a: any) =>
                                                    reporttype === 'indi'
                                                        ? Number(getVal(a, 'eme_id', 'emeid')) === Number(exam.emE_Id) &&
                                                          exam.emE_ExamCode !== 'IA1' &&
                                                          exam.emE_ExamCode !== 'IA2' &&
                                                          exam.emE_ExamDescription !== 'UAT'
                                                        : getVal(a, 'groupname')?.toLowerCase().trim() ===
                                                              exam.empG_GroupName?.toLowerCase().trim() &&
                                                          exam.empG_GroupName !== 'Internal Assessment'
                                                );
                                                const val = att
                                                    ? reporttype === 'indi'
                                                        ? `${getVal(att, 'percentage')} %`
                                                        : `${getVal(att, 'percentageobtained')} %`
                                                    : '';
                                                return (
                                                    <td
                                                        key={`att-${eIdx}`}
                                                        className='p-2 text-center font-bold'
                                                        colSpan={2}
                                                        style={{
                                                            borderTop: '1px solid black',
                                                            borderBottom: '1px solid black',
                                                            borderLeft: eIdx === 0 ? '1px solid black' : '0',
                                                            borderRight: '0'
                                                        }}>
                                                        {val}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    )}

                                    {/* Position */}
                                    <tr>
                                        <td className='td-250 border border-black p-2 pl-6 text-left font-bold' width='250'>
                                            Position
                                        </td>
                                        {(reporttype === 'indi'
                                            ? getexamdetails
                                            : [...getexamdetails, { empG_GroupName: 'Final Average' }]
                                        ).map((exam: any, eIdx: number) => {
                                            const totl = report.markstotal.find((t: any) =>
                                                reporttype === 'indi'
                                                    ? Number(getVal(t, 'eme_id', 'emeid')) === Number(exam.emE_Id) &&
                                                      exam.emE_ExamCode !== 'IA1' &&
                                                      exam.emE_ExamCode !== 'IA2' &&
                                                      exam.emE_ExamDescription !== 'UAT'
                                                    : getVal(t, 'groupname')?.toLowerCase().trim() ===
                                                          exam.empG_GroupName?.toLowerCase().trim() &&
                                                      exam.empG_GroupName !== 'Internal Assessment'
                                            );
                                            const val = totl
                                                ? reporttype === 'indi'
                                                    ? getVal(totl, 'estmp_sectionposition')
                                                    : getVal(totl, 'position')
                                                : '';
                                            return (
                                                <td
                                                    key={`pos-${eIdx}`}
                                                    className='p-2 text-center font-bold'
                                                    colSpan={2}
                                                    style={{
                                                        borderTop: '1px solid black',
                                                        borderBottom: '1px solid black',
                                                        borderLeft: eIdx === 0 ? '1px solid black' : '0',
                                                        borderRight: '0'
                                                    }}>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Signatures & Promotion Footer info */}
                        <div className='mt-8 font-bold text-sm'>
                            {reporttype === 'promotion' && (
                                <p className='mb-4 font-normal text-gray-700 italic'>
                                    The 'Position' in the Second Term and Final Average is calculated after adding the Total Marks and the
                                    marks obtained in the Co-curricular activities
                                </p>
                            )}
                            <div className='mb-12'>Class Teacher's Comment :</div>
                            <div className='mt-16 flex justify-between px-10'>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold'>Dr.T.H.Ireland</div>
                                    <div className='font-bold text-sm'>Principal</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold'>
                                        {formatTeacherName(report.classteacher || report.Classteacher) || <span>&nbsp;</span>}
                                    </div>
                                    <div className='font-bold text-sm'>Class Teacher</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-32 pt-1'>&nbsp;</div>
                                    <div className='w-32 border-black border-t-[1.5px] pt-1 font-bold'>Parent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
