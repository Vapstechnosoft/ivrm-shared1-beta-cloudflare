'use client';

import { format } from 'date-fns';
import React, { Fragment } from 'react';

interface TotalStrengthPrintProps {
    groupedData: Record<string, any[]>;
    totalGrand: number;
    totalBoysGrand?: number;
    totalGirlsGrand?: number;
    academicYearName?: string;
    schoolName?: string;
    schoolAddress?: string;
    schoolPhone?: string;
    logoUrl?: string;
}

export const TotalStrengthPrint = React.forwardRef<HTMLDivElement, TotalStrengthPrintProps>(
    (
        { groupedData, totalGrand, totalBoysGrand, totalGirlsGrand, academicYearName, schoolName, schoolAddress, schoolPhone, logoUrl },
        ref
    ) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        const calculateClassBoysTotal = (key: string) => {
            const items = groupedData[key] || [];
            return items.reduce((sum, item) => sum + (item.boys || 0), 0);
        };

        const calculateClassGirlsTotal = (key: string) => {
            const items = groupedData[key] || [];
            return items.reduce((sum, item) => sum + (item.girls || 0), 0);
        };

        const calculateClassTotal = (key: string) => {
            const items = groupedData[key] || [];
            return items.reduce((sum, item) => sum + (item.totalstudents || 0), 0);
        };

        return (
            <div ref={ref} className='print-preview-container min-h-full w-full bg-white text-black'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 10mm;
                                size: A4 portrait;
                            }
                            body {
                                visibility: hidden;
                                background: white;
                                margin: 0;
                                padding: 0;
                            }
                            .print-preview-container {
                                visibility: visible !important;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                background: white;
                                z-index: 9999;
                                color: black;
                            }
                            .print-preview-container * {
                                visibility: visible !important;
                            }
                            .main-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: none !important;
                            }
                            .data-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: 1px solid #000;
                            }
                            .data-table th, .data-table td {
                                border: 1px solid #000;
                                padding: 6px;
                                text-align: center;
                                font-size: 11px;
                            }
                            .data-table th {
                                background-color: #f3f4f6;
                                font-weight: bold;
                                -webkit-print-color-adjust: exact;
                            }
                            .text-left { text-align: left !important; }
                            .text-right { text-align: right !important; }
                            .header-section {
                                text-align: center;
                                padding-bottom: 10px;
                            }
                            .footer-section {
                                padding-top: 10px;
                                display: flex;
                                justify-content: space-between;
                                font-size: 10px;
                                opacity: 0.7;
                            }
                            .no-border {
                                border: none !important;
                            }
                        }
                    `}
                </style>

                <table className='main-table no-border'>
                    <thead>
                        <tr>
                            <td className='no-border'>
                                {/* Header */}
                                <div className='header-section'>
                                    <div className='mb-4 flex items-center justify-center gap-4'>
                                        {logoUrl && (
                                            <img
                                                src={logoUrl}
                                                alt='Logo'
                                                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                                className='w-full'
                                            />
                                        )}
                                    </div>
                                    <h2 className='inline-block px-4 py-1 font-bold text-md uppercase'>
                                        Total Strength Report {academicYearName ? `FOR ${academicYearName}` : ''}
                                    </h2>
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='no-border'>
                                {/* Table */}
                                <table className='data-table w-full'>
                                    <thead>
                                        <tr className='bg-gray-100 uppercase'>
                                            <th className='w-12'>Sl.No</th>
                                            <th className='text-left'>Class</th>
                                            <th className='text-left'>Section</th>
                                            <th>Boys</th>
                                            <th className='w-24 text-right'>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(groupedData)
                                            .sort(([, aSec], [, bSec]) => (aSec[0]?.ASMCL_Order || 0) - (bSec[0]?.ASMCL_Order || 0))
                                            .map(([groupKey, sections], index) => (
                                                <Fragment key={groupKey}>
                                                    {sections.map((item: any, sectionIndex) => (
                                                        <tr key={`${groupKey}-${item.sectionname}-${sectionIndex}`}>
                                                            <td>{sectionIndex === 0 ? index + 1 : ''}</td>
                                                            <td className='text-left'>{sectionIndex === 0 ? item.classname : ''}</td>
                                                            <td className='text-left'>{item.sectionname}</td>
                                                            <td>{item.boys}</td>
                                                            <td className='text-right'>{item.totalstudents}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className='bg-gray-50 font-bold'>
                                                        <td colSpan={3} className='text-right'>
                                                            Total for {sections[0]?.classname || groupKey}
                                                        </td>
                                                        <td>{calculateClassBoysTotal(groupKey)}</td>
                                                        <td className='text-right'>{calculateClassTotal(groupKey)}</td>
                                                    </tr>
                                                </Fragment>
                                            ))}
                                        <tr className='bg-gray-200 font-bold uppercase'>
                                            <td colSpan={3} className='text-right'>
                                                Grand Total
                                            </td>
                                            <td>{totalBoysGrand ?? ''}</td>
                                            <td className='text-right'>{totalGrand}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
);

TotalStrengthPrint.displayName = 'TotalStrengthPrint';
