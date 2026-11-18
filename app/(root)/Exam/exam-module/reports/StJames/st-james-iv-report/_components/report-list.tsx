'use client';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type React from 'react';

interface StJamesIVReportListProps {
    data: any;
    institution: any;
}

export default function StJamesIVReportList({ data, institution: _institution }: StJamesIVReportListProps) {
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

    const findMarks = (marks: any[], colm: any, subj: any) => {
        return marks.find((m) => {
            const mEmeId = getVal(m, 'emeid', 'eme_id');
            if (mEmeId === undefined || Number(mEmeId) !== Number(colm.EME_Id)) return false;

            const mSubId = getVal(m, 'subid', 'isms_id', 'ismsid');
            if (mSubId !== undefined && subj.ISMS_Id !== undefined && Number(mSubId) === Number(subj.ISMS_Id)) {
                return true;
            }

            const mSubOrder = getVal(m, 'subjectorder', 'subjectOrder', 'isms_order', 'emps_subjorder');
            if (mSubOrder !== undefined && subj.subjectorder !== undefined && Number(mSubOrder) === Number(subj.subjectorder)) {
                return true;
            }

            const mSubName = getVal(m, 'subjectname', 'isms_subjectname');
            if (
                mSubName !== undefined &&
                subj.ismS_SubjectName !== undefined &&
                String(mSubName).toLowerCase().trim() === String(subj.ismS_SubjectName).toLowerCase().trim()
            ) {
                return true;
            }

            return false;
        });
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
    const displayAttendance = data?.displayAttendance ?? findKeyCaseInsensitive(data, 'displayAttendance') ?? false;

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
    });

    const students = getstudentdetails.map((student: any) => {
        const studentId = getStudentId(student);

        const filteredSubjects = getstudentwisesubjectlistnew.filter((sub: any) => {
            const subStudentId = getStudentId(sub);
            return subStudentId !== undefined && Number(subStudentId) === Number(studentId);
        });

        // Deduplicate subjects by subjectName (lowercase trimmed)
        const _subjectMap = new Map();
        // Deduplicate subjects by ISMS_Id (Subject ID) to prevent duplicate subject rows on the report card
        const subjectMap = new Map();
        filteredSubjects.forEach((sub: any) => {
            const ismsId = getVal(sub, 'subId', 'subid', 'isms_id', 'ismsid');
            const key = ismsId !== undefined ? String(ismsId) : Math.random().toString();
            if (!subjectMap.has(key)) {
                subjectMap.set(key, sub);
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

    const getMarksDisplay = (mrks: any, colm: any) => {
        if (!mrks) return '';
        const passFail = getVal(mrks, 'passfailflg') ?? '';
        const obtainMarks = getVal(mrks, 'obtainmarks', 'estmppsg_groupobtmarks') ?? '';
        const gradePoints = getVal(mrks, 'obtainedgradepoints', 'estmppsg_gradepoints') ?? '';

        const isFail = passFail === 'Fail';
        const style: React.CSSProperties = isFail ? { textDecoration: 'underline' } : {};

        if (colm.columname === 'Marks') {
            if (passFail === 'AB') return 'AB';
            return isFail ? <span style={style}>{obtainMarks}</span> : obtainMarks;
        }
        if (colm.columname === 'Point' && colm.emE_ExamDescription !== 'UAT') {
            if (passFail === 'AB') return 'AB';
            return isFail ? <span style={style}>{gradePoints}</span> : gradePoints;
        }
        return '';
    };

    const getGradeDisplay = (mrks: any, colm: any) => {
        if (!mrks) return '';
        const passFail = getVal(mrks, 'passfailflg') ?? '';
        const obtainMarks = getVal(mrks, 'obtainmarks', 'estmppsg_groupobtmarks') ?? '';
        const obtainedGrade = getVal(mrks, 'obtainedgrade', 'estmppsg_groupobtgrade') ?? '';
        const marksDisplay = getVal(mrks, 'marksdisplay', 'marksdispaly') ?? '';
        const gradeDisplay = getVal(mrks, 'gradedisplay', 'gradedispaly') ?? '';

        const isFail = passFail === 'Fail';
        const style: React.CSSProperties = isFail ? { textDecoration: 'underline' } : {};

        if (colm.columname === 'Marks') {
            if (passFail === 'AB') return 'AB';

            const elements: React.ReactNode[] = [];
            if (Number(marksDisplay) === 1 || String(marksDisplay).toLowerCase() === 'true' || marksDisplay === true) {
                elements.push(
                    <span key='marks' style={style}>
                        {obtainMarks}
                    </span>
                );
            }
            if (Number(gradeDisplay) === 1 || String(gradeDisplay).toLowerCase() === 'true' || gradeDisplay === true) {
                elements.push(
                    <span key='grade' style={style}>
                        {obtainedGrade}
                    </span>
                );
            }

            if (elements.length > 0) {
                return <>{elements}</>;
            }

            if (obtainMarks || obtainedGrade) {
                return <span style={style}>{obtainedGrade || obtainMarks}</span>;
            }
        }
        return '';
    };

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
                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse border-2 border-gray-400 text-center font-bold text-sm'>
                                <thead className='border-gray-400 border-b-0 border-double'>
                                    <tr>
                                        <td rowSpan={2} className='w-[250px] border border-gray-400 bg-white p-2' />
                                        {getexamdetails.map((exam: any, eIdx: number) => {
                                            return (
                                                <td
                                                    key={`exam-${eIdx}`}
                                                    colSpan={1}
                                                    className='border border-gray-400 bg-white p-2 text-center'>
                                                    {exam.emE_ExamName}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        {tempexamdetails.map((colm: any, cIdx: number) => (
                                            <td key={`col-${cIdx}`} className='border border-gray-400 bg-white p-2 text-center'>
                                                {colm.columname}
                                            </td>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className='border-gray-400 border-t-0 border-double'>
                                    {report.subjects
                                        .filter((s: any) => s.eyceS_AplResultFlg)
                                        .map((subj: any, sIdx: number) => (
                                            <tr key={`subj-${sIdx}`}>
                                                <td className='border border-gray-400 p-2 pl-6 text-left'>{subj.ismS_SubjectName}</td>
                                                {tempexamdetails.map((colm: any, cIdx: number) => {
                                                    const mrks = findMarks(report.marks, colm, subj);
                                                    return (
                                                        <td key={`mark-${cIdx}`} className='border border-gray-400 p-2 text-center'>
                                                            {getMarksDisplay(mrks, colm)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                </tbody>

                                <tbody>
                                    <tr className='border-none'>
                                        <td className='border-none p-2' colSpan={tempexamdetails.length + 1}>
                                            &nbsp;
                                        </td>
                                    </tr>
                                </tbody>

                                <tbody className='border-gray-400 border-double'>
                                    <tr>
                                        <td className='border border-gray-400 p-2 pl-6 text-left'>Total</td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const totl = report.markstotal.find((t: any) => {
                                                const tId = getVal(t, 'emeid', 'eme_id', 'emE_Id');
                                                return (
                                                    tId !== undefined &&
                                                    Number(tId) === Number(colm.EME_Id) &&
                                                    colm.emE_ExamCode !== 'IA1' &&
                                                    colm.emE_ExamCode !== 'IA2'
                                                );
                                            });
                                            return (
                                                <td key={`tot-${cIdx}`} className='border border-gray-400 p-2 text-center'>
                                                    {totl
                                                        ? colm.columname === 'Marks'
                                                            ? getVal(totl, 'estmp_totalobtmarks', 'estmP_TotalObtMarks')
                                                            : ''
                                                        : ''}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    {report.subjects
                                        .filter((s: any) => !s.eyceS_AplResultFlg)
                                        .map((subj: any, sIdx: number) => (
                                            <tr key={`subj-non-${sIdx}`}>
                                                <td className='border border-gray-400 p-2 pl-6 text-left'>{subj.ismS_SubjectName}</td>
                                                {tempexamdetails.map((colm: any, cIdx: number) => {
                                                    const mrks = findMarks(report.marks, colm, subj);
                                                    return (
                                                        <td key={`mark-non-${cIdx}`} className='border border-gray-400 p-2 text-center'>
                                                            {getGradeDisplay(mrks, colm)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Extra Details */}
                        <div className='mt-8 font-bold text-sm'>
                            <div className='mb-4 flex'>
                                <div className='w-[20%]'>Class Teacher's Comment :</div>
                                <div className='w-[80%] border-black border-b'>&nbsp;</div>
                            </div>
                            <div className='mb-4 flex'>
                                <div className='w-full border-black border-b'>&nbsp;</div>
                            </div>
                            <div className='mb-4 flex'>
                                <div className='w-full border-black border-b'>&nbsp;</div>
                            </div>
                            <div className='mb-4 flex'>
                                <div className='w-full border-black border-b'>&nbsp;</div>
                            </div>
                            <div className='mb-4 flex'>
                                <div className='w-full border-black border-b'>&nbsp;</div>
                            </div>

                            {displayAttendance && (
                                <div className='mb-4 flex'>
                                    <div className='w-[15%]'>Attendance</div>
                                    <div className='w-[25%] border-black border-b'>&nbsp;</div>
                                    <div className='w-[15%] text-center'>days out of</div>
                                    <div className='w-[45%] border-black border-b'>&nbsp;</div>
                                </div>
                            )}

                            <div className='mb-4 flex'>
                                <div className='w-[10%]'>Club</div>
                                <div className='w-[90%] border-black border-b'>&nbsp;</div>
                            </div>

                            <div className='mb-4 flex'>
                                <div className='w-[10%]'>Awards</div>
                                <div className='w-[90%] border-black border-b'>&nbsp;</div>
                            </div>

                            <div className='mb-12 flex justify-end'>
                                <div>Promotion Granted/Refused</div>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className='mt-10 font-bold text-sm'>
                            <div className='mt-16 flex justify-between'>
                                <div className='flex flex-col items-start'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold text-sm'>
                                        {formatTeacherName(report.Classteacher || report.classteacher) || <span>&nbsp;</span>}
                                    </div>
                                    <div className='font-bold text-sm'>&emsp; Class Teacher</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold text-sm'>Mrs.B.Mathew</div>
                                    <div className='font-bold text-sm'>Junior Head</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold text-sm'>Dr.T.H.Ireland</div>
                                    <div className='font-bold text-sm'>Principal</div>
                                </div>
                                <div className='flex flex-col items-end text-right '>
                                    <div className='mt-[2px] w-32 border-black border-t-[1.5px] pt-1 font-bold text-sm'>Parent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
