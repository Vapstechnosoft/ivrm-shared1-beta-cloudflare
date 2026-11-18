'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface StThomasTcPrintProps {
    data: any;
}

export const StThomasTcPrint = forwardRef<HTMLDivElement, StThomasTcPrintProps>(({ data }, ref) => {
    if (!data) return null;

    const {
        tcno,
        addno,
        lblstdname,
        lblfathername,
        lblmothername,
        leftdate,
        lblconduct,
        astC_FeePaid,
        laststudied,
        lblPromotion,
        lbldob,
        todaydate,
        lbldoa,
        lbldobwords,
        frommonth1,
        fromyear,
        tomonth1,
        toyear,
        logo,
        leavingreason
    } = data;

    const schoolLogo = 'https://dcampusstrg.blob.core.windows.net/files/17/Trnsportdocuments/7115f492-3955-47e6-97d9-187413d0f3a5.jpg';

    return (
        <div ref={ref} className='stthomas-tc-container bg-white p-4 font-serif text-black'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .stthomas-tc-container, .stthomas-tc-container * {
                        visibility: visible !important;
                    }
                    .stthomas-tc-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: 0px !important;
                        background-color: white !important;
                        display: block !important;
                        font-weight: 600;
                        text-align: left !important;
                        font-family: 'Times New Roman', Times, serif;
                    }
                    .border-bottom-dotted {
                        border-bottom: 1px dotted #000 !important;
                    }
                }
                .stthomas-tc-container {
                    font-family: 'Times New Roman', Times, serif;
                    color: #000;
                }
                .italic-text { font-style: italic; font-weight: bold; }
                .border-bottom-dotted { border-bottom: 1px dotted #000 !important; display: inline-block; padding: 0 5px; }
                .header-section { display: flex; align-items: center; justify-content: center; margin-bottom: 5px; }
                .logo-img { width: 80px; height: 80px; margin-right: 15px; object-fit: contain; }
                .school-details { text-align: center; }
                .school-name { text-transform: uppercase; font-size: 16px; font-weight: bold; }
                .tc-title { text-align: center; text-transform: uppercase; font-size: 18px; margin: 5px 0; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 2px 0; font-weight: bold; color: #1e40af; }
                .double-column { display: flex; justify-content: space-between; gap: 10px; border: 1px solid #000; padding: 8px; min-height: 980px; }
                .left-panel { width: 34%; border-right: 1px dashed #666; padding-right: 10px; position: relative; }
                .right-panel { width: 66%; padding-left: 10px; position: relative; }
                .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; width: 400px; z-index: 0; pointer-events: none; }
                .main-content { position: relative; z-index: 1; }
                .field-row { display: flex; align-items: baseline; margin-bottom: 8px; font-size: 14px; }
                .label-text { white-space: nowrap; }
                .value-dotted { flex-grow: 1; border-bottom: 1px dotted #000; text-align: center; font-weight: bold; }
            `
                }}
            />

            <div className='double-column'>
                {/* Left Panel */}
                <div className='left-panel'>
                    <div className='header-section'>
                        <img src={schoolLogo} className='logo-img' alt='Logo' />
                        <div className='school-details'>
                            <div className='school-name'>ST. THOMAS' CHURCH SCHOOL</div>
                            <div className='font-bold text-sm'>HOWRAH</div>
                            <div className='font-bold text-[10px]'>SCHOOL CODE : WB-079</div>
                        </div>
                    </div>

                    <div className='tc-title'>TRANSFER CERTIFICATE</div>

                    <div className='mb-4 flex justify-between font-bold text-xs'>
                        <div>
                            TC No: <span className='min-w-[40px] border-bottom-dotted'>{tcno || '248'}</span>
                        </div>
                        <div>
                            ID No: <span className='min-w-[60px] border-bottom-dotted'>{addno || '19220'}</span>
                        </div>
                    </div>

                    <div className='mt-4 space-y-3'>
                        <div className='field-row'>
                            <span className='label-text'>Given to</span>
                            <span className='value-dotted italic-text'>{lblstdname}</span>
                        </div>

                        <div className='field-row mt-4'>
                            <span className='value-dotted h-4 border-b'></span>
                        </div>

                        <div className='field-row'>
                            <span className='label-text'>Son/Daughter of</span>
                            <span className='value-dotted italic-text'>{lblfathername}</span>
                        </div>

                        <div className='field-row mt-4'>
                            <span className='value-dotted h-4 border-b'></span>
                        </div>

                        <div className='field-row'>
                            <span className='label-text'>On account of</span>
                            <span className='value-dotted italic-text'>{leavingreason || 'Transfer'}</span>
                        </div>

                        <div className='field-row'>
                            <span className='label-text'>Left</span>
                            <span className='value-dotted'>{leftdate ? format(new Date(leftdate), 'dd/MM/yyyy') : ''}</span>
                        </div>

                        <div className='field-row'>
                            <span className='label-text'>Character</span>
                            <span className='value-dotted'>{lblconduct || 'Good'}</span>
                        </div>

                        <div className='field-row'>
                            <span className='label-text'>Fees</span>
                            <span className='value-dotted'>{astC_FeePaid === 'Yes' ? 'Up-to-date' : astC_FeePaid || 'Up-to-date'}</span>
                        </div>

                        <div className='field-row'>
                            <span className='label-text'>Studying in Class</span>
                            <span className='value-dotted'>{laststudied}</span>
                        </div>

                        <div className='field-row'>
                            <span className='label-text'>Promotion</span>
                            <span className='value-dotted'>{lblPromotion || 'NOT APPLICABLE'}</span>
                        </div>

                        <div className='field-row'>
                            <span className='label-text'>Date of Birth</span>
                            <span className='value-dotted'>{lbldob ? format(new Date(lbldob), 'dd/MM/yyyy') : ''}</span>
                        </div>

                        <div className='field-row'>
                            <span className='label-text'>Dated :</span>
                            <span className='value-dotted'>{todaydate ? format(new Date(todaydate), 'dd/MM/yyyy') : ''}</span>
                        </div>

                        <div className='field-row mt-10'>
                            <span className='label-text'>Prepared By:</span>
                            <span className='value-dotted font-normal text-xs'>enter here</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className='right-panel'>
                    <img src={schoolLogo} className='watermark' alt='Watermark' />

                    <div className='main-content'>
                        <div className='header-section'>
                            <img src={schoolLogo} className='logo-img' alt='Logo' />
                            <div className='school-details'>
                                <div className='font-bold text-[10px]'>ANGLO INDIAN SCHOOLS IN INDIA</div>
                                <div className='school-name text-2xl'>ST. THOMAS' CHURCH SCHOOL</div>
                                <div className='font-bold text-sm'>3, CHURCH ROAD, HOWRAH-1</div>
                                <div className='font-bold text-[10px]'>SCHOOL CODE : WB-079</div>
                            </div>
                        </div>

                        <div className='tc-title'>TRANSFER CERTIFICATE</div>

                        <div className='mt-8 mb-6 flex justify-between font-bold text-sm'>
                            <div>
                                TC No: <span className='min-w-[50px] border-bottom-dotted'>{tcno || '248'}</span>
                            </div>
                            <div className='flex-grow'></div>
                            <div>
                                ID No: <span className='min-w-[80px] border-bottom-dotted'>{addno || '19220'}</span>
                            </div>
                        </div>

                        <div className='space-y-6 text-[15px] leading-relaxed'>
                            <div className='field-row'>
                                <span className='label-text'>This is to certify that</span>
                                <span className='value-dotted italic-text'>{lblstdname}</span>
                            </div>

                            <div className='field-row'>
                                <span className='value-dotted h-4 border-b'></span>
                            </div>

                            <div className='field-row'>
                                <span className='label-text'>Son/Daughter of</span>
                                <span className='value-dotted italic-text'>{lblfathername}</span>
                            </div>

                            <div className='field-row'>
                                <span className='label-text'>was admitted into this school on the (date)</span>
                                <span className='value-dotted'>{lbldoa ? format(new Date(lbldoa), 'dd/MM/yyyy') : '19/02/2018'}</span>
                            </div>

                            <div className='field-row'>
                                <span className='label-text'>on a transfer certificate from</span>
                                <span className='value-dotted font-normal text-xs'>enter here</span>
                            </div>

                            <div className='flex items-baseline'>
                                <span className='label-text'>and left on the</span>
                                <span className='mx-2 w-40 border-bottom-dotted text-center font-bold'>
                                    {leftdate ? format(new Date(leftdate), 'dd/MM/yyyy') : '09/04/2025'}
                                </span>
                                <span className='label-text'>with a</span>
                                <span className='mx-2 flex-grow border-bottom-dotted text-center font-bold'>{lblconduct || 'Good'}</span>
                                <span className='label-text'>character</span>
                            </div>

                            <div className='field-row'>
                                <span className='label-text'>He/She was then studying in Calss</span>
                                <span className='mx-2 flex-grow border-bottom-dotted text-center font-bold'>{laststudied || 'VIII'}</span>
                                <span className='label-text'>enter here</span>
                            </div>

                            <div className='flex items-baseline'>
                                <span className='label-text'>Class of the</span>
                                <span className='mx-2 w-60 border-bottom-dotted text-center font-bold'>ISC</span>
                                <span className='label-text'>stream, the school year</span>
                            </div>

                            <div className='flex items-baseline'>
                                <span className='label-text'>being from</span>
                                <span className='mx-2 flex-grow border-bottom-dotted text-center font-bold'>
                                    APRIL {fromyear || '2025'}
                                </span>
                                <span className='label-text'>to</span>
                                <span className='mx-2 flex-grow border-bottom-dotted text-center font-bold'>MARCH {toyear || '2026'}</span>
                            </div>

                            <div className='flex items-baseline'>
                                <span className='label-text'>All sum due</span>
                                <span className='mx-2 w-32 border-bottom-dotted text-center font-bold'>
                                    {astC_FeePaid === 'Yes' ? 'Up-to-date' : astC_FeePaid || 'Up-to-date'}
                                </span>
                                <span className='label-text flex-grow'>to this school on his/her account have been remitted or</span>
                            </div>

                            <div className='label-text'>satisfactorily arranged for.</div>

                            <div className='flex items-baseline'>
                                <span className='label-text'>
                                    His/Her date of birth, according to the Admission Register is (in figures)
                                </span>
                                <span className='ml-2 flex-grow border-bottom-dotted text-center font-bold'>
                                    {lbldob ? format(new Date(lbldob), 'dd/MM/yyyy') : '09/01/2012'}
                                </span>
                            </div>

                            <div className='flex items-baseline'>
                                <span className='label-text mr-2'>(</span>
                                <span className='flex-grow border-bottom-dotted text-center font-bold italic'>
                                    {lbldobwords || 'NINTH JANUARY TWO THOUSAND TWELVE'}
                                </span>
                                <span className='label-text ml-2'>)</span>
                                <span className='label-text ml-2'>(in words)</span>
                            </div>

                            <div className='pt-2 text-[10px] italic leading-tight'>
                                (The following additional information must be supplied if the scholar left at the end of the School year)
                            </div>

                            <div className='field-row'>
                                <span className='label-text'>Promotion has been</span>
                                <span className='flex-grow border-bottom-dotted text-center font-bold'>
                                    {lblPromotion || 'NOT APPLICABLE'}
                                </span>
                            </div>

                            <div className='flex items-end justify-between pt-12'>
                                <div className='flex items-center'>
                                    <span className='label-text'>Date :</span>
                                    <span className='ml-2 w-40 border-bottom-dotted text-center font-bold'>
                                        {todaydate ? format(new Date(todaydate), 'dd/MM/yyyy') : '23/04/2025'}
                                    </span>
                                </div>
                                <div className='text-center'>
                                    <span className='label-text mr-4'>Signature</span>
                                    <span className='w-60 border-bottom-dotted'></span>
                                </div>
                            </div>

                            <div className='flex justify-end pt-4'>
                                <div className='text-center font-bold text-xs uppercase'>
                                    (PRINCIPAL)
                                    <br />
                                    School Rubber Stamp
                                </div>
                            </div>
                        </div>

                        <div className='mt-10 space-y-0.5 text-[9px] opacity-80'>
                            <div>1. To be given in words.</div>
                            <div>2. Mention whether ICSE/ISC /Any other examination stream.</div>
                            <div>3. Insert month.</div>
                            <div>4. Sums due to the School include payments for which provision was admitted into the school.</div>
                            <div>5. Granted / Granted on Trail / Refused.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

StThomasTcPrint.displayName = 'StThomasTcPrint';
