'use client';

import { format } from 'date-fns';
import {
    ArrowLeft,
    Camera,
    CheckCircle2,
    CreditCard,
    Eye,
    FileText,
    Heart,
    History,
    Info,
    Loader2,
    MapPin,
    Plus,
    Printer,
    Save,
    School,
    Search,
    ShieldAlert,
    Trash2,
    Upload,
    User,
    Users,
    Wallet
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import { useAdmissionFormDetails } from '@/hooks/admission/admissionForm';
import {
    useSophiaRegistrationXICaste,
    useSophiaRegistrationXIDelete,
    useSophiaRegistrationXIInitialData,
    useSophiaRegistrationXISave,
    useSophiaRegistrationXIStates,
    useSophiaRegistrationXIStudentPrintData,
    useSophiaRegistrationXIToggleStatus
} from '@/hooks/admission/preadmission/transactions/useSophiaRegistrationXI';
import {
    useAcademicYearDropdown,
    useMasterCasteCategory,
    useMasterCasteCategoryDropdown,
    useMasterReligion
} from '@/hooks/admission/preadmission/useMasters';
import { useActivePreadmissionDetails, useReligionDropdown } from '@/hooks/admission/preadmission/useTransactions';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function SophiaRegistration() {
    /* -------------------- Main State -------------------- */
    const [activeTab, setActiveTab] = useState<'entry' | 'list'>('entry');
    const [view, setView] = useState<'form' | 'payment'>('form');
    const [paymentMode, setPaymentMode] = useState<number>(1); // 1: Online, 2: Offline
    const [selectedGateway, setSelectedGateway] = useState<string>('RAZORPAY');

    const [counts, setCounts] = useState({
        regisrertotal: 0,
        notappform: 0,
        appform: 0,
        duplicate: 0,
        pay: 0,
        notpay: 0,
        transferstu: 0
    });

    const [reg, setReg] = useState<any>({
        pasR_Id: 0,
        ASMAY_Id: 0,
        PASR_FirstName: '',
        PASR_MiddleName: '',
        PASR_LastName: '',
        PASR_MobileNo: '',
        PASR_emailId: '',
        PASR_BirthPlace: '',
        PASR_DOB: null,
        PASR_Sex: 'Female',
        ASMCL_Id: 0,
        PASR_Nationality: 0,
        Religion_Id: 0,
        IMCC_Id: 0,
        Caste_Id: 0,
        PASR_MotherTongue: '',
        PASR_BloodGroup: '',
        ASMST_Id: 0,
        ASMCE_Id: 0,
        PASR_Student_Pic_Path: '',

        // Residential Address
        PASR_ConStreet: '',
        PASR_ConArea: '',
        PASR_ConCountry: 0,
        PASR_ConState: 0,
        PASR_ConCity: '',
        PASR_ConPincode: '',
        chkbox_address: 0,

        // Permanent Address
        PASR_PerStreet: '',
        PASR_PerArea: '',
        PASR_PerCountry: 0,
        PASR_PerState: 0,
        PASR_PerCity: '',
        PASR_PerPincode: '',

        // Father's Details
        PASR_FatherName: '',
        PASR_FatherSurname: '',
        PASR_FatherMobleNo: '',
        PASR_FatheremailId: '',
        PASR_FatherReligion: 0,
        PASA_FatherMotherTongue: '',
        PASR_FatherEducation: '',
        PASA_FatherInstitution: '',
        PASR_FatherOccupation: '',
        PASA_FatherBusiness: '',
        PASA_FatherCompany: '',
        PASR_FatherOfficeAddr: '',
        PASR_FatherDesignation: '',
        PASR_FatherMonIncome: '',
        PASR_FatherPhoto: '',

        // Mother's Details
        PASR_MotherName: '',
        PASR_MotherSurname: '',
        PASR_MotherMobleNo: '',
        PASR_MotheremailId: '',
        PASR_MotherReligion: 0,
        PASA_MotherMotherTongue: '',
        PASR_MotherEducation: '',
        PASA_MotherInstitution: '',
        PASR_MotherOccupation: '',
        PASA_MotherBusiness: '',
        PASA_MotherCompany: '',
        PASR_MotherOfficeAddr: '',
        PASR_MotherDesignation: '',
        PASR_MotherMonIncome: '',
        PASR_MotherPhoto: '',

        // Other Details
        PASA_AdmittingReason: '',
        PASA_WillingToContributeFlg: 1,
        PASA_WillingToContributeRemarks: '',
        PASR_UndertakingFlag: '1'
    });

    const [siblings, setSiblings] = useState<any[]>([
        {
            pasrS_SiblingsName: '',
            pasrS_SiblingsClass: '',
            pasrS_SchoolName: '',
            pasrS_Gender: 'Female'
        }
    ]);

    const [prevSchools, setPrevSchools] = useState<any[]>([
        {
            pasrpS_PrvSchoolName: '',
            pasrpS_Address: ''
        }
    ]);

    const [documentList, setDocumentList] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    // Modal States
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [printData, setPrintData] = useState<any>(null);
    const [docPreviewModalOpen, setDocPreviewModalOpen] = useState(false);
    const [previewDocUrl, setPreviewDocUrl] = useState<string>('');
    const [previewDocType, setPreviewDocType] = useState<'image' | 'pdf'>('image');

    /* -------------------- Hooks & API -------------------- */
    const { data: initialData } = useSophiaRegistrationXIInitialData(0, 0);
    const { data: admissionDetails } = useAdmissionFormDetails();
    const { data: activePreadmission } = useActivePreadmissionDetails();
    const { data: academicYearDropdown } = useAcademicYearDropdown();
    const { data: religionDropdownData } = useReligionDropdown();
    const { data: masterReligionData } = useMasterReligion();
    const { data: casteCategoryDropdownData } = useMasterCasteCategoryDropdown();
    const { data: masterCasteCategoryData } = useMasterCasteCategory();

    const casteMutation = useSophiaRegistrationXICaste();
    const statesMutation = useSophiaRegistrationXIStates();
    const saveMutation = useSophiaRegistrationXISave();
    const deleteMutation = useSophiaRegistrationXIDelete();
    const toggleStatusMutation = useSophiaRegistrationXIToggleStatus();
    const studentPrintMutation = useSophiaRegistrationXIStudentPrintData();

    /* -------------------- Dropdowns & Memo -------------------- */
    const academicYears = useMemo(() => {
        const payload = initialData?.data as any;
        const years = Array.isArray(payload) ? payload : (payload?.academicdrp ?? payload?.Items ?? payload?.allAcademicYear);
        if (Array.isArray(years) && years.length > 0) {
            return years.map((y: any) => ({
                asmaY_Id: y.asmaY_Id ?? y.ASMAY_Id,
                asmaY_Year: y.asmaY_Year ?? y.ASMAY_Year
            }));
        }
        const dd = (academicYearDropdown as any)?.data || (Array.isArray(academicYearDropdown) ? academicYearDropdown : []);
        return Array.isArray(dd) ? dd : [];
    }, [initialData, academicYearDropdown]);

    const _activeAcademicYear = useMemo(() => {
        if (activePreadmission?.data?.asmaY_Year) return activePreadmission.data.asmaY_Year;
        if (academicYears && academicYears.length > 0) {
            const found = academicYears.find((y: any) => Number(y.asmaY_Id) === Number(reg.ASMAY_Id)) || academicYears[0];
            if (found?.asmaY_Year) return found.asmaY_Year;
        }
        return '';
    }, [activePreadmission, academicYears, reg.ASMAY_Id]);

    const religions = useMemo(() => {
        const raw =
            (religionDropdownData as any)?.data ||
            (Array.isArray(religionDropdownData) ? religionDropdownData : null) ||
            (masterReligionData as any)?.data ||
            (Array.isArray(masterReligionData) ? masterReligionData : null) ||
            (admissionDetails as any)?.religions ||
            (admissionDetails as any)?.allReligion ||
            (initialData?.data as any)?.religiondrp ||
            (initialData as any)?.religiondrp ||
            (initialData?.data as any)?.arrlist8 ||
            [];
        return Array.isArray(raw) ? raw : [];
    }, [religionDropdownData, masterReligionData, admissionDetails, initialData]);

    const casteCategories = useMemo(() => {
        const raw =
            (casteCategoryDropdownData as any)?.data ||
            (Array.isArray(casteCategoryDropdownData) ? casteCategoryDropdownData : null) ||
            (masterCasteCategoryData as any)?.data ||
            (Array.isArray(masterCasteCategoryData) ? masterCasteCategoryData : null) ||
            (admissionDetails as any)?.casteCategoryes ||
            (admissionDetails as any)?.allCasteCategory ||
            (initialData?.data as any)?.castecategorydrp ||
            (initialData as any)?.castecategorydrp ||
            (initialData?.data as any)?.arrlist9 ||
            [];
        return Array.isArray(raw) ? raw : [];
    }, [casteCategoryDropdownData, masterCasteCategoryData, admissionDetails, initialData]);

    const allCastes = useMemo(() => {
        const raw =
            (casteMutation.data as any)?.data?.allCaste ||
            (casteMutation.data as any)?.data ||
            (admissionDetails as any)?.castes ||
            (admissionDetails as any)?.allCaste ||
            [];
        return Array.isArray(raw) ? raw : [];
    }, [casteMutation.data, admissionDetails]);

    const countries = useMemo(() => {
        const pData = (initialData?.data as any) || initialData;
        const list = pData?.countrydrp || pData?.allCountry || pData?.arrlist || [];
        return Array.isArray(list) ? list : [];
    }, [initialData]);

    const states = useMemo(() => {
        const sData = (statesMutation.data as any)?.data || statesMutation.data;
        const list = Array.isArray(sData) ? sData : sData?.statedrp || sData?.arrStatelist || sData?.arrStatelist2 || [];
        return Array.isArray(list) ? list : [];
    }, [statesMutation.data]);

    const classes = useMemo(() => {
        const pData = (initialData?.data as any) || initialData;
        const list = pData?.classdrp || pData?.classList || pData?.arrlist5 || [];
        return Array.isArray(list) ? list : [];
    }, [initialData]);

    const isRomanCatholic = useMemo(() => {
        const religionId = Number(reg.Religion_Id);
        const rel = religions.find((r: any) => Number(r.ivrmmR_Id ?? r.IVRMMR_Id ?? r.religion_Id) === religionId);
        const name = (rel?.ivrmmR_ReligionName || rel?.ivrmmR_Name || rel?.IVRMMR_Name || '').toLowerCase().trim();
        return name.includes('roman catholic') || name.includes('christian');
    }, [reg.Religion_Id, religions]);

    /* -------------------- Effects -------------------- */
    useEffect(() => {
        if (initialData) {
            const pData = (initialData as any)?.data || initialData;

            // Load counts
            setCounts({
                regisrertotal: pData?.regisrertotal || 0,
                notappform: pData?.notappform || 0,
                appform: pData?.appform || 0,
                duplicate: pData?.duplicate || 0,
                pay: pData?.pay || 0,
                notpay: pData?.notpay || 0,
                transferstu: pData?.transferstu || 0
            });

            // Documents
            const docs = pData?.documentList || pData?.DocumentList || [];
            if (Array.isArray(docs)) {
                setDocumentList(docs.map((d: any) => ({ ...d, document_Path: d.document_Path || '' })));
            }

            // Default Academic Year
            const yr = pData?.asmaY_Id || pData?.ASMAY_Id || pData?.academicdrp?.[0]?.asmaY_Id;
            if (yr && (!reg.ASMAY_Id || reg.ASMAY_Id === 0)) {
                setReg((prev: any) => ({ ...prev, ASMAY_Id: yr }));
            }
        }
    }, [initialData]);

    /* -------------------- Handlers -------------------- */
    const handleInputChange = (field: string, value: any) => {
        setReg((prev: any) => {
            const updated = { ...prev, [field]: value };

            // Sync permanent address if checkbox is ticked
            if (prev.chkbox_address === 1 && field.startsWith('PASR_Con')) {
                const perField = field.replace('PASR_Con', 'PASR_Per');
                updated[perField] = value;
            }

            return updated;
        });
    };

    const handleCheckboxAddressChange = (checked: boolean) => {
        const flag = checked ? 1 : 0;
        setReg((prev: any) => ({
            ...prev,
            chkbox_address: flag,
            ...(checked
                ? {
                    PASR_PerStreet: prev.PASR_ConStreet,
                    PASR_PerArea: prev.PASR_ConArea,
                    PASR_PerCountry: prev.PASR_ConCountry,
                    PASR_PerState: prev.PASR_ConState,
                    PASR_PerCity: prev.PASR_ConCity,
                    PASR_PerPincode: prev.PASR_ConPincode
                }
                : {})
        }));
    };

    const handleCountryChange = async (type: 'Con' | 'Per', countryId: string) => {
        const id = Number(countryId);
        handleInputChange(`PASR_${type}Country`, id);
        try {
            await statesMutation.mutateAsync(id);
        } catch {
            toast.error('Failed to load states for selected country');
        }
    };

    const handleCasteCategoryChange = async (val: string) => {
        const id = Number(val);
        handleInputChange('IMCC_Id', id);
        try {
            await casteMutation.mutateAsync(id);
        } catch {
            toast.error('Failed to load castes');
        }
    };

    const handlePhotoUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            handleInputChange(field, reader.result as string);
            toast.success('Photo attached');
        };
        reader.readAsDataURL(file);
    };

    const handleDocUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const updated = [...documentList];
            updated[idx].document_Path = reader.result as string;
            updated[idx].filetype = file.type.includes('pdf') ? 'pdf' : 'image';
            setDocumentList(updated);
            toast.success(`Attached ${updated[idx].amsmD_DocumentName}`);
        };
        reader.readAsDataURL(file);
    };

    /* Siblings */
    const handleAddSibling = () => {
        if (siblings.length >= 5) {
            toast.error('Maximum 5 siblings allowed');
            return;
        }
        setSiblings((prev) => [...prev, { pasrS_SiblingsName: '', pasrS_SiblingsClass: '', pasrS_SchoolName: '', pasrS_Gender: 'Female' }]);
    };

    const handleRemoveSibling = (index: number) => {
        if (siblings.length <= 1) return;
        setSiblings((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSiblingChange = (index: number, field: string, value: any) => {
        setSiblings((prev) => {
            const list = [...prev];
            list[index] = { ...list[index], [field]: value };
            return list;
        });
    };

    /* Kindergarten */
    const handleAddPrevSchool = () => {
        if (prevSchools.length >= 3) return;
        setPrevSchools((prev) => [...prev, { pasrpS_PrvSchoolName: '', pasrpS_Address: '' }]);
    };

    const handleRemovePrevSchool = (index: number) => {
        if (prevSchools.length <= 1) return;
        setPrevSchools((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePrevSchoolChange = (index: number, field: string, value: any) => {
        setPrevSchools((prev) => {
            const list = [...prev];
            list[index] = { ...list[index], [field]: value };
            return list;
        });
    };

    /* Save Submission */
    const handleSave = async () => {
        if (!reg.PASR_FirstName || !reg.PASR_MobileNo) {
            toast.error('Please fill required basic student fields (First Name and Mobile).');
            return;
        }

        const payload = {
            ...reg,
            siblings: siblings.filter((s) => s.pasrS_SiblingsName.trim() !== ''),
            PreviousSchoolList: prevSchools.filter((p) => p.pasrpS_PrvSchoolName.trim() !== ''),
            documentList: documentList.filter((d) => d.document_Path)
        };

        try {
            const res: any = await saveMutation.mutateAsync(payload);
            const data = res?.data || res;
            if (data?.returnval === true || data?.status === 'success') {
                Swal.fire('Saved!', 'Registration submitted successfully.', 'success');
                setActiveTab('list');
            } else {
                toast.error(data?.message || 'Error occurred while saving application');
            }
        } catch {
            toast.error('Server error saving registration');
        }
    };

    /* Reset / Clear */
    const handleClear = () => {
        setReg({
            pasR_Id: 0,
            ASMAY_Id: reg.ASMAY_Id,
            PASR_FirstName: '',
            PASR_MiddleName: '',
            PASR_LastName: '',
            PASR_MobileNo: '',
            PASR_emailId: '',
            PASR_BirthPlace: '',
            PASR_DOB: null,
            PASR_Sex: 'Female',
            ASMCL_Id: 0,
            PASR_Nationality: 0,
            Religion_Id: 0,
            IMCC_Id: 0,
            Caste_Id: 0,
            PASR_MotherTongue: '',
            PASR_BloodGroup: '',
            ASMST_Id: 0,
            ASMCE_Id: 0,
            PASR_Student_Pic_Path: '',
            PASR_ConStreet: '',
            PASR_ConArea: '',
            PASR_ConCountry: 0,
            PASR_ConState: 0,
            PASR_ConCity: '',
            PASR_ConPincode: '',
            chkbox_address: 0,
            PASR_PerStreet: '',
            PASR_PerArea: '',
            PASR_PerCountry: 0,
            PASR_PerState: 0,
            PASR_PerCity: '',
            PASR_PerPincode: '',
            PASR_FatherName: '',
            PASR_FatherSurname: '',
            PASR_FatherMobleNo: '',
            PASR_FatheremailId: '',
            PASR_FatherReligion: 0,
            PASA_FatherMotherTongue: '',
            PASR_FatherEducation: '',
            PASA_FatherInstitution: '',
            PASR_FatherOccupation: '',
            PASA_FatherBusiness: '',
            PASA_FatherCompany: '',
            PASR_FatherOfficeAddr: '',
            PASR_FatherDesignation: '',
            PASR_FatherMonIncome: '',
            PASR_FatherPhoto: '',
            PASR_MotherName: '',
            PASR_MotherSurname: '',
            PASR_MotherMobleNo: '',
            PASR_MotheremailId: '',
            PASR_MotherReligion: 0,
            PASA_MotherMotherTongue: '',
            PASR_MotherEducation: '',
            PASA_MotherInstitution: '',
            PASA_MotherCompany: '',
            PASR_MotherOfficeAddr: '',
            PASR_MotherDesignation: '',
            PASR_MotherMonIncome: '',
            PASR_MotherPhoto: '',
            PASA_AdmittingReason: '',
            PASA_WillingToContributeFlg: 1,
            PASA_WillingToContributeRemarks: '',
            PASR_UndertakingFlag: '1'
        });
        setSiblings([{ pasrS_SiblingsName: '', pasrS_SiblingsClass: '', pasrS_SchoolName: '', pasrS_Gender: 'Female' }]);
        setPrevSchools([{ pasrpS_PrvSchoolName: '', pasrpS_Address: '' }]);
    };

    /* Delete */
    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Delete Application?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it'
        });

        if (result.isConfirmed) {
            try {
                await deleteMutation.mutateAsync(id);
                Swal.fire('Deleted', 'Application removed successfully.', 'success');
            } catch {
                toast.error('Failed to delete application');
            }
        }
    };

    /* Show Print Preview */
    const handleShowPrint = async (studentId: number) => {
        try {
            const res: any = await studentPrintMutation.mutateAsync({ pasR_Id: studentId });
            const data = res?.data || res;
            setPrintData(data);
            setPrintModalOpen(true);
        } catch {
            toast.error('Failed to load application print details');
        }
    };

    /* Trigger Browser Print */
    const handlePrintWindow = () => {
        const printArea = document.getElementById('JSHSAPPH');
        if (!printArea) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <html>
                <head>
                    <title>Sophia Nursery Admission Form</title>
                    <style>
                        body { font-family: Arial, sans-serif; font-size: 13px; color: #000; margin: 20px; }
                        .info-row { display: flex; align-items: flex-start; margin-bottom: 8px; }
                        .info-label { width: 260px; text-align: right; padding-right: 15px; font-weight: bold; flex-shrink: 0; }
                        .info-value { flex-grow: 1; text-align: left; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
                        th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: center; font-size: 13px; }
                        th { background-color: #f7f7f7; font-weight: bold; }
                        .header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                        .badge { border: 1px solid #999; padding: 4px 10px; font-weight: bold; font-size: 14px; }
                        .photo-box { width: 130px; height: 130px; border: 1px solid #000; object-fit: cover; display: block; margin: 0 auto; }
                        .photos-container { display: flex; justify-content: space-around; margin: 15px 0; }
                        .section-title { font-weight: bold; font-size: 14px; border-bottom: 1px solid #333; padding-bottom: 4px; margin-top: 15px; margin-bottom: 10px; text-transform: uppercase; background: #f0f4f8; padding-left: 8px; }
                        .sig-container { display: flex; justify-content: space-between; margin-top: 40px; }
                        .sig-block { width: 28%; text-align: left; }
                        .sig-line { border-bottom: 1px dotted #000; margin-bottom: 6px; }
                        @media print {
                            @page { margin: 12mm; }
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${printArea.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 350);
    };

    /* List Filter */
    const registrationList = useMemo(() => {
        const pData = (initialData?.data as any) || initialData;
        const list = pData?.registrationList || pData?.pages || [];
        return Array.isArray(list) ? list : [];
    }, [initialData]);

    const filteredList = useMemo(() => {
        if (!studentSearch.trim()) return registrationList;
        const s = studentSearch.toLowerCase();
        return registrationList.filter(
            (r: any) =>
                r.pasR_FirstName?.toLowerCase().includes(s) ||
                r.name?.toLowerCase().includes(s) ||
                r.pasR_RegistrationNo?.toLowerCase().includes(s) ||
                r.pasR_Applicationno?.toLowerCase().includes(s)
        );
    }, [registrationList, studentSearch]);

    return (
        <div className='min-h-screen space-y-6 bg-slate-50/50 p-6'>
            {/* Metric Status Badges - Unified indigo theme matching Image 1 */}
            <div className='flex flex-wrap items-center gap-2'>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    REGISTERED <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>{counts.regisrertotal}</span>
                </Badge>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    APPLICATION NOT FILLED <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>{counts.notappform}</span>
                </Badge>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    APPLICATION FILLED{' '}
                    <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>
                        {counts.appform - counts.duplicate}+{counts.duplicate}
                    </span>
                </Badge>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    PAYMENT DONE <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>{counts.pay}</span>
                </Badge>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    PAYMENT NOT DONE <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>{counts.notpay}</span>
                </Badge>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    TRANSFER STUDENT <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>{counts.transferstu}</span>
                </Badge>
            </div>

            {/* Tabs List */}
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className='space-y-6'>
                <TabsList className='grid h-12 w-full grid-cols-2 bg-slate-200/50 p-1 lg:w-[400px]'>
                    <TabsTrigger
                        value='entry'
                        className='rounded-md font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm'>
                        <FileText className='mr-2 h-4 w-4' />
                        Registration Form
                    </TabsTrigger>
                    <TabsTrigger
                        value='list'
                        className='rounded-md font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm'>
                        <Search className='mr-2 h-4 w-4' />
                        View Registrations
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: ENTRY / FORM */}
                <TabsContent value='entry' className='fade-in slide-in-from-bottom-2 animate-in space-y-6 duration-300'>
                    {view === 'payment' ? (
                        /* Payment Mode View */
                        <div className='flex justify-center'>
                            <Card className='w-full max-w-2xl overflow-hidden rounded-2xl border-none shadow-2xl'>
                                <CardHeader className='bg-indigo-600 p-8 text-center text-white'>
                                    <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20'>
                                        <Wallet className='h-8 w-8 text-white' />
                                    </div>
                                    <CardTitle className='font-bold text-2xl'>REGISTRATION FEES PAYMENT</CardTitle>
                                    <CardDescription className='text-indigo-100'>
                                        Complete your registration by making the payment.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-6 p-8'>
                                    <div className='grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-6'>
                                        <div className='flex items-center justify-between border-slate-200 border-b pb-3 text-sm'>
                                            <span className='font-medium text-slate-500'>Name of the Child</span>
                                            <span className='font-bold text-slate-800'>{reg.PASR_FirstName || '-'}</span>
                                        </div>
                                        <div className='flex items-center justify-between border-slate-200 border-b pb-3 text-sm'>
                                            <span className='font-medium text-slate-500'>Mobile</span>
                                            <span className='font-bold text-slate-800'>{reg.PASR_MobileNo || '-'}</span>
                                        </div>
                                        <div className='flex items-center justify-between text-sm'>
                                            <span className='font-medium text-slate-500'>Email ID</span>
                                            <span className='font-bold text-slate-800'>{reg.PASR_emailId || '-'}</span>
                                        </div>
                                    </div>

                                    <RadioGroup
                                        value={paymentMode.toString()}
                                        onValueChange={(v) => setPaymentMode(Number(v))}
                                        className='flex justify-center gap-8 rounded-xl bg-indigo-50/50 p-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='1' id='online' />
                                            <Label htmlFor='online' className='cursor-pointer font-bold text-indigo-700'>
                                                ONLINE PAYMENT
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='2' id='offline' />
                                            <Label htmlFor='offline' className='cursor-pointer font-bold text-indigo-700'>
                                                OFFLINE PAYMENT
                                            </Label>
                                        </div>
                                    </RadioGroup>

                                    {paymentMode === 1 && (
                                        <div className='space-y-4 text-center'>
                                            <h4 className='font-bold text-slate-700 text-sm'>Select Payment Gateway</h4>
                                            <div className='flex justify-center gap-4'>
                                                {['RAZORPAY', 'PAYU', 'PAYTM', 'EASEBUZZ'].map((gw) => (
                                                    <div
                                                        key={gw}
                                                        onClick={() => setSelectedGateway(gw)}
                                                        className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${selectedGateway === gw
                                                                ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                                                : 'border-slate-100 hover:border-indigo-200'
                                                            }`}>
                                                        <p className='font-bold text-slate-700 text-xs uppercase'>{gw}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className='flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4'>
                                        <Info className='h-5 w-5 shrink-0 text-amber-600' />
                                        <p className='font-medium text-amber-800 text-sm leading-relaxed'>
                                            <strong>Note:</strong> For faster and smoother payment processing, please prefer using the UPI
                                            mode of payment.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className='flex gap-4 border-t bg-slate-50 p-8'>
                                    <Button variant='outline' className='h-12 flex-1 rounded-xl' onClick={() => setView('form')}>
                                        <ArrowLeft className='mr-2 h-4 w-4' /> BACK
                                    </Button>
                                    <Button
                                        className='h-12 flex-1 rounded-xl bg-indigo-600 shadow-indigo-100 shadow-lg hover:bg-indigo-700'
                                        onClick={() => {
                                            if (paymentMode === 1) {
                                                toast.info(`Redirecting to ${selectedGateway} gateway...`);
                                            } else {
                                                Swal.fire(
                                                    'Offline Payment',
                                                    'Kindly visit school to pay registration fees before the last date.',
                                                    'info'
                                                );
                                                setView('form');
                                            }
                                        }}>
                                        <CreditCard className='mr-2 h-4 w-4' /> CLICK HERE TO PAY NOW
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    ) : (
                        /* Standard Form View matching SophiaRegistrationXI layout */
                        <div className='grid grid-cols-1 gap-8 pb-28'>
                            {/* Section 1: Application Form - Personal Information (Image 1 placement) */}
                            <CollapsibleSection
                                title='Application Form - Personal Information'
                                icon={<User className='h-5 w-5 text-indigo-600' />}
                                defaultOpen={true}>
                                <div className='grid grid-cols-1 gap-8 p-6 lg:grid-cols-12'>
                                    {/* Left: 3-column input field grid */}
                                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-9 lg:grid-cols-3'>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                First Name <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                placeholder='First Name'
                                                value={reg.PASR_FirstName}
                                                onChange={(e) => handleInputChange('PASR_FirstName', e.target.value)}
                                                className='h-10 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>Middle Name</Label>
                                            <Input
                                                placeholder='Middle Name'
                                                value={reg.PASR_MiddleName}
                                                onChange={(e) => handleInputChange('PASR_MiddleName', e.target.value)}
                                                className='h-10 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>Last Name</Label>
                                            <Input
                                                placeholder='Last Name'
                                                value={reg.PASR_LastName}
                                                onChange={(e) => handleInputChange('PASR_LastName', e.target.value)}
                                                className='h-10 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Mobile No <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                placeholder='Mobile No'
                                                maxLength={10}
                                                value={reg.PASR_MobileNo}
                                                onChange={(e) => handleInputChange('PASR_MobileNo', e.target.value)}
                                                className='h-10'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Place of Birth <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                placeholder='Place of Birth'
                                                value={reg.PASR_BirthPlace}
                                                onChange={(e) => handleInputChange('PASR_BirthPlace', e.target.value)}
                                                className='h-10 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Email ID <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                placeholder='Email ID'
                                                type='email'
                                                value={reg.PASR_emailId}
                                                onChange={(e) => handleInputChange('PASR_emailId', e.target.value)}
                                                className='h-10'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Religion <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.Religion_Id && reg.Religion_Id !== 0 ? reg.Religion_Id.toString() : ''}
                                                onValueChange={(v) => handleInputChange('Religion_Id', Number(v))}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Religion' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {religions.map((r: any) => {
                                                        const id = r.ivrmmR_Id ?? r.IVRMMR_Id ?? r.religion_Id ?? r.religionId;
                                                        const name =
                                                            r.ivrmmR_ReligionName || r.ivrmmR_Name || r.IVRMMR_Name || r.religionName;
                                                        if (id === undefined || id === null) return null;
                                                        return (
                                                            <SelectItem key={id.toString()} value={id.toString()}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Caste Category <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.IMCC_Id && reg.IMCC_Id !== 0 ? reg.IMCC_Id.toString() : ''}
                                                onValueChange={handleCasteCategoryChange}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Category' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {casteCategories.map((c: any) => {
                                                        const id = c.imcC_Id ?? c.imCC_Id ?? c.IMCC_Id ?? c.imc_id;
                                                        const name =
                                                            c.imcC_CategoryName ||
                                                            c.imCC_CategoryName ||
                                                            c.IMCC_CategoryName ||
                                                            c.imC_CategoryName;
                                                        if (id === undefined || id === null) return null;
                                                        return (
                                                            <SelectItem key={id.toString()} value={id.toString()}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Caste <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.Caste_Id ? reg.Caste_Id.toString() : ''}
                                                onValueChange={(v) => handleInputChange('Caste_Id', Number(v))}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Caste' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allCastes.map((c: any) => {
                                                        const id = c.imC_Id ?? c.IMC_Id;
                                                        const name = c.imC_CasteName ?? c.IMC_CasteName;
                                                        if (!id) return null;
                                                        return (
                                                            <SelectItem key={id.toString()} value={id.toString()}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Gender <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select value={reg.PASR_Sex} onValueChange={(v) => handleInputChange('PASR_Sex', v)}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='Female'>Female</SelectItem>
                                                    <SelectItem value='Male'>Male</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Date of Birth <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                type='date'
                                                value={reg.PASR_DOB ? new Date(reg.PASR_DOB).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleInputChange('PASR_DOB', e.target.value)}
                                                className='h-10'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Applying For <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.ASMCL_Id ? reg.ASMCL_Id.toString() : ''}
                                                onValueChange={(v) => handleInputChange('ASMCL_Id', Number(v))}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((cls: any) => {
                                                        const id = cls.asmcL_Id ?? cls.ASMCL_Id;
                                                        const name = cls.asmcL_ClassName ?? cls.ASMCL_ClassName;
                                                        return (
                                                            <SelectItem key={id.toString()} value={id.toString()}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                    {classes.length === 0 && <SelectItem value='0'>Nursery</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Academic Year <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.ASMAY_Id ? reg.ASMAY_Id.toString() : ''}
                                                onValueChange={(v) => handleInputChange('ASMAY_Id', Number(v))}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYears.map((ay: any) => (
                                                        <SelectItem key={ay.asmaY_Id.toString()} value={ay.asmaY_Id.toString()}>
                                                            {ay.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Nationality <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.PASR_Nationality ? reg.PASR_Nationality.toString() : ''}
                                                onValueChange={(v) => handleCountryChange('Con', v)}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Country' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries.map((c: any) => {
                                                        const id = c.ivrmmC_Id ?? c.IVRMMC_Id;
                                                        const name = c.ivrmmC_CountryName ?? c.IVRMMC_CountryName;
                                                        return (
                                                            <SelectItem key={id.toString()} value={id.toString()}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Mother Tongue <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                value={reg.PASR_MotherTongue}
                                                onChange={(e) => handleInputChange('PASR_MotherTongue', e.target.value)}
                                                placeholder='Mother Tongue'
                                                className='h-10 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Blood Group <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.PASR_BloodGroup}
                                                onValueChange={(v) => handleInputChange('PASR_BloodGroup', v)}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Blood Group' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Not Available'].map((bg) => (
                                                        <SelectItem key={bg} value={bg}>
                                                            {bg}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Right: Student Photo Box (matching Image 1) */}
                                    <div className='flex flex-col items-center justify-start space-y-4 lg:col-span-3'>
                                        <label className='group relative flex h-48 w-48 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 border-dashed bg-slate-50 transition-colors hover:border-indigo-400'>
                                            {reg.PASR_Student_Pic_Path ? (
                                                <img src={reg.PASR_Student_Pic_Path} alt='Student' className='h-full w-full object-cover' />
                                            ) : (
                                                <div className='space-y-2 p-4 text-center'>
                                                    <User className='mx-auto h-12 w-12 text-slate-300' />
                                                    <p className='font-bold text-[10px] text-slate-400 uppercase'>Upload Photo</p>
                                                </div>
                                            )}
                                            <div className='absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                                                <span className='rounded-full bg-white/80 p-2 text-indigo-700 shadow'>
                                                    <Upload className='h-4 w-4' />
                                                </span>
                                            </div>
                                            <input
                                                type='file'
                                                accept='image/*'
                                                className='hidden'
                                                onChange={(e) => handlePhotoUpload('PASR_Student_Pic_Path', e)}
                                            />
                                        </label>
                                        <Label className='font-black text-[10px] text-indigo-600 uppercase tracking-widest'>
                                            Student Profile Picture <span className='text-red-500'>*</span>
                                        </Label>
                                        <label className='flex w-full cursor-pointer items-center justify-center rounded-md border border-indigo-200 bg-white px-3 py-2 font-medium text-indigo-600 text-xs shadow-sm hover:bg-indigo-50'>
                                            <Camera className='mr-1.5 h-3.5 w-3.5' /> Capture Image
                                            <input
                                                type='file'
                                                accept='image/*'
                                                capture='user'
                                                className='hidden'
                                                onChange={(e) => handlePhotoUpload('PASR_Student_Pic_Path', e)}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Section 2: Addresses (2-column grid matching Image 2) */}
                            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                <CollapsibleSection
                                    title='Residential Address'
                                    icon={<MapPin className='h-5 w-5 text-indigo-600' />}
                                    variant='outline'>
                                    <div className='space-y-6 p-6'>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Street <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                value={reg.PASR_ConStreet}
                                                onChange={(e) => handleInputChange('PASR_ConStreet', e.target.value)}
                                                className='text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Area <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                value={reg.PASR_ConArea}
                                                onChange={(e) => handleInputChange('PASR_ConArea', e.target.value)}
                                                className='text-uppercase'
                                            />
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    Country <span className='text-red-500'>*</span>
                                                </Label>
                                                <Select
                                                    value={reg.PASR_ConCountry?.toString()}
                                                    onValueChange={(v) => handleCountryChange('Con', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Country' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {countries.map((c: any) => {
                                                            const id = c.ivrmmC_Id ?? c.IVRMMC_Id;
                                                            const name = c.ivrmmC_CountryName ?? c.IVRMMC_CountryName;
                                                            return (
                                                                <SelectItem key={id.toString()} value={id.toString()}>
                                                                    {name}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    State <span className='text-red-500'>*</span>
                                                </Label>
                                                <Select
                                                    value={reg.PASR_ConState?.toString()}
                                                    onValueChange={(v) => handleInputChange('PASR_ConState', Number(v))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select State' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {states.map((s: any) => {
                                                            const id = s.ivrmmS_Id ?? s.IVRMMS_Id;
                                                            const name = s.ivrmmS_Name ?? s.IVRMMS_Name;
                                                            return (
                                                                <SelectItem key={id.toString()} value={id.toString()}>
                                                                    {name}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    City <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    value={reg.PASR_ConCity}
                                                    onChange={(e) => handleInputChange('PASR_ConCity', e.target.value)}
                                                    className='text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    Pincode <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    value={reg.PASR_ConPincode}
                                                    onChange={(e) => handleInputChange('PASR_ConPincode', e.target.value)}
                                                    maxLength={6}
                                                />
                                            </div>
                                        </div>
                                        <div className='flex items-center space-x-2 pt-2'>
                                            <Checkbox
                                                id='addr_same'
                                                checked={reg.chkbox_address === 1}
                                                onCheckedChange={(c) => handleCheckboxAddressChange(!!c)}
                                            />
                                            <Label
                                                htmlFor='addr_same'
                                                className='cursor-pointer font-bold text-indigo-600 text-xs uppercase tracking-tight'>
                                                Permanent Address Same As Residential Address
                                            </Label>
                                        </div>
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection
                                    title='Permanent Address'
                                    icon={<History className='h-5 w-5 text-indigo-600' />}
                                    variant='outline'>
                                    <div className='space-y-6 p-6'>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Street <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                value={reg.PASR_PerStreet}
                                                onChange={(e) => handleInputChange('PASR_PerStreet', e.target.value)}
                                                className='text-uppercase'
                                                disabled={reg.chkbox_address === 1}
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Area <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                value={reg.PASR_PerArea}
                                                onChange={(e) => handleInputChange('PASR_PerArea', e.target.value)}
                                                className='text-uppercase'
                                                disabled={reg.chkbox_address === 1}
                                            />
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    Country <span className='text-red-500'>*</span>
                                                </Label>
                                                <Select
                                                    value={reg.PASR_PerCountry?.toString()}
                                                    onValueChange={(v) => handleCountryChange('Per', v)}
                                                    disabled={reg.chkbox_address === 1}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Country' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {countries.map((c: any) => {
                                                            const id = c.ivrmmC_Id ?? c.IVRMMC_Id;
                                                            const name = c.ivrmmC_CountryName ?? c.IVRMMC_CountryName;
                                                            return (
                                                                <SelectItem key={id.toString()} value={id.toString()}>
                                                                    {name}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    State <span className='text-red-500'>*</span>
                                                </Label>
                                                <Select
                                                    value={reg.PASR_PerState?.toString()}
                                                    onValueChange={(v) => handleInputChange('PASR_PerState', Number(v))}
                                                    disabled={reg.chkbox_address === 1}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select State' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {states.map((s: any) => {
                                                            const id = s.ivrmmS_Id ?? s.IVRMMS_Id;
                                                            const name = s.ivrmmS_Name ?? s.IVRMMS_Name;
                                                            return (
                                                                <SelectItem key={id.toString()} value={id.toString()}>
                                                                    {name}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    City <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    value={reg.PASR_PerCity}
                                                    onChange={(e) => handleInputChange('PASR_PerCity', e.target.value)}
                                                    className='text-uppercase'
                                                    disabled={reg.chkbox_address === 1}
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    Pincode <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    value={reg.PASR_PerPincode}
                                                    onChange={(e) => handleInputChange('PASR_PerPincode', e.target.value)}
                                                    maxLength={6}
                                                    disabled={reg.chkbox_address === 1}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* Section 3: Parents Details (2-column grid matching Image 2) */}
                            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                <CollapsibleSection
                                    title="FATHER'S DETAILS"
                                    icon={<Users className='h-5 w-5 text-indigo-600' />}
                                    variant='outline'>
                                    <div className='space-y-4 p-6'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Father Name *</Label>
                                                <Input
                                                    value={reg.PASR_FatherName}
                                                    onChange={(e) => handleInputChange('PASR_FatherName', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Surname *</Label>
                                                <Input
                                                    value={reg.PASR_FatherSurname}
                                                    onChange={(e) => handleInputChange('PASR_FatherSurname', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Mobile *</Label>
                                                <Input
                                                    value={reg.PASR_FatherMobleNo}
                                                    onChange={(e) => handleInputChange('PASR_FatherMobleNo', e.target.value)}
                                                    className='h-9'
                                                    maxLength={10}
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Email *</Label>
                                                <Input
                                                    value={reg.PASR_FatheremailId}
                                                    onChange={(e) => handleInputChange('PASR_FatheremailId', e.target.value)}
                                                    className='h-9'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Religion *</Label>
                                                <Select
                                                    value={reg.PASR_FatherReligion?.toString()}
                                                    onValueChange={(v) => handleInputChange('PASR_FatherReligion', Number(v))}>
                                                    <SelectTrigger className='h-9'>
                                                        <SelectValue placeholder='Select Religion' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {religions.map((r: any) => {
                                                            const id = r.ivrmmR_Id ?? r.IVRMMR_Id ?? r.religion_Id;
                                                            const name = r.ivrmmR_ReligionName || r.ivrmmR_Name || r.IVRMMR_Name;
                                                            return (
                                                                <SelectItem key={id.toString()} value={id.toString()}>
                                                                    {name}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Mother Tongue *</Label>
                                                <Input
                                                    value={reg.PASA_FatherMotherTongue}
                                                    onChange={(e) => handleInputChange('PASA_FatherMotherTongue', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Qualification *</Label>
                                                <Input
                                                    value={reg.PASR_FatherEducation}
                                                    onChange={(e) => handleInputChange('PASR_FatherEducation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>
                                                    Institution Attended *
                                                </Label>
                                                <Input
                                                    value={reg.PASA_FatherInstitution}
                                                    onChange={(e) => handleInputChange('PASA_FatherInstitution', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Service *</Label>
                                                <Input
                                                    value={reg.PASR_FatherOccupation}
                                                    onChange={(e) => handleInputChange('PASR_FatherOccupation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Business *</Label>
                                                <Input
                                                    value={reg.PASA_FatherBusiness}
                                                    onChange={(e) => handleInputChange('PASA_FatherBusiness', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-[10px] text-slate-500 uppercase'>Company Name *</Label>
                                            <Input
                                                value={reg.PASA_FatherCompany}
                                                onChange={(e) => handleInputChange('PASA_FatherCompany', e.target.value)}
                                                className='h-9 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-[10px] text-slate-500 uppercase'>Address *</Label>
                                            <Textarea
                                                value={reg.PASR_FatherOfficeAddr}
                                                onChange={(e) => handleInputChange('PASR_FatherOfficeAddr', e.target.value)}
                                                className='min-h-[60px] text-uppercase'
                                            />
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Designation *</Label>
                                                <Input
                                                    value={reg.PASR_FatherDesignation}
                                                    onChange={(e) => handleInputChange('PASR_FatherDesignation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Monthly Income *</Label>
                                                <Input
                                                    value={reg.PASR_FatherMonIncome}
                                                    onChange={(e) => handleInputChange('PASR_FatherMonIncome', e.target.value)}
                                                    className='h-9'
                                                />
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-4 rounded-xl border-2 border-dashed bg-slate-50/50 p-4'>
                                            <div className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white'>
                                                {reg.PASR_FatherPhoto ? (
                                                    <img src={reg.PASR_FatherPhoto} alt='Father' className='h-full w-full object-cover' />
                                                ) : (
                                                    <User className='h-8 w-8 text-slate-200' />
                                                )}
                                            </div>
                                            <div className='flex-1 space-y-2'>
                                                <Label className='font-black text-[10px] text-indigo-600 uppercase'>Father Photo *</Label>
                                                <label className='flex cursor-pointer items-center justify-center rounded border border-indigo-200 border-dashed bg-white px-3 py-1.5 font-bold text-[11px] text-indigo-600 hover:bg-indigo-50'>
                                                    CHOOSE FILE
                                                    <input
                                                        type='file'
                                                        accept='image/*'
                                                        className='hidden'
                                                        onChange={(e) => handlePhotoUpload('PASR_FatherPhoto', e)}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection
                                    title="MOTHER'S DETAILS"
                                    icon={<Heart className='h-5 w-5 text-indigo-600' />}
                                    variant='outline'>
                                    <div className='space-y-4 p-6'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Mother Name *</Label>
                                                <Input
                                                    value={reg.PASR_MotherName}
                                                    onChange={(e) => handleInputChange('PASR_MotherName', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Surname *</Label>
                                                <Input
                                                    value={reg.PASR_MotherSurname}
                                                    onChange={(e) => handleInputChange('PASR_MotherSurname', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Mobile *</Label>
                                                <Input
                                                    value={reg.PASR_MotherMobleNo}
                                                    onChange={(e) => handleInputChange('PASR_MotherMobleNo', e.target.value)}
                                                    className='h-9'
                                                    maxLength={10}
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Email *</Label>
                                                <Input
                                                    value={reg.PASR_MotheremailId}
                                                    onChange={(e) => handleInputChange('PASR_MotheremailId', e.target.value)}
                                                    className='h-9'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Religion *</Label>
                                                <Select
                                                    value={reg.PASR_MotherReligion?.toString()}
                                                    onValueChange={(v) => handleInputChange('PASR_MotherReligion', Number(v))}>
                                                    <SelectTrigger className='h-9'>
                                                        <SelectValue placeholder='Select Religion' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {religions.map((r: any) => {
                                                            const id = r.ivrmmR_Id ?? r.IVRMMR_Id ?? r.religion_Id;
                                                            const name = r.ivrmmR_ReligionName || r.ivrmmR_Name || r.IVRMMR_Name;
                                                            return (
                                                                <SelectItem key={id.toString()} value={id.toString()}>
                                                                    {name}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Mother Tongue *</Label>
                                                <Input
                                                    value={reg.PASA_MotherMotherTongue}
                                                    onChange={(e) => handleInputChange('PASA_MotherMotherTongue', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Qualification *</Label>
                                                <Input
                                                    value={reg.PASR_MotherEducation}
                                                    onChange={(e) => handleInputChange('PASR_MotherEducation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>
                                                    Institution Attended *
                                                </Label>
                                                <Input
                                                    value={reg.PASA_MotherInstitution}
                                                    onChange={(e) => handleInputChange('PASA_MotherInstitution', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Service *</Label>
                                                <Input
                                                    value={reg.PASR_MotherOccupation}
                                                    onChange={(e) => handleInputChange('PASR_MotherOccupation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Business *</Label>
                                                <Input
                                                    value={reg.PASA_MotherBusiness}
                                                    onChange={(e) => handleInputChange('PASA_MotherBusiness', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-[10px] text-slate-500 uppercase'>Company Name *</Label>
                                            <Input
                                                value={reg.PASA_MotherCompany}
                                                onChange={(e) => handleInputChange('PASA_MotherCompany', e.target.value)}
                                                className='h-9 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-[10px] text-slate-500 uppercase'>Address *</Label>
                                            <Textarea
                                                value={reg.PASR_MotherOfficeAddr}
                                                onChange={(e) => handleInputChange('PASR_MotherOfficeAddr', e.target.value)}
                                                className='min-h-[60px] text-uppercase'
                                            />
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Designation *</Label>
                                                <Input
                                                    value={reg.PASR_MotherDesignation}
                                                    onChange={(e) => handleInputChange('PASR_MotherDesignation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Monthly Income *</Label>
                                                <Input
                                                    value={reg.PASR_MotherMonIncome}
                                                    onChange={(e) => handleInputChange('PASR_MotherMonIncome', e.target.value)}
                                                    className='h-9'
                                                />
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-4 rounded-xl border-2 border-dashed bg-slate-50/50 p-4'>
                                            <div className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white'>
                                                {reg.PASR_MotherPhoto ? (
                                                    <img src={reg.PASR_MotherPhoto} alt='Mother' className='h-full w-full object-cover' />
                                                ) : (
                                                    <User className='h-8 w-8 text-slate-200' />
                                                )}
                                            </div>
                                            <div className='flex-1 space-y-2'>
                                                <Label className='font-black text-[10px] text-indigo-600 uppercase'>Mother Photo *</Label>
                                                <label className='flex cursor-pointer items-center justify-center rounded border border-indigo-200 border-dashed bg-white px-3 py-1.5 font-bold text-[11px] text-indigo-600 hover:bg-indigo-50'>
                                                    CHOOSE FILE
                                                    <input
                                                        type='file'
                                                        accept='image/*'
                                                        className='hidden'
                                                        onChange={(e) => handlePhotoUpload('PASR_MotherPhoto', e)}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* Section 4: Sibling Details (Image 2 placement) */}
                            <CollapsibleSection
                                title='Sibling Details'
                                icon={<Users className='h-5 w-5 text-indigo-600' />}
                                variant='outline'>
                                <div className='space-y-4 p-6'>
                                    <Table className='border border-slate-200'>
                                        <TableHeader>
                                            <TableRow className='bg-slate-50'>
                                                <TableHead className='w-14 text-center'>#</TableHead>
                                                <TableHead>Sibling Name</TableHead>
                                                <TableHead>Class</TableHead>
                                                <TableHead>School Name</TableHead>
                                                <TableHead>Gender</TableHead>
                                                <TableHead className='w-16 text-center'>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {siblings.map((sib, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className='text-center font-bold text-slate-400'>{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={sib.pasrS_SiblingsName}
                                                            onChange={(e) => handleSiblingChange(idx, 'pasrS_SiblingsName', e.target.value)}
                                                            placeholder='Name'
                                                            className='h-10 text-uppercase'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={sib.pasrS_SiblingsClass}
                                                            onChange={(e) =>
                                                                handleSiblingChange(idx, 'pasrS_SiblingsClass', e.target.value)
                                                            }
                                                            placeholder='Class'
                                                            className='h-10 text-uppercase'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={sib.pasrS_SchoolName}
                                                            onChange={(e) => handleSiblingChange(idx, 'pasrS_SchoolName', e.target.value)}
                                                            placeholder='School Name'
                                                            className='h-10 text-uppercase'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={sib.pasrS_Gender}
                                                            onValueChange={(v) => handleSiblingChange(idx, 'pasrS_Gender', v)}>
                                                            <SelectTrigger className='h-10'>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='Female'>Female</SelectItem>
                                                                <SelectItem value='Male'>Male</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className='text-center'>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            disabled={siblings.length <= 1}
                                                            onClick={() => handleRemoveSibling(idx)}
                                                            className='h-9 w-9 text-red-500 hover:bg-red-50'>
                                                            <Trash2 className='h-4 w-4' />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Button
                                        variant='outline'
                                        onClick={handleAddSibling}
                                        disabled={siblings.length >= 5}
                                        className='h-10 border-indigo-200 text-indigo-600 hover:bg-indigo-50'>
                                        <Plus className='mr-2 h-4 w-4' /> Add Sibling (Max 5)
                                    </Button>
                                </div>
                            </CollapsibleSection>

                            {/* Section 5: Last Attended School (Image 2 placement) */}
                            <CollapsibleSection
                                title='Last Attended School'
                                icon={<School className='h-5 w-5 text-indigo-600' />}
                                variant='outline'>
                                <div className='space-y-4 p-6'>
                                    <Table className='border border-slate-200'>
                                        <TableHeader>
                                            <TableRow className='bg-slate-50'>
                                                <TableHead className='w-14 text-center'>#</TableHead>
                                                <TableHead>School Name</TableHead>
                                                <TableHead>Address</TableHead>
                                                <TableHead className='w-16 text-center'>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {prevSchools.map((ps, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className='text-center font-bold text-slate-400'>{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={ps.pasrpS_PrvSchoolName}
                                                            onChange={(e) =>
                                                                handlePrevSchoolChange(idx, 'pasrpS_PrvSchoolName', e.target.value)
                                                            }
                                                            placeholder='School Name'
                                                            className='h-10 text-uppercase'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={ps.pasrpS_Address}
                                                            onChange={(e) => handlePrevSchoolChange(idx, 'pasrpS_Address', e.target.value)}
                                                            placeholder='Address'
                                                            className='h-10 text-uppercase'
                                                        />
                                                    </TableCell>
                                                    <TableCell className='text-center'>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            disabled={prevSchools.length <= 1}
                                                            onClick={() => handleRemovePrevSchool(idx)}
                                                            className='h-9 w-9 text-red-500 hover:bg-red-50'>
                                                            <Trash2 className='h-4 w-4' />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Button
                                        variant='outline'
                                        onClick={handleAddPrevSchool}
                                        disabled={prevSchools.length >= 3}
                                        className='h-10 border-indigo-200 text-indigo-600 hover:bg-indigo-50'>
                                        <Plus className='mr-2 h-4 w-4' /> Add Another School
                                    </Button>
                                </div>
                            </CollapsibleSection>

                            {/* Section 6: Other Details (Image 2 placement) */}
                            <CollapsibleSection
                                title='Other Details'
                                icon={<FileText className='h-5 w-5 text-indigo-600' />}
                                variant='outline'>
                                <div className='space-y-6 p-6'>
                                    <div className='space-y-2'>
                                        <Label className='font-bold text-slate-500 text-xs uppercase'>
                                            Reasons for admitting your child to school <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input
                                            value={reg.PASA_AdmittingReason}
                                            onChange={(e) => handleInputChange('PASA_AdmittingReason', e.target.value)}
                                            placeholder='State reasons for choosing this school'
                                            className='h-11'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='contribute_check'
                                                checked={reg.PASA_WillingToContributeFlg === 1}
                                                onCheckedChange={(c) => handleInputChange('PASA_WillingToContributeFlg', c ? 1 : 0)}
                                            />
                                            <Label htmlFor='contribute_check' className='font-semibold text-slate-700 text-sm'>
                                                Are you willing to contribute time and effort to help the school? Specify some ways:{' '}
                                                <span className='text-red-500'>*</span>
                                            </Label>
                                        </div>
                                        <Input
                                            value={reg.PASA_WillingToContributeRemarks}
                                            onChange={(e) => handleInputChange('PASA_WillingToContributeRemarks', e.target.value)}
                                            placeholder='Specify ways you can volunteer / contribute'
                                            className='h-11'
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Section 7: Document Upload Details (Image 2 placement) */}
                            <CollapsibleSection
                                title='Document Upload Details'
                                icon={<Upload className='h-5 w-5 text-indigo-600' />}
                                variant='outline'>
                                <div className='space-y-4 p-6'>
                                    <Table className='border border-slate-200'>
                                        <TableHeader>
                                            <TableRow className='bg-slate-50'>
                                                <TableHead className='w-14 text-center'>#</TableHead>
                                                <TableHead>Document Name</TableHead>
                                                <TableHead>File Upload</TableHead>
                                                <TableHead className='w-28 text-center'>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {documentList.map((doc, idx) => {
                                                const isBaptism = doc.amsmD_DocumentName?.toLowerCase().includes('baptism');
                                                const isMandatory =
                                                    (doc.amsmD_FLAG === true && !isBaptism) || (isRomanCatholic && isBaptism);

                                                return (
                                                    <TableRow key={idx}>
                                                        <TableCell className='text-center font-bold text-slate-400'>{idx + 1}</TableCell>
                                                        <TableCell className='font-medium text-slate-800 text-sm'>
                                                            {doc.amsmD_DocumentName}{' '}
                                                            {isMandatory && <span className='text-red-500'>*</span>}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className='flex items-center gap-2'>
                                                                <label className='flex cursor-pointer items-center rounded-lg border border-indigo-200 border-dashed bg-indigo-50/50 px-3 py-1.5 font-medium text-indigo-700 text-xs transition-colors hover:bg-indigo-100/50'>
                                                                    <Upload className='mr-1.5 h-3.5 w-3.5' /> Choose File
                                                                    <input
                                                                        type='file'
                                                                        accept='image/*,application/pdf'
                                                                        className='hidden'
                                                                        onChange={(e) => handleDocUpload(idx, e)}
                                                                    />
                                                                </label>
                                                                {doc.document_Path && <CheckCircle2 className='h-5 w-5 text-emerald-500' />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className='text-center'>
                                                            {doc.document_Path && (
                                                                <Button
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    onClick={() => {
                                                                        setPreviewDocUrl(doc.document_Path);
                                                                        setPreviewDocType(doc.filetype === 'pdf' ? 'pdf' : 'image');
                                                                        setDocPreviewModalOpen(true);
                                                                    }}
                                                                    className='font-bold text-indigo-600 text-xs'>
                                                                    <Eye className='mr-1 h-3.5 w-3.5' /> VIEW
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {documentList.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className='py-6 text-center text-slate-400 text-sm'>
                                                        No document requirements found for selected configuration.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CollapsibleSection>

                            {/* Section 8: Declaration & Undertaking */}
                            <CollapsibleSection
                                title='Declaration & Undertaking'
                                icon={<CheckCircle2 className='h-5 w-5 text-indigo-600' />}
                                variant='outline'>
                                <div className='space-y-4 p-6'>
                                    <p className='text-justify text-slate-600 text-sm leading-relaxed'>
                                        <strong>Declaration:</strong> I hereby state that, I will not bring any recommendations, by word or
                                        letter, to the school for the admission of my child or any other. If found violating it, I
                                        understand that admission will not be granted to my child. I agree to abide by the rules and
                                        regulations of the school. I also take the responsibility of applying for admission to other schools
                                        in case my child is not selected here. I certify that the information stated above is correct and
                                        true to the best of my knowledge.
                                    </p>
                                    <RadioGroup
                                        value={reg.PASR_UndertakingFlag}
                                        onValueChange={(v) => handleInputChange('PASR_UndertakingFlag', v)}
                                        className='flex gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='1' id='decl_yes' />
                                            <Label htmlFor='decl_yes' className='cursor-pointer font-bold text-sm'>
                                                Yes
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='0' id='decl_no' />
                                            <Label htmlFor='decl_no' className='cursor-pointer font-bold text-sm'>
                                                No
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </CollapsibleSection>

                            {/* Footer Actions (matching Image 1 & 2) */}
                            <div className='sticky right-0 bottom-6 left-0 z-10 flex justify-center'>
                                <Card className='flex items-center gap-4 rounded-full border border-slate-200/50 bg-white/90 px-8 py-4 shadow-2xl backdrop-blur-md'>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saveMutation.isPending}
                                        className='h-12 rounded-full bg-indigo-600 px-12 shadow-indigo-100 shadow-lg transition-all hover:bg-indigo-700 active:scale-95'>
                                        {saveMutation.isPending ? (
                                            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                        ) : (
                                            <Save className='mr-2 h-5 w-5' />
                                        )}
                                        SAVE REGISTRATION
                                    </Button>
                                    <Button
                                        variant='outline'
                                        className='h-12 rounded-full border-slate-200 px-12 hover:bg-slate-100'
                                        onClick={() => setView('payment')}>
                                        PROCEED TO PAYMENT
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        className='h-12 rounded-full px-8 text-slate-500 hover:bg-slate-100'
                                        onClick={handleClear}>
                                        CANCEL
                                    </Button>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* TAB 2: APPLICATIONS LIST */}
                <TabsContent value='list' className='fade-in slide-in-from-bottom-2 animate-in duration-300'>
                    <Card className='overflow-hidden rounded-3xl border-none shadow-xl'>
                        <CardHeader className='border-slate-100 border-b bg-white p-6'>
                            <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
                                <div className='space-y-1'>
                                    <CardTitle className='font-bold text-lg text-slate-800'>Applications Filled List</CardTitle>
                                    <CardDescription>
                                        Total registered records: <span className='font-bold text-indigo-600'>{filteredList.length}</span>
                                    </CardDescription>
                                </div>
                                <div className='relative w-full md:w-80'>
                                    <Search className='-translate-y-1/2 absolute top-1/2 left-3.5 h-4 w-4 text-slate-400' />
                                    <Input
                                        placeholder='Search by name or reg no...'
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        className='h-10 rounded-xl pl-10 text-sm'
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <DataTable
                                totalItems={filteredList.length}
                                columns={[
                                    {
                                        header: 'SL.NO',
                                        accessorKey: 'sno',
                                        cell: ({ row }: any) => <span className='font-bold text-slate-400'>{row.index + 1}</span>
                                    },
                                    {
                                        header: 'Student Name',
                                        accessorKey: 'name',
                                        cell: ({ row }: any) => {
                                            const name =
                                                row.original.name ||
                                                `${row.original.pasR_FirstName || ''} ${row.original.pasR_LastName || ''}`;
                                            return (
                                                <div className='flex items-center gap-3'>
                                                    <div className='flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border bg-slate-100'>
                                                        {row.original.pasR_Student_Pic_Path ? (
                                                            <img
                                                                src={row.original.pasR_Student_Pic_Path}
                                                                alt='Student Avatar'
                                                                className='h-full w-full object-cover'
                                                            />
                                                        ) : (
                                                            <User className='h-4 w-4 text-slate-400' />
                                                        )}
                                                    </div>
                                                    <span className='font-semibold text-slate-800 text-sm'>{name}</span>
                                                </div>
                                            );
                                        }
                                    },
                                    {
                                        header: 'Class',
                                        accessorKey: 'classname',
                                        cell: ({ row }: any) => (
                                            <Badge variant='outline'>
                                                {row.original.classname || row.original.asmcL_ClassName || 'Nursery'}
                                            </Badge>
                                        )
                                    },
                                    {
                                        header: 'Application No',
                                        accessorKey: 'pasR_Applicationno',
                                        cell: ({ row }: any) => (
                                            <span className='font-bold font-mono text-indigo-600 text-xs'>
                                                {row.original.pasR_Applicationno || row.original.pasR_RegistrationNo || '-'}
                                            </span>
                                        )
                                    },
                                    {
                                        header: 'Email',
                                        accessorKey: 'pasR_emailId',
                                        cell: ({ row }: any) => (
                                            <span className='text-slate-500 text-xs'>{row.original.pasR_emailId || '-'}</span>
                                        )
                                    },
                                    {
                                        header: 'Status',
                                        accessorKey: 'statusname',
                                        cell: ({ row }: any) => (
                                            <Badge
                                                variant={row.original.pasR_ActiveFlag !== 0 ? 'success' : 'destructive'}
                                                className='rounded-full px-3 font-semibold text-[10px]'>
                                                {row.original.statusname || (row.original.pasR_ActiveFlag !== 0 ? 'Active' : 'Inactive')}
                                            </Badge>
                                        )
                                    },
                                    {
                                        header: 'Actions',
                                        id: 'actions',
                                        cell: ({ row }: any) => {
                                            const id = row.original.pasR_Id || row.original.pasr_id;
                                            return (
                                                <div className='flex items-center gap-1.5'>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() => handleShowPrint(id)}
                                                        className='h-8 w-8 rounded-full text-indigo-600 hover:bg-indigo-50'
                                                        title='View Admission Form'>
                                                        <Eye className='h-4 w-4' />
                                                    </Button>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() => {
                                                            setReg((prev: any) => ({
                                                                ...prev,
                                                                pasR_Id: id,
                                                                PASR_FirstName: row.original.pasR_FirstName || row.original.name,
                                                                PASR_MobileNo: row.original.pasR_MobileNo,
                                                                PASR_emailId: row.original.pasR_emailId
                                                            }));
                                                            setView('payment');
                                                            setActiveTab('entry');
                                                        }}
                                                        className='h-8 w-8 rounded-full text-emerald-600 hover:bg-emerald-50'
                                                        title='Pay Registration Fee'>
                                                        <CreditCard className='h-4 w-4' />
                                                    </Button>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() => toggleStatusMutation.mutate(id)}
                                                        className='h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100'
                                                        title='Toggle Active'>
                                                        <ShieldAlert className='h-4 w-4' />
                                                    </Button>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() => handleDelete(id)}
                                                        className='h-8 w-8 rounded-full text-red-500 hover:bg-red-50'
                                                        title='Delete'>
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            );
                                        }
                                    }
                                ]}
                                data={filteredList}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* PRINT APPLICATION FORM DIALOG (#test / JSHSAPPH) */}
            <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
                <DialogContent className='max-h-[92vh] max-w-4xl overflow-y-auto p-0'>
                    <DialogHeader className='border-b p-4'>
                        <div className='flex items-center justify-between'>
                            <div className='space-y-1 text-left'>
                                <DialogTitle className='font-bold text-lg'>Print Admission Application</DialogTitle>
                                <DialogDescription className='text-xs'>
                                    Kindly select <strong>Save as PDF</strong> or select your printer after clicking{' '}
                                    <strong>Download/Print</strong>.
                                </DialogDescription>
                            </div>
                            <Button
                                onClick={handlePrintWindow}
                                className='rounded-xl bg-indigo-600 px-6 font-bold text-white hover:bg-indigo-700'>
                                <Printer className='mr-2 h-4 w-4' /> Download/Print
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className='p-6'>
                        {/* Printable container */}
                        <div id='JSHSAPPH' className='bg-white p-4 font-sans text-slate-900'>
                            {/* Header row */}
                            <div className='header-row flex items-center justify-between border-slate-900 border-b pb-3'>
                                <div>
                                    <h2 className='font-bold text-xl'>
                                        {printData?.studentReg_DTObj?.[0]?.pasR_Applicationno || 'APP'}:{' '}
                                        {printData?.studentReg_DTObj?.[0]?.pasR_FirstName || reg.PASR_FirstName}{' '}
                                        {printData?.studentReg_DTObj?.[0]?.pasR_MiddleName || reg.PASR_MiddleName}{' '}
                                        {printData?.studentReg_DTObj?.[0]?.pasR_LastName || reg.PASR_LastName}
                                    </h2>
                                </div>
                                <div>
                                    <span className='badge rounded border border-slate-400 bg-slate-50 px-3 py-1 font-bold text-sm'>
                                        Nursery Admission
                                    </span>
                                </div>
                            </div>

                            {/* Section: Photos */}
                            <div className='photos-container my-4 flex justify-around'>
                                <div className='text-center'>
                                    <div className='flex h-32 w-32 items-center justify-center border border-slate-800 bg-slate-50'>
                                        {printData?.studentphoto || reg.PASR_Student_Pic_Path ? (
                                            <img
                                                src={printData?.studentphoto || reg.PASR_Student_Pic_Path}
                                                alt='Student'
                                                className='photo-box h-32 w-32 object-cover'
                                            />
                                        ) : (
                                            <User className='h-12 w-12 text-slate-300' />
                                        )}
                                    </div>
                                    <span className='mt-1 block font-semibold text-xs'>Student</span>
                                </div>
                                <div className='text-center'>
                                    <div className='flex h-32 w-32 items-center justify-center border border-slate-800 bg-slate-50'>
                                        {printData?.fatherphoto || reg.PASR_FatherPhoto ? (
                                            <img
                                                src={printData?.fatherphoto || reg.PASR_FatherPhoto}
                                                alt='Father'
                                                className='photo-box h-32 w-32 object-cover'
                                            />
                                        ) : (
                                            <Users className='h-12 w-12 text-slate-300' />
                                        )}
                                    </div>
                                    <span className='mt-1 block font-semibold text-xs'>Father</span>
                                </div>
                                <div className='text-center'>
                                    <div className='flex h-32 w-32 items-center justify-center border border-slate-800 bg-slate-50'>
                                        {printData?.motherphoto || reg.PASR_MotherPhoto ? (
                                            <img
                                                src={printData?.motherphoto || reg.PASR_MotherPhoto}
                                                alt='Mother'
                                                className='photo-box h-32 w-32 object-cover'
                                            />
                                        ) : (
                                            <Users className='h-12 w-12 text-slate-300' />
                                        )}
                                    </div>
                                    <span className='mt-1 block font-semibold text-xs'>Mother</span>
                                </div>
                            </div>

                            {/* Section: Applicant Details */}
                            <div className='section-title mt-4 border-slate-300 border-b bg-slate-100 p-1.5 font-bold text-xs uppercase'>
                                Applicant Details
                            </div>
                            <div className='space-y-1.5 pt-2 text-xs'>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Applicant's full name:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>
                                        {printData?.studentReg_DTObj?.[0]?.pasR_FirstName || reg.PASR_FirstName}{' '}
                                        {printData?.studentReg_DTObj?.[0]?.pasR_MiddleName || reg.PASR_MiddleName}{' '}
                                        {printData?.studentReg_DTObj?.[0]?.pasR_LastName || reg.PASR_LastName}
                                    </span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Date of birth:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>
                                        {reg.PASR_DOB ? format(new Date(reg.PASR_DOB), 'dd/MM/yyyy') : '-'}
                                    </span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Sex:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>{reg.PASR_Sex}</span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Mother tongue:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>{reg.PASR_MotherTongue || '-'}</span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Kindergarten last attended:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>
                                        {prevSchools[0]?.pasrpS_PrvSchoolName || '-'}, {prevSchools[0]?.pasrpS_Address || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Section: Contact Details */}
                            <div className='section-title mt-4 border-slate-300 border-b bg-slate-100 p-1.5 font-bold text-xs uppercase'>
                                Contact Details
                            </div>
                            <div className='space-y-1.5 pt-2 text-xs'>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Residence Address:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>
                                        {reg.PASR_PerStreet}, {reg.PASR_PerArea}, {reg.PASR_PerCity} - {reg.PASR_PerPincode}
                                    </span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Mobile No. (For SMS):</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>{reg.PASR_MobileNo}</span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Email:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>{reg.PASR_emailId}</span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Siblings in Family:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>
                                        {siblings.filter((s) => s.pasrS_SiblingsName).length} child(ren)
                                    </span>
                                </div>
                            </div>

                            {/* Section: Father's Details */}
                            <div className='section-title mt-4 border-slate-300 border-b bg-slate-100 p-1.5 font-bold text-xs uppercase'>
                                Father's Details
                            </div>
                            <div className='space-y-1.5 pt-2 text-xs'>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Name of the Father:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>
                                        {reg.PASR_FatherName} {reg.PASR_FatherSurname}
                                    </span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Mobile No.:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>{reg.PASR_FatherMobleNo || '-'}</span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Occupation & Company:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>
                                        {reg.PASR_FatherOccupation || '-'} - {reg.PASA_FatherCompany || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Section: Mother's Details */}
                            <div className='section-title mt-4 border-slate-300 border-b bg-slate-100 p-1.5 font-bold text-xs uppercase'>
                                Mother's Details
                            </div>
                            <div className='space-y-1.5 pt-2 text-xs'>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Name of the Mother:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>
                                        {reg.PASR_MotherName} {reg.PASR_MotherSurname}
                                    </span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Mobile No.:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>{reg.PASR_MotherMobleNo || '-'}</span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Occupation & Company:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>
                                        {reg.PASR_MotherOccupation || '-'} - {reg.PASA_MotherCompany || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Section: Other Details */}
                            <div className='section-title mt-4 border-slate-300 border-b bg-slate-100 p-1.5 font-bold text-xs uppercase'>
                                Other Details
                            </div>
                            <div className='space-y-1.5 pt-2 text-xs'>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>
                                        Reasons for admitting child:
                                    </span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>{reg.PASA_AdmittingReason || '-'}</span>
                                </div>
                                <div className='info-row flex'>
                                    <span className='info-label w-64 text-right font-bold text-slate-600'>Willingness to contribute:</span>
                                    <span className='info-value ml-4 font-semibold text-slate-900'>
                                        {reg.PASA_WillingToContributeRemarks || 'Yes'}
                                    </span>
                                </div>
                            </div>

                            {/* Section: Signatures */}
                            <div className='sig-container mt-12 flex justify-between pt-6 text-xs'>
                                <div className='sig-block w-1/4 text-center'>
                                    <div className='sig-line border-slate-400 border-b border-dotted pb-6' />
                                    <span className='mt-2 block font-bold'>Signature of Father</span>
                                    <span className='mt-1 block text-slate-500'>Date:</span>
                                </div>
                                <div className='sig-block w-1/4 text-center'>
                                    <div className='sig-line border-slate-400 border-b border-dotted pb-6' />
                                    <span className='mt-2 block font-bold'>Signature of Mother</span>
                                    <span className='mt-1 block text-slate-500'>Date:</span>
                                </div>
                                <div className='sig-block w-1/4 text-center'>
                                    <div className='sig-line border-slate-400 border-b border-dotted pb-6' />
                                    <span className='mt-2 block font-bold'>Signature of Guardian</span>
                                    <span className='mt-1 block text-slate-500'>Date:</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* DOCUMENT PREVIEW MODAL */}
            <Dialog open={docPreviewModalOpen} onOpenChange={setDocPreviewModalOpen}>
                <DialogContent className='max-h-[90vh] max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle>Document Preview</DialogTitle>
                    </DialogHeader>
                    <div className='flex items-center justify-center p-4'>
                        {previewDocType === 'image' ? (
                            <img src={previewDocUrl} alt='Document' className='max-h-[70vh] rounded-xl object-contain shadow-md' />
                        ) : (
                            <iframe src={previewDocUrl} className='h-[70vh] w-full rounded-xl border' title='PDF Preview' />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
