'use client';

import { format } from 'date-fns';
import React, { Fragment, useMemo } from 'react';

interface TotalStrengthPrintProps {
    groupedData: Record<string, any[]>;
    totalGrand: number;
    dynamicElectives?: any[];
    schoolName?: string;
    schoolAddress?: string;
    schoolPhone?: string;
    logoUrl?: string;
    yearString?: string;
}

export const TotalStrengthPrint = React.forwardRef<HTMLDivElement, TotalStrengthPrintProps>(
    ({ groupedData, totalGrand, dynamicElectives = [], schoolName, schoolAddress, schoolPhone, logoUrl, yearString }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        const studentList = useMemo(() => {
            return Object.values(groupedData).flat();
        }, [groupedData]);

        const resolvedDynamicElectives = useMemo(() => {
            if (dynamicElectives && dynamicElectives.length > 0) return dynamicElectives;
            const list = studentList;
            if (list.length > 0) {
                const firstRow = list[0];
                const excludeKeys = [
                    'ASMCL_Id',
                    'asmay_id',
                    'ASMAY_Id',
                    'classname',
                    'sectionname',
                    'boys',
                    'girls',
                    'totalstudents',
                    'newAdmission',
                    'Sl.No',
                    'RowNumber',
                    'AMST_Id',
                    'result',
                    'ASMCL_Order',
                    'ASMC_Order',
                    'asmcL_Order',
                    'asmC_Order',
                    'ASMS_Order'
                ];
                const subjectKeys = Object.keys(firstRow).filter(
                    (k) => !excludeKeys.includes(k) && !excludeKeys.some((ek) => ek.toLowerCase() === k.toLowerCase())
                );
                if (subjectKeys.length > 0) {
                    return subjectKeys.map((k) => ({ ISMS_SubjectName: k }));
                }
            }
            return [];
        }, [studentList, dynamicElectives]);

        console.log('resolvedDynamicElectives', resolvedDynamicElectives);
        const calculateClassTotalByGroup = (groupKey: string, field: string) => {
            const items = groupedData[groupKey] || [];
            return items.reduce((sum: number, item: any) => sum + (item[field] || 0), 0);
        };

        const calculateGrandTotal = (field: string) => {
            let grand = 0;
            Object.values(groupedData).forEach((sections: any[]) => {
                sections.forEach((item: any) => {
                    grand += item[field] || 0;
                });
            });
            return grand;
        };

        return (
            <div ref={ref} className='print-preview-container printable-content min-h-full w-full bg-white text-black'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 5mm;
                                size: A4 landscape;
                            }
                            body {
                                background: white;
                            }
                            .print-preview-container {
                                visibility: visible !important;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                            }
                            table {
                                border-collapse: collapse;
                                width: 100%;
                            }
                            th, td {
                                border: 0.5pt solid black !important;
                                padding: 4px;
                                text-align: center;
                                font-size: 10px;
                            }
                            th {
                                background-color: #f1f1f1 !important;
                                -webkit-print-color-adjust: exact;
                            }
                            .text-left { text-align: left; }
                            .text-right { text-align: right; }
                            .font-bold { font-weight: bold; }
                        }
                    `}
                </style>

                <div className='p-4'>
                    {/* Header */}
                    <div className='mt-2 mb-4 flex items-start gap-6'>
                        {logoUrl && <img src={logoUrl} alt='Logo' className='h-20 w-20 object-contain' />}
                        <div className='flex-1 text-center'>
                            <h1 className='mb-1 font-bold text-2xl uppercase' style={{ color: '#102d7d' }}>
                                {schoolName}
                            </h1>
                            <div className='font-medium text-[12px] text-gray-800 leading-relaxed'>
                                <p className='whitespace-pre-line text-sm'>{schoolAddress}</p>
                                {schoolPhone && <p className='mt-1'>Phone No : {schoolPhone}</p>}
                            </div>
                        </div>
                    </div>

                    <div className='mb-4 text-center'>
                        <h2 className='inline-block border-black border-b px-4 pb-0.5 font-bold text-lg'>
                            Total Strength Report For Year {yearString}
                        </h2>
                    </div>

                    {/* Table */}
                    <table className='w-full'>
                        <thead>
                            <tr className='bg-gray-100 uppercase'>
                                <th style={{ width: '40px' }}>Sl.No</th>
                                <th className='text-left'>Class</th>
                                <th className='text-left'>Section</th>
                                <th style={{ width: '45px' }}>Boys</th>
                                <th style={{ width: '45px' }}>Girls</th>
                                <th className='text-right' style={{ width: '60px' }}>
                                    Total
                                </th>
                                <th style={{ width: '50px' }}>New Admission</th>
                                {resolvedDynamicElectives.map((e: any, i: number) => (
                                    <th key={e.ISMS_Id || (e as any).ismS_Id || i}>{e.ISMS_SubjectName || (e as any).ismS_SubjectName}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedData).map(([groupKey, sections], index) => (
                                <Fragment key={groupKey}>
                                    {sections.map((item: any, sectionIndex) => (
                                        <tr key={`${groupKey}-${sectionIndex}`}>
                                            <td>{sectionIndex + 1}</td>
                                            <td>{item.classname}</td>
                                            <td className='text-left'>{item.sectionname}</td>
                                            <td>{item.boys}</td>
                                            <td>{item.girls}</td>
                                            <td className='text-right font-bold'>{item.totalstudents}</td>
                                            <td>{item.newAdmission || 0}</td>
                                            {resolvedDynamicElectives.map((e: any, i: number) => (
                                                <td key={e.ISMS_Id || (e as any).ismS_Id || i}>
                                                    {item[e.ISMS_SubjectName || (e as any).ismS_SubjectName] || 0}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    <tr className='bg-gray-50 font-bold'>
                                        <td></td>
                                        <td className='text-left'>Total</td>
                                        <td></td>
                                        <td>{calculateClassTotalByGroup(groupKey, 'boys')}</td>
                                        <td>{calculateClassTotalByGroup(groupKey, 'girls')}</td>
                                        <td className='text-right'>{calculateClassTotalByGroup(groupKey, 'totalstudents')}</td>
                                        <td>{calculateClassTotalByGroup(groupKey, 'newAdmission')}</td>
                                        {resolvedDynamicElectives.map((e: any, i: number) => (
                                            <td key={e.ISMS_Id || (e as any).ismS_Id || i}>
                                                {calculateClassTotalByGroup(groupKey, e.ISMS_SubjectName || (e as any).ismS_SubjectName)}
                                            </td>
                                        ))}
                                    </tr>
                                </Fragment>
                            ))}
                            <tr className='bg-gray-200 font-bold uppercase'>
                                <td></td>
                                <td className='text-left font-black'>Grand Total</td>
                                <td></td>
                                <td>{calculateGrandTotal('boys')}</td>
                                <td>{calculateGrandTotal('girls')}</td>
                                <td className='text-right font-black'>{totalGrand}</td>
                                <td>{calculateGrandTotal('newAdmission')}</td>
                                {resolvedDynamicElectives.map((e: any, i: number) => (
                                    <td key={e.ISMS_Id || (e as any).ismS_Id || i}>
                                        {calculateGrandTotal(e.ISMS_SubjectName || (e as any).ismS_SubjectName)}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>

                    <div className='mt-8 flex justify-between text-xs italic opacity-50'>
                        <div>Printed on: {currentDate}</div>
                    </div>
                </div>
            </div>
        );
    }
);

TotalStrengthPrint.displayName = 'TotalStrengthPrint';
