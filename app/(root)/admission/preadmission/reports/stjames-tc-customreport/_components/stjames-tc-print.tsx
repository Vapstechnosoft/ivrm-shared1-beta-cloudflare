'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface StJamesTcPrintProps {
    data: any;
}

export const StJamesTcPrint = forwardRef<HTMLDivElement, StJamesTcPrintProps>(({ data }, ref) => {
    if (!data) return null;

    const formatDate = (date: any) => {
        if (!date) return '';
        try {
            return format(new Date(date), 'dd/MM/yyyy');
        } catch (e) {
            return '';
        }
    };

    return (
        <div ref={ref} className='stjames-tc-print-container printable-content mx-auto min-h-[210mm] w-[297mm] bg-white'>
            <style jsx global>{`
                @media print {
                    .stjames-tc-print-container {
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .table {
                        width: 100%;
                        border: 0px !important;
                        font-weight: 600;
                        text-align: left !important;
                        margin-bottom: 10px;
                        font-size: 16px !important;
                        line-height: 1.2;
                        font-family: 'Times New Roman', Times, serif
                    }

                    .table {
                        border: none;
                    }

                    .border-bottom-dotted {
                        border-bottom: 1px dotted #000 !important;
                        text-align: left !important;
                    }
                    
                    @page {
                        size: A4 landscape;
                        margin: 5mm;
                    }
                }

                .italic {
                    font-size: 18px;
                    font-style: italic;
                    font-family: 'Times New Roman', Times, serif;
                    font-weight: 600;
                }

                .vl {
                    border-left: 2px solid green;
                    height: auto !important;
                }

                .tcCss {
                    display: block;
                    width: 100%;
                    float: left;
                }

                .imgTc img {
                    width: 100%;
                    height: 102px;
                    margin-bottom: 10px;
                }

                .certificateCss {
                    margin-top: 4px;
                }

                table {
                    margin-top: 5px;
                    width: 100%;
                }

                .signature tr > td {
                    float: right;
                }

                .signature {
                    width: 100%;
                }

                .stjamesReportCss {
                    display: block;
                    width: 100%;
                    float: left;
                    background-color: #fff;
                    padding-top: 5px;
                    margin-bottom: 10px;
                    font-size: 15px !important;
                    font-weight: bold !important;
                }

                .borderLeft {
                    padding-right: 10px;
                    width: 33.333%;
                    padding-left: 10px;
                }

                .paddingLeftCss {
                    border-left: #000 dotted;
                    padding-left: 10px;
                    width: 66.666%;
                }

                .borderLeft table {
                    margin-top: 20px;
                }

                .marginPx {
                    margin-top: 0px !important;
                }

                .imgTableCss {
                    margin-top: 5px !important;
                }

                .postionCss {
                    position: relative;
                    bottom: 7px;
                    padding-bottom: 4px;
                }

                .postionCss b {
                    position: relative;
                    top: 7px;
                }

                .margin-top-20 {
                    margin-top: 10px !important;
                }
                
                * {
                    font-family: 'Times New Roman', Times, serif !important;
                }
                
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .border-bottom-dotted { text-align: center !important; }
                .dynamic-line { min-width: 200px; display: inline-block; width: auto; border-bottom: 1px dotted #000; text-align: center; }
                .school-header { text-align: center; width: 100%; margin-bottom: 5px; line-height: 1.2; }
                .school-name { font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
                .school-address { font-size: 14px; font-weight: bold; }
                .boxed-title-container { text-align: center; margin: 10px 0; }
                .boxed-title { border: 1px solid #000; padding: 5px 20px; display: inline-block; font-size: 22px; font-weight: bold; font-family: 'Times New Roman', serif; border-radius: 4px; box-shadow: 2px 2px 0px #000; }
                .w-full { width: 100%; }
                .h-5 { height: 1.25rem; }
            `}</style>

            <div id='Stjames' className='stjamesReportCss' style={{ fontSize: '15px', fontWeight: 'bold' }}>
                <div className='flex w-full flex-row'>
                    {/* LEFT STUB (col-sm-4 borderLeft) */}
                    <div className='borderLeft border-r-0'>
                        <div className='tcCss'>
                            <div>
                                <img src={data.logo} style={{ width: '100%', height: '100%' }} alt='TC Logo' />
                            </div>
                            <table>
                                <tbody>
                                    <tr>
                                        <td className='headerCss' width='60'>
                                            <b>No : </b>
                                        </td>
                                        <td className='text-center'>
                                            <b>{data.tcno}</b>
                                        </td>
                                        <td width='20'></td>
                                        <td className='headerCss' width='244'>
                                            <b>School Roll No : </b>
                                        </td>
                                        <td className='text-center'>
                                            <b>{data.admno}</b>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className='boxed-title-container'>
                                <div className='boxed-title'>Transfer Certificate</div>
                            </div>
                            <table className='certificateCss imgTableCss'>
                                <tbody>
                                    <tr>
                                        <td width='100'>Given to</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.lblstdname}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table>
                                <tbody>
                                    <tr>
                                        <td width='100'>Joined in Class</td>
                                        <td className='h-5 text-center'>
                                            <span className='dynamic-line flex items-end text-sm'>{data.joiningclass}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='130'>On account of</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.lblreasonleaving}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='40'>Left</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{formatDate(data.lbldol)}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='40'>Character</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.lblconduct}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='40'>Fees</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b></b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='200'>Studying in Class</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.laststudiedinwords}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='40'>Promotion</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.lblPromotion?.toUpperCase()}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='160'>Date of Birth</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{formatDate(data.lbldob)}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td className='headerCss' width='100'>
                                            <b>Dated :</b>
                                        </td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{formatDate(data.todaydate)}</b>
                                            </span>
                                        </td>
                                        <td width='50'></td>
                                        <td width='200'>
                                            <b></b>
                                        </td>
                                        <td width='200'>
                                            <b></b>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='signature mt-4'>
                                <tbody>
                                    <tr>
                                        <td></td>
                                        <td className='pr-4 text-right'>
                                            <b>Principal</b>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='150'>Sent to D.D.S.E. on</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.ddse_date}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='300'>Recd. from D.D.S.E. on</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.ddse_recd_date}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT MAIN TC (col-sm-7 paddingLeftCss) */}
                    <div className='paddingLeftCss'>
                        <div className='tcCss'>
                            <div>
                                <img src={data.logo} style={{ width: '76%' }} alt='TC Logo' />
                            </div>
                            <div className='boxed-title-container' style={{ marginTop: '5px' }}>
                                <div className='boxed-title' style={{ fontSize: '32px', padding: '10px 40px' }}>
                                    Transfer Certificate
                                </div>
                            </div>
                            <table>
                                <tbody>
                                    <tr>
                                        <td className='headerCss' width='60'>
                                            <b>No : </b>
                                        </td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.tcno}</b>
                                            </span>
                                        </td>
                                        <td width='400'></td>
                                        <td className='headerCss' width='200'>
                                            <b>School Roll No : </b>
                                        </td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.admno}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss margin-top-20'>
                                <tbody>
                                    <tr>
                                        <td width='220' style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'serif' }}>
                                            This is to certify that {data.gender?.title || 'master'}
                                        </td>
                                        <td className='postionCss text-center'>
                                            <span className='dynamic-line'>
                                                <b className='relative top-[7px]'>{data.lblstdname}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='100'>{data.gender?.sonOf || 'Son of'}</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.lblfathername}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='390'>was admitted into this school on the (date)</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{formatDate(data.lbldoa)}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='220'>on a transfer certificate from</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>{data.previousschoolname}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='250'>and left on the</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{formatDate(data.lbldol)}</b>
                                            </span>
                                        </td>
                                        <td width='100' className='px-1 text-center'>
                                            with a
                                        </td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.lblconduct}</b>
                                            </span>
                                        </td>
                                        <td width='80' className='pl-1'>
                                            character
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='20'></td>
                                        <td width='260'>{data.gender?.heShe || 'He'} was then studying in the (1)</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.laststudiedinwords}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='240'>Class of the (2)</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.streamname || 'ICSE & ISC'}</b>
                                            </span>
                                        </td>
                                        <td width='290' className='pl-1'>
                                            stream, the school year
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='250'>being from (3)</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.frommonth1 || 'MARCH'}</b>
                                            </span>
                                        </td>
                                        <td width='30' className='px-1 text-center'>
                                            to
                                        </td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.tomonth1 || 'FEBRUARY'}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='20'></td>
                                        <td width='160'>All sum due (4)</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.feeconcession}</b>
                                            </span>
                                        </td>
                                        <td width='120' className='pl-1 text-center'>
                                            to this school
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4}>
                                            on {data.gender?.hisHer || 'his'} account have been remitted or satisfactorily arrange for.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss mt-1'>
                                <tbody>
                                    <tr>
                                        <td width='20'></td>
                                        <td width='1000'>
                                            {data.gender?.hisHer
                                                ? data.gender.hisHer.charAt(0).toUpperCase() + data.gender.hisHer.slice(1)
                                                : 'His'}{' '}
                                            date of birth, according to the Admission Register is (in figures)
                                        </td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{formatDate(data.lbldob)}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='80'>(in words)</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.lbldobwords}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td width='140'></td>
                                        <td width='1000' className='text-sm italic'>
                                            (The following additional information must be supplied if the scholar left at the end of the
                                            School year)
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss' style={{ marginTop: '0px' }}>
                                <tbody>
                                    <tr>
                                        <td width='150'></td>
                                        <td width='220'>Promotion has been (5)</td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{data.lblPromotion?.toUpperCase()}</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='certificateCss'>
                                <tbody>
                                    <tr>
                                        <td className='headerCss' width='60'>
                                            Date :
                                        </td>
                                        <td className='text-center'>
                                            <span className='dynamic-line'>
                                                <b>{formatDate(data.todaydate)}</b>
                                            </span>
                                        </td>
                                        <td width='300'></td>
                                        <td width='200'></td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='mt-2 w-full'>
                                <tbody>
                                    <tr>
                                        <td width='300' className='pt-8 text-center'>
                                            <b>School Rubber Stamp</b>
                                        </td>
                                        <td width='300' className='text-center'>
                                            {data.qrcode && (
                                                <div className='flex justify-center'>
                                                    <img
                                                        src={data.qrcode}
                                                        alt='Verification QR Code'
                                                        style={{ width: '70px', height: '70px', marginBottom: '2px' }}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td width='400' className='pt-8 text-center'>
                                            <div className='mb-1 w-full border-black border-t border-dotted'></div>
                                            <b>Head of the School</b>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='mt-1 font-bold text-[11px]'>
                                <tbody>
                                    <tr>
                                        <td>1. To be given in words.</td>
                                    </tr>
                                    <tr>
                                        <td>2. Mention whether ICSE/MADHAYAMIK /Any other examination stream.</td>
                                    </tr>
                                    <tr>
                                        <td>3. Insert month.</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            4. Sums due to the School include payments for which provision was admitted into the school.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>5. Granted / Granted on Trail / Refused.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

StJamesTcPrint.displayName = 'StJamesTcPrint';
