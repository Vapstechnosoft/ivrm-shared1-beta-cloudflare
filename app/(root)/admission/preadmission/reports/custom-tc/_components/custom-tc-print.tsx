'use client';

import { format } from 'date-fns';
import { forwardRef, useEffect, useState } from 'react';

interface CustomTcPrintProps {
    data: any;
}

export const CustomTcPrint = forwardRef<HTMLDivElement, CustomTcPrintProps>(({ data }, ref) => {
    const [editableData, setEditableData] = useState<any>(null);

    useEffect(() => {
        if (data) {
            const casteVal = data.schedulecaste || data.studcaste || data.lblreligioncaste;
            const isScSt = casteVal?.toString().toUpperCase() === 'SC' || casteVal?.toString().toUpperCase() === 'ST';

            setEditableData({
                ...data,
                schedulecaste_display: isScSt ? `Yes, ${casteVal}` : 'No',
                govt_pen_display: `${data.govtno || ''} & ${data.Penno || ''}`
            });
        }
    }, [data]);

    if (!editableData) return null;

    const capitalizeEachWord = (text: string) => {
        if (!text) return '';
        return text
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatDate = (date: any, formatStr = 'dd-MM-yyyy') => {
        if (!date) return '';
        try {
            return format(new Date(date), formatStr);
        } catch (e) {
            return date;
        }
    };

    return (
        <div
            ref={ref}
            className='JSHSTC-container bg-white text-black print:p-0'
            style={{ width: '210mm', minHeight: '297mm', padding: '0' }}>
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
                    }
                    .JSHSTC-container {
                        visibility: visible !important;
                        display: block !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        position: relative !important;
                        left: 0 !important;
                        top: 0 !important;
                    }
                    .JSHSTC-container * {
                        visibility: visible !important;
                    }
                }
                .tc-main-content {
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 10.5pt;
                    padding-left: 15mm;
                    padding-right: 15mm;
                    color: black !important;
                }
                .tc-table {
                    border-collapse: collapse;
                    width: 100%;
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 11.5pt;
                    font-weight: normal;
                }
                .tc-table td {
                    padding: 6px 8px;
                    vertical-align: top;
                    text-align: left;
                    font-weight: normal;
                    color: black !important;
                }
                .tc-table td:nth-child(1) { width: 20px; }
                .tc-table td:nth-child(2) { width: 30px; text-align: right; padding-right: 15px; }
                .tc-table td:nth-child(3) { width: 280px; }
                .tc-table td:nth-child(4) { padding-left: 10px; flex: 1; }
                .tc-table td:nth-child(4)::before { content: ": "; font-weight: bold; margin-right: 4px; }
                .text-bold { font-weight: bold; }
            `
                }}
            />

            <div className='tc-main-content'>
                <div style={{ pageBreakAfter: 'always', marginTop: '245px' }}>
                    <h4 className='mb-6 text-center font-bold text-lg uppercase'>TRANSFER CERTIFICATE</h4>

                    <div className='mb-4 flex items-center justify-between px-2'>
                        <div className='text-left font-bold'>Certificate No. {editableData.tcno}</div>
                        <div className='text-right font-bold'>Date of Issue : {formatDate(new Date())}</div>
                    </div>

                    <hr className='mb-6 border-black' />

                    <table className='tc-table'>
                        <tbody>
                            <tr>
                                <td></td>
                                <td>1</td>
                                <td>Name of Student</td>
                                <td className='font-bold'>{capitalizeEachWord(editableData.lblstdname)}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>2</td>
                                <td>Admission Number</td>
                                <td className='font-bold'>{editableData.admno}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>3</td>
                                <td>Gender</td>
                                <td className='font-bold'>{editableData.amsT_Sex}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>4</td>
                                <td>Mother's Name</td>
                                <td className='font-bold'>{capitalizeEachWord(editableData.lblmothername)}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>5</td>
                                <td>Father's / Guardian's Name</td>
                                <td className='font-bold'>{capitalizeEachWord(editableData.lblfathername)}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>6</td>
                                <td>Nationality</td>
                                <td className='font-bold'>{editableData.lblnationality}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>7</td>
                                <td>Religion</td>
                                <td className='font-bold'>{editableData.lblreligioncaste}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>8</td>
                                <td>Caste</td>
                                <td className='font-bold'>{editableData.studcaste}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>9</td>
                                <td>Mother Tongue</td>
                                <td className='font-bold'>{editableData.Mothertounge}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>10</td>
                                <td>Whether the candidate belongs to Scheduled Caste / Scheduled Tribe</td>
                                <td className='font-bold' contentEditable={true} suppressContentEditableWarning={true}>
                                    {editableData.schedulecaste_display}
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>11</td>
                                <td>Date of birth according to the admission register</td>
                                <td className='font-bold'>
                                    {formatDate(editableData.lbldob)} (in figures) {editableData.lbldobwords} (in words)
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>12</td>
                                <td>Class in which last studied</td>
                                <td className='font-bold'>
                                    {editableData.laststudied} ({editableData.laststudiedinwords})
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>13</td>
                                <td>School / Board Annual examination last taken</td>
                                <td className='font-bold'>{editableData.astC_LastExamDetails || '—'}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>14</td>
                                <td>Whether failed. If so, once/twice in the same class</td>
                                <td className='font-bold'>{editableData.result || 'No'}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>15</td>
                                <td>Subjects Studied</td>
                                <td className='font-bold'>{editableData.subjectstudied}</td>
                            </tr>

                            <tr>
                                <td></td>
                                <td>16</td>
                                <td>Whether qualified for promotion to the higher class</td>
                                <td className='font-bold'>{editableData.promotionflag || 'Yes'}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>17</td>
                                <td>Any fee concession availed of, if so, the nature of concession</td>
                                <td className='font-bold'>{editableData.fee_concesion}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>18</td>
                                <td>Total number of days attended / working</td>
                                <td className='font-bold'>
                                    {editableData.noof_daysattended} / {editableData.noof_schooldays} days
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>19</td>
                                <td>STS.No & PEN No.</td>
                                <td className='font-bold' contentEditable={true} suppressContentEditableWarning={true}>
                                    {editableData.govt_pen_display}
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>20</td>
                                <td>Date of application for certificate</td>
                                <td className='font-bold'>{formatDate(editableData.Applicatiodate)}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>21</td>
                                <td>Reason for leaving the school</td>
                                <td className='font-bold'>{editableData.lblreasonleaving}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>22</td>
                                <td>General conduct</td>
                                <td className='font-bold'>{editableData.lblconduct}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ marginTop: '100px' }} className='text-[12pt] leading-relaxed'>
                        <p>
                            I hereby certify that the entries made in this Transfer Certificate have been made with reference to the
                            Admission Register maintained in our office and that they are true and correct. The school Dise Code is
                            29160505607.
                        </p>
                    </div>

                    <div style={{ marginTop: '100px' }} className='flex items-center justify-between px-4 font-bold text-[12pt]'>
                        <div className='w-48 text-center'>
                            <span className='border-black border-t px-4 pt-1'>Checked by</span>
                        </div>
                        <div className='w-48 text-center'>
                            <span className='border-black border-t px-4 pt-1'>Institution Seal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CustomTcPrint.displayName = 'CustomTcPrint';
