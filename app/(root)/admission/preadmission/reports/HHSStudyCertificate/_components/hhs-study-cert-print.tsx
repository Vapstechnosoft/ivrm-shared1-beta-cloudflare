'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface HHSStudyCertPrintProps {
    data: any;
    mode?: '0' | '2'; // Optional, if they carry over the RadioGroup
}

export const HHSStudyCertPrint = forwardRef<HTMLDivElement, HHSStudyCertPrintProps>(({ data, mode = '0' }, ref) => {
    if (!data) return null;

    const students = Array.isArray(data.studentList) ? data.studentList : [];
    if (students.length === 0) return null;

    const formatDate = (dateStr: any) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return format(date, 'dd/MM/yyyy');
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div ref={ref} className='print-container bg-white text-black'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { 
                            size: A4 portrait; 
                            margin: 0; 
                        }
                        body { 
                            margin: 0 !important; 
                            padding: 0 !important; 
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important; 
                            background: white !important;
                        }
                        .print-container {
                            visibility: visible !important;
                            display: block !important;
                            width: 210mm !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important;
                            background: white !important;
                        }
                        .page-container {
                            visibility: visible !important;
                            display: block !important;
                            width: 210mm !important;
                            height: 297mm !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            position: relative !important;
                            overflow: hidden !important;
                            background: white !important;
                            page-break-after: always !important;
                        }
                        .print-container * {
                            visibility: visible !important;
                        }
                    }
                    .page-container {
                        width: 210mm;
                        height: 297mm;
                        margin: 0 auto;
                        box-sizing: border-box;
                        background: white;
                        color: black !important;
                        position: relative;
                        border: 1px solid #000;
                    }
                    .dotted-field {
                        border-bottom: 1px dotted #000;
                        display: inline-block;
                        padding: 0 8px;
                        font-weight: normal;
                        color: #1f2937;
                        min-width: 150px;
                        text-align: center;
                    }
                `
                }}
            />

            {students.map((student: any, index: number) => {
                // Photo from API might come as photoPath, student_photo, amsT_Photoname, etc.
                const photoSrc = student.photoPath || student.student_photo || student.amsT_Photoname || student.AMST_Photoname || '';
                const uniqueKey = `${student.amsT_Id || 'std'}-${index}`;

                return (
                    <div key={uniqueKey} className='page-container' style={{ padding: '30mm 20mm' }}>
                        <div className='relative w-full h-full font-serif text-black leading-relaxed'>

                            {/* Header Section with Logo and Photo inline */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                                {/* Logo Banner */}
                                <div style={{ width: '75%', display: 'flex', alignItems: 'center' }}>
                                    {data.mi_logo ? (
                                        <img src={data.mi_logo} style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }} alt="School Logo" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    ) : null}
                                </div>

                                {/* Student Photo */}
                                <div style={{ width: '120px', height: '150px', border: '1px solid #9ca3af', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {photoSrc ? (
                                        <img src={photoSrc} alt="Student Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '10pt', color: '#9ca3af' }}>Photo</span>
                                    )}
                                </div>
                            </div>

                            {/* Titles */}
                            <div style={{ textAlign: 'center', margin: '40px 0' }}>
                                <h2 style={{ fontSize: '18pt', fontWeight: 'bold', marginBottom: '30px' }}>Bonafide Certificate</h2>
                                <h3 style={{ fontSize: '16pt', fontWeight: 'bold' }}>To Whomsoever It May Concern</h3>
                            </div>

                            {/* Body Text */}
                            <div style={{ fontSize: '14pt', lineHeight: '1.8', textAlign: 'justify', padding: '0 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '20px' }}>
                                    <span style={{ whiteSpace: 'nowrap', marginRight: '10px' }}>This is to certify that</span>
                                    <span className='dotted-field' style={{ flexGrow: 1 }}>
                                        {student.studentName}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <span>is/was a bonafide student of this school studying in</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '20px' }}>
                                    <span className='dotted-field' style={{ flexGrow: 1 }}>
                                        {student.presentClass} {student.sectionName ? `- ${student.sectionName}` : ''}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <span>His/Her birth date according to the school Register is</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '20px' }}>
                                    <span className='dotted-field' style={{ flexGrow: 1 }}>
                                        {formatDate(student.dob)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '20px' }}>
                                    <span style={{ whiteSpace: 'nowrap', marginRight: '10px' }}>In words</span>
                                    <span className='dotted-field' style={{ flexGrow: 1 }}>
                                        {student.dobInWords}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '20px' }}>
                                    <span style={{ whiteSpace: 'nowrap', marginRight: '10px' }}>School Academic Year</span>
                                    <span className='dotted-field' style={{ flexGrow: 1 }}>
                                        {student.presentYearInfo}
                                    </span>
                                </div>
                            </div>

                            {/* Footer Signatures */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                    marginTop: '120px',
                                    fontSize: '14pt',
                                    padding: '0 10px'
                                }}>
                                <div>
                                    Date
                                    <span className='dotted-field' style={{ minWidth: '150px', marginLeft: '10px' }}>
                                        {formatDate(student.currentDate)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {data.principalsign ? (
                                        <img
                                            src={data.principalsign}
                                            alt='Principal Sign'
                                            style={{ height: '60px', objectFit: 'contain', marginBottom: '10px' }}
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    ) : (
                                        <div style={{ height: '70px' }}></div>
                                    )}
                                    <span>Principal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

HHSStudyCertPrint.displayName = 'HHSStudyCertPrint';
