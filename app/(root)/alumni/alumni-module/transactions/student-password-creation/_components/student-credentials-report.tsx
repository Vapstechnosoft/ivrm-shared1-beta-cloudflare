'use client';

import type { ICredentialStudent } from '@/types/alumni/student-password-creation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface StudentCredentialsReportProps {
    students: ICredentialStudent[];
}

export default function StudentCredentialsReport({ students }: StudentCredentialsReportProps) {
    // Portal needs the browser's document, so only render after mount (avoids SSR errors)
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted || students.length === 0) return null;

    // Rendered directly inside <body> so the rest of the app can be hidden with display:none
    // while printing. That removes the blank first page and the extra empty pages.
    return createPortal(
        <div className='print-root-portal'>
            <div className='print-only print-root p-4'>
                <div className='mb-4 text-center'>
                    <h1 className='font-bold text-xl uppercase'>Student Credentials Report</h1>
                    <p className='text-[10px] text-muted-foreground'>Generated on {new Date().toLocaleDateString()}</p>
                </div>

                <table className='w-full border-collapse border border-black text-[11px]'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='w-[5%] border border-black p-1 text-center'>Sl. No</th>
                            <th className='w-[20%] border border-black p-1 text-left'>Student Name</th>
                            <th className='w-[12%] border border-black p-1 text-left'>Adm No</th>
                            <th className='w-[12%] border border-black p-1 text-left'>User Name</th>
                            <th className='w-[13%] border border-black p-1 text-left'>Password</th>
                            <th className='w-[13%] border border-black p-1 text-left'>Class</th>
                            <th className='w-[10%] border border-black p-1 text-left'>Section</th>
                            <th className='w-[15%] border border-black p-1 text-left'>Mobile</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, idx) => (
                            <tr key={student.amsT_Id ?? idx}>
                                <td className='border border-black p-1 text-center'>{idx + 1}</td>
                                <td className='border border-black p-1'>{student.studentname}</td>
                                <td className='border border-black p-1'>{student.amsT_AdmNo}</td>
                                <td className='border border-black p-1'>{student.username}</td>
                                <td className='border border-black p-1'>{student.password}</td>
                                <td className='border border-black p-1'>{student.asmcL_ClassName}</td>
                                <td className='border border-black p-1'>{student.asmC_SectionName}</td>
                                <td className='border border-black p-1'>{student.amsT_MobileNo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className='mt-4 flex justify-between text-[10px]'>
                    <p>Total Records: {students.length}</p>
                    <p>Authorized Signature</p>
                </div>
            </div>

            <style jsx global>{`
                @media screen {
                    .print-only {
                        display: none !important;
                    }
                }

                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }

                    html,
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        height: auto !important;
                        min-height: 0 !important;
                    }

                    /* Remove the whole app from the print layout (no blank pages) */
                    body > *:not(.print-root-portal) {
                        display: none !important;
                    }

                    .print-root-portal,
                    .print-root-portal .print-only {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }

                    .print-root {
                        padding: 0 !important;
                    }

                    /* The table MUST be allowed to break across pages */
                    .print-root table {
                        display: table !important;
                        width: 100% !important;
                        border-collapse: collapse !important;
                        page-break-inside: auto !important;
                        break-inside: auto !important;
                    }
                    .print-root thead {
                        display: table-header-group !important; /* repeat header on every page */
                    }
                    .print-root tbody {
                        display: table-row-group !important;
                    }
                    .print-root tr {
                        display: table-row !important;
                        page-break-inside: avoid !important; /* only rows stay intact */
                        break-inside: avoid !important;
                    }
                    .print-root td,
                    .print-root th {
                        display: table-cell !important;
                        border: 1px solid black !important;
                    }
                    .print-root thead tr {
                        background: #f3f4f6 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>,
        document.body
    );
}
