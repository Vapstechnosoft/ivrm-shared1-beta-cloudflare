'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface AlexanderStudyCertPrintProps {
    data: any;
    mode?: '0' | '2';
}

export const AlexanderStudyCertPrint = forwardRef<HTMLDivElement, AlexanderStudyCertPrintProps>(({ data, mode = '0' }, ref) => {
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

    const getFormatType = (student: any) => {
        const presentClass = (student.presentClass || '').toString().toUpperCase();
        // "if they select 9 th then 10th format like i given u two formats"
        if (presentClass.includes('IX') || presentClass.includes('9') || presentClass === 'IX' || presentClass === '9TH') {
            return '10th';
        }
        // "if they select 10th then 11 and 12th format comes"
        return '12th';
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
                    }
                    .dotted-field {
                        border-bottom: 2px dashed #000;
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
                const isFemale = student.gender === 'FEMALE' || student.gender === 'Female' || student.gender === 'F';
                const genderWords = {
                    heShe: isFemale ? 'She' : 'He',
                    hisHer: isFemale ? 'Her' : 'His',
                    sonDaughter: isFemale ? 'daughter' : 'son'
                };

                const formatType = getFormatType(student);
                const is10thFormat = formatType === '10th';

                return (
                    <div key={student.amsT_Id || index} className='page-container'>
                        <div className='relative min-h-[297mm] w-[210mm] p-[20mm] font-serif text-black leading-relaxed'>
                            {/* Header */}
                            <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
                                <h1
                                    style={{
                                        fontSize: '24pt',
                                        fontWeight: 'bold',
                                        margin: '0 0 10px 0',
                                        letterSpacing: '1px',
                                        color: '#1f2937'
                                    }}>
                                    ALEXANDRA SCHOOL AMRITSAR
                                </h1>
                                <p style={{ fontSize: '14pt', margin: '0 0 20px 0', fontWeight: '500' }}>8-QUEEN'S ROAD, AMRITSAR</p>
                                <h2 style={{ fontSize: '16pt', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                    TRANSFER/CHARACTER CERTIFICATE
                                </h2>
                            </div>

                            {/* Date */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px', fontSize: '14pt' }}>
                                <div>
                                    Dated
                                    <span className='dotted-field' style={{ minWidth: '150px' }}>
                                        {formatDate(student.currentDate)}
                                    </span>
                                </div>
                            </div>

                            {/* Body */}
                            <div style={{ fontSize: '14pt', lineHeight: '2.4', textAlign: 'justify' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px' }}>
                                    <span>This is to certify that</span>
                                    <span className='dotted-field' style={{ flexGrow: 1, minWidth: '300px' }}>
                                        {student.studentName}
                                    </span>
                                    <span>{genderWords.sonDaughter} of</span>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px' }}>
                                    <span>Shri</span>
                                    <span className='dotted-field' style={{ flexGrow: 1, minWidth: '250px' }}>
                                        {student.fatherName}
                                    </span>
                                    <span>Unique Id no</span>
                                    <span className='dotted-field' style={{ minWidth: '200px' }}>
                                        {student.admNo}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px' }}>
                                    <span>was a bonafide student of this School since</span>
                                    <span className='dotted-field' style={{ flexGrow: 1, minWidth: '300px' }}>
                                        {student.joinedYearInfo}
                                    </span>
                                </div>

                                {is10thFormat ? (
                                    <>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px' }}>
                                            <span>{genderWords.heShe} has passed in examination of ICSE (Class X) March</span>
                                            <span className='dotted-field' style={{ flexGrow: 1, minWidth: '150px' }}>
                                                {student.presentYearInfo.split('-')[1] || student.presentYearInfo}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px' }}>
                                            <span>
                                                {genderWords.heShe} is allowed to withdraw {genderWords.hisHer.toLowerCase()} name on date
                                            </span>
                                            <span className='dotted-field' style={{ flexGrow: 1, minWidth: '200px' }}>
                                                {formatDate(student.currentDate)}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px' }}>
                                        <span>{genderWords.heShe} has passed in examination of ISC (Class XII) March</span>
                                        <span className='dotted-field' style={{ flexGrow: 1, minWidth: '200px' }}>
                                            {student.presentYearInfo.split('-')[1] || student.presentYearInfo}
                                        </span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px', marginTop: '10px' }}>
                                    <span>{genderWords.hisHer} date of birth as per the School records is</span>
                                    <span className='dotted-field' style={{ flexGrow: 1, minWidth: '250px' }}>
                                        {formatDate(student.dob)}
                                    </span>
                                </div>

                                <div style={{ marginTop: '10px', fontStyle: 'italic' }}>
                                    {genderWords.heShe} bears a good moral character.
                                </div>

                                <div style={{ marginTop: '10px', fontStyle: 'italic' }}>All dues towards the School have been paid.</div>
                            </div>

                            {/* Signatures */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                    marginTop: '100px',
                                    fontSize: '14pt',
                                    fontWeight: 'bold'
                                }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {data.principalsign ? (
                                        <img
                                            src={data.principalsign}
                                            alt='Principal Sign'
                                            style={{ height: '60px', objectFit: 'contain', marginBottom: '10px' }}
                                        />
                                    ) : (
                                        <div style={{ height: '70px' }}></div>
                                    )}
                                    <span>Principal</span>
                                </div>

                                <div>{is10thFormat ? 'Checked by:' : 'Prepared by'}</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

AlexanderStudyCertPrint.displayName = 'AlexanderStudyCertPrint';
