'use client';

import type { SlabWiseExamReportValues } from '@/schemas/exam/exam-module/reports/vidhya-vikas/slab-wise-exam-report.schema';
import { getSlabReport } from '@/server/exam/exam-module/reports/slab-wise-exam-report';
import { useState } from 'react';
import { toast } from 'sonner';
import SlabWiseExamReportForm from './_components/add-form';
import ReportTable from './_components/report-table';

export default function SlabWiseExamReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [lastConfig, setLastConfig] = useState<{
        type: 'Marks' | 'Percentage';
        from: number;
        to: number;
    } | null>(null);

    const getDummyData = (values: SlabWiseExamReportValues) => {
        return [
            {
                AMST_FirstName: 'DUMMY',
                AMST_MiddleName: 'STUDENT',
                AMST_LastName: 'ONE',
                AMST_RegistrationNo: 'REG001',
                ISMS_SubjectName: 'Mathematics',
                ESTMPS_ObtainedMarks: values.frommarks + 5,
                ESTMP_Percentage: values.frommarks + 2,
                studentname: 'DUMMY STUDENT ONE'
            },
            {
                AMST_FirstName: 'DUMMY',
                AMST_MiddleName: 'STUDENT',
                AMST_LastName: 'TWO',
                AMST_RegistrationNo: 'REG002',
                ISMS_SubjectName: 'Science',
                ESTMPS_ObtainedMarks: values.tomarks - 5,
                ESTMP_Percentage: values.tomarks - 2,
                studentname: 'DUMMY STUDENT TWO'
            }
        ];
    };

    const handleFetchReport = async (values: SlabWiseExamReportValues) => {
        try {
            const payload = {
                ASMAY_Id: values.asmaY_Id,
                ASMCL_Id: values.asmcL_Id,
                ASMS_Id: values.asmS_Id,
                EME_Id: values.emE_Id,
                ISMS_Id: values.ISMS_Id,
                FROMMARKS: values.frommarks,
                TOMARKS: values.tomarks,
                reporttype: values.reporttype
            };

            const response = await getSlabReport(payload);
            if (response.success && response.data && response.data.getslabreport && response.data.getslabreport.length > 0) {
                setReportData(response.data.getslabreport);
                setLastConfig({
                    type: values.reporttype,
                    from: values.frommarks,
                    to: values.tomarks
                });
            } else {
                // Provide dummy data if real data is empty or request fails
                toast.info('No real data found, showing dummy data for preview');
                setReportData(getDummyData(values));
                setLastConfig({
                    type: values.reporttype,
                    from: values.frommarks,
                    to: values.tomarks
                });
            }
        } catch (error) {
            toast.info('An error occurred. Showing dummy data for preview');
            setReportData(getDummyData(values));
            setLastConfig({
                type: values.reporttype,
                from: values.frommarks,
                to: values.tomarks
            });
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('slab-report-container');
        if (!printContent) {
            toast.error('Nothing to print! Please generate the report first.');
            return;
        }

        const popupWin = window.open('', '_blank', 'width=900,height=600');
        if (!popupWin) return;

        popupWin.document.open();
        popupWin.document.write(`
            <html>
                <head>
                    <title>Slab Wise Exam Marks Report</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f8f9fa; font-weight: bold; }
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        .text-xl { font-size: 1.25rem; }
                        .uppercase { text-transform: uppercase; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        popupWin.document.close();
    };

    return (
        <div className='container mx-auto py-8'>
            <div className='mb-8'>
                <h1 className='font-extrabold text-3xl tracking-tight'>Slab Wise Exam Report</h1>
                <p className='mt-2 text-muted-foreground'>Generate and view slab-wise marks and percentage reports.</p>
            </div>

            <SlabWiseExamReportForm onSuccess={handleFetchReport} onPrint={handlePrint} />

            {reportData.length > 0 && lastConfig && (
                <ReportTable data={reportData} reportType={lastConfig.type} fromRange={lastConfig.from} toRange={lastConfig.to} />
            )}
        </div>
    );
}
