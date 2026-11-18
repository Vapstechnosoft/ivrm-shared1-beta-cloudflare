'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { getStudentPrintData } from '@/server/admission/preadmission/transactions/application_form';
import { getDocumentpdf } from '@/server/admission/preadmission/transactions/document-view';
import type { IPreadmissionDocumentView } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

function parseDocumentResponse(res: any): { type: 'pdf' | 'html' | 'url' | 'printData'; content: any } | null {
    if (!res) return null;

    let data = res?.data !== undefined ? res.data : res;

    // Unwrap array from $values or raw array
    if (data && typeof data === 'object' && Array.isArray((data as any).$values)) {
        data = (data as any).$values;
    }

    if (Array.isArray(data) && data.length > 0) {
        data = data[0];
    }

    if (!data) return null;

    // String handling
    if (typeof data === 'string') {
        const trimmed = data.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.endsWith('.pdf')) {
            return { type: 'url', content: trimmed };
        }
        if (trimmed.startsWith('data:application/pdf') || trimmed.startsWith('data:image/')) {
            return { type: 'url', content: trimmed };
        }
        if (trimmed.startsWith('data:text/html')) {
            return { type: 'html', content: trimmed };
        }
        if (
            trimmed.startsWith('<') ||
            trimmed.toLowerCase().includes('<html') ||
            trimmed.toLowerCase().includes('<div') ||
            trimmed.toLowerCase().includes('<table')
        ) {
            return { type: 'html', content: trimmed };
        }
        // Base64 PDF string
        return { type: 'pdf', content: trimmed };
    }

    // Object handling
    if (typeof data === 'object') {
        // Check for HTML content
        const html = data.htmldata || data.htmlData || data.html || data.html_data || data.htmlContent;
        if (html && typeof html === 'string') {
            return { type: 'html', content: html };
        }

        // Check for URL or file path
        const pdfUrl =
            data.pdf_path ||
            data.pdfPath ||
            data.document_download ||
            data.document_Path ||
            data.document_path ||
            data.filepath ||
            data.filePath ||
            data.url ||
            data.file_path;
        if (pdfUrl && typeof pdfUrl === 'string') {
            const trimmedUrl = pdfUrl.trim();
            if (trimmedUrl.startsWith('<')) {
                return { type: 'html', content: trimmedUrl };
            }
            return { type: 'url', content: trimmedUrl };
        }

        // Check for Base64 PDF
        const base64 = data.pdfData || data.base64 || data.pdfBase64 || data.pdfbase64 || data.bytes || data.pdf;
        if (base64 && typeof base64 === 'string') {
            return { type: 'pdf', content: base64 };
        }

        // Check for student print data structure
        if (data.studentReg_DTObj || data.pasR_RegistrationNo || data.pasR_FirstName || data.student_name) {
            const printObj = Array.isArray(data.studentReg_DTObj) ? data.studentReg_DTObj[0] : data.studentReg_DTObj || data;
            return { type: 'printData', content: printObj };
        }
    }

    return null;
}

function getPropValue(obj: any, keys: string[]): string {
    if (!obj || typeof obj !== 'object') return '-';
    // 1. Direct key lookup
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== '' && String(obj[key]).trim() !== 'null') {
            return String(obj[key]).trim();
        }
    }
    // 2. Case-insensitive lookup
    const objKeys = Object.keys(obj);
    for (const key of keys) {
        const lowerKey = key.toLowerCase();
        const foundKey = objKeys.find((k) => k.toLowerCase() === lowerKey);
        if (
            foundKey &&
            obj[foundKey] !== undefined &&
            obj[foundKey] !== null &&
            String(obj[foundKey]).trim() !== '' &&
            String(obj[foundKey]).trim() !== 'null'
        ) {
            return String(obj[foundKey]).trim();
        }
    }
    return '-';
}

function formatDateVal(val: string): string {
    if (!val || val === '-') return '-';
    try {
        if (val.includes('T') || val.includes('-') || val.includes('/')) {
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('en-GB'); // dd/MM/yyyy
            }
        }
    } catch {}
    return val;
}

