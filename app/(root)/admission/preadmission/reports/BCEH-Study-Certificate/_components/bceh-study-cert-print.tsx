'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface BcehStudyCertPrintProps {
    data: any;
    mode?: '0' | '2'; // 0: Study/Bonafide Certificate, 2: No Objection Certificate
}

export const BcehStudyCertPrint = forwardRef<HTMLDivElement, BcehStudyCertPrintProps>(({ data, mode = '0' }, ref) => {
    if (!data) return null;

    const students = Array.isArray(data.studentList) ? data.studentList : [];
    if (students.length === 0) return null;

    const getRomanToWord = (roman: string) => {
        const map: { [key: string]: string } = {
            I: 'FIRST',
            II: 'SECOND',
            III: 'THIRD',
            IV: 'FOURTH',
            V: 'FIFTH',
            VI: 'SIXTH',
            VII: 'SEVENTH',
            VIII: 'EIGHTH',
            IX: 'NINTH',
            X: 'TENTH'
        };
        return map[roman?.toUpperCase()] || roman;
    };

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
                    }
                    .dotted-field {
                        border-bottom: 2px solid #000;
                        display: inline-block;
                        padding: 0 8px;
                        font-weight: bold;
                        min-width: 100px;
                    }
                `
                }}
            />

            {students.map((student: any, index: number) => {
                const isFemale = student.gender === 'FEMALE' || student.gender === 'Female';
                const genderWords = {
                    heShe: isFemale ? 'She' : 'He',
                    hisHer: isFemale ? 'Her' : 'His',
                    sonDaughter: isFemale ? 'Daughter' : 'Son',
                    soD: isFemale ? 'D/o' : 'S/o',
                    masterMiss: isFemale ? 'Miss' : 'Master'
                };

                if (mode === '2') {
                    /* ── NO OBJECTION CERTIFICATE ── */
                    return (
                        <div key={student.amsT_Id || index} className='page-container'>
                            <div className='relative min-h-[297mm] w-[210mm] p-[20mm] font-serif text-black leading-relaxed'>
                                {/* Title */}
                                <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '40px' }}>
                                    <h2
                                        style={{
                                            fontSize: '16pt',
                                            fontWeight: 'bold',
                                            textDecoration: 'underline',
                                            letterSpacing: '1px',
                                            display: 'inline-block'
                                        }}>
                                        TO WHOM IT MAY CONCERN
                                    </h2>
                                </div>

                                {/* Body */}
                                <div style={{ fontSize: '14pt', lineHeight: '2.2', textAlign: 'justify', marginTop: '20px' }}>
                                    <p>
                                        It is hereby certified that{' '}
                                        <span className='dotted-field'>{student.studentName?.toUpperCase()}</span>,{' '}
                                        <span className='dotted-field'>
                                            {genderWords.soD} {student.fatherName?.toUpperCase()}
                                        </span>{' '}
                                        is a bonafide student of this school studying in Class{' '}
                                        <span className='dotted-field'>{student.presentClass}</span>, Admission No.{' '}
                                        <span className='dotted-field'>{student.admNo}</span>.
                                    </p>

                                    <p style={{ marginTop: '28px' }}>
                                        The School has no objection to {student.studentName} applying for the Schengen Visa for visiting
                                        Norway, Denmark and Finland.
                                    </p>
                                </div>

                                {/* Footer */}
                                <div
                                    style={{
                                        marginTop: '100px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        gap: '8px'
                                    }}>
                                    {data.principalsign && (
                                        <img
                                            src={data.principalsign}
                                            alt='Principal Sign'
                                            style={{ height: '64px', objectFit: 'contain', marginRight: '40px' }}
                                        />
                                    )}
                                    <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '14pt', paddingRight: '16px' }}>
                                        Signature of Head of the School
                                    </div>
                                    <div style={{ marginTop: '24px', fontSize: '14pt' }}>
                                        Dated: <span className='dotted-field'>{formatDate(student.currentDate)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                /* ── STUDY / BONAFIDE CERTIFICATE (default mode='0') ── */
                return (
                    <div key={student.amsT_Id || index} className='page-container'>
                        <div className='relative min-h-[297mm] w-[210mm] p-[20mm] font-serif text-black leading-relaxed'>
                            {/* Title */}
                            <div style={{ textAlign: 'center', marginTop: '80px', marginBottom: '50px' }}>
                                <h2
                                    style={{
                                        fontSize: '24pt',
                                        fontWeight: 'bold',
                                        textDecoration: 'underline',
                                        display: 'inline-block'
                                    }}>
                                    BONAFIDE/STUDY CERTIFICATE
                                </h2>
                            </div>

                            {/* Top Info Row (Admn No + Date) */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    marginBottom: '28px',
                                    fontSize: '13pt'
                                }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                                    <span>ADMN NO.</span>
                                    <span className='dotted-field' style={{ minWidth: '150px', textAlign: 'center' }}>
                                        {student.admNo}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', fontWeight: 'bold' }}>
                                    <span>Date :</span>
                                    <span>{formatDate(student.currentDate)}</span>
                                </div>
                            </div>

                            {/* Body fields */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13pt', lineHeight: '1.8' }}>
                                {/* Student Name */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>This is to certify that</span>
                                    <span className='dotted-field' style={{ flexGrow: 1, textAlign: 'center', textTransform: 'uppercase' }}>
                                        {student.studentName}
                                    </span>
                                </div>

                                {/* Parent Name */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>{genderWords.sonDaughter} of</span>
                                    <span className='dotted-field' style={{ flexGrow: 1, textAlign: 'center' }}>
                                        MR. <span style={{ textTransform: 'uppercase' }}>{student.fatherName}</span> AND MRS.{' '}
                                        <span style={{ textTransform: 'uppercase' }}>{student.motherName}</span>
                                    </span>
                                </div>

                                {/* Class Range */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>Was a bonafide student of this school from</span>
                                    <span
                                        className='dotted-field'
                                        style={{ minWidth: '220px', textAlign: 'center', textTransform: 'uppercase' }}>
                                        STD {student.joinedClass} TO {student.presentClass} [{getRomanToWord(student.presentClass)}]
                                    </span>
                                </div>

                                {/* Year Range */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>of the school year being [Month and year] from</span>
                                    <span
                                        className='dotted-field'
                                        style={{ minWidth: '260px', textAlign: 'center', textTransform: 'uppercase' }}>
                                        {student.joinedYearInfo} TO {student.presentYearInfo}
                                    </span>
                                </div>

                                {/* DOB (figures) */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>{genderWords.hisHer} date of birth, as per our records is (in figures)</span>
                                    <span className='dotted-field' style={{ minWidth: '150px', textAlign: 'center' }}>
                                        {formatDate(student.dob)}
                                    </span>
                                </div>

                                {/* DOB (words) */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>(in words)</span>
                                    <span className='dotted-field' style={{ flexGrow: 1, textAlign: 'center', textTransform: 'uppercase' }}>
                                        {student.dobInWords}
                                    </span>
                                </div>

                                {/* Caste */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>{genderWords.heShe} belongs to</span>
                                    <span
                                        className='dotted-field'
                                        style={{ minWidth: '300px', textAlign: 'center', textTransform: 'uppercase' }}>
                                        {student.casteName}
                                    </span>
                                    <span>Community</span>
                                </div>

                                {/* Mother Tongue */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>{genderWords.hisHer} Mother tongue is</span>
                                    <span
                                        className='dotted-field'
                                        style={{ minWidth: '250px', textAlign: 'center', textTransform: 'uppercase' }}>
                                        {student.motherTongue}
                                    </span>
                                </div>
                            </div>

                            {/* Notice */}
                            <div style={{ fontWeight: 'bold', fontSize: '13pt', marginTop: '32px' }}>
                                THE ABOVE DETAILS ARE AS PER THE ADMISSION REGISTER.
                            </div>

                            {/* Footer signatures */}
                            <div
                                style={{
                                    marginTop: '100px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '8px'
                                }}>
                                {data.principalsign && (
                                    <img
                                        src={data.principalsign}
                                        alt='Principal Sign'
                                        style={{ height: '64px', objectFit: 'contain', marginRight: '40px' }}
                                    />
                                )}
                                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '13pt', paddingRight: '16px' }}>
                                    Signature of Head of the School
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

BcehStudyCertPrint.displayName = 'BcehStudyCertPrint';
