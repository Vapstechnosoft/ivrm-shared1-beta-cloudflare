import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import React from 'react';
import { dummyPerformanceData, dummyScholasticData } from './mockData';

interface SophiaReportCardIXXViewProps {
    data: any[];
    institution: IMasterInstitution | Institution | null;
}

const SophiaReportCardIXXView = ({ data, institution }: SophiaReportCardIXXViewProps) => {
    const handleExport = () => {};
    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <style>
                {`
            @media print {
                @page { margin: 10mm; }
                body {
                    visibility: hidden;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                #printable-area, #printable-area * {
                    visibility: visible;
                }
                #printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
            }
        `}
            </style>
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
                <Button
                    onClick={handleExport}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <FileSpreadsheet className='h-4 w-4' /> Excel
                </Button>
            </div>

            <div id='printable-area' className='min-w-[1000px] bg-white p-4 font-sans text-[12px] text-black'>
                <div className='mb-1 flex justify-between font-medium'>
                    <div className='flex-1' />
                    <div className='flex-1 text-center font-medium text-[15px] text-gray-800'>First Term Examination</div>
                    <div className='flex-1 text-right text-gray-700'>2025-2026</div>
                </div>

                <div className='mb-6 flex justify-between border border-gray-400 p-2 pr-12 pl-12'>
                    <div className='flex w-1/2 flex-col gap-1'>
                        <div className='flex'>
                            <span className='w-48 font-bold'>Name</span>{' '}
                            <span>
                                : <span className='font-bold'>AANYA E DEV</span>
                            </span>
                        </div>
                        <div className='flex'>
                            <span className='w-48 font-bold'>Class & Division</span>{' '}
                            <span>
                                : <span className='font-bold'>10th Division A</span>
                            </span>
                        </div>
                        <div className='flex'>
                            <span className='w-48 font-bold'>Date of Birth</span>{' '}
                            <span>
                                : <span className='font-bold'>26-Mar-2010</span>
                            </span>
                        </div>
                        <div className='flex'>
                            <span className='w-48 font-bold'>Student House</span>{' '}
                            <span>
                                : <span className='font-bold'>Bennett</span>
                            </span>
                        </div>
                    </div>
                    <div className='flex w-1/2 flex-col items-start gap-1 pl-8'>
                        <div className='flex'>
                            <span className='w-56 font-bold'>Standard Strength</span>{' '}
                            <span>
                                : <span className='font-bold'>199</span>
                            </span>
                        </div>
                        <div className='flex'>
                            <span className='w-56 font-bold'>Division Strength</span>{' '}
                            <span>
                                : <span className='font-bold'>51</span>
                            </span>
                        </div>
                        <div className='flex'>
                            <span className='w-56 font-bold'>Attendance</span>{' '}
                            <span>
                                : <span className='font-bold'>103/111</span>
                            </span>
                        </div>
                        <div className='flex'>
                            <span className='w-56 font-bold'>Attendance %</span>{' '}
                            <span>
                                : <span className='font-bold'>93</span>
                            </span>
                        </div>
                    </div>
                </div>

                <table className='mb-6 w-full border-collapse border border-gray-400 text-center'>
                    <thead>
                        <tr className='border border-gray-400 font-bold'>
                            <td rowSpan={2} className='w-12 border border-gray-400 p-1 text-gray-800'>
                                SL.No
                            </td>
                            <td rowSpan={2} className='w-64 border border-gray-400 p-1 text-center font-bold text-gray-800'>
                                Subjects
                            </td>
                            <td colSpan={3} className='border border-gray-400 p-1 text-center font-bold text-gray-800'>
                                Marks
                            </td>
                            <td colSpan={2} className='border border-gray-400 p-1 text-center font-bold text-gray-800'>
                                Highest
                            </td>
                            <td colSpan={2} className='border border-gray-400 p-1 text-center font-bold text-gray-800'>
                                Average
                            </td>
                            <td colSpan={2} className='border border-gray-400 p-1 text-center font-bold text-gray-800'>
                                Position
                            </td>
                            <td rowSpan={2} className='w-24 border border-gray-400 p-1 text-center font-bold text-gray-800'>
                                Percentile
                            </td>
                            <td rowSpan={2} className='w-32 border border-gray-400 p-1 text-center font-bold text-gray-800'>
                                Remarks
                            </td>
                        </tr>
                        <tr className='border border-gray-400 font-bold'>
                            <td className='w-10 border border-gray-400 p-1 font-bold text-gray-800'>Max</td>
                            <td className='w-10 border border-gray-400 p-1 font-bold text-gray-800'>Min</td>
                            <td className='w-16 border border-gray-400 p-1 font-bold text-gray-800'>Obtained</td>
                            <td className='w-12 border border-gray-400 p-1 font-bold text-gray-800'>Std.</td>
                            <td className='w-12 border border-gray-400 p-1 font-bold text-gray-800'>Div.</td>
                            <td className='w-12 border border-gray-400 p-1 font-bold text-gray-800'>Std.</td>
                            <td className='w-12 border border-gray-400 p-1 font-bold text-gray-800'>Div.</td>
                            <td className='w-12 border border-gray-400 p-1 font-bold text-gray-800'>Std.</td>
                            <td className='w-12 border border-gray-400 p-1 font-bold text-gray-800'>Div.</td>
                        </tr>
                    </thead>
                    <tbody>
                        {dummyScholasticData.map((group, groupIndex) => {
                            const hasMultipleSubjects = group.subjects.length > 1;
                            const isLastGroup = groupIndex === dummyScholasticData.length - 1;

                            return (
                                <React.Fragment key={groupIndex}>
                                    {/* Group Header */}
                                    {hasMultipleSubjects && (
                                        <tr className=''>
                                            <td className='border-gray-400 border-r p-1 pt-2 align-top font-bold text-gray-800'>
                                                {group.id || ''}
                                            </td>
                                            <td className='border-gray-400 border-r p-1 pt-2 pl-2 text-left font-bold text-gray-800'>
                                                {group.groupName}
                                            </td>
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='' />
                                        </tr>
                                    )}

                                    {/* Subjects */}
                                    {group.subjects.map((subj, subjIndex) => (
                                        <tr key={subjIndex} className={isLastGroup ? 'border-gray-400 border-b' : ''}>
                                            {hasMultipleSubjects ? (
                                                <td className='border-gray-400 border-r' />
                                            ) : (
                                                <td
                                                    className={`border-gray-400 border-r p-1 font-bold text-gray-800 ${isLastGroup ? 'pb-2' : ''}`}>
                                                    {group.id || ''}
                                                </td>
                                            )}
                                            <td
                                                className={`${hasMultipleSubjects ? 'p-1 py-0 pl-6 text-left text-gray-600' : 'p-1 pl-2 text-left font-bold text-gray-800'} border-gray-400 border-r ${isLastGroup ? 'pb-2' : ''}`}>
                                                {subj.name}
                                            </td>
                                            <td
                                                className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-gray-400 border-r text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>
                                                {subj.max}
                                            </td>
                                            <td
                                                className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-gray-400 border-r text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>
                                                {subj.min}
                                            </td>
                                            <td
                                                className={`p-1 font-bold ${hasMultipleSubjects ? 'py-0' : ''} border-gray-400 border-r text-gray-800 ${isLastGroup ? 'pb-2' : ''}`}>
                                                {subj.obtained}
                                            </td>
                                            <td
                                                className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-gray-400 border-r text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>
                                                {subj.highStd}
                                            </td>
                                            <td
                                                className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-gray-400 border-r text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>
                                                {subj.highDiv}
                                            </td>
                                            <td
                                                className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-gray-400 border-r text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>
                                                {subj.avgStd}
                                            </td>
                                            <td
                                                className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-gray-400 border-r text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>
                                                {subj.avgDiv}
                                            </td>
                                            <td
                                                className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-gray-400 border-r text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>
                                                {subj.posStd}
                                            </td>
                                            <td
                                                className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-gray-400 border-r text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>
                                                {subj.posDiv}
                                            </td>
                                            <td
                                                className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-gray-400 border-r text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>
                                                {subj.remarks}
                                            </td>
                                            <td className={`${isLastGroup ? 'pb-2' : ''}`} />
                                        </tr>
                                    ))}

                                    {/* Average Row */}
                                    {group.average && (
                                        <tr className=''>
                                            <td className='border-gray-400 border-r p-1 pb-4' />
                                            <td className='border-gray-400 border-r p-1 pr-2 pb-4 text-right font-bold text-gray-800'>
                                                Average
                                            </td>
                                            <td className='border-gray-400 border-r p-1 pb-4 text-gray-600'>{group.average.max}</td>
                                            <td className='border-gray-400 border-r p-1 pb-4 text-gray-600'>{group.average.min}</td>
                                            <td className='border-gray-400 border-r p-1 pb-4 font-bold text-gray-800'>
                                                {group.average.obtained}
                                            </td>
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='border-gray-400 border-r' />
                                            <td className='' />
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}

                        {/* TOTAL */}
                        <tr className='border-gray-400 border-b'>
                            <td colSpan={2} className='border-gray-400 border-r p-2 pr-4 text-right font-bold text-gray-800'>
                                TOTAL
                            </td>
                            <td className='border-gray-400 border-r p-2 text-gray-600'>600</td>
                            <td className='border-gray-400 border-r p-2 text-gray-600'>198</td>
                            <td className='border-gray-400 border-r p-2 font-bold text-gray-800'>344</td>
                            <td colSpan={2} className='border-gray-400 border-r p-2 text-gray-600'>
                                Percentage : 57
                            </td>
                            <td colSpan={2} className='border-gray-400 border-r p-2 text-gray-600'>
                                Std.Position : 112
                            </td>
                            <td colSpan={3} className='border-gray-400 border-r p-2 pl-4 text-left text-gray-600'>
                                Div.Position : 41
                            </td>
                            <td className='' />
                        </tr>
                    </tbody>
                </table>

                {/* Performance Table */}
                <table className='mt-8 mb-0 w-full border-collapse border border-gray-400 text-center'>
                    <thead>
                        <tr className='border border-gray-400 bg-gray-50/20 font-bold text-gray-800'>
                            <td colSpan={13} className='border-gray-400 border-b p-1 font-bold uppercase'>
                                PERFORMANCE OF THE YEAR
                            </td>
                        </tr>
                        <tr className='border-gray-400 border-b bg-white font-bold text-gray-800'>
                            <td className='w-10 border-gray-400 border-r p-1 font-bold text-gray-800'>Sl.No</td>
                            <td className='border-gray-400 border-r p-1 font-bold text-gray-800'>Examination</td>
                            <td className='border-gray-400 border-r p-1 font-bold text-gray-800'>ENGL</td>
                            <td className='border-gray-400 border-r p-1 font-bold text-gray-800'>ELIT</td>
                            <td className='border-gray-400 border-r p-1 font-bold text-gray-800'>PHY</td>
                            <td className='border-gray-400 border-r p-1 font-bold text-gray-800'>CHEM</td>
                            <td className='border-gray-400 border-r p-1 font-bold text-gray-800'>BIO</td>
                            <td className='border-gray-400 border-r p-1 font-bold text-gray-800'>H & C</td>
                            <td className='border-gray-400 border-r p-1 font-bold text-gray-800'>GEO</td>
                            <td className='border-gray-400 border-r p-1 font-bold text-gray-800'>KAN</td>
                            <td className='border-gray-400 border-r p-1 font-bold text-gray-800'>MAT</td>
                            <td className='whitespace-nowrap p-1 font-bold text-gray-800'>Com Appl</td>
                        </tr>
                    </thead>
                    <tbody>
                        {dummyPerformanceData.map((perf, idx) => (
                            <tr key={idx} className={perf.isLast ? '' : 'border-gray-400 border-b'}>
                                <td className={`border-gray-400 border-r p-1 text-gray-600 ${perf.isLast ? 'h-24 pt-2 align-top' : ''}`}>
                                    {perf.id}
                                </td>
                                <td
                                    className={`border-gray-400 border-r p-1 pl-2 text-left text-gray-600 ${perf.isLast ? 'pt-2 align-top' : 'whitespace-nowrap'}`}>
                                    {perf.exam}
                                </td>
                                <td className={`border-gray-400 border-r p-1 text-gray-600 ${perf.isLast ? 'pt-2 align-top' : ''}`}>
                                    {perf.scores.ENGL}
                                </td>
                                <td className={`border-gray-400 border-r p-1 text-gray-600 ${perf.isLast ? 'pt-2 align-top' : ''}`}>
                                    {perf.scores.ELIT}
                                </td>
                                <td className={`border-gray-400 border-r p-1 text-gray-600 ${perf.isLast ? 'pt-2 align-top' : ''}`}>
                                    {perf.scores.PHY}
                                </td>
                                <td className={`border-gray-400 border-r p-1 text-gray-600 ${perf.isLast ? 'pt-2 align-top' : ''}`}>
                                    {perf.scores.CHEM}
                                </td>
                                <td className={`border-gray-400 border-r p-1 text-gray-600 ${perf.isLast ? 'pt-2 align-top' : ''}`}>
                                    {perf.scores.BIO}
                                </td>
                                <td className={`border-gray-400 border-r p-1 text-gray-600 ${perf.isLast ? 'pt-2 align-top' : ''}`}>
                                    {perf.scores['H & C']}
                                </td>
                                <td className={`border-gray-400 border-r p-1 text-gray-600 ${perf.isLast ? 'pt-2 align-top' : ''}`}>
                                    {perf.scores.GEO}
                                </td>
                                <td className={`border-gray-400 border-r p-1 text-gray-600 ${perf.isLast ? 'pt-2 align-top' : ''}`}>
                                    {perf.scores.KAN}
                                </td>
                                <td className={`border-gray-400 border-r p-1 text-gray-600 ${perf.isLast ? 'pt-2 align-top' : ''}`}>
                                    {perf.scores.MAT}
                                </td>
                                <td className={`p-1 text-gray-600 ${perf.isLast ? 'pt-2 align-top' : ''}`}>{perf.scores['Com Appl']}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='mb-16 h-12 border border-gray-400 border-t-0 p-1 pl-2'>
                    <span className='text-gray-600'>Teacher's Remarks : </span>
                    <span className='font-bold text-gray-800'>
                        Good understanding of key concepts—more focus will boost your performance.
                    </span>
                </div>

                {/* Signatures */}
                <div className='flex justify-between px-24 pt-4 pb-8 font-bold text-[12px]'>
                    <p className='text-gray-600'>CLASS TEACHER</p>
                    <p className='text-gray-600'>PRINCIPAL</p>
                    <p className='text-gray-600'>PARENT</p>
                </div>
            </div>
        </div>
    );
};

export default SophiaReportCardIXXView;