function resolvePrintData(printObj: any, fullRes: any) {
    if (!printObj || typeof printObj !== 'object') return printObj;
    const merged = { ...printObj };

    const unwrapList = (list: any) => {
        if (!list) return [];
        if (Array.isArray(list)) return list;
        if (typeof list === 'object' && Array.isArray(list.$values)) return list.$values;
        return [];
    };

    // Resolve Religion
    if (
        !getPropValue(merged, ['pasR_Religion', 'religion', 'religionName', 'ivrmmR_ReligionName', 'religion_name']) ||
        getPropValue(merged, ['pasR_Religion', 'religion', 'religionName', 'ivrmmR_ReligionName', 'religion_name']) === '-'
    ) {
        const religionList = unwrapList(fullRes?.religion || fullRes?.religionlist || fullRes?.religionList || fullRes?.religions);
        const relId = merged.ivrmmR_Id || merged.IVRMMR_Id;
        if (relId && religionList.length > 0) {
            const match = religionList.find((r: any) => (r.ivrmmR_Id || r.IVRMMR_Id) === relId);
            if (match) merged.pasR_Religion = match.ivrmmR_ReligionName || match.ivrmmR_Name || match.religionName;
        }
    }

    // Resolve Nationality
    if (
        !getPropValue(merged, ['pasR_Nationality', 'nationality', 'nationalityName', 'ivrmmN_NationalityName', 'nationality_name']) ||
        getPropValue(merged, ['pasR_Nationality', 'nationality', 'nationalityName', 'ivrmmN_NationalityName', 'nationality_name']) === '-'
    ) {
        const natList = unwrapList(fullRes?.nationality || fullRes?.nationalitylist || fullRes?.nationalityList || fullRes?.nationalities);
        const natId = merged.ivrmmN_Id || merged.IVRMMN_Id;
        if (natId && natList.length > 0) {
            const match = natList.find((n: any) => (n.ivrmmN_Id || n.IVRMMN_Id) === natId);
            if (match) merged.pasR_Nationality = match.ivrmmN_NationalityName || match.ivrmmN_Mode || match.nationalityName;
        }
    }

    // Resolve Caste
    if (
        !getPropValue(merged, ['pasR_Caste', 'caste', 'casteName', 'imC_CasteName', 'caste_name']) ||
        getPropValue(merged, ['pasR_Caste', 'caste', 'casteName', 'imC_CasteName', 'caste_name']) === '-'
    ) {
        const casteList = unwrapList(fullRes?.caste || fullRes?.castelist || fullRes?.casteList || fullRes?.castes);
        const casteId = merged.imC_Id || merged.IMC_Id;
        if (casteId && casteList.length > 0) {
            const match = casteList.find((c: any) => (c.imC_Id || c.IMC_Id) === casteId);
            if (match) merged.pasR_Caste = match.imC_CasteName || match.casteName;
        }
    }

    // Resolve Category
    if (
        !getPropValue(merged, ['pasR_Category', 'category', 'categoryName', 'casteCategory', 'imcC_CategoryName', 'category_name']) ||
        getPropValue(merged, ['pasR_Category', 'category', 'categoryName', 'casteCategory', 'imcC_CategoryName', 'category_name']) === '-'
    ) {
        const catList = unwrapList(fullRes?.casteCategory || fullRes?.categorylist || fullRes?.categoryList || fullRes?.categories);
        const catId = merged.imcC_Id || merged.IMCC_Id;
        if (catId && catList.length > 0) {
            const match = catList.find((c: any) => (c.imcC_Id || c.IMCC_Id) === catId);
            if (match) merged.pasR_Category = match.imcC_CategoryName || match.categoryName;
        }
    }

    // Resolve Mother Tongue
    if (
        !getPropValue(merged, ['pasR_MotherTongue', 'motherTongue', 'mother_tongue', 'ivrmmL_LanguageName', 'language_name']) ||
        getPropValue(merged, ['pasR_MotherTongue', 'motherTongue', 'mother_tongue', 'ivrmmL_LanguageName', 'language_name']) === '-'
    ) {
        const langList = unwrapList(fullRes?.motherTongue || fullRes?.motherTonguelist || fullRes?.motherTongueList || fullRes?.languages);
        const langId = merged.ivrmmL_Id || merged.IVRMML_Id;
        if (langId && langList.length > 0) {
            const match = langList.find((l: any) => (l.ivrmmL_Id || l.IVRMML_Id) === langId);
            if (match) merged.pasR_MotherTongue = match.ivrmmL_LanguageName || match.languageName;
        }
    }

    // Resolve Sex / Gender
    if (
        !getPropValue(merged, ['pasR_Sex', 'student_sex', 'sex', 'gender', 'ivrmmG_GenderName', 'genderName']) ||
        getPropValue(merged, ['pasR_Sex', 'student_sex', 'sex', 'gender', 'ivrmmG_GenderName', 'genderName']) === '-'
    ) {
        const genderList = unwrapList(fullRes?.gender || fullRes?.genderlist || fullRes?.genderList || fullRes?.genders);
        const genId = merged.ivrmmG_Id || merged.IVRMMG_Id;
        if (genId && genderList.length > 0) {
            const match = genderList.find((g: any) => (g.ivrmmG_Id || g.IVRMMG_Id) === genId);
            if (match) merged.pasR_Sex = match.ivrmmG_GenderName || match.genderName;
        }
    }

    return merged;
}

