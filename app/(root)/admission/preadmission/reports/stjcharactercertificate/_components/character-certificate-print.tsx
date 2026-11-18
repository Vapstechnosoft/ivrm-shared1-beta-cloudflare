'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface CharacterCertificatePrintProps {
    data: any;
}

export const CharacterCertificatePrint = forwardRef<HTMLDivElement, CharacterCertificatePrintProps>(function CharacterCertificatePrint(
    { data },
    ref
) {
    const getSelectedActivities = () => {
        const selected: string[] = [];
        if (data.staticActivities) {
            Object.entries(data.staticActivities).forEach(([key, value]) => {
                if (value) {
                    selected.push(key.charAt(0).toUpperCase() + key.slice(1));
                }
            });
        }
        return selected;
    };

    const Getclassin = () => {
        const selected: string[] = [];
        if (data.activities) {
            Object.entries(data.activities).forEach(([key, value]) => {
                if (value) {
                    selected.push(key.charAt(0).toUpperCase() + key.slice(1));
                }
            });
        }
        return selected;
    };

    const Gethousein = () => {
        const selected: string[] = [];
        if (data.House) {
            Object.entries(data.House).forEach(([key, value]) => {
                if (value) {
                    selected.push(key.charAt(0).toUpperCase() + key.slice(1));
                }
            });
        }
        return selected;
    };

    const Getschoolin = () => {
        const selected: string[] = [];
        if (data.School) {
            Object.entries(data.School).forEach(([key, value]) => {
                if (value) {
                    selected.push(key.charAt(0).toUpperCase() + key.slice(1));
                }
            });
        }
        return selected;
    };

    const dob = data.dob ? new Date(data.dob) : null;
    const admdate = data.admdate ? new Date(data.admdate) : null;

    return (
        <div
            ref={ref}
            className='printable-content relative min-h-[297mm] w-[210mm] bg-white p-[20mm] font-serif text-[14px] text-black leading-relaxed'>
            <style type='text/css' media='print'>
                {`
                        @page { size: auto; margin: 0; }
                        @media print {
                            .print-line {
                                margin-bottom: 10px;
                                font-family: 'Times New Roman', serif;
                                font-size: 14px;
                                line-height: 1.4;
                                display: flex;
                            }
                            .label {
                                width: 250px;
                                flex-shrink: 0;
                            }
                            .value {
                                flex: 1;
                                white-space: normal;
                                word-break: break-word;
                            }
                        }
                    `}
            </style>
            <div style={{ marginTop: '150px' }}>
                <div style={{ fontFamily: "'Times New Roman', serif", lineHeight: 1.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Name :</span>
                            <span>{data.studentname}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Class :</span>
                            <span>{data.className}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Registration Number :</span>
                            <span>{data.AMST_RegistrationNo}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Date Of Birth :</span>
                            <span>{dob ? format(dob, 'dd.MM.yyyy') : ''}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Date of Admission :</span>
                            <span>{admdate ? format(admdate, 'dd.MM.yyyy') : ''}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Class when Admitted :</span>
                            <span>{data.admitedclass}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Last School Examination :</span>
                            <span>ISC</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Conduct :</span>
                            <span>Good</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>House :</span>
                            <span>{data.SPCCMH_HouseName}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Clubs :</span>
                            {getSelectedActivities().length > 0 && <span>{getSelectedActivities().join(', ')}</span>}
                        </div>
                    </div>

                    {/* Section Title */}
                    <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
                        <strong>Academic Performance (in percentage)</strong>
                    </div>

                    {/* Header Labels */}
                    <div>
                        <div style={{ marginLeft: '30px', marginBottom: '20px', display: 'flex' }}>
                            <span style={{ display: 'inline-block', width: '250px' }}>Year</span>
                            <span style={{ display: 'inline-block', width: '200px' }}>Final Average</span>
                        </div>

                        {/* Row 1 */}
                        <div style={{ marginLeft: '30px', marginBottom: '20px', display: 'flex' }}>
                            <span style={{ display: 'inline-block', width: '250px' }}>{data.Year}</span>
                            <span style={{ display: 'inline-block', width: '200px' }}>{data.Final}</span>
                        </div>

                        {/* Row 2 */}
                        <div style={{ marginLeft: '30px', marginBottom: '40px', display: 'flex' }}>
                            <span style={{ display: 'inline-block', width: '250px' }}>{data.Year1}</span>
                            <span style={{ display: 'inline-block', width: '200px' }}>{data.Final1}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Represented the Class in :</span>
                            {Getclassin().length > 0 && <span>{Getclassin().join(', ')}</span>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', marginBottom: '20px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Represented the House in :</span>
                            {Gethousein().length > 0 && <span>{Gethousein().join(', ')}</span>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', marginBottom: '40px' }}>
                        <div style={{ marginLeft: '30px', width: '100%', display: 'flex' }}>
                            <span style={{ width: '250px' }}>Represented the School in :</span>
                            {Getschoolin().length > 0 && <span>{Getschoolin().join(', ')}</span>}
                        </div>
                    </div>

                    <br />
                    <div className='print-line' style={{ marginLeft: '30px', display: 'flex', marginBottom: '70px' }}>
                        <span
                            className='label'
                            style={{
                                width: '250px',
                                flexShrink: 0,
                                textDecoration: 'underline',
                                textDecorationThickness: '1px',
                                textUnderlineOffset: '3px'
                            }}>
                            <strong>Posts/Achievements:</strong>
                        </span>
                        <span className='value' style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {data.Posts}
                        </span>
                    </div>
                    <br />
                    <br />
                    <div className='print-line' style={{ marginLeft: '30px', display: 'flex', marginBottom: '50px' }}>
                        <span
                            className='label'
                            style={{
                                width: '250px',
                                flexShrink: 0,
                                textDecoration: 'underline',
                                textDecorationThickness: '1px',
                                textUnderlineOffset: '3px'
                            }}>
                            <strong>Principal&apos;s Comments:</strong>
                        </span>
                        <span className='value' style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {data.Principal}
                        </span>
                    </div>
                </div>
                <br />
                <br />
                <br />
                <br />
                <div style={{ marginTop: '40px' }}>
                    <div style={{ marginLeft: '42px' }}>
                        <strong>Dr. T.H. Ireland</strong>
                    </div>
                    <div style={{ marginLeft: '5%' }}>
                        <strong>Principal/Secretary</strong>
                    </div>
                </div>
            </div>
        </div>
    );
});
