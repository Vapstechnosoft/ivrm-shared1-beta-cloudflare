'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface BonafiedCertificatePrintProps {
    data: any;
    reportFormat: number;
}

export const BonafiedCertificatePrint = forwardRef<HTMLDivElement, BonafiedCertificatePrintProps>(function BonafiedCertificatePrint(
    { data, reportFormat },
    ref
) {
    const selectedDate = data.selectedDate ? new Date(data.selectedDate) : new Date();
    const dob = data.dob ? new Date(data.dob) : null;

    // Fallback for names and text if data is empty for preview
    const titleGender = data.isFemale ? 'Miss' : 'Master';

    return (
        <div
            ref={ref}
            className='printable-content bg-white text-black'
            style={{ width: '100%', minHeight: '297mm', padding: '0', margin: '0 auto' }}>
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
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                                background: white !important;
                            }
                        }
                    `
                }}
            />

            <div style={{ borderLeft: '5px solid #d5303b', height: '100%', minHeight: '277mm', paddingLeft: '5px' }}>
                <div style={{ borderLeft: '5px solid #e7cb7d', height: '100%', minHeight: '277mm', paddingLeft: '5px' }}>
                    <div style={{ borderLeft: '4px solid #211f21', height: '100%', minHeight: '277mm', paddingLeft: '5px' }}>
                        <div style={{ margin: '30px' }}>
                            <img
                                src='https://calcuttaboy.blob.core.windows.net/files/Logo_Main_Campus.jpg'
                                alt='logo'
                                style={{ objectFit: 'fill', width: '100%', maxHeight: '282px' }}
                            />

                            <div style={{ marginTop: '30px' }}>
                                <h3 style={{ textAlign: 'center', fontFamily: 'Georgia, serif', textDecoration: 'underline' }}>
                                    TO WHOM IT MAY CONCERN
                                </h3>
                            </div>

                            <div style={{ marginTop: '10px' }}>
                                <p style={{ fontFamily: 'Georgia, serif', fontSize: '21px', lineHeight: '40px' }}>
                                    This is to certify that {titleGender} {data.studentname} , {data.sonof} {data.fathername}
                                    {data.isorwas || ' is'} a bonafied student of this school ( Scholar No.:{data.admno}) presently studying
                                    in Class {data.className} Section {data.section}.Roll No.38 . <br />
                                    As per our records {data.hisHer || 'his'} date of birth is {dob ? format(dob, 'dd MMMM yyyy') : ''} .{' '}
                                    <br />
                                    During the Academic Session {data.frommonth1} {data.fromyear} to March {data.toyear}{' '}
                                    {data.gender4?.toLowerCase() || 'he'} was studying in Class {data.className}, Section {data.section}.
                                    <br />
                                </p>

                                <div>
                                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '21px', lineHeight: '40px' }}>
                                        <span style={{ fontFamily: '"Old English Text MT", serif' }}>Calcutta Boys School</span> is
                                        affiliated to the Council for the ISC Examination (School Code: WB010) with ISC curriculum.
                                    </p>
                                </div>

                                <div style={{ marginTop: '60px', textAlign: 'right' }}>
                                    <p style={{ fontFamily: 'Georgia, serif', marginBottom: '0' }}>
                                        <b> (Raja McGee)</b> &emsp;&emsp;
                                    </p>
                                    <p style={{ fontFamily: 'Georgia, serif', margin: '0', lineHeight: '20px' }}>
                                        {' '}
                                        <u>
                                            <b>Principal & Secretary</b>
                                        </u>
                                    </p>
                                </div>

                                <p style={{ fontFamily: 'Georgia, serif', fontSize: '22px', lineHeight: '30px', marginTop: '40px' }}>
                                    Dated:{' '}
                                    <label style={{ fontSize: '20px', borderBottom: 'solid thin' }}>
                                        {format(selectedDate, 'dd MMMM yyyy')}
                                    </label>
                                </p>

                                <div style={{ marginTop: '20px' }}>
                                    <img
                                        src='https://calcuttaboy.blob.core.windows.net/files/Bonafied_Footer_cbs.jpg'
                                        style={{ height: '100px', objectFit: 'contain' }}
                                        alt='footer logo'
                                    />
                                </div>

                                <div
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        marginLeft: 'auto'
                                    }}>
                                    {data.ASCISS_QRCode && (
                                        <img
                                            src={data.ASCISS_QRCode}
                                            className='img-thumbnail img-responsive'
                                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                                            alt='QR Code'
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
