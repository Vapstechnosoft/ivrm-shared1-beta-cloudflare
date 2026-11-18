'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface CbsCertificatePrintProps {
    data: any;
    mode: '0' | '1' | '2'; // 0: Study, 1: Character, 2: No Objection
}

export const CbsCertificatePrint = forwardRef<HTMLDivElement, CbsCertificatePrintProps>(({ data, mode }, ref) => {
    if (!data) return null;

    const students = data.studentList || [];

    return (
        <div ref={ref} className='print-container bg-white text-black'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @font-face {
                        font-family: "Old English Text MT";
                        src: url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.eot");
                        src: url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.eot?#iefix")format("embedded-opentype"), 
                             url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.woff")format("woff"), 
                             url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.woff2")format("woff2"), 
                             url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.ttf")format("truetype"), 
                             url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.svg#Old English Text MT")format("svg");
                        font-weight: normal;
                        font-style: normal;
                        font-display: swap;
                    }
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
                        padding: 15mm;
                        margin: 0 auto;
                        box-sizing: border-box;
                        background: white;
                        color: black !important;
                    }
                    .outer-border {
                        border-left: 5px solid #d5303b !important;
                        height: 98%;
                    }
                    .middle-border {
                        border-left: 5px solid #e7cb7d !important;
                        height: 100%;
                    }
                    .inner-border {
                        border-left: 4px solid #211f21 !important;
                        height: 100%;
                    }
                    .content-wrapper {
                        margin: 30px !important;
                        font-family: 'system-ui', -apple-system, sans-serif !important;
                        display: flex;
                        flex-direction: column;
                        height: 90%;
                    }
                    .certificate-title {
                        font-family: 'system-ui', -apple-system, sans-serif !important;
                        font-size: 20px;
                        font-weight: 600;
                        text-decoration: underline;
                        text-align: center;
                        margin-top: 50px;
                        margin-bottom: 50px;
                    }
                    .cert-text {
                        font-family: 'system-ui', -apple-system, sans-serif !important;
                        font-size: 20px !important;
                        line-height: 1.6;
                        margin-top: 30px;
                    }
                    .underline-text {
                        border-bottom: 1px solid black;
                        display: inline-block;
                        padding: 0 4px;
                    }
                    .signatory-block {
                        margin-top: 20px;
                        text-align: right;
                        width: 95%;
                        font-size: 20px !important;
                    }
                    .georgia-text {
                        font-family: Georgia, serif !important;
                    }
                `
                }}
            />

            {students.map((student: any, index: number) => (
                <div key={student.amsT_Id || index} className='page-container'>
                    <div className='outer-border'>
                        <div className='middle-border'>
                            <div className='inner-border'>
                                <div className='content-wrapper'>
                                    {/* Header Logo */}
                                    <div className='w-full'>
                                        <img
                                            src='https://calcuttaboy.blob.core.windows.net/files/Logo_Main_Campus.jpg'
                                            alt='School Header'
                                            className='w-full object-fill'
                                        />
                                    </div>

                                    {mode === '1' ? (
                                        /* CHARACTER CERTIFICATE REPORT */
                                        <div className='flex flex-grow flex-col'>
                                            <div className='certificate-title'>TO WHOM IT MAY CONCERN</div>

                                            <div className='cert-text'>
                                                Certified that {student.genderLabel || 'Master'}{' '}
                                                <b className='underline-text'>{student.studentname}</b>{' '}
                                                {student.genderLabel === 'Miss' ? 'd/o' : 's/o'}{' '}
                                                <b className='underline-text'>{student.fatherName || student.fathername}</b> was a bonafide
                                                student of this school studying in{' '}
                                                <b className='underline-text'>
                                                    Class {student.className}
                                                    {student.section ? `-${student.section}` : ''}
                                                </b>{' '}
                                                (Scholar ID) UID: <b className='underline-text'>{student.admno}</b>
                                            </div>

                                            <div className='cert-text'>
                                                He/She appeared for and Passed the <b>{student.boardType || 'ICSE'}</b> Examination held in{' '}
                                                <b>March 2024</b> from this School.
                                            </div>

                                            <div className='cert-text'>
                                                To the best of my knowledge his/her conduct and character is{' '}
                                                {student.charType || 'satisfactory'}.
                                            </div>

                                            <div className='cert-text'>I wish him/her all success in the future.</div>

                                            <div className='mt-auto'>
                                                <div className='signatory-block pr-6 pb-4' style={{ lineHeight: '20px' }}>
                                                    <p className='georgia-text mb-1 font-bold text-[20px]'>(Raja McGee)</p>
                                                    <p className='georgia-text font-bold text-[20px] underline'>Principal & Secretary</p>
                                                </div>

                                                <div className='mt-12'>
                                                    <label className='georgia-text border-black border-b font-medium text-[20px]'>
                                                        Dated:{' '}
                                                        {student.date
                                                            ? format(new Date(student.date), 'dd/MMMM/yyyy')
                                                            : format(new Date(), 'dd/MMMM/yyyy')}
                                                    </label>
                                                </div>

                                                <div className='mt-6'>
                                                    <img
                                                        src='https://calcuttaboy.blob.core.windows.net/files/Bonafied_Footer_cbs.jpg'
                                                        alt='Footer'
                                                        className='h-[100px] w-full object-contain'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : mode === '2' ? (
                                        /* NO OBJECTION CERTIFICATE REPORT */
                                        <div className='flex flex-grow flex-col'>
                                            <div className='mt-12 mb-12 text-center'>
                                                <h3 className='georgia-text font-bold text-[22px] uppercase tracking-wide underline'>
                                                    TO WHOM IT MAY CONCERN
                                                </h3>
                                            </div>

                                            <div className='georgia-text mt-4 text-justify text-[20px] leading-[36px]'>
                                                <p>
                                                    It is hereby certified that {student.genderLabel || 'Master'}{' '}
                                                    <b className='underline'>{student.studentname}</b> ,{' '}
                                                    {student.genderLabel === 'Miss' ? 'D/o' : 'S/o'}{' '}
                                                    <b className='underline'>{student.fatherName || student.fathername}</b> is a bonafide
                                                    student of this school studying in Class{' '}
                                                    <b className='underline'>{student.className || student.class}</b> Section{' '}
                                                    <b className='underline'>{student.section}</b>, Roll No. and Scholor No.{' '}
                                                    <b className='underline'>{student.admno}</b> of this school.
                                                    <br />
                                                    <br />
                                                    The School has no objection to {student.studentname} applying for the Schengen Visa for
                                                    visiting Norway, Denmark and Finland from Tuesday, 30th April 2024 to Wednesday 15th May
                                                    2024.
                                                </p>
                                            </div>

                                            <div className='mt-auto'>
                                                <div className='signatory-block pr-6 pb-4' style={{ lineHeight: '20px' }}>
                                                    <p className='georgia-text mb-1 font-bold text-[20px]'>(Raja McGee)</p>
                                                    <p className='georgia-text font-bold text-[20px] underline'>Principal & Secretary</p>
                                                </div>

                                                <div className='mt-12'>
                                                    <p className='georgia-text text-[22px]'>
                                                        Dated:{' '}
                                                        <span className='border-black border-b font-medium'>
                                                            {student.date
                                                                ? format(new Date(student.date), 'dd MMMM yyyy')
                                                                : format(new Date(), 'dd MMMM yyyy')}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className='mt-6'>
                                                    <img
                                                        src='https://calcuttaboy.blob.core.windows.net/files/Bonafied_Footer_cbs.jpg'
                                                        alt='Footer'
                                                        className='h-[100px] w-full object-contain'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* STUDY CERTIFICATE REPORT */
                                        <div className='flex flex-grow flex-col'>
                                            <div className='certificate-title'>STUDY CERTIFICATE</div>

                                            <div className='cert-text'>
                                                Certified that {student.genderLabel || 'Master'}{' '}
                                                <b className='underline-text'>{student.studentname}</b>{' '}
                                                {student.genderLabel === 'Miss' ? 'd/o' : 's/o'}{' '}
                                                <b className='underline-text'>{student.fatherName || student.fathername}</b> is/was a
                                                bonafide student of this school studying in{' '}
                                                <b className='underline-text'>
                                                    {' '}
                                                    {student.className}
                                                    {student.section ? `-${student.section}` : ''}
                                                </b>{' '}
                                                during the academic year <b className='underline-text'>{student.acadamicyear}</b>.
                                            </div>

                                            <div className='cert-text'>
                                                His/Her date of birth as per school records is{' '}
                                                <b>{student.dob ? format(new Date(student.dob), 'dd/MM/yyyy') : '--'}</b> (
                                                {student.dobinwords}).
                                            </div>

                                            <div className='cert-text'>The above information is true to the best of my knowledge.</div>

                                            <div className='mt-auto'>
                                                <div className='signatory-block pr-6 pb-4' style={{ lineHeight: '20px' }}>
                                                    <p className='georgia-text mb-1 font-bold text-[20px]'>(Raja McGee)</p>
                                                    <p className='georgia-text font-bold text-[20px] underline'>Principal & Secretary</p>
                                                </div>

                                                <div className='mt-12'>
                                                    <label className='georgia-text border-black border-b font-medium text-[20px]'>
                                                        Dated:{' '}
                                                        {student.date
                                                            ? format(new Date(student.date), 'dd/MMMM/yyyy')
                                                            : format(new Date(), 'dd/MMMM/yyyy')}
                                                    </label>
                                                </div>

                                                <div className='mt-6'>
                                                    <img
                                                        src='https://calcuttaboy.blob.core.windows.net/files/Bonafied_Footer_cbs.jpg'
                                                        alt='Footer'
                                                        className='h-[100px] w-full object-contain'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

CbsCertificatePrint.displayName = 'CbsCertificatePrint';
