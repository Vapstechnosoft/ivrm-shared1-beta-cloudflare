'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import Image from 'next/image';

interface Props {
    reportData: any;
    onPrint?: () => void;
    reportType?: string;
}

export default function ProgressCardReport({ reportData, onPrint, reportType = 'REPORT' }: Props) {
    const {
        getstudentdetails = [],
        getstudentwisesubjectlist = [],
        getstudentmarksdetails = [],
        getgroupexamdetails = [],
        examwiseremarks = [],
        getstudentwisetermwisedetails = [],
        getstudentwiseattendancedetails = [],
        getpromotionremarksdetails = [],
        getsubjects = [],
        yearlySkillAreaStudentWise = [],
        clstchname = []
    } = reportData;

    // Derived distinct exams from getgroupexamdetails or fallback to getstudentwisesubjectlist
    const termList =
        getgroupexamdetails && getgroupexamdetails.length > 0
            ? getgroupexamdetails
            : Array.from(new Set(getstudentwisesubjectlist.map((s: any) => s.EME_Id))).map((id) => {
                  const sub = getstudentwisesubjectlist.find((s: any) => s.EME_Id === id);
                  return { emE_Id: id, emE_ExamName: sub?.EME_ExamName || `Exam ${id}` };
              });

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #progress-card-print-area,
                    #progress-card-print-area * {
                        visibility: visible !important;
                    }
                    #progress-card-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break-after {
                        page-break-after: always !important;
                    }
                    .page-break-before {
                        page-break-before: always !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 5mm;
                    }
                    .table-bordered {
                        border: 1px solid #ccc !important;
                    }
                    .table-bordered th, .table-bordered td {
                        border: 1px solid #ccc !important;
                    }
                }

                .report-container {
                    font-family: 'Poppins', sans-serif !important;
                    color: black;
                }

                .table-custom {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                    background-color: transparent !important;
                }

                .table-custom th, .table-custom td {
                    border: 1px solid #ccc;
                    padding: 8px;
                    text-align: center;
                    font-size: 13px;
                }
                
                .table-header {
                    background-color: #f9f9f9;
                    font-weight: 600;
                }

                .text-left { text-align: left !important; }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .font-bold { font-weight: bold; }
                
                .blue-border-box {
                    border: 2px solid #3b82f6;
                    padding: 20px;
                    height: 100%;
                }
            `}</style>

            <div className='no-print my-6 flex justify-end'>
                <Button onClick={onPrint} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print
                </Button>
            </div>

            <div id='progress-card-print-area' className='report-container'>
                {getstudentdetails.map((report: any, index: number) => {
                    const studentId = report.AMST_Id || report.amsT_Id || Number(report.subject_wise_total_per);

                    const studentName = report.studentname || report.amsT_FirstName || report.r_amst_id;
                    const className = report.classname || report.asmcL_ClassName || report.r_grporder;
                    const sectionName = report.sectionname || report.asmC_SectionName || report.r_emps_apptoresultflg;
                    const admNo = report.admno || report.amsT_AdmNo || report.r_isms_id;
                    const academicYear = report.asmaY_Year || (clstchname && clstchname.length > 0 ? '2025-2026' : '2025-2026');
                    const studentPhoto =
                        report.r_eyces_marksdisplayflg || 'https://vapsclg.blob.core.windows.net/files/27/StudentProfilePics/default.png';

                    // For TEMPLATE view
                    const studentAttendance = getstudentwiseattendancedetails.filter((a: any) => (a.AMST_Id || a.amsT_Id) === studentId);
                    const term1Att = studentAttendance.find((a: any) => a.EME_ExamName?.includes('Term 1') || a.EME_Id === 26);
                    const term2Att = studentAttendance.find((a: any) => a.EME_ExamName?.includes('Term 2') || a.EME_Id === 27);

                    // For REPORT view
                    const studentSubjectsList = getstudentwisesubjectlist.filter((s: any) => (s.AMST_Id || s.amsT_Id) === studentId);

                    // Distinct subjects (like employeeid in AngularJS)
                    const distinctSubjects = Array.from(new Set(studentSubjectsList.map((s: any) => s.ISMS_Id))).map((id) =>
                        studentSubjectsList.find((s: any) => s.ISMS_Id === id)
                    );

                    return (
                        <div
                            key={studentId + '-' + index}
                            className='report-page mb-8'
                            style={{ pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
                            {reportType === 'TEMPLATE' ? (
                                <div className='grid grid-cols-12 gap-6 p-2'>
                                    {/* Left Side Details */}
                                    <div className='col-span-7 flex flex-col gap-4'>
                                        <div className='flex gap-4'>
                                            {/* Attendance Table */}
                                            <div className='flex-1'>
                                                <table className='table-custom'>
                                                    <thead>
                                                        <tr>
                                                            <th className='table-header'>ATTENDANCE</th>
                                                            {termList.map((exm: any, idx: number) => (
                                                                <th key={idx} className='table-header'>
                                                                    {exm.emE_ExamName || exm.EME_ExamName}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className='text-left font-medium'>Days Present :</td>
                                                            {termList.map((exm: any, idx: number) => {
                                                                const att = studentAttendance.find(
                                                                    (a: any) => a.EME_Id === exm.emE_Id || a.EME_Id === exm.EME_Id
                                                                );
                                                                return <td key={idx}>{att?.TOTALPRESENTDAYS || att?.PRESENTDAYS || ''}</td>;
                                                            })}
                                                        </tr>
                                                        <tr>
                                                            <td className='text-left font-medium'>Total Days :</td>
                                                            {termList.map((exm: any, idx: number) => {
                                                                const att = studentAttendance.find(
                                                                    (a: any) => a.EME_Id === exm.emE_Id || a.EME_Id === exm.EME_Id
                                                                );
                                                                return <td key={idx}>{att?.TOTALWORKINGDAYS || ''}</td>;
                                                            })}
                                                        </tr>
                                                        <tr>
                                                            <td className='text-left font-medium'>Percentage :</td>
                                                            {termList.map((exm: any, idx: number) => {
                                                                const att = studentAttendance.find(
                                                                    (a: any) => a.EME_Id === exm.emE_Id || a.EME_Id === exm.EME_Id
                                                                );
                                                                return (
                                                                    <td key={idx}>
                                                                        {att?.TOTALAttendancePercentage || att?.ATTENDANCEPERCENTAGE || ''}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Promotion Image Block */}
                                            <div className='flex w-[200px] flex-col border border-gray-300'>
                                                <div className='flex flex-1 items-center justify-center bg-blue-50 p-2'>
                                                    <Image
                                                        src='https://vapsclg.blob.core.windows.net/files/27/promotion_kids.png'
                                                        alt='Promotion'
                                                        width={150}
                                                        height={120}
                                                        className='object-contain'
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className='border-gray-300 border-t p-2 font-medium text-sm'>Promotion :</div>
                                            </div>
                                        </div>

                                        {/* Teacher's Remarks */}
                                        <div className='mt-4 flex h-32 items-start border border-gray-300 p-3 text-gray-600 text-sm'>
                                            Teacher's Remarks Term I
                                        </div>

                                        <div className='mt-auto pt-4'>
                                            <table className='w-full text-xs'>
                                                <tbody>
                                                    <tr>
                                                        <td className='w-1/3 text-center'>Class Teacher's Signature | date</td>
                                                        <td className='w-1/3 text-center'>Principal's Signature | date</td>
                                                        <td className='w-1/3 text-center'>Parent's Signature | date</td>
                                                    </tr>
                                                    <tr>
                                                        <td className='w-1/3 pt-8 text-center'>T1</td>
                                                        <td className='pt-8'></td>
                                                        <td className='pt-8'></td>
                                                    </tr>
                                                    <tr>
                                                        <td className='w-1/3 pt-8 text-center'>T2</td>
                                                        <td className='pt-8'></td>
                                                        <td className='pt-8'></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Right Side Cover Page */}
                                    <div className='col-span-5'>
                                        <div className='blue-border-box relative flex h-[800px] flex-col items-center text-center'>
                                            <Image
                                                src='https://vapsclg.blob.core.windows.net/files/27/Logo02.jpg'
                                                alt='Tunbridge High School'
                                                width={100}
                                                height={100}
                                                unoptimized
                                            />
                                            <h2 className='mt-4 mb-2 font-bold text-blue-900 text-xl'>TUNBRIDGE HIGH SCHOOL</h2>
                                            <p className='mb-6 px-4 text-gray-700 text-xs'>
                                                86/2, Infantry Road, Tasker Town, Shivaji Nagar, Bengaluru, Karnataka 560001 KA025
                                                (Affiliated to the Council for the Indian School Certificate Examinations, New Delhi)
                                            </p>

                                            <h3 className='mb-1 font-bold text-lg'>PERFORMANCE REPORT</h3>
                                            <h4 className='mb-6 font-bold text-md'>ACADEMIC YEAR : {academicYear}</h4>

                                            <div className='mb-6 border-2 border-blue-400 p-1'>
                                                <Image
                                                    src={studentPhoto}
                                                    alt='Student Profile'
                                                    width={120}
                                                    height={150}
                                                    className='object-cover'
                                                    unoptimized
                                                    onError={(e: any) => {
                                                        e.target.src =
                                                            'https://vapsclg.blob.core.windows.net/files/27/StudentProfilePics/default.png';
                                                    }}
                                                />
                                            </div>

                                            <div className='mt-4 w-full space-y-3 px-8 text-left font-medium text-sm'>
                                                <div className='flex border-gray-400 border-b border-dotted pb-1'>
                                                    <span className='w-32'>Name</span>
                                                    <span className='mr-2'>:</span>
                                                    <span className='font-bold'>{studentName}</span>
                                                </div>
                                                <div className='flex border-gray-400 border-b border-dotted pb-1'>
                                                    <span className='w-32'>Admission No.</span>
                                                    <span className='mr-2'>:</span>
                                                    <span className='font-bold'>{admNo}</span>
                                                </div>
                                                <div className='flex border-gray-400 border-b border-dotted pb-1'>
                                                    <span className='w-32'>Class & Section</span>
                                                    <span className='mr-2'>:</span>
                                                    <span className='font-bold'>
                                                        {className} & {sectionName}
                                                    </span>
                                                </div>
                                                <div className='flex border-gray-400 border-b border-dotted pb-1'>
                                                    <span className='w-32'>Class Teacher</span>
                                                    <span className='mr-2'>:</span>
                                                    <span className='font-bold'>
                                                        {clstchname && clstchname.length > 0 ? clstchname : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='absolute bottom-4'>
                                                <Image
                                                    src='https://vapsclg.blob.core.windows.net/files/27/image_2024_03_15T08_35_44_566Z-removebg-preview (1).png'
                                                    alt='Footer Decoration'
                                                    width={200}
                                                    height={100}
                                                    unoptimized
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='p-2'>
                                    <table className='table-custom'>
                                        <thead>
                                            <tr>
                                                <th colSpan={3} className='p-3 text-left font-bold text-lg'>
                                                    TUNBRIDGE HIGH SCHOOL
                                                </th>
                                                <th colSpan={termList.length || 2} className='p-3 text-right font-bold text-lg'>
                                                    AY &nbsp; &nbsp; {academicYear}
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className='table-header w-12' rowSpan={2}>
                                                    #
                                                </th>
                                                <th className='table-header w-1/4' rowSpan={2}>
                                                    FOCUS AREA
                                                </th>
                                                <th className='table-header w-1/4' rowSpan={2}>
                                                    LEARNING OUTCOMES
                                                </th>
                                                {termList.map((exm: any, idx: number) => (
                                                    <th key={idx} className='table-header'>
                                                        {exm.emE_ExamName || exm.EME_ExamName}
                                                    </th>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className='bg-gray-50 text-center' colSpan={termList.length || 2}>
                                                    <div className='flex justify-center gap-6'>
                                                        <span className='text-xl'>🤩</span>
                                                        <span className='text-xl'>😊</span>
                                                        <span className='text-xl'>😃</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {distinctSubjects.map((sub: any, idx: number) => {
                                                // Get the sub-exams / outcomes for this subject
                                                const outcomes = Array.from(
                                                    new Set(
                                                        studentSubjectsList
                                                            .filter((s: any) => s.ISMS_Id === sub.ISMS_Id)
                                                            .map((s: any) => s.EMSE_SubExamName)
                                                    )
                                                );

                                                return (
                                                    <tr key={idx}>
                                                        <td>{idx + 1}</td>
                                                        <td className='text-left font-medium'>{sub.ISMS_SubjectName}</td>
                                                        <td className='border-0 p-0'>
                                                            <table className='h-full w-full border-hidden'>
                                                                <tbody>
                                                                    {outcomes.map((outcome: any, oIdx: number) => (
                                                                        <tr key={oIdx}>
                                                                            <td className='block min-h-[40px] border-0 border-gray-300 border-b p-2 text-left last:border-0'>
                                                                                {outcome}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                        {termList.map((exm: any, eIdx: number) => (
                                                            <td key={eIdx} className='border-0 p-0'>
                                                                <table className='h-full w-full border-hidden'>
                                                                    <tbody>
                                                                        {outcomes.map((outcome: any, oIdx: number) => {
                                                                            const examData = studentSubjectsList.find(
                                                                                (s: any) =>
                                                                                    s.ISMS_Id === sub.ISMS_Id &&
                                                                                    s.EMSE_SubExamName === outcome &&
                                                                                    (s.EME_Id === exm.emE_Id || s.EME_Id === exm.EME_Id)
                                                                            );

                                                                            let emoji = '';
                                                                            if (examData?.ESTMPSSS_ObtainedMarks === 1) emoji = '🤩';
                                                                            else if (examData?.ESTMPSSS_ObtainedMarks === 2) emoji = '😊';
                                                                            else if (examData?.ESTMPSSS_ObtainedMarks === 3) emoji = '😃';

                                                                            return (
                                                                                <tr key={oIdx}>
                                                                                    <td className='block min-h-[40px] border-0 border-gray-300 border-b p-2 text-center last:border-0'>
                                                                                        {emoji && <span className='text-xl'>{emoji}</span>}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                            {distinctSubjects.length === 0 && (
                                                <tr>
                                                    <td colSpan={3 + termList.length} className='py-4 text-center'>
                                                        No data available for this student
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
