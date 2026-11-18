'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import React from 'react';

interface StJamesIXXReportListProps {
    data: any;
    institution: any;
}

export default function StJamesIXXReportList({ data, institution }: StJamesIXXReportListProps) {
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
    const displayAttendance = data?.displayAttendance ?? findKeyCaseInsensitive(data, 'displayAttendance');

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
    getexamdetails.forEach((exam: any) => {
        const examName = exam.emE_ExamName ?? exam.eme_ExamName ?? exam.emE_Examname ?? '';
        const examCode = exam.emE_ExamCode ?? exam.eme_ExamCode ?? exam.emE_Examcode ?? '';
        const examDesc = exam.emE_ExamDescription ?? exam.eme_ExamDescription ?? exam.emE_Examdescription ?? '';
        const examId = exam.emE_Id ?? exam.eme_Id ?? exam.emeId ?? 0;

        tempexamdetails.push({
            ...exam,
            columname: 'Marks',
            EME_Id: examId,
            emE_ExamName: examName,
            emE_ExamCode: examCode,
            emE_ExamDescription: examDesc
        });
        tempexamdetails.push({
            ...exam,
            columname: 'Point',
            EME_Id: examId,
            emE_ExamName: examName,
            emE_ExamCode: examCode,
            emE_ExamDescription: examDesc
        });
    });

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

    const getMarksStyleAndContent = (mrks: any, colm: any) => {
        if (!mrks) return null;
        const passFail = getVal(mrks, 'passfailflg') ?? '';
        const obtainMarks = getVal(mrks, 'obtainmarks', 'estmppsg_groupobtmarks') ?? '';
        const gradePoints = getVal(mrks, 'obtainedgradepoints', 'estmppsg_gradepoints') ?? '';
        const compulsoryFlag = getVal(mrks, 'compulsoryflag', 'complusoryflag') ?? '';

        if (colm.columname === 'Marks') {
            let content = obtainMarks;
            if (passFail === 'AB') content = 'AB';

            const isFail = passFail === 'Fail';
            const style: React.CSSProperties = isFail ? { textDecoration: 'underline' } : {};

            return (
                <b style={style} className='font-bold'>
                    {content}
                </b>
            );
        } else if (colm.columname === 'Point') {
            const isCompulsory = compulsoryFlag === 'C';
            if (isCompulsory) return null;

            let content = gradePoints;
            if (passFail === 'AB') content = 'AB';

            const isFail = passFail === 'Fail';
            const style: React.CSSProperties = isFail ? { textDecoration: 'underline' } : {};

            return (
                <b style={style} className='font-bold'>
                    {content}
                </b>
            );
        }
        return null;
    };

    const getNonScholasticMarksStyleAndContent = (mrks: any, colm: any) => {
        if (!mrks) return null;
        const passFail = getVal(mrks, 'passfailflg') ?? '';
        const obtainMarks = getVal(mrks, 'obtainmarks', 'estmppsg_groupobtmarks') ?? '';
        const obtainedGrade = getVal(mrks, 'obtainedgrade', 'estmppsg_groupobtgrade') ?? '';
        const compulsoryFlag = getVal(mrks, 'compulsoryflag', 'complusoryflag') ?? '';
        const marksDisplay = getVal(mrks, 'marksdisplay', 'marksdispaly') ?? '';
        const gradeDisplay = getVal(mrks, 'gradedisplay', 'gradedispaly') ?? '';

        const isFail = passFail === 'Fail';
        const style: React.CSSProperties = isFail ? { textDecoration: 'underline' } : {};

        if (colm.columname === 'Marks') {
            if (passFail === 'AB') {
                return (
                    <b style={style} className='font-bold'>
                        {passFail}
                    </b>
                );
            }

            const elements: React.ReactNode[] = [];
            if (Number(marksDisplay) === 1 || String(marksDisplay).toLowerCase() === 'true' || marksDisplay === true) {
                elements.push(
                    <b key='marks' style={style} className='font-bold'>
                        {obtainMarks}
                    </b>
                );
            }
            if (Number(gradeDisplay) === 1 || String(gradeDisplay).toLowerCase() === 'true' || gradeDisplay === true) {
                elements.push(
                    <b key='grade' style={style} className='font-bold'>
                        {obtainedGrade}
                    </b>
                );
            }

            if (elements.length > 0) {
                return <React.Fragment>{elements}</React.Fragment>;
            }

            // Fallback if neither is explicitly 1 but one of them exists
            if (obtainMarks || obtainedGrade) {
                return (
                    <b style={style} className='font-bold'>
                        {obtainedGrade || obtainMarks}
                    </b>
                );
            }
        }
        return null;
    };

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return date;
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
          .padding-left-25 { padding-left: 25px !important; }
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
                                <div className='w-1/3'>{report.studentname}</div>
                                <div className='flex w-1/3 justify-between'>
                                    <span>
                                        Class : {report.classname} {report.sectionname}
                                    </span>
                                    <span>Roll : {report.rollno}</span>
                                </div>
                                <div className='w-1/3 text-right'>Reg.No. : {report.admno}</div>
                            </div>

                            <div className='flex justify-between font-bold'>
                                <div className='w-1/3'>{report.SPCCMH_HouseName || report.spccmH_HouseName || ''}</div>
                                <div className='w-1/3 text-center'>Number of boys in class : {report.totalboys}</div>
                                <div className='w-1/3 text-right'>D.O.B : {formatDate(report.dob)}</div>
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
                                        <th className='w-[250px] border border-black bg-white p-2 text-left' rowSpan={2}></th>
                                        {getexamdetails.map((exam: any, eIdx: number) => (
                                            <th
                                                key={`exam-${eIdx}`}
                                                colSpan={2}
                                                className='border border-black bg-white p-2 text-center'
                                                style={eIdx < getexamdetails.length - 1 ? { borderRight: '3px double black' } : {}}>
                                                <b>{exam.emE_ExamName}</b>
                                            </th>
                                        ))}
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
                                                <b>{colm.columname}</b>
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
                                                        const mId = getVal(m, 'emeid', 'eme_id');
                                                        if (mId === undefined || Number(mId) !== Number(colm.EME_Id)) return false;

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
                                                            {getMarksStyleAndContent(mrks, colm)}
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
                                                        const mId = getVal(m, 'emeid', 'eme_id');
                                                        if (mId === undefined || Number(mId) !== Number(colm.EME_Id)) return false;

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
                                                            {getNonScholasticMarksStyleAndContent(mrks, colm)}
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
                                            Total (Eng + 4)
                                        </td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const showTotal = colm.emE_ExamCode !== 'IA1' && colm.emE_ExamCode !== 'IA2';
                                            let val = '';
                                            if (showTotal) {
                                                const totl = report.markstotal.find((t: any) => {
                                                    const tId = getVal(t, 'emeid', 'eme_id');
                                                    return tId !== undefined && Number(tId) === Number(colm.EME_Id);
                                                });
                                                if (totl) {
                                                    if (colm.columname === 'Marks') {
                                                        val = getVal(totl, 'estmp_totalobtmarks') ?? '';
                                                    } else if (colm.columname === 'Point') {
                                                        val = getVal(totl, 'estmp_gradepoints') ?? '';
                                                    }
                                                }
                                            }
                                            return (
                                                <td
                                                    key={`tot-${cIdx}`}
                                                    className='border border-black p-2 text-center font-bold'
                                                    style={
                                                        cIdx % 2 === 1 && cIdx < tempexamdetails.length - 1
                                                            ? { borderRight: '3px double black' }
                                                            : {}
                                                    }>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Average */}
                                    <tr>
                                        <td className='td-250 border border-black p-2 pl-6 text-left font-bold' width='250'>
                                            Average (Eng + 4)
                                        </td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const showAvg = colm.emE_ExamCode !== 'IA1' && colm.emE_ExamCode !== 'IA2';
                                            let val = '';
                                            if (showAvg) {
                                                const totl = report.markstotal.find((t: any) => {
                                                    const tId = getVal(t, 'emeid', 'eme_id');
                                                    return tId !== undefined && Number(tId) === Number(colm.EME_Id);
                                                });
                                                if (totl && colm.columname === 'Marks') {
                                                    val = getVal(totl, 'estmp_percentage') ?? '';
                                                }
                                            }
                                            return (
                                                <td
                                                    key={`avg-${cIdx}`}
                                                    className='border border-black p-2 text-center font-bold'
                                                    style={
                                                        cIdx % 2 === 1 && cIdx < tempexamdetails.length - 1
                                                            ? { borderRight: '3px double black' }
                                                            : {}
                                                    }>
                                                    {val || <span>&nbsp;</span>}
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
                                            {tempexamdetails.map((colm: any, cIdx: number) => {
                                                const showAtt = colm.emE_ExamCode !== 'IA1' && colm.emE_ExamCode !== 'IA2';
                                                let val = '';
                                                if (showAtt) {
                                                    const att = report.attendance.find((a: any) => {
                                                        const aId = getVal(a, 'emeid', 'eme_id');
                                                        return aId !== undefined && Number(aId) === Number(colm.EME_Id);
                                                    });
                                                    if (att && colm.columname === 'Marks') {
                                                        const pct = getVal(att, 'percentage', 'attendancepercentage') ?? '';
                                                        val = pct ? `${pct} %` : '';
                                                    }
                                                }
                                                return (
                                                    <td
                                                        key={`att-${cIdx}`}
                                                        className='border border-black p-2 text-center font-bold'
                                                        style={
                                                            cIdx % 2 === 1 && cIdx < tempexamdetails.length - 1
                                                                ? { borderRight: '3px double black' }
                                                                : {}
                                                        }>
                                                        {val || <span>&nbsp;</span>}
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
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const showPos = colm.emE_ExamCode !== 'IA1' && colm.emE_ExamCode !== 'IA2';
                                            let val = '';
                                            if (showPos) {
                                                const totl = report.markstotal.find((t: any) => {
                                                    const tId = getVal(t, 'emeid', 'eme_id');
                                                    return tId !== undefined && Number(tId) === Number(colm.EME_Id);
                                                });
                                                if (totl && colm.columname === 'Marks') {
                                                    val = getVal(totl, 'estmp_sectionposition') ?? '';
                                                }
                                            }
                                            return (
                                                <td
                                                    key={`pos-${cIdx}`}
                                                    className='border border-black p-2 text-center font-bold'
                                                    style={
                                                        cIdx % 2 === 1 && cIdx < tempexamdetails.length - 1
                                                            ? { borderRight: '3px double black' }
                                                            : {}
                                                    }>
                                                    {val || <span>&nbsp;</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Signatures */}
                        <div className='my-footer mt-10 font-bold text-sm'>
                            <div className='row mb-12'>
                                <div>Class Teacher's Comment :</div>
                            </div>
                            <div className='mt-16 flex justify-between px-4'>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold text-sm'>Dr.T.H.Ireland</div>
                                    <div className='font-bold text-sm'>Principal/Secretary</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='link w-48 border-black border-t-[1.5px] pt-1 font-bold text-sm'>
                                        {formatTeacherName(report.Classteacher || report.classteacher) || <span>&nbsp;</span>}
                                    </div>
                                    <div className='font-bold text-sm'>Class Teacher</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-32 pt-1'>&nbsp;</div>
                                    <div className='w-32 border-black border-t-[1.5px] pt-1 font-bold text-sm'>Parent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
