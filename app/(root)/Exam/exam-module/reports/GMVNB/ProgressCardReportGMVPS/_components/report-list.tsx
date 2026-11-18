'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useMemo, useRef } from 'react';

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

    // Extract exam name and code from returned data
    const examName = data?.examName || '';
    const examCode = data?.examCode || '';

    // Group the marks list by student to get unique student details
    const reportList = useMemo(() => {
        const uniqueStudentsMap = new Map<number, any>();
        const savelist = data?.savelist || [];
        savelist.forEach((item: any) => {
            const studentId = item.amsT_Id || item.AMST_Id;
            if (studentId && !uniqueStudentsMap.has(studentId)) {
                // Calculate min marks for this student
                const studentMarks = savelist.filter((m: any) => (m.amsT_Id || m.AMST_Id) === studentId);
                let estmP_MinMarks = 0;
                studentMarks.forEach((mark: any) => {
                    if (mark.eyceS_AplResultFlg === true || mark.EYCES_AplResultFlg === true) {
                        estmP_MinMarks += Number(mark.eyceS_MinMarks || mark.EYCES_MinMarks || 0);
                    }
                });

                uniqueStudentsMap.set(studentId, {
                    ...item,
                    estmP_MinMarks
                });
            }
        });
        return Array.from(uniqueStudentsMap.values());
    }, [data]);

    return (
        <div className='printable-content space-y-6'>
            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='flex w-fit items-center gap-2'>
                    <Printer className='h-4 w-4' /> Print Report
                </Button>
            </div>

            <div ref={printRef} id='print-area' className='print-area' style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                {reportList.length > 0 ? (
                    reportList.map((report: any, index: number) => {
                        const studentID = report.amsT_Id || report.AMST_Id;

                        // Filter savelist marks for this student
                        const studentMarks = (data?.savelist || []).filter(
                            (m: any) =>
                                (m.amsT_Id || m.AMST_Id) === studentID && (m.eyceS_AplResultFlg === true || m.EYCES_AplResultFlg === true)
                        );

                        // Safe date formatting helper
                        let dobText = '';
                        if (report.amsT_DOB) {
                            try {
                                dobText = format(new Date(report.amsT_DOB), 'd MMMM yyyy');
                            } catch {
                                dobText = report.amsT_DOB;
                            }
                        }

                        return (
                            <div
                                key={index}
                                className={`mx-auto mb-8 w-[95%] border border-gray-300 bg-white p-6 shadow-sm ${index > 0 ? 'page-break-before-always' : ''}`}
                                style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                                {/* School Logo */}
                                <div className='mb-6 flex w-full justify-center'>
                                    <img
                                        src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/6a4bad20-fd91-45ff-b0cd-b152f3d07edc.jpg'
                                        alt='School Header Logo'
                                        className='w-full object-contain'
                                        style={{ maxWidth: '100%', height: 'auto' }}
                                    />
                                </div>

                                {/* Student Details Profile */}
                                <div className='relative mb-8 flex items-start justify-between px-4'>
                                    <div className='flex w-2/3 flex-col space-y-2 text-[15px]'>
                                        {[
                                            { label: 'Name', value: report.amsT_FirstName || report.studentname || report.studentName },
                                            { label: 'Admission No', value: report.amsT_AdmNo || report.admno || report.admissionNo },
                                            {
                                                label: 'Class & Section',
                                                value: `${report.asmcL_ClassName || ''} - ${report.asmC_SectionName || ''}`
                                            },
                                            { label: 'Date of birth', value: dobText },
                                            {
                                                label: "Mother's name",
                                                value: report.amsT_MotherName || report.motherName || report.mothername
                                            },
                                            {
                                                label: "Father's name",
                                                value: report.amsT_FatherName || report.fatherName || report.fathername
                                            }
                                        ].map((item, i) => (
                                            <div key={i} className='flex items-center'>
                                                <div className='w-40 font-bold text-gray-700'>{item.label}</div>
                                                <div className='w-4 font-bold text-gray-700'>:</div>
                                                <div className='ml-2 font-bold text-black'>{item.value || ''}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Student Photo */}
                                    <div className='flex h-[140px] w-[120px] items-center justify-center border-2 border-gray-300 bg-gray-50 p-1 shadow-sm'>
                                        {report.amsT_Photoname || report.photo || report.AMST_Photoname ? (
                                            <img
                                                src={report.amsT_Photoname || report.photo || report.AMST_Photoname}
                                                alt='Student Photo'
                                                className='h-full w-full object-cover'
                                            />
                                        ) : (
                                            <span className='font-bold text-gray-400 text-xs'>PHOTO</span>
                                        )}
                                    </div>
                                </div>

                                {/* Exam Name Header */}
                                <div className='mb-6 text-center'>
                                    <h3 className='font-bold text-sky-900 text-xl uppercase tracking-wider'>
                                        {examName} - {academicYear}
                                    </h3>
                                </div>

                                {/* Marks Table */}
                                <div className='px-2'>
                                    <table className='w-full border-collapse border border-gray-400 text-sm'>
                                        <thead>
                                            <tr style={{ backgroundColor: '#c6dff7' }}>
                                                <th className='w-16 border border-gray-400 p-2 text-center font-bold text-black'>SL No</th>
                                                <th className='border border-gray-400 p-2 text-left font-bold text-black'>
                                                    SUBJECT(SCHOLASTIC)
                                                </th>
                                                <th className='w-32 border border-gray-400 p-2 text-center font-bold text-black'>
                                                    Max Marks
                                                </th>
                                                <th className='w-32 border border-gray-400 p-2 text-center font-bold text-black'>
                                                    Min Marks
                                                </th>
                                                <th className='w-40 border border-gray-400 p-2 text-center font-bold text-black'>
                                                    Obtained Marks
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentMarks.map((mark: any, sIdx: number) => {
                                                const pfFlag = mark.estmpS_PassFailFlg || mark.ESTMPS_PassFailFlg;
                                                const displayFlg = mark.eyceS_MarksDisplayFlg || mark.EYCES_MarksDisplayFlg;
                                                const subCode = mark.ismS_SubjectCode || mark.ISMS_SubjectCode || '';

                                                let obtainedMarksText = '';
                                                if (pfFlag !== 'AB' && displayFlg) {
                                                    obtainedMarksText = String(
                                                        mark.estmpS_ObtainedMarks ?? mark.ESTMPS_ObtainedMarks ?? ''
                                                    );
                                                } else if (pfFlag === 'AB' && displayFlg && subCode !== 'SE') {
                                                    obtainedMarksText = pfFlag;
                                                } else if (pfFlag !== 'AB' && subCode === 'SE') {
                                                    obtainedMarksText = '-';
                                                } else {
                                                    obtainedMarksText = String(
                                                        mark.estmpS_ObtainedMarks ?? mark.ESTMPS_ObtainedMarks ?? ''
                                                    );
                                                }

                                                return (
                                                    <tr key={sIdx} className='transition-colors hover:bg-slate-50'>
                                                        <td className='border border-gray-400 p-2 text-center'>{sIdx + 1}</td>
                                                        <td className='border border-gray-400 p-2 text-left font-bold'>
                                                            {mark.ismS_SubjectName || mark.ISMS_SubjectName}
                                                        </td>
                                                        <td className='border border-gray-400 bg-[#c6dff7]/30 p-2 text-center'>
                                                            {mark.estmpS_MaxMarks || mark.ESTMPS_MaxMarks}
                                                        </td>
                                                        <td className='border border-gray-400 bg-[#c6dff7]/30 p-2 text-center'>
                                                            {mark.eyceS_MinMarks || mark.EYCES_MinMarks}
                                                        </td>
                                                        <td className='border border-gray-400 bg-[#c6dff7]/30 p-2 text-center font-semibold'>
                                                            {obtainedMarksText}
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* Total Row */}
                                            <tr style={{ backgroundColor: '#c6dff7' }} className='font-bold'>
                                                <td className='border border-gray-400 p-2 text-center'>&nbsp;</td>
                                                <td className='border border-gray-400 p-2 text-left'>TOTAL</td>
                                                <td className='border border-gray-400 p-2 text-center'>
                                                    {report.estmP_TotalMaxMarks || report.ESTMP_TotalMaxMarks}
                                                </td>
                                                <td className='border border-gray-400 p-2 text-center'>
                                                    {report.estmP_MinMarks || report.ESTMP_MinMarks}
                                                </td>
                                                <td className='border border-gray-400 p-2 text-center'>
                                                    {report.estmP_TotalObtMarks || report.ESTMP_TotalObtMarks}
                                                </td>
                                            </tr>

                                            {/* Percentage Row */}
                                            <tr style={{ backgroundColor: '#c6dff7' }} className='font-bold'>
                                                <td className='border border-gray-400 p-2 text-center'>&nbsp;</td>
                                                <td className='border border-gray-400 p-2 text-left' colSpan={2}>
                                                    PERCENTAGE
                                                </td>
                                                <td className='border border-gray-400 p-2 text-center' colSpan={2}>
                                                    {report.estmP_Percentage || report.ESTMP_Percentage}%
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Signatures Footer */}
                                <div className='mt-24 flex items-center justify-between px-4 font-bold text-gray-800 text-sm'>
                                    <div className='w-1/3 text-left'>Principal / H.M Signature</div>
                                    <div className='w-1/3 text-center'>Class Teacher Signature</div>
                                    <div className='w-1/3 text-right'>Parent Signature</div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className='rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm'>
                        No student records found to display the report.
                    </div>
                )}
            </div>

            <style jsx global>{`
                @media print {
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
                    
                    html, body, main, 
                    body :has(#print-area),
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
                    
                    #print-area,
                    #print-area * {
                        visibility: visible !important;
                    }
                    
                    #print-area {
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
            `}</style>
        </div>
    );
};
