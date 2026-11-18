'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    useCBSNoObjectionLoadData,
    useCBSNoObjectionStudDetails,
    useSaveCBSNoObjectionQRCode
} from '@/hooks/admission/preadmission/reports/useCBSNoObjectionCert';
import { Loader2, Printer, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { NoObjectionCertPrint } from './_components/no-objection-cert-print';

export default function CBSNoObjectionCertPage() {
    const [filterData, setFilterData] = useState<any>(null);
    const [reportResult, setReportResult] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    // Initial load data
    const { data: loadDataResponse, isLoading: isLoadDataLoading } = useCBSNoObjectionLoadData(2); // pageId 2 as per legacy
    const loadData = loadDataResponse?.data;

    const studDetailsMutation = useCBSNoObjectionStudDetails();
    const saveQRCodeMutation = useSaveCBSNoObjectionQRCode();

    // Helper to format names as per legacy uppercase() function
    const formatName = (str: string) => {
        if (!str) return '';
        return str
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const handleReport = async (data: any) => {
        setFilterData(data);
        setIsGenerating(true);
        setReportResult(null);

        try {
            const payload = {
                ASMAY_Id: data.asmaY_Id,
                ASMCL_Id: data.allorindi === 'A' ? 0 : data.asmcL_Id || 0,
                ASMS_Id: data.allorindi === 'A' ? 0 : data.asmS_Id || 0,
                AMST_Id: data.amsT_Id,
                save_flag: false
            };

            const response = await studDetailsMutation.mutateAsync(payload);

            if (response?.data?.studentlist && response.data.studentlist.length > 0) {
                const rawStudents = response.data.studentlist;

                // Transform data based on legacy logic
                const transformedStudents = rawStudents.map((stud: any) => {
                    const isFemale = stud.AMST_Sex?.toLowerCase() === 'female';
                    return {
                        ...stud,
                        studentname: formatName(stud.studentnam || stud.amsT_FirstName || ''),
                        fathername: formatName(stud.fatherName || stud.fathername || stud.amsT_FatherName || ''),
                        gender5: isFemale ? 'Miss' : 'Master',
                        date: data.date,
                        milogo:
                            response.data.masterCompany?.[0]?.milogo ||
                            'https://calcuttaboy.blob.core.windows.net/files/Logo_Main_Campus.jpg'
                    };
                });

                setReportResult({
                    studentList: transformedStudents,
                    masterCompany: response.data.masterCompany
                });
            } else {
                toast.error('No records found for the selected criteria');
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('An error occurred while generating the report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `No_Objection_Certificate_${new Date().getTime()}`,
        onAfterPrint: () => {
            // Optional: Auto-save to history after print if needed
            handleSaveToHistory();
        }
    });

    const handleSaveToHistory = async () => {
        if (!reportResult || !reportResult.studentList || !filterData || !printRef.current) return;

        try {
            // Legacy sends the full HTML template. In React we construct it or send a representative one.
            // Following repo pattern of sending a constructed summary HTML.

            for (const student of reportResult.studentList) {
                const htmlTemplate = `
                    <div style="font-family: Georgia, serif; padding: 20px; border: 1px solid #ccc;">
                        <h2 style="text-align: center; text-decoration: underline;">TO WHOM IT MAY CONCERN</h2>
                        <p>It is hereby certified that ${student.gender5} ${student.studentname}, S/o ${student.fathername || ''} 
                           is a bonafide student of this school studying in Class ${student.class || ''} Section ${student.section || ''}, 
                           Roll No. ${student.rollNo || ''} and Scholar No. ${student.admno || ''}.</p>
                        <p>The School has no objection to ${student.studentname} applying for the Schengen Visa...</p>
                        <p>Dated: ${new Date(student.date).toLocaleDateString()}</p>
                    </div>
                `
                    .replace(/\s+/g, ' ')
                    .trim();

                const payload = {
                    ASMAY_Id: filterData.asmaY_Id.toString(),
                    ASMCL_Id: filterData.asmcL_Id || 0,
                    ASMC_Id: filterData.asmS_Id || 0,
                    AMST_Id: student.amsT_Id || student.AMST_Id,
                    AllOrInd: filterData.allorindi || 'I',
                    AMST_SOL: filterData.optradio || 'S',
                    ASCISS_CertificateFlg: 'BC',
                    ASCISS_CertificateNo: `BC${filterData.asmaY_Id}${student.amsT_Id || student.AMST_Id}`,
                    ASCISS_HtmlTemplate: htmlTemplate,
                    ASCISS_PDFFileName: `NOC_${student.studentname.replace(/\s+/g, '_')}.pdf`,
                    ASCISS_QRCode: ''
                };

                await saveQRCodeMutation.mutateAsync(payload);
            }
            toast.success('Certificate history saved successfully');
        } catch (error) {
            console.error('Save to history error:', error);
        }
    };

    const handleReset = () => {
        setFilterData(null);
        setReportResult(null);
    };

    if (isLoadDataLoading) {
        return (
            <div className='flex h-[400px] items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <div className='mx-auto max-w-[1400px] space-y-6 p-6'>
            <Card className='overflow-hidden border-t-4 border-t-primary shadow-lg'>
                <CardHeader className='border-b bg-slate-50 py-4'>
                    <CardTitle className='flex items-center gap-2 font-bold text-primary text-xl'>No Objection Certificate</CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                    <FilterForm initialData={loadData} onSubmit={handleReport} onReset={handleReset} />
                </CardContent>
            </Card>

            {isGenerating && (
                <div className='flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed bg-white/50 py-12'>
                    <Loader2 className='h-10 w-10 animate-spin text-primary' />
                    <p className='animate-pulse font-medium text-muted-foreground'>Fetching Student Details...</p>
                </div>
            )}

            {reportResult && (
                <Card className='fade-in slide-in-from-bottom-4 animate-in overflow-hidden shadow-lg duration-500'>
                    <CardHeader className='flex flex-row items-center justify-between border-b bg-slate-50 py-3'>
                        <CardTitle className='flex items-center gap-2 font-semibold text-lg'>Certificate Preview</CardTitle>
                        <div className='flex gap-3'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleReset}
                                className='border-red-200 text-red-500 hover:bg-red-50'>
                                <XCircle className='mr-2 h-4 w-4' /> Clear
                            </Button>
                            <Button onClick={() => handlePrint()} className='bg-green-600 text-white shadow-sm hover:bg-green-700'>
                                <Printer className='mr-2 h-4 w-4' /> Print Certificate
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='flex max-h-[800px] justify-center overflow-auto bg-slate-200 p-0 py-8'>
                        <div className='mb-8 origin-top scale-95 bg-white shadow-2xl transition-transform duration-300 hover:scale-100'>
                            <NoObjectionCertPrint ref={printRef} data={reportResult} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