export const ApplicationFormCell = ({ pasrId, rowData }: { pasrId: number; rowData: IPreadmissionDocumentView }) => {
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [docType, setDocType] = useState<'pdf' | 'html' | 'url' | 'printData' | null>(null);
    const [docSource, setDocSource] = useState<string | null>(null);
    const [printData, setPrintData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Application_Form_${rowData.pasR_RegistrationNo || pasrId}`
    });

    const handleViewClick = async () => {
        setShowPdfModal(true);
        if (docSource || printData) return;

        setLoading(true);
        try {
            // First attempt: try getDocumentpdf API
            const res = await getDocumentpdf(pasrId);
            const extracted = parseDocumentResponse(res);

            if (extracted && (extracted.type === 'pdf' || extracted.type === 'html' || extracted.type === 'url')) {
                setDocType(extracted.type);
                setDocSource(extracted.content);
                setLoading(false);
                return;
            }

            // If not a direct PDF/HTML file or if it's dynamic application data, ALWAYS fetch full registration print data
            const printRes = await getStudentPrintData(pasrId, rowData.asmcl_id || 0, rowData.asmaY_Id || 0, 0);
            const dtObj =
                printRes?.studentReg_DTObj && Array.isArray(printRes.studentReg_DTObj) && printRes.studentReg_DTObj.length > 0
                    ? printRes.studentReg_DTObj[0]
                    : printRes?.studentReg_DTObj || printRes?.data || printRes || {};

            const merged = {
                ...rowData,
                ...(typeof extracted?.content === 'object' ? extracted.content : {}),
                ...(typeof dtObj === 'object' ? dtObj : {})
            };

            const resolved = resolvePrintData(merged, printRes);

            setDocType('printData');
            setPrintData(resolved);
        } catch (err) {
            console.error('Failed to load application form:', err);
            if (rowData) {
                setDocType('printData');
                setPrintData(rowData);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant='link' className='p-0 text-blue-600 hover:underline' onClick={handleViewClick}>
                <div className='flex items-center gap-1'>
                    <span className='flex items-center gap-1'>
                        <i className='fa fa-eye' /> View Application
                    </span>
                </div>
            </Button>

            {showPdfModal && (
                <Dialog
                    open={showPdfModal}
                    onOpenChange={(open) => {
                        setShowPdfModal(open);
                    }}>
                    <DialogContent
                        className='flex h-[90vh] max-w-5xl flex-col p-0'
                        onInteractOutside={(e) => {
                            e.preventDefault();
                        }}>
                        <DialogHeader className='flex flex-row items-center justify-between border-b px-6 py-4'>
                            <DialogTitle className='font-semibold text-blue-900 text-lg'>
                                Pre Admission Application Form - {rowData.student_name || rowData.pasR_RegistrationNo || ''}
                            </DialogTitle>
                            {docType === 'printData' && printData && (
                                <Button size='sm' onClick={() => handlePrint()} className='mr-6 gap-2'>
                                    <Printer className='h-4 w-4' /> Print Application
                                </Button>
                            )}
                        </DialogHeader>
                        <div className='relative min-h-0 flex-1 overflow-auto bg-slate-50 p-4'>
                            {loading && (
                                <div className='absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm'>
                                    <div className='flex flex-col items-center'>
                                        <Spinner size='lg' className='text-primary' />
                                        <p className='mt-3 font-medium text-gray-700 text-sm'>Loading application form...</p>
                                    </div>
                                </div>
                            )}

                            {!loading && (docType === 'url' || docType === 'pdf') && docSource && (
                                <iframe
                                    src={
                                        docSource.startsWith('data:') || docSource.startsWith('http')
                                            ? docSource
                                            : `data:application/pdf;base64,${docSource}`
                                    }
                                    title='Pre Admission Application Form'
                                    className='h-full w-full rounded-md border-0 bg-white shadow'
                                />
                            )}

                            {!loading && docType === 'html' && docSource && (
                                <iframe
                                    srcDoc={docSource}
                                    title='Pre Admission Application Form'
                                    className='h-full w-full rounded-md border-0 bg-white shadow'
                                />
                            )}

                            {!loading && docType === 'printData' && printData && (
                                <div
                                    ref={printRef}
                                    className='mx-auto min-h-[900px] max-w-4xl border bg-white p-8 font-sans text-slate-800 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none'>
                                    {/* Header Section */}
                                    <div className='flex flex-col items-center border-slate-400 border-b pb-3 text-center'>
                                        <div className='mb-1 flex items-center justify-center gap-4'>
                                            {(printData.logo_path || printData.logoPath || printData.mI_Logo || printData.masterCompany?.[0]?.logo) && (
                                                <div className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-50 p-1'>
                                                    <img
                                                        src={printData.logo_path || printData.logoPath || printData.mI_Logo || printData.masterCompany?.[0]?.logo}
                                                        alt='Logo'
                                                        className='h-full w-full object-contain'
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <h1 className='font-bold text-2xl text-slate-900 uppercase tracking-wide'>
                                                    {printData.mI_Name ||
                                                        printData.institute_name ||
                                                        printData.institution_name ||
                                                        printData.masterCompany?.[0]?.companyname ||
                                                        'STUDENT APPLICATION FORM'}
                                                </h1>
                                                {(printData.mI_Address1 || printData.address) && (
                                                    <p className='text-slate-600 text-xs'>
                                                        {[printData.mI_Address1, printData.mI_Address2, printData.mI_Address3]
                                                            .filter(Boolean)
                                                            .join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* App Registration & Class Header */}
                                    <div className='my-3 flex items-center justify-between border-slate-300 border-b pb-2'>
                                        <div className='font-bold text-base text-slate-900 uppercase'>
                                            {getPropValue(printData, ['pasR_RegistrationNo', 'registrationNo', 'pasR_Registration_No'])} :{' '}
                                            {printData.student_name ||
                                                `${printData.pasR_FirstName || ''} ${printData.pasR_MiddleName || ''} ${printData.pasR_LastName || ''}`.trim() ||
                                                rowData.student_name ||
                                                ''}
                                        </div>
                                        <div className='rounded-sm border border-slate-700 bg-slate-50 px-6 py-1 font-bold text-slate-900 text-sm'>
                                            {getPropValue(printData, ['applied_class_name', 'class_name', 'classname', 'asmcL_ClassName'])}
                                        </div>
                                    </div>

                                    {/* Section Heading */}
                                    <div className='mb-4'>
                                        <h2 className='border-slate-300 border-b pb-1 font-bold text-lg text-slate-700'>
                                            Applicant details
                                        </h2>
                                    </div>

                                    {/* Photos Row */}
                                    <div className='mb-6 flex items-center justify-center gap-10 border-slate-300 border-b pb-6'>
                                        <div className='flex flex-col items-center'>
                                            <div className='mb-2 flex h-32 w-28 items-center justify-center border border-slate-400 bg-slate-50 p-1 shadow-sm'>
                                                {printData.pasR_Student_Pic_Path ||
                                                printData.student_photo ||
                                                printData.pasR_Student_Pic ? (
                                                    <img
                                                        src={
                                                            printData.pasR_Student_Pic_Path ||
                                                            printData.student_photo ||
                                                            printData.pasR_Student_Pic
                                                        }
                                                        alt='Student'
                                                        className='h-full w-full object-cover'
                                                    />
                                                ) : (
                                                    <span className='text-slate-400 text-xs'>Student Photo</span>
                                                )}
                                            </div>
                                            <span className='rounded-sm border border-slate-800 bg-slate-100 px-3 py-0.5 font-semibold text-slate-900 text-xs'>
                                                Student Photo
                                            </span>
                                        </div>

                                        <div className='flex flex-col items-center'>
                                            <div className='mb-2 flex h-32 w-28 items-center justify-center border border-slate-400 bg-slate-50 p-1 shadow-sm'>
                                                {printData.pasR_FatherPhoto || printData.father_photo ? (
                                                    <img
                                                        src={printData.pasR_FatherPhoto || printData.father_photo}
                                                        alt='Father'
                                                        className='h-full w-full object-cover'
                                                    />
                                                ) : (
                                                    <span className='text-slate-400 text-xs'>Father Photo</span>
                                                )}
                                            </div>
                                            <span className='rounded-sm border border-slate-800 bg-slate-100 px-3 py-0.5 font-semibold text-slate-900 text-xs'>
                                                Father Photo
                                            </span>
                                        </div>

                                        <div className='flex flex-col items-center'>
                                            <div className='mb-2 flex h-32 w-28 items-center justify-center border border-slate-400 bg-slate-50 p-1 shadow-sm'>
                                                {printData.pasR_MotherPhoto || printData.mother_photo ? (
                                                    <img
                                                        src={printData.pasR_MotherPhoto || printData.mother_photo}
                                                        alt='Mother'
                                                        className='h-full w-full object-cover'
                                                    />
                                                ) : (
                                                    <span className='text-slate-400 text-xs'>Mother Photo</span>
                                                )}
                                            </div>
                                            <span className='rounded-sm border border-slate-800 bg-slate-100 px-3 py-0.5 font-semibold text-slate-900 text-xs'>
                                                Mother Photo
                                            </span>
                                        </div>
                                    </div>

                                    {/* Applicant Key-Value Table */}
                                    <div className='ml-4 max-w-xl space-y-3.5 font-medium text-slate-800 text-sm'>
                                        <div className='flex items-center'>
                                            <span className='w-48 pr-2 text-right font-bold text-slate-900'>Applicant's Full Name :</span>
                                            <span className='pl-4 font-bold text-slate-900 uppercase'>
                                                {getPropValue(printData, ['student_name', 'pasR_Student_Name', 'pasR_FirstName']) !== '-'
                                                    ? printData.student_name ||
                                                      `${printData.pasR_FirstName || ''} ${printData.pasR_MiddleName || ''} ${printData.pasR_LastName || ''}`.trim()
                                                    : rowData.student_name || '-'}
                                            </span>
                                        </div>
                                        <div className='flex items-center'>
                                            <span className='w-48 pr-2 text-right font-bold text-slate-900'>Date of birth :</span>
                                            <span className='pl-4 text-slate-900'>
                                                {formatDateVal(
                                                    getPropValue(printData, [
                                                        'pasR_DOB',
                                                        'pasR_DateOfBirth',
                                                        'date_of_birth',
                                                        'dob',
                                                        'dateOfBirth',
                                                        'pasr_dob',
                                                        'pasR_Date'
                                                    ])
                                                )}
                                            </span>
                                        </div>
                                        <div className='flex items-center'>
                                            <span className='w-48 pr-2 text-right font-bold text-slate-900'>Sex :</span>
                                            <span className='pl-4 text-slate-900 capitalize'>
                                                {getPropValue(printData, [
                                                    'pasR_Sex',
                                                    'student_sex',
                                                    'sex',
                                                    'gender',
                                                    'ivrmmG_GenderName',
                                                    'genderName',
                                                    'IVRMMG_GenderName'
                                                ])}
                                            </span>
                                        </div>
                                        <div className='flex items-center'>
                                            <span className='w-48 pr-2 text-right font-bold text-slate-900'>Nationality :</span>
                                            <span className='pl-4 text-slate-900'>
                                                {getPropValue(printData, [
                                                    'pasR_Nationality',
                                                    'nationality',
                                                    'nationalityName',
                                                    'ivrmmN_NationalityName',
                                                    'IVRMMN_NationalityName',
                                                    'ivrmmN_Mode',
                                                    'nationality_name'
                                                ])}
                                            </span>
                                        </div>
                                        <div className='flex items-center'>
                                            <span className='w-48 pr-2 text-right font-bold text-slate-900'>Religion :</span>
                                            <span className='pl-4 text-slate-900'>
                                                {getPropValue(printData, [
                                                    'pasR_Religion',
                                                    'religion',
                                                    'religionName',
                                                    'ivrmmR_ReligionName',
                                                    'IVRMMR_ReligionName',
                                                    'ivrmmR_Name',
                                                    'religion_name'
                                                ])}
                                            </span>
                                        </div>
                                        <div className='flex items-center'>
                                            <span className='w-48 pr-2 text-right font-bold text-slate-900'>Caste :</span>
                                            <span className='pl-4 text-slate-900'>
                                                {getPropValue(printData, [
                                                    'pasR_Caste',
                                                    'caste',
                                                    'casteName',
                                                    'imC_CasteName',
                                                    'IMC_CasteName',
                                                    'caste_name'
                                                ])}
                                            </span>
                                        </div>
                                        <div className='flex items-center'>
                                            <span className='w-48 pr-2 text-right font-bold text-slate-900'>Category :</span>
                                            <span className='pl-4 text-slate-900'>
                                                {getPropValue(printData, [
                                                    'pasR_Category',
                                                    'category',
                                                    'categoryName',
                                                    'casteCategory',
                                                    'imcC_CategoryName',
                                                    'IMCC_CategoryName',
                                                    'category_name'
                                                ])}
                                            </span>
                                        </div>
                                        <div className='flex items-center'>
                                            <span className='w-48 pr-2 text-right font-bold text-slate-900'>Mother tongue :</span>
                                            <span className='pl-4 text-slate-900'>
                                                {getPropValue(printData, [
                                                    'pasR_MotherTongue',
                                                    'motherTongue',
                                                    'mother_tongue',
                                                    'ivrmmL_LanguageName',
                                                    'IVRMML_LanguageName',
                                                    'languageName',
                                                    'language_name'
                                                ])}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!loading && !docSource && !printData && (
                                <div className='flex h-full items-center justify-center p-8 text-gray-500 text-sm'>
                                    No document available
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export const DocumentViewColoumn: ColumnDef<IPreadmissionDocumentView>[] = [
    {
        accessorKey: 'pasr_id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'student_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' className='font-bold text-black' />,
        cell: ({ row }) => <div className='text-uppercase'>{row.getValue('student_name')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'pasR_RegistrationNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Registration No' className='font-bold text-black' />,
        cell: ({ row }) => {
            const regNo = row.original.pasR_RegistrationNo ?? 'N.A';
            const date = row.original.pasR_Date;
            const formattedDate = date ? new Date(date).toLocaleDateString('en-GB') : ''; // dd/MM/yyyy
            return (
                <div className='flex flex-col gap-1'>
                    <span>{regNo}</span>
                    {formattedDate && <span className='text-gray-500 text-sm'>{formattedDate}</span>}
                </div>
            );
        },
        enableSorting: true
    },
    {
        accessorKey: 'applied_class_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.original.applied_class_name || row.original.classname || 'N.A'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'application_form',
        header: ({ column }) => (
            <DataTableColumnHeader className='text-nowrap font-bold text-black' column={column} title='Application Form' />
        ),
        cell: ({ row }) => <ApplicationFormCell pasrId={row.original.pasr_id} rowData={row.original} />,
        enableSorting: false
    },
    {
        id: 'view',
        header: ({ column }) => <DataTableColumnHeader column={column} title='View' className='text-center font-bold text-black' />,
        cell: ({ row }) => {
            const data = row.original;
            const studentPhoto =
                data.student_photo || data.pasR_Student_Pic_Path || (data as any).studentPhoto || (data as any).pasr_student_pic_path;
            let fatherPhoto =
                data.pasR_FatherPhoto ||
                (data as any).father_photo ||
                (data as any).fatherPhoto ||
                (data as any).pasr_father_photo ||
                (data as any).pasR_Father_Photo;
            let motherPhoto =
                data.pasR_MotherPhoto ||
                (data as any).mother_photo ||
                (data as any).motherPhoto ||
                (data as any).pasr_mother_photo ||
                (data as any).pasR_Mother_Photo;
            const doclist = data.doclist || [];

            // If not found in primary properties, try to find in doclist by name
            if (!fatherPhoto && doclist.length > 0) {
                fatherPhoto = doclist.find((d: any) => {
                    const name = d.amsmD_DocumentName?.toLowerCase() || '';
                    return name.includes('father photo') || name.includes('father_photo');
                })?.document_Path;
            }
            if (!motherPhoto && doclist.length > 0) {
                motherPhoto = doclist.find((d: any) => {
                    const name = d.amsmD_DocumentName?.toLowerCase() || '';
                    return name.includes('mother photo') || name.includes('mother_photo');
                })?.document_Path;
            }

            // Filter out primary photos from doclist to avoid double-showing them
            const otherDocs = doclist.filter((doc: any) => {
                const path = doc.document_Path;
                if (!path) return false;
                if (path === studentPhoto || path === fatherPhoto || path === motherPhoto) return false;
                const name = doc.amsmD_DocumentName?.toLowerCase() || '';
                if (name.includes('student photo') || name.includes('father photo') || name.includes('mother photo')) return false;
                return true;
            });

            const [selectedDoc, setSelectedDoc] = useState<{ path: string; name: string; type: string } | null>(null);

            const handleViewDoc = (path: string, name: string) => {
                if (!path) return;
                const extension = path.split('.').pop()?.toLowerCase() || '';
                let type = 'other';
                if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) type = 'image';
                else if (extension === 'pdf') type = 'pdf';

                if (type === 'image' || type === 'pdf') {
                    setSelectedDoc({ path, name, type });
                } else {
                    window.open(path, '_blank');
                }
            };

            return (
                <div className='flex flex-col items-start gap-1 py-1'>
                    {studentPhoto && (
                        <Button
                            variant='link'
                            className='h-auto p-0 text-blue-600 hover:text-blue-800 hover:underline'
                            onClick={() => handleViewDoc(studentPhoto, 'Student Photo')}>
                            Student Photo
                        </Button>
                    )}
                    {fatherPhoto && (
                        <Button
                            variant='link'
                            className='h-auto p-0 text-blue-600 hover:text-blue-800 hover:underline'
                            onClick={() => handleViewDoc(fatherPhoto, 'Father Photo')}>
                            Father Photo
                        </Button>
                    )}
                    {motherPhoto && (
                        <Button
                            variant='link'
                            className='h-auto p-0 text-blue-600 hover:text-blue-800 hover:underline'
                            onClick={() => handleViewDoc(motherPhoto, 'Mother Photo')}>
                            Mother Photo
                        </Button>
                    )}
                    {otherDocs.map((doc: any, index: number) => {
                        const path = doc.document_Path;
                        if (!path) return null;
                        const isPdf = path.toLowerCase().endsWith('.pdf');
                        return (
                            <Button
                                key={`view-doc-${index}`}
                                variant='link'
                                className='h-auto p-0 text-blue-600 hover:text-blue-800 hover:underline'
                                onClick={() => handleViewDoc(path, doc.amsmD_DocumentName || 'Document')}>
                                {doc.amsmD_DocumentName || 'Document'}
                                {isPdf && <span className='ml-1 font-bold text-orange-600'>(pdf)</span>}
                            </Button>
                        );
                    })}

                    {selectedDoc && (
                        <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
                            <DialogContent className='flex h-[90vh] max-w-5xl flex-col p-4'>
                                <DialogHeader>
                                    <DialogTitle className='text-center font-bold text-lg'>{selectedDoc.name}</DialogTitle>
                                </DialogHeader>
                                <div className='relative mt-4 flex-1 overflow-hidden rounded-md border bg-gray-50'>
                                    {selectedDoc.type === 'image' ? (
                                        <div className='flex h-full items-center justify-center p-4'>
                                            <img
                                                src={selectedDoc.path}
                                                alt={selectedDoc.name}
                                                className='max-h-full max-w-full object-contain shadow-sm'
                                            />
                                        </div>
                                    ) : (
                                        <iframe src={selectedDoc.path} title={selectedDoc.name} className='h-full w-full border-none' />
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            );
        },
        enableSorting: false
    },
    {
        id: 'download',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Download' className='font-bold text-black' />,
        cell: ({ row }) => {
            const data = row.original;
            const studentPhoto =
                data.student_photo || data.pasR_Student_Pic_Path || (data as any).studentPhoto || (data as any).pasr_student_pic_path;
            let fatherPhoto =
                data.pasR_FatherPhoto ||
                (data as any).father_photo ||
                (data as any).fatherPhoto ||
                (data as any).pasr_father_photo ||
                (data as any).pasR_Father_Photo;
            let motherPhoto =
                data.pasR_MotherPhoto ||
                (data as any).mother_photo ||
                (data as any).motherPhoto ||
                (data as any).pasr_mother_photo ||
                (data as any).pasR_Mother_Photo;
            const doclist = data.doclist || [];

            // If not found in primary properties, try to find in doclist by name
            if (!fatherPhoto && doclist.length > 0) {
                fatherPhoto = doclist.find((d: any) => {
                    const name = d.amsmD_DocumentName?.toLowerCase() || '';
                    return name.includes('father photo') || name.includes('father_photo');
                })?.document_Path;
            }
            if (!motherPhoto && doclist.length > 0) {
                motherPhoto = doclist.find((d: any) => {
                    const name = d.amsmD_DocumentName?.toLowerCase() || '';
                    return name.includes('mother photo') || name.includes('mother_photo');
                })?.document_Path;
            }

            // Filter out primary photos from doclist to avoid double-showing them
            const otherDocs = doclist.filter((doc: any) => {
                const path = doc.document_Path;
                if (!path) return false;
                if (path === studentPhoto || path === fatherPhoto || path === motherPhoto) return false;
                const name = doc.amsmD_DocumentName?.toLowerCase() || '';
                if (name.includes('student photo') || name.includes('father photo') || name.includes('mother photo')) return false;
                return true;
            });

            const [downloading, setDownloading] = useState<string | null>(null);

            const handleDownload = async (url: string, filename: string, id: string) => {
                if (!url) return;
                setDownloading(id);
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = objectUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(objectUrl);
                } catch (error) {
                    console.error('Download failed:', error);
                    window.open(url, '_blank');
                } finally {
                    setDownloading(null);
                }
            };

            return (
                <div className='flex flex-col items-start gap-1 py-1'>
                    {studentPhoto && (
                        <button
                            type='button'
                            className='flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800'
                            onClick={() => handleDownload(studentPhoto, `Student_Photo_${row.original.pasr_id}.jpg`, 'student')}>
                            {downloading === 'student' ? <Spinner size='sm' /> : <Download className='h-4 w-4' />}
                            <span className='text-sm'>Download</span>
                        </button>
                    )}
                    {fatherPhoto && (
                        <button
                            type='button'
                            className='flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800'
                            onClick={() => handleDownload(fatherPhoto, `Father_Photo_${row.original.pasr_id}.jpg`, 'father')}>
                            {downloading === 'father' ? <Spinner size='sm' /> : <Download className='h-4 w-4' />}
                            <span className='text-sm'>Download</span>
                        </button>
                    )}
                    {motherPhoto && (
                        <button
                            type='button'
                            className='flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800'
                            onClick={() => handleDownload(motherPhoto, `Mother_Photo_${row.original.pasr_id}.jpg`, 'mother')}>
                            {downloading === 'mother' ? <Spinner size='sm' /> : <Download className='h-4 w-4' />}
                            <span className='text-sm'>Download</span>
                        </button>
                    )}
                    {otherDocs.map((doc: any, index: number) => {
                        const path = doc.document_Path;
                        if (!path) return null;
                        const ext = path.split('.').pop() || 'file';
                        return (
                            <button
                                key={`download-doc-${index}`}
                                type='button'
                                className='flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800'
                                onClick={() =>
                                    handleDownload(
                                        path,
                                        `${doc.amsmD_DocumentName || 'Document'}_${data.pasr_id || (data as any).pasR_Id}.${ext}`,
                                        `doc-${index}`
                                    )
                                }>
                                {downloading === `doc-${index}` ? <Spinner size='sm' /> : <Download className='h-4 w-4' />}
                                <span className='text-sm'>Download {doc.amsmD_DocumentName}</span>
                            </button>
                        );
                    })}
                </div>
            );
        },
        enableSorting: false
    }
];
