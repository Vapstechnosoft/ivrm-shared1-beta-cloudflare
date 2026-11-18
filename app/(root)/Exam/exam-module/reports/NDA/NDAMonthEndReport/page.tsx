'use client';

import React, { useState } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import NDAMonthEndReportForm from './_components/report-form';
import NDAMonthEndReportListView from './_components/report-list';

export default function NDAMonthEndReportPage() {
    const [reportState, setReportState] = useState<{
        reportData: any[];
        selectedYear: string;
        selectedMonth: string;
        selectedExam: string;
        iename: string;
    } | null>(null);

    const handleSuccess = (state: {
        reportData: any[];
        selectedYear: string;
        selectedMonth: string;
        selectedExam: string;
        iename: string;
    }) => {
        setReportState(state);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printSectionId');
        if (printContent) {
            const popupWindow = window.open('', '_blank', 'width=1000,height=1000');
            if (popupWindow) {
                popupWindow.document.open();
                popupWindow.document.write(`
                    <html>
                        <head>
                            <title>NDA Exam Month End Report</title>
                            <style>
                                @page { size: A4; margin: 10mm; }
                                body { font-family: sans-serif; margin: 0; padding: 15px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                                th, td { border: 1px solid #333; padding: 6px 10px; text-align: center; }
                                th { background-color: #f1f5f9; font-weight: bold; }
                                .text-green-600 { color: #16a34a; }
                                .text-destructive { color: #dc2626; }
                            </style>
                        </head>
                        <body onload="window.print(); window.close();">
                            ${printContent.innerHTML}
                        </body>
                    </html>
                `);
                popupWindow.document.close();
            }
        }
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='NDA Exam Month End Report' defaultOpen>
                <NDAMonthEndReportForm
                    onSuccess={handleSuccess}
                    onPrint={reportState?.reportData?.length ? handlePrint : undefined}
                />
            </CollapsibleSection>

            {reportState && reportState.reportData && reportState.reportData.length > 0 && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <NDAMonthEndReportListView
                        data={reportState.reportData}
                        selectedYear={reportState.selectedYear}
                        selectedMonth={reportState.selectedMonth}
                        selectedExam={reportState.selectedExam}
                        iename={reportState.iename}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
