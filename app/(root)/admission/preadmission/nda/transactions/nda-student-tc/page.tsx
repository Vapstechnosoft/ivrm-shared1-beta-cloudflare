'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    ndaStudentTcKeys,
    useNdaStudentTcApprovalStatus,
    useNdaStudentTcInitialData,
    useNdaStudentTcPdf,
    useNdaStudentTcSave,
    useNdaStudentTcSearch
} from '@/hooks/admission/preadmission/useNdaStudentTc';
import { useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, GraduationCap, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { NdaStudentTcList } from './_components/NdaStudentTcList';
import { NdaStudentTcPrintModal } from './_components/NdaStudentTcPrintModal';
import { NdaStudentTcSearch } from './_components/NdaStudentTcSearch';
import { NdaStudentTcStatusModal } from './_components/NdaStudentTcStatusModal';
import { NdaStudentTcSummary } from './_components/NdaStudentTcSummary';

export default function NdaStudentTcPage() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useState<any>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Modal states
    const [printModal, setPrintModal] = useState({ isOpen: false, data: null });
    const [statusModal, setStatusModal] = useState({ isOpen: false, list: [] });

    // Data fetching
    const { data: initialData, isLoading: isInitialLoading } = useNdaStudentTcInitialData();
    const searchMutation = useNdaStudentTcSearch();
    const saveMutation = useNdaStudentTcSave();
    const pdfMutation = useNdaStudentTcPdf();
    const statusMutation = useNdaStudentTcApprovalStatus();

    const handleSearch = async (formData: any) => {
        try {
            setSearchParams(formData);
            const res = (await searchMutation.mutateAsync({
                ASMAY_Id: Number(formData.academic_year),
                ASMCL_Id: Number(formData.classname),
                ASMS_Id: Number(formData.sectionname)
            })) as any;

            // API returns flat array (or nested under $values)
            const studentList = Array.isArray(res) ? res : (res?.$values ?? res?.ndastudentlistsearch ?? []);

            if (studentList.length > 0) {
                // Map lowercase API keys to PascalCase keys expected by NdaStudentTcList
                // and initialize all TC application fields with defaults
                const mapped = studentList.map((s: any) => ({
                    AMST_Id: s.amst_id ?? s.AMST_Id,
                    StudentName: s.studentname ?? s.StudentName,
                    AMST_AdmNo: s.amst_admno ?? s.AMST_AdmNo,
                    ASMCL_ClassName: s.asmcl_classname ?? s.ASMCL_ClassName,
                    ASMC_SectionName: s.asmc_sectionname ?? s.ASMC_SectionName,
                    ASMAY_Id: s.asmay_id ?? s.ASMAY_Id,
                    ASMS_Id: s.asms_id ?? s.ASMS_Id,
                    ASMCL_Id: s.asmcl_id ?? s.ASMCL_Id,
                    // TC Fields initialization
                    astc_Remarks: '',
                    astc_LeavingReason: '',
                    astc_SubjectsStudied: '',
                    astc_MediumOfINStruction: 'English',
                    astc_LanguageStudied: '',
                    astc_ElectivesStudied: '',
                    astc_Scholarship: 'No',
                    astc_MedicallyExam: 'Fit',
                    astc_NCCDetails: 'N/A',
                    astc_ExtraActivities: '',
                    astc_Conduct: 'Good',
                    astc_FeePaid: 0,
                    astc_FeeConcession: 'No',
                    astc_LastExamDetails: '',
                    astc_Result: '',
                    astc_ResultDetails: '',
                    astc_Qual_Class: '',
                    astc_Qual_PromotionFlag: 'No',
                    astc_WorkingDays: 0,
                    astc_AttendedDays: 0,
                    astc_TemporaryFlag: 0
                }));
                setSearchResults(mapped);
                setShowResults(true);
                toast.success(`Found ${mapped.length} students`);
            } else {
                setSearchResults([]);
                setShowResults(false);
                toast.error('No students found for this criteria');
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to fetch student list');
        }
    };

    const handleSave = async (selectedStudents: any[]) => {
        try {
            const transNumConfig = (initialData as any)?.admTransNumSetting?.find((config: any) => config.imN_Flag === 'tcno');

            const payload = {
                studentTCdata: selectedStudents.map((s: any) => ({
                    amst_Id: s.AMST_Id,
                    asmay_Id: s.ASMAY_Id,
                    asmcl_Id: s.ASMCL_Id,
                    asms_Id: s.ASMS_Id,
                    astc_Remarks: s.astc_Remarks,
                    astc_TCApplicationDate: s.ASTC_TCApplicationDate,
                    astc_TCDate: s.ASTC_TCDate,
                    astc_LeavingReason: s.astc_LeavingReason,
                    astc_SubjectsStudied: s.astc_SubjectsStudied,
                    astc_MediumOfINStruction: s.astc_MediumOfINStruction,
                    astc_LanguageStudied: s.astc_LanguageStudied,
                    astc_ElectivesStudied: s.astc_ElectivesStudied,
                    astc_Scholarship: s.astc_Scholarship,
                    astc_MedicallyExam: s.astc_MedicallyExam,
                    astc_NCCDetails: s.astc_NCCDetails,
                    astc_ExtraActivities: s.astc_ExtraActivities,
                    astc_Conduct: s.astc_Conduct,
                    astc_FeePaid: String(s.astc_FeePaid || 0),
                    astc_FeeConcession: s.astc_FeeConcession,
                    astc_LastExamDetails: s.astc_LastExamDetails,
                    astc_Result: s.astc_Result,
                    astc_ResultDetails: s.astc_ResultDetails,
                    astc_Qual_Class: s.astc_Qual_Class,
                    astc_Qual_PromotionFlag: s.astc_Qual_PromotionFlag,
                    astc_WorkingDays: Number(s.astc_WorkingDays || 0),
                    astc_AttendedDays: Number(s.astc_AttendedDays || 0),
                    astc_TemporaryFlag: Number(s.astc_TemporaryFlag || 0)
                })),
                tcflagexists: '',
                transnumconfigsettings: {
                    mI_Id: transNumConfig?.mI_Id ?? 0,
                    imN_AutoManualFlag: transNumConfig?.imN_AutoManualFlag ?? 'Auto',
                    imN_StartingNo: transNumConfig?.imN_StartingNo ?? '1',
                    imN_WidthNumeric: transNumConfig?.imN_WidthNumeric ?? '5',
                    imN_ZeroPrefixFlag: transNumConfig?.imN_ZeroPrefixFlag ?? 'true',
                    imN_PrefixAcadYearCode: transNumConfig?.imN_PrefixAcadYearCode ?? false,
                    imN_SuffixAcadYearCode: transNumConfig?.imN_SuffixAcadYearCode ?? false
                }
            };

            const res = (await saveMutation.mutateAsync(payload)) as any;

            if (res?.success || res?.returnval) {
                toast.success(res?.message || 'TC applications submitted successfully');
                setShowResults(false);
                setSearchResults([]);
                // Refresh summary list
                queryClient.invalidateQueries({ queryKey: ndaStudentTcKeys.all });
            } else {
                toast.error(res?.message || 'Failed to submit applications');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Error occurred while saving');
        }
    };

    const handleViewPdf = async (student: any) => {
        try {
            setPrintModal({ isOpen: true, data: null });
            const amstId = student.AMST_Id ?? student.amst_id;
            const asmayId = student.ASMAY_Id ?? student.asmay_id;
            const res = (await pdfMutation.mutateAsync({ AMST_Id: amstId, ASMAY_Id: asmayId })) as any;

            let tcList: any[] = [];
            if (Array.isArray(res)) {
                tcList = res;
            } else if (res?.data && Array.isArray(res.data)) {
                tcList = res.data;
            } else if (res?.data?.$values && Array.isArray(res.data.$values)) {
                tcList = res.data.$values;
            } else if (res?.$values && Array.isArray(res.$values)) {
                tcList = res.$values;
            } else if (res?.studenttcpdf && Array.isArray(res.studenttcpdf)) {
                tcList = res.studenttcpdf;
            } else if (res?.studenttcpdf?.$values && Array.isArray(res.studenttcpdf.$values)) {
                tcList = res.studenttcpdf.$values;
            }

            if (tcList && tcList.length > 0) {
                const tcData = tcList[0] as any;
                // Map to expected fields for NdaTcPrint, handling both lowercase and PascalCase from API
                const mappedData = {
                    ...tcData,
                    lblstdname: tcData.studentname || tcData.StudentName,
                    lblfathername: tcData.amst_fathername || tcData.amsT_FatherName,
                    lblmothername: tcData.amst_mothername || tcData.amsT_MotherName,
                    lblreligioncaste: tcData.religion || tcData.Religion,
                    studcaste: tcData.caste || tcData.Caste,
                    lblnationality: tcData.nationality || tcData.Nationality,
                    lbldob: tcData.amst_dob || tcData.amsT_DOB,
                    lbldoa: tcData.amst_date || tcData.amsT_Date,
                    lbllastschool: tcData.astc_lastschoolattended || tcData.astc_LastSchoolAttended || 'N/A',
                    lblconduct: tcData.astc_conduct || tcData.astC_Conduct || 'Good',
                    last_date_attended: tcData.tcdatess || tcData.tcDate || tcData.astC_TCDate,
                    Last_Class_Studied: tcData.last_class_studied || tcData.Last_Class_Studied,
                    asmC_SectionName: tcData.asmc_sectionname || tcData.asmC_SectionName,
                    ASTC_Remarks: tcData.astc_remarks || tcData.astC_Remarks,
                    govtno: tcData.govtno || tcData.GovtNo || 'N/A',
                    AMST_PENNo: tcData.amst_pen_no || tcData.AMST_PENNo || 'N/A',
                    tcno: tcData.astc_tcno || tcData.astC_TCNO,
                    admno: tcData.amst_admno || tcData.amsT_AdmNo,
                    AMST_APAAANO: tcData.amst_apaar_no || tcData.amst_aadharno || tcData.AMST_APAAANO || 'N/A',
                    institutionname: tcData.institutionname || tcData.mI_Name,
                    logo: tcData.logo || tcData.mI_Logo
                };

                setPrintModal({ isOpen: true, data: mappedData });
            } else {
                toast.error(res?.message || 'No PDF data found');
                setPrintModal({ isOpen: false, data: null });
            }
        } catch (error) {
            console.error('PDF error:', error);
            toast.error('Failed to load TC document');
            setPrintModal({ isOpen: false, data: null });
        }
    };

    const handleViewStatus = async (student: any) => {
        try {
            setStatusModal({ isOpen: true, list: [] });
            const res = (await statusMutation.mutateAsync({
                AMST_Id: student.AMST_Id ?? student.amst_id,
                ASMAY_Id: student.ASMAY_Id ?? student.asmay_id
            })) as any;
            if (res?.studentapprovedpendingdetails) {
                setStatusModal({ isOpen: true, list: res.studentapprovedpendingdetails as never[] });
            } else {
                toast.error('No status details found');
                setStatusModal({ isOpen: false, list: [] });
            }
        } catch (error) {
            console.error('Status error:', error);
            toast.error('Failed to fetch approval status');
            setStatusModal({ isOpen: false, list: [] });
        }
    };

    const handleReset = () => {
        setShowResults(false);
        setSearchResults([]);
    };

    if (isInitialLoading) {
        return (
            <div className='flex h-screen w-full flex-col items-center justify-center gap-6 bg-slate-50'>
                <div className='relative'>
                    <Loader2 className='h-20 w-20 animate-spin text-indigo-600' />
                    <GraduationCap className='-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-8 w-8 text-indigo-400' />
                </div>
                <div className='text-center'>
                    <h2 className='font-black text-2xl text-slate-800 tracking-tight'>INITIALIZING TC SYSTEM</h2>
                    <p className='mt-2 font-bold text-slate-400 text-xs uppercase tracking-[0.3em]'>
                        Loading academic records & configurations
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='fade-in container mx-auto animate-in space-y-10 p-4 duration-1000 md:p-8'>
            {/* Header Section */}
            <div className='flex flex-col items-start justify-between gap-4 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-indigo-100/20 shadow-xl md:flex-row md:items-center'>
                <div className='flex items-center gap-6'>
                    <div className='flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-2xl shadow-indigo-200'>
                        <ClipboardCheck className='h-10 w-10' />
                    </div>
                    <div>
                        <h1 className='font-black text-4xl text-indigo-950 tracking-tighter'>STUDENT TC APPLY</h1>
                        <p className='mt-1 font-bold text-[10px] text-indigo-500 uppercase tracking-widest'>
                            Transaction Portal • Notre Dame Academy
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <CollapsibleSection
                title='Application Filter'
                description='Select criteria to search students for TC request'
                defaultOpen={true}
                className='overflow-hidden rounded-[2.5rem] border-none bg-white/70 shadow-2xl ring-1 ring-slate-100 backdrop-blur-xl'>
                <div className='p-6'>
                    <NdaStudentTcSearch
                        academicList={(initialData as any)?.academicList || []}
                        classList={(initialData as any)?.classlist || []}
                        onSubmit={handleSearch}
                        onReset={handleReset}
                        isLoading={searchMutation.isPending}
                    />
                </div>
            </CollapsibleSection>

            {/* Results Section */}
            {showResults && (
                <CollapsibleSection
                    title='Student Selection Grid'
                    description={`Showing ${searchResults.length} eligible students`}
                    defaultOpen={true}
                    className='overflow-hidden rounded-[2.5rem] border-none bg-white/70 shadow-2xl ring-1 ring-slate-100 backdrop-blur-xl'>
                    <div className='p-6'>
                        <NdaStudentTcList students={searchResults} onSave={handleSave} isSaving={saveMutation.isPending} />
                    </div>
                </CollapsibleSection>
            )}

            {/* Summary Section */}
            <Card className='overflow-hidden rounded-[2.5rem] border-none bg-white/70 shadow-2xl ring-1 ring-slate-100 backdrop-blur-xl'>
                <CardContent className='p-10'>
                    <NdaStudentTcSummary
                        summaryList={(initialData as any)?.studenttcapprovedlist || []}
                        onViewPdf={handleViewPdf}
                        onViewStatus={handleViewStatus}
                    />
                </CardContent>
            </Card>

            {/* Modals */}
            <NdaStudentTcPrintModal
                isOpen={printModal.isOpen}
                onClose={() => setPrintModal({ isOpen: false, data: null })}
                data={printModal.data}
                isLoading={pdfMutation.isPending}
            />

            <NdaStudentTcStatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ isOpen: false, list: [] })}
                statusList={statusModal.list}
                isLoading={statusMutation.isPending}
            />

            <div className='h-10' />
        </div>
    );
}
