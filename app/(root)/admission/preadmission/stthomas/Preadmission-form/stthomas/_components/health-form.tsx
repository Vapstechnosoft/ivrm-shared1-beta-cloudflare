'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    useSophiaRegistrationXIDeleteHealthDetails,
    useSophiaRegistrationXIEditHealthData,
    useSophiaRegistrationXISaveHealthCertificateDetail,
    useSophiaRegistrationXIStudentData
} from '@/hooks/admission/preadmission/transactions/useSophiaRegistrationXI';
import { useActivePreadmissionDetails, useDocumentDownload } from '@/hooks/admission/preadmission/useTransactions';
import { AlertCircle, ClipboardList, Edit3, HeartPulse, Plus, Trash2, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface IHealthFormFields {
    pashD_Id: number;
    pasR_Id: number;
    asmaY_ID: number;

    // Immunization & Vaccination Dates
    pashD_VaccinationDate: string;
    pashD_HepatitisB: string;
    pashD_TyphoidFever: string;

    // Illness / Fits History
    pashD_Illness: number; // 0 or 1
    pashD_FitsFlag: number; // 0 or 1
    pashD_FitsDate: string;

    // Descriptions
    pashD_Ailment: string;
    pashD_Allergy: string;
    pashD_HealthProblem: string;
    pashD_BloodGroup: string;
    pashD_AllergyFlg: boolean;
    pashD_CronicDesease: string;

    // Emergency details
    pashD_MEDetails: string;
    pashD_MEContactNo: string;

    // Infectious Diseases Flags & Dates
    pashD_ChickenpoxFlag: number;
    pashD_ChickenpoxDate: string;
    pashD_DiptheriaFlag: number;
    pashD_DiptheriaDate: string;
    pashD_EpidemicFlag: number;
    pashD_EpidemicDate: string;
    pashD_MeaslesFlag: number;
    pashD_MeaslesDate: string;
    pashD_MumpsFlag: number;
    pashD_MumpsDate: string;
    pashD_RingwormFlag: number;
    pashD_RingwormDate: string;
    pashD_ScarletFlag: number;
    pashD_ScarletDate: string;
    pashD_SmallPoxFlag: number;
    pashD_SmallPoxDate: string;
    pashD_WhoopingFlag: number;
    pashD_WhoopingDate: string;

    // Custom Radio/Checkbox states for UI only
    PASHD_UnderTakingRadio: string; // 'yes' or 'no'
}

const initialFormState: IHealthFormFields = {
    pashD_Id: 0,
    pasR_Id: 0,
    asmaY_ID: 0,

    pashD_VaccinationDate: '',
    pashD_HepatitisB: '',
    pashD_TyphoidFever: '',

    pashD_Illness: 0,
    pashD_FitsFlag: 0,
    pashD_FitsDate: '',

    pashD_Ailment: '',
    pashD_Allergy: '',
    pashD_HealthProblem: '',
    pashD_BloodGroup: '',
    pashD_AllergyFlg: false,
    pashD_CronicDesease: '',

    pashD_MEDetails: '',
    pashD_MEContactNo: '',

    pashD_ChickenpoxFlag: 0,
    pashD_ChickenpoxDate: '',
    pashD_DiptheriaFlag: 0,
    pashD_DiptheriaDate: '',
    pashD_EpidemicFlag: 0,
    pashD_EpidemicDate: '',
    pashD_MeaslesFlag: 0,
    pashD_MeaslesDate: '',
    pashD_MumpsFlag: 0,
    pashD_MumpsDate: '',
    pashD_RingwormFlag: 0,
    pashD_RingwormDate: '',
    pashD_ScarletFlag: 0,
    pashD_ScarletDate: '',
    pashD_SmallPoxFlag: 0,
    pashD_SmallPoxDate: '',
    pashD_WhoopingFlag: 0,
    pashD_WhoopingDate: '',

    PASHD_UnderTakingRadio: ''
};

function ViewApplicationButton({ pasrId }: { pasrId: number }) {
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);
    const [iframeLoading, setIframeLoading] = useState(false);

    const { mutate: downloadDocument, isPending: isLoading } = useDocumentDownload();

    const handleViewClick = () => {
        setShowPdfModal(true);
        if (!pdfBase64) {
            downloadDocument(pasrId, {
                onSuccess: (data) => {
                    const base64 =
                        (data?.data as any)?.pdfbase64 || (data?.data as any)?.pdfBase64 ||
                        (typeof data?.data === 'string'
                            ? data.data
                            : Array.isArray(data?.data)
                              ? ((data.data[0] as unknown as string) ?? null)
                              : null);
                    setPdfBase64(base64);
                },
                onError: (error) => {
                    console.error('Failed to load document:', error);
                    setPdfBase64(null);
                }
            });
        }
    };

    useEffect(() => {
        if (showPdfModal && pdfBase64) {
            setIframeLoading(true);
        }
        if (!showPdfModal) {
            setIframeLoading(false);
        }
    }, [showPdfModal, pdfBase64]);

    return (
        <>
            <Button
                type='button'
                variant='link'
                className='h-auto p-0 font-bold text-blue-600 text-xs hover:underline'
                onClick={handleViewClick}>
                View Application
            </Button>

            {showPdfModal && (
                <Dialog
                    open={showPdfModal}
                    onOpenChange={(open) => {
                        setShowPdfModal(open);
                        if (!open) {
                            setPdfBase64(null);
                        }
                    }}>
                    <DialogContent
                        className='flex h-[90vh] max-w-5xl flex-col p-0'
                        onInteractOutside={(e) => {
                            e.preventDefault();
                        }}>
                        <DialogHeader className='p-0'>
                            <DialogTitle className='pt-3 text-center font-bold text-lg'>Pre Admission Application Form</DialogTitle>
                        </DialogHeader>
                        <div className='relative min-h-0 flex-1 overflow-hidden'>
                            {(isLoading || iframeLoading) && (
                                <div className='absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
                                    <div className='transition-all'>
                                        <div className='flex flex-col items-center'>
                                            <Spinner size='lg' className='text-primary' />
                                            <p className='mt-3 font-medium text-gray-700 text-sm'>Loading document...</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className='relative h-full min-h-0 w-full'>
                                {pdfBase64 ? <div className='absolute top-3 right-3 z-30 flex gap-3' /> : null}

                                {typeof pdfBase64 === 'string' && pdfBase64 ? (
                                    <iframe
                                        src={
                                            pdfBase64.startsWith('data:') || pdfBase64.startsWith('http')
                                                ? pdfBase64
                                                : `data:application/pdf;base64,${pdfBase64}`
                                        }
                                        title='Pre Admission Application Form'
                                        className='h-full min-h-0 w-full border-0'
                                        style={{ display: iframeLoading ? 'none' : 'block' }}
                                        onLoad={() => setIframeLoading(false)}
                                    />
                                ) : (
                                    <div className='flex h-full items-center justify-center'>
                                        <div className='text-gray-500 text-sm'>{isLoading ? 'Loading...' : 'No document available'}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

export default function HealthForm() {
    const [formData, setFormData] = useState<IHealthFormFields>({
        ...initialFormState
    });
    const [students, setStudents] = useState<any[]>([]);
    const [savedRecords, setSavedRecords] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // API hooks
    const getStudentDataMut = useSophiaRegistrationXIStudentData();
    const editHealthDataMut = useSophiaRegistrationXIEditHealthData();
    const saveHealthDataMut = useSophiaRegistrationXISaveHealthCertificateDetail();
    const deleteHealthDataMut = useSophiaRegistrationXIDeleteHealthDetails();

    // Active preadmission hook
    const { data: activePreadmission } = useActivePreadmissionDetails();

    // Fetch initial data (student list and saved health certificates)
    const loadInitialData = async () => {
        try {
            const res = await getStudentDataMut.mutateAsync();
            if (res?.success && res?.data) {
                const data = res.data;
                // Capture students dropdown list
                const studentList = data.studentDetails || data.studentdetails || data.studentlist || data.studentList || [];
                setStudents(studentList);

                // Capture saved health certificates list
                const healthList =
                    data.studenthelth_DTObj ||
                    data.studenthelth_dtobj ||
                    data.studenthelthDetails ||
                    data.studenthelthdetails ||
                    data.helthlist ||
                    data.healthlist ||
                    data.helthdetailList ||
                    [];
                setSavedRecords(healthList);
            }
        } catch (error) {
            console.error('Error loading initial health data:', error);
            toast.error('Failed to load student registration list');
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    // Handle input field changes
    const handleInputChange = (field: keyof IHealthFormFields, value: any) => {
        setFormData((prev) => {
            const updated = { ...prev };
            (updated as any)[field] = value;
            return updated;
        });
    };

    // Reset form state
    const handleCancel = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setShowForm(false);
        toast.info('Form cleared');
    };

    // Save record to backend matching the exact requested payload format
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.pasR_Id) {
            toast.error('Please select a Student Name');
            return;
        }

        if (formData.PASHD_UnderTakingRadio !== 'yes') {
            toast.error('Please accept the Undertaking by the Parents/Guardian to submit');
            return;
        }

        try {
            // Helper to format ISO dates safely
            const formatToISOOrDefault = (dateStr: string) => {
                if (!dateStr) return new Date().toISOString();
                try {
                    return new Date(dateStr).toISOString();
                } catch {
                    return new Date().toISOString();
                }
            };

            const selectedStudent = students.find((s) => s.pasR_Id === formData.pasR_Id || s.PASR_Id === formData.pasR_Id);
            const studentAsmayId = selectedStudent?.asmaY_Id || selectedStudent?.ASMAY_Id || 0;
            const finalAsmayId = studentAsmayId || activePreadmission?.data?.asmaY_Id || 0;

            const payload = {
                pashD_Id: formData.pashD_Id,
                pasR_Id: formData.pasR_Id,
                asmaY_ID: finalAsmayId,
                ASMAY_Id: finalAsmayId,

                // Vaccination dates
                pashD_VaccinationDate: formatToISOOrDefault(formData.pashD_VaccinationDate),
                pashD_HepatitisB: formatToISOOrDefault(formData.pashD_HepatitisB),
                pashD_TyphoidFever: formatToISOOrDefault(formData.pashD_TyphoidFever),

                // Illness / Fits flags and dates
                pashD_Illness: Number(formData.pashD_Illness),
                pashD_FitsFlag: Number(formData.pashD_FitsFlag),
                pashD_FitsDate: formatToISOOrDefault(formData.pashD_FitsDate),

                // Texts, description & basic details
                pashD_Ailment: formData.pashD_Ailment || 'No illness',
                pashD_Allergy: formData.pashD_Allergy || 'None',
                pashD_HealthProblem: formData.pashD_HealthProblem || 'No',
                pashD_BloodGroup: formData.pashD_BloodGroup || 'O+',
                pashD_AllergyFlg: Boolean(formData.pashD_AllergyFlg),
                pashD_CronicDesease: formData.pashD_CronicDesease || 'No',

                // Emergency
                pashD_MEDetails: formData.pashD_MEDetails || 'Emergency contact details',
                pashD_MEContactNo: formData.pashD_MEContactNo ? String(formData.pashD_MEContactNo) : '0',

                // Infectious Diseases Flags & Dates
                pashD_ChickenpoxFlag: Number(formData.pashD_ChickenpoxFlag),
                pashD_ChickenpoxDate: formatToISOOrDefault(formData.pashD_ChickenpoxDate),
                pashD_DiptheriaFlag: Number(formData.pashD_DiptheriaFlag),
                pashD_DiptheriaDate: formatToISOOrDefault(formData.pashD_DiptheriaDate),
                pashD_EpidemicFlag: Number(formData.pashD_EpidemicFlag),
                pashD_EpidemicDate: formatToISOOrDefault(formData.pashD_EpidemicDate),
                pashD_MeaslesFlag: Number(formData.pashD_MeaslesFlag),
                pashD_MeaslesDate: formatToISOOrDefault(formData.pashD_MeaslesDate),
                pashD_MumpsFlag: Number(formData.pashD_MumpsFlag),
                pashD_MumpsDate: formatToISOOrDefault(formData.pashD_MumpsDate),
                pashD_RingwormFlag: Number(formData.pashD_RingwormFlag),
                pashD_RingwormDate: formatToISOOrDefault(formData.pashD_RingwormDate),
                pashD_ScarletFlag: Number(formData.pashD_ScarletFlag),
                pashD_ScarletDate: formatToISOOrDefault(formData.pashD_ScarletDate),
                pashD_SmallPoxFlag: Number(formData.pashD_SmallPoxFlag),
                pashD_SmallPoxDate: formatToISOOrDefault(formData.pashD_SmallPoxDate),
                pashD_WhoopingFlag: Number(formData.pashD_WhoopingFlag),
                pashD_WhoopingDate: formatToISOOrDefault(formData.pashD_WhoopingDate)
            };

            const res = await saveHealthDataMut.mutateAsync(payload);
            if (res?.success || (res as any) === true) {
                const backendMsg =
                    res?.message || (isEditing ? 'Health Certificate updated successfully!' : 'Health Certificate submitted successfully!');
                toast.success(backendMsg);

                // If the backend returned the saved data, we update the savedRecords local state immediately for instant UI feedback
                if (res?.data) {
                    const savedItem = res.data;
                    setSavedRecords((prev) => {
                        const exists = prev.some((r) => (r.pashD_Id || r.PASHD_Id) === (savedItem.pashD_Id || savedItem.PASHD_Id));
                        if (exists) {
                            return prev.map((r) =>
                                (r.pashD_Id || r.PASHD_Id) === (savedItem.pashD_Id || savedItem.PASHD_Id) ? savedItem : r
                            );
                        }
                        return [savedItem, ...prev];
                    });
                }

                setFormData(initialFormState);
                setIsEditing(false);
                setShowForm(false);
                loadInitialData();
            } else {
                toast.error(res?.message || 'Failed to save health certificate');
            }
        } catch (error: any) {
            console.error('Error saving health certificate:', error);
            toast.error(error?.message || 'An error occurred while saving health details');
        }
    };

    // Load dynamic record into editing state with robust matching
    const handleEdit = async (record: any) => {
        const pashdId = record.pashD_Id || record.PASHD_Id;
        if (!pashdId) {
            toast.error('Invalid record selected for edit');
            return;
        }

        try {
            const res = await editHealthDataMut.mutateAsync(pashdId);
            if (res?.success && res?.data) {
                // Populate/merge students dropdown list if returned by edit response
                const editStudents = res.data.studentDetails || res.data.studentdetails || res.data.studentlist || res.data.studentList;
                if (editStudents && editStudents.length > 0) {
                    setStudents((prev) => {
                        const merged = [...prev];
                        for (const stu of editStudents) {
                            const id = stu.pasR_Id || stu.PASR_Id;
                            if (!merged.some((s) => (s.pasR_Id || s.PASR_Id) === id)) {
                                merged.push(stu);
                            }
                        }
                        return merged;
                    });
                }

                const healthDetails =
                    res.data.studenthelth_DTObj?.[0] ||
                    res.data.studenthelth_dtobj?.[0] ||
                    res.data.studenthelthDetails?.[0] ||
                    res.data.studenthelthdetails?.[0] ||
                    res.data.helthdetailList?.[0] ||
                    res.data.healthlist?.[0] ||
                    res.data.helthlist?.[0] ||
                    record;

                // Format dates safely for input type="date" (YYYY-MM-DD)
                const formatDateStr = (dateVal: any) => {
                    if (!dateVal) return '';
                    try {
                        const d = new Date(dateVal);
                        if (Number.isNaN(d.getTime())) return '';
                        return d.toISOString().split('T')[0];
                    } catch {
                        return '';
                    }
                };

                setFormData({
                    pashD_Id: healthDetails.pashD_Id || healthDetails.PASHD_Id || pashdId,
                    pasR_Id: healthDetails.pasR_Id || healthDetails.PASR_Id || 0,
                    asmaY_ID: healthDetails.asmaY_ID || healthDetails.ASMAY_Id || 0,

                    pashD_VaccinationDate: formatDateStr(healthDetails.pashD_VaccinationDate || healthDetails.PASHD_VaccinationDate),
                    pashD_HepatitisB: formatDateStr(healthDetails.pashD_HepatitisB || healthDetails.PASHD_HepatitisB),
                    pashD_TyphoidFever: formatDateStr(healthDetails.pashD_TyphoidFever || healthDetails.PASHD_TyphoidFever),

                    pashD_Illness: Number(healthDetails.pashD_Illness || healthDetails.PASHD_Illness || 0),
                    pashD_FitsFlag: Number(healthDetails.pashD_FitsFlag || healthDetails.PASHD_FitsFlag || 0),
                    pashD_FitsDate: formatDateStr(healthDetails.pashD_FitsDate || healthDetails.PASHD_FitsDate),

                    pashD_Ailment: healthDetails.pashD_Ailment || healthDetails.PASHD_Ailment || '',
                    pashD_Allergy: healthDetails.pashD_Allergy || healthDetails.PASHD_Allergy || '',
                    pashD_HealthProblem: healthDetails.pashD_HealthProblem || healthDetails.PASHD_HealthProblem || '',
                    pashD_BloodGroup: healthDetails.pashD_BloodGroup || healthDetails.PASHD_BloodGroup || '',
                    pashD_AllergyFlg: Boolean(
                        healthDetails.pashD_AllergyFlg || healthDetails.PASHD_AllergyFlg || healthDetails.pashD_AllergyFlg === 1
                    ),
                    pashD_CronicDesease:
                        healthDetails.pashD_CronicDesease ||
                        healthDetails.PASHD_CronicDesease ||
                        healthDetails.pashD_ChronicDisorderDetails ||
                        '',

                    pashD_MEDetails:
                        healthDetails.pashD_MEDetails || healthDetails.PASHD_MEDetails || healthDetails.pashD_PreferredHospital || '',
                    pashD_MEContactNo:
                        healthDetails.pashD_MEContactNo || healthDetails.PASHD_MEContactNo || healthDetails.pashD_EmergencyContactNo || '',

                    pashD_ChickenpoxFlag: Number(healthDetails.pashD_ChickenpoxFlag || healthDetails.PASHD_ChickenpoxFlag || 0),
                    pashD_ChickenpoxDate: formatDateStr(healthDetails.pashD_ChickenpoxDate || healthDetails.PASHD_ChickenpoxDate),
                    pashD_DiptheriaFlag: Number(healthDetails.pashD_DiptheriaFlag || healthDetails.PASHD_DiptheriaFlag || 0),
                    pashD_DiptheriaDate: formatDateStr(healthDetails.pashD_DiptheriaDate || healthDetails.PASHD_DiptheriaDate),
                    pashD_EpidemicFlag: Number(healthDetails.pashD_EpidemicFlag || healthDetails.PASHD_EpidemicFlag || 0),
                    pashD_EpidemicDate: formatDateStr(healthDetails.pashD_EpidemicDate || healthDetails.PASHD_EpidemicDate),
                    pashD_MeaslesFlag: Number(healthDetails.pashD_MeaslesFlag || healthDetails.PASHD_MeaslesFlag || 0),
                    pashD_MeaslesDate: formatDateStr(healthDetails.pashD_MeaslesDate || healthDetails.PASHD_MeaslesDate),
                    pashD_MumpsFlag: Number(healthDetails.pashD_MumpsFlag || healthDetails.PASHD_MumpsFlag || 0),
                    pashD_MumpsDate: formatDateStr(healthDetails.pashD_MumpsDate || healthDetails.PASHD_MumpsDate),
                    pashD_RingwormFlag: Number(healthDetails.pashD_RingwormFlag || healthDetails.PASHD_RingwormFlag || 0),
                    pashD_RingwormDate: formatDateStr(healthDetails.pashD_RingwormDate || healthDetails.PASHD_RingwormDate),
                    pashD_ScarletFlag: Number(healthDetails.pashD_ScarletFlag || healthDetails.PASHD_ScarletFlag || 0),
                    pashD_ScarletDate: formatDateStr(healthDetails.pashD_ScarletDate || healthDetails.PASHD_ScarletDate),
                    pashD_SmallPoxFlag: Number(healthDetails.pashD_SmallPoxFlag || healthDetails.PASHD_SmallPoxFlag || 0),
                    pashD_SmallPoxDate: formatDateStr(healthDetails.pashD_SmallPoxDate || healthDetails.PASHD_SmallPoxDate),
                    pashD_WhoopingFlag: Number(healthDetails.pashD_WhoopingFlag || healthDetails.PASHD_WhoopingFlag || 0),
                    pashD_WhoopingDate: formatDateStr(healthDetails.pashD_WhoopingDate || healthDetails.PASHD_WhoopingDate),

                    PASHD_UnderTakingRadio: 'yes'
                });
                setIsEditing(true);
                setShowForm(true);
                toast.success('Record loaded for edit');
            } else {
                toast.error('Failed to retrieve health certificate details');
            }
        } catch (error) {
            console.error('Error fetching edit details:', error);
            toast.error('Failed to load certificate edit data');
        }
    };

    // Delete record with confirmation
    const handleDelete = async (record: any) => {
        const pashdId = record.pashD_Id || record.PASHD_Id;
        if (!pashdId) {
            toast.error('Invalid record ID');
            return;
        }

        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this health certificate!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await deleteHealthDataMut.mutateAsync(pashdId);
                    if (res?.success || (res as any) === true) {
                        Swal.fire('Deleted!', 'Health certificate has been removed.', 'success');
                        loadInitialData();
                        if (formData.pashD_Id === pashdId) {
                            handleCancel();
                        }
                    } else {
                        toast.error(res?.message || 'Failed to delete health certificate');
                    }
                } catch (error) {
                    console.error('Error deleting record:', error);
                    toast.error('Failed to remove health certificate');
                }
            }
        });
    };

    const getFullName = (stu: any) => {
        if (!stu) return '';
        const firstName = stu.pasR_FirstName || stu.pasr_FirstName || stu.studentName || stu.student_Name || stu.student_name || '';
        const middleName = stu.pasR_MiddleName || stu.pasr_MiddleName || '';
        const lastName = stu.pasR_LastName || stu.pasr_LastName || '';
        if (stu.pasR_FirstName || stu.pasr_FirstName) {
            return [firstName, middleName, lastName].filter((n) => n && String(n).trim() !== '').join(' ');
        }
        return firstName;
    };

    const getStudentName = (record: any) => {
        if (!record) return 'Unknown Student';
        const pasrId = typeof record === 'object' ? record.pasR_Id || record.PASR_Id : record;
        const student = students.find((s) => s.pasR_Id === pasrId || s.PASR_Id === pasrId);
        if (student) {
            return getFullName(student);
        }
        if (typeof record === 'object') {
            return getFullName(record) || 'Unknown Student';
        }
        return 'Unknown Student';
    };

    const getStudentEmail = (record: any) => {
        if (!record) return '-';
        const pasrId = typeof record === 'object' ? record.pasR_Id || record.PASR_Id : record;
        const student = students.find((s) => s.pasR_Id === pasrId || s.PASR_Id === pasrId);
        if (student) {
            return student.pasR_EmailId || student.PASR_EmailId || student.emailId || student.email || '-';
        }
        if (typeof record === 'object') {
            return record.pasR_EMAIL || record.pasR_EmailId || record.PASR_EmailId || record.emailId || record.email || '-';
        }
        return '-';
    };

    const getStudentPaymentStatus = (pasrId: number) => {
        const student = students.find((s) => s.pasR_Id === pasrId || s.PASR_Id === pasrId);
        if (!student) return <span className='font-semibold text-slate-400 text-xs'>-</span>;

        const isFeeApplicable = student.is_fee_applicable || student.isFeeApplicable || 0;
        const paymentStatus = student.payment_status || student.paymentStatus || 0;

        if (isFeeApplicable === 1) {
            if (paymentStatus === 0) {
                return (
                    <span className='inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 font-bold text-red-700 text-xs'>
                        Unpaid
                    </span>
                );
            }
            return (
                <span className='inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 font-bold text-green-700 text-xs'>
                    Paid
                </span>
            );
        }
        return (
            <span className='inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-bold text-slate-500 text-xs'>
                No Fee
            </span>
        );
    };

    const renderApplicationAndPayment = (record: any) => {
        const pasrId = record.pasR_Id || record.PASR_Id;

        return (
            <div className='flex flex-col items-start gap-1'>
                <ViewApplicationButton pasrId={pasrId} />
                {getStudentPaymentStatus(pasrId)}
            </div>
        );
    };

    const infectiousDiseasesList = [
        { label: 'Chickenpox', flagKey: 'pashD_ChickenpoxFlag', dateKey: 'pashD_ChickenpoxDate' },
        { label: 'Diphtheria', flagKey: 'pashD_DiptheriaFlag', dateKey: 'pashD_DiptheriaDate' },
        { label: 'Epidemic Meningitis', flagKey: 'pashD_EpidemicFlag', dateKey: 'pashD_EpidemicDate' },
        { label: 'Measles', flagKey: 'pashD_MeaslesFlag', dateKey: 'pashD_MeaslesDate' },
        { label: 'Mumps', flagKey: 'pashD_MumpsFlag', dateKey: 'pashD_MumpsDate' },
        { label: 'Ringworm', flagKey: 'pashD_RingwormFlag', dateKey: 'pashD_RingwormDate' },
        { label: 'Scarlet Fever', flagKey: 'pashD_ScarletFlag', dateKey: 'pashD_ScarletDate' },
        { label: 'Smallpox', flagKey: 'pashD_SmallPoxFlag', dateKey: 'pashD_SmallPoxDate' },
        { label: 'Whooping Cough', flagKey: 'pashD_WhoopingFlag', dateKey: 'pashD_WhoopingDate' }
    ];

    return (
        <div className='fade-in animate-in space-y-8 duration-500'>
            {/* Action Bar / Toggle Button */}
            {!showForm && (
                <div className='flex justify-end'>
                    <Button
                        onClick={() => {
                            setFormData(initialFormState);
                            setIsEditing(false);
                            setShowForm(true);
                        }}
                        className='flex h-10 items-center gap-2 rounded-lg bg-[#0f4c81] px-6 font-bold text-white text-xs uppercase tracking-wider shadow-sm transition-all hover:bg-[#0f4c81]/90'>
                        <Plus className='h-4 w-4' /> Add Health Form
                    </Button>
                </div>
            )}

            {/* Form card */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className='relative space-y-6 rounded-xl border border-slate-200 bg-white p-6 duration-300 md:p-8'>
                    <div className='absolute top-0 left-0 h-[4px] w-full bg-[#0f4c81]' />

                    {/* Header */}
                    <div className='flex items-center justify-between border-slate-100 border-b pb-4'>
                        <div className='flex items-center space-x-2'>
                            <HeartPulse className='h-6 w-6 text-[#0f4c81]' />
                            <h2 className='font-bold text-slate-800 text-sm uppercase tracking-wider'>HEALTH CERTIFICATE</h2>
                        </div>
                        {/* Close button */}
                        <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={handleCancel}
                            className='h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600'>
                            <X className='h-4 w-4' />
                        </Button>
                    </div>

                    <div className='space-y-6'>
                        {/* Student Name */}
                        <div className='flex flex-col space-y-2'>
                            <Label className='font-bold text-slate-700 text-sm'>
                                Student Name: <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                value={formData.pasR_Id ? String(formData.pasR_Id) : ''}
                                onValueChange={(val) => handleInputChange('pasR_Id', Number(val))}
                                disabled={isEditing}>
                                <SelectTrigger className='h-10 w-full rounded-lg border-slate-300 bg-white focus:ring-2 focus:ring-blue-500'>
                                    <SelectValue placeholder='Select Student Name' />
                                </SelectTrigger>
                                <SelectContent className='rounded-lg shadow-xl'>
                                    {students.map((stu) => {
                                        const id = stu.pasR_Id || stu.PASR_Id;
                                        const name = getFullName(stu);
                                        const regNo = stu.pasR_RegistrationNo || stu.PASR_RegistrationNo || '';
                                        return (
                                            <SelectItem key={id} value={String(id)} className='rounded-lg'>
                                                {name} {regNo && `(${regNo})`}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Infectious Diseases Grid: 1. State whether the child has been through */}
                        <div className='flex flex-col space-y-3'>
                            <Label className='font-bold text-slate-700 text-sm'>1.State whether the child has been through:</Label>
                            <div className='grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 md:grid-cols-2 lg:grid-cols-3'>
                                {infectiousDiseasesList.map((disease) => {
                                    const hasDisease = Number((formData as any)[disease.flagKey]) === 1;

                                    return (
                                        <div
                                            key={disease.flagKey}
                                            className={`rounded-xl border p-4 transition-all duration-200 ${
                                                hasDisease
                                                    ? 'border-orange-200 bg-orange-50/40 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}>
                                            <div className='flex items-center justify-between'>
                                                <Label
                                                    htmlFor={disease.flagKey}
                                                    className='flex cursor-pointer items-center gap-2 font-bold text-slate-700 text-xs'>
                                                    <Checkbox
                                                        id={disease.flagKey}
                                                        checked={hasDisease}
                                                        onCheckedChange={(checked) => {
                                                            handleInputChange(disease.flagKey as any, checked === true ? 1 : 0);
                                                            if (!checked) {
                                                                handleInputChange(disease.dateKey as any, '');
                                                            }
                                                        }}
                                                    />
                                                    {disease.label}
                                                </Label>
                                            </div>

                                            {hasDisease && (
                                                <div className='slide-in-from-top-1 mt-3 flex animate-in flex-col space-y-1.5 duration-200'>
                                                    <Label className='font-medium text-[10px] text-slate-500 uppercase tracking-wider'>
                                                        When did the child have this?
                                                    </Label>
                                                    <InputText
                                                        type='date'
                                                        value={(formData as any)[disease.dateKey] || ''}
                                                        onChange={(e) => handleInputChange(disease.dateKey as any, e.target.value)}
                                                        className='h-8 rounded-lg border-slate-200 bg-white text-xs focus:ring-1 focus:ring-blue-500'
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Allergy: 2. Is the child allergic to any Drug/Food? */}
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='flex flex-col space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/30 p-4'>
                                <Label className='font-bold text-slate-700 text-sm'>
                                    2. Is the child allergic to any Drug/Food?: <span className='text-red-500'>*</span>
                                </Label>
                                <RadioGroup
                                    value={formData.pashD_AllergyFlg ? 'yes' : 'no'}
                                    onValueChange={(val) => handleInputChange('pashD_AllergyFlg', val === 'yes')}
                                    className='flex items-center space-x-6 pl-1'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='yes' id='allergic-yes' />
                                        <Label htmlFor='allergic-yes' className='cursor-pointer font-semibold text-slate-600 text-xs'>
                                            Yes
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='no' id='allergic-no' />
                                        <Label htmlFor='allergic-no' className='cursor-pointer font-semibold text-slate-600 text-xs'>
                                            No
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Conditional input for Allergy details */}
                            {formData.pashD_AllergyFlg && (
                                <div className='slide-in-from-top-2 flex animate-in flex-col space-y-2 duration-200'>
                                    <Label className='font-bold text-slate-700 text-sm'>Allergy Details:</Label>
                                    <InputTextarea
                                        value={formData.pashD_Allergy || ''}
                                        onChange={(e) => handleInputChange('pashD_Allergy', e.target.value)}
                                        placeholder='Specify allergic details (Drug / Food)...'
                                        className='min-h-[80px] w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500'
                                    />
                                </div>
                            )}
                        </div>

                        {/* Congenital Disease Textarea: 3. Any congenital disease/chronic disorder */}
                        <div className='flex flex-col space-y-2'>
                            <Label className='font-bold text-slate-700 text-sm'>
                                3. Any congenital disease/chronic disorder{' '}
                                <span className='font-normal text-slate-400 text-xs'>
                                    (e.g. Heart, Asthma, for which treatment is followed)
                                </span>
                            </Label>
                            <InputTextarea
                                value={formData.pashD_CronicDesease || ''}
                                onChange={(e) => handleInputChange('pashD_CronicDesease', e.target.value)}
                                placeholder='Specify congenital disease or chronic disorder if any...'
                                className='min-h-[90px] w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500'
                            />
                        </div>

                        {/* Any other remarks (placeholder HealthProblem): 4. Any other remarks */}
                        <div className='flex flex-col space-y-2'>
                            <Label className='font-bold text-slate-700 text-sm'>
                                4. Any other remarks <span className='text-red-500'>*</span>:
                            </Label>
                            <InputTextarea
                                value={formData.pashD_HealthProblem || ''}
                                onChange={(e) => handleInputChange('pashD_HealthProblem', e.target.value)}
                                placeholder='Specify any general health concerns or remarks...'
                                className='min-h-[80px] w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500'
                            />
                        </div>

                        {/* Doctor Details: 5. Provide Details of the Doctor/Nursing Home/hospital... */}
                        <div className='flex flex-col space-y-2'>
                            <Label className='font-bold text-slate-700 text-sm'>
                                5. Provide Details of the Doctor/Nursing Home/hospital preferred for the child to be Referred in case of any
                                medical emergency.
                            </Label>
                            <InputTextarea
                                value={formData.pashD_MEDetails || ''}
                                onChange={(e) => handleInputChange('pashD_MEDetails', e.target.value)}
                                placeholder='Specify doctor or hospital name, contact, and address...'
                                className='min-h-[80px] w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500'
                            />
                        </div>

                        {/* Emergency Contact Number: 6. Emergency Contact Number */}
                        <div className='flex flex-col space-y-2'>
                            <Label className='font-bold text-slate-700 text-sm'>
                                6. Emergency Contact Number <span className='text-red-500'>*</span>:
                            </Label>
                            <InputText
                                value={formData.pashD_MEContactNo || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/[^\d]/.test(value)) {
                                        toast.error('Please enter numbers only for Emergency Contact Number.');
                                        return;
                                    }
                                    handleInputChange('pashD_MEContactNo', value);
                                }}
                                placeholder='Enter emergency contact number'
                                className='h-10 w-full rounded-lg border-slate-300 bg-white focus:ring-2 focus:ring-blue-500'
                            />
                        </div>

                        {/* Declaration text */}
                        <div className='rounded-xl border border-slate-150 bg-slate-50/70 p-4 font-semibold text-[11px] text-slate-500 leading-relaxed'>
                            I hereby certify that to the best of my knowledge and belief that the above information is right (including
                            those already mentioned). I bind myself to abide by the rules of the school.
                        </div>

                        {/* Undertaking block */}
                        <div className='flex flex-col space-y-4 pt-2'>
                            <Label className='font-bold text-slate-700 text-sm'>
                                Undertaking by the Parents/Guardian: <span className='text-red-500'>*</span>
                            </Label>
                            <p className='rounded-xl border border-blue-100/60 bg-blue-50/50 p-4 font-semibold text-[11px] text-slate-500 leading-relaxed'>
                                I and my ward will abide by and accept the rules of the school. I shall pay all the school fees quarterly or
                                annually. I am willing to pay all other dues as necessary. I have no objection to my child participating in
                                any extra curricular activities run by the school.
                            </p>
                            <RadioGroup
                                value={formData.PASHD_UnderTakingRadio || ''}
                                onValueChange={(val) => handleInputChange('PASHD_UnderTakingRadio', val)}
                                className='flex items-center space-x-6 pl-1'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='yes' id='undertaking-yes' />
                                    <Label htmlFor='undertaking-yes' className='cursor-pointer font-semibold text-slate-600 text-xs'>
                                        Yes
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='no' id='undertaking-no' />
                                    <Label htmlFor='undertaking-no' className='cursor-pointer font-semibold text-slate-600 text-xs'>
                                        No
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    {/* Submit & Clear Buttons */}
                    <div className='flex justify-center space-x-4 border-slate-100 border-t pt-6'>
                        <Button
                            type='submit'
                            className='h-10 rounded-lg bg-blue-600 px-8 font-bold text-white text-xs uppercase tracking-wider transition-all hover:bg-blue-700'>
                            SUBMIT
                        </Button>
                        <Button
                            type='button'
                            onClick={handleCancel}
                            className='h-10 rounded-lg bg-orange-500 px-8 font-bold text-white text-xs uppercase tracking-wider transition-all hover:bg-orange-600'>
                            CLEAR
                        </Button>
                    </div>
                </form>
            )}

            {/* List Header and Data Grid */}
            <div className='space-y-6 rounded-xl border border-slate-200 bg-white p-6 md:p-8'>
                <div className='flex items-center space-x-2 border-slate-100 border-b pb-4'>
                    <ClipboardList className='h-5 w-5 text-blue-600' />
                    <h3 className='font-bold text-slate-800 text-sm uppercase tracking-wider'>STUDENTS HEALTH CERTIFICATES LIST</h3>
                </div>

                {savedRecords.length === 0 ? (
                    <div className='flex flex-col items-center justify-center space-y-2 rounded-xl border border-slate-200 border-dashed bg-slate-50/20 py-10 text-center'>
                        <AlertCircle className='h-8 w-8 text-slate-300' />
                        <h4 className='font-bold text-slate-700 text-xs'>NO CERTIFICATES FOUND</h4>
                        <p className='max-w-xs text-[11px] text-slate-500'>There are no health certificates registered yet.</p>
                    </div>
                ) : (
                    <div className='overflow-x-auto rounded-lg border border-slate-200 shadow-sm'>
                        <table className='w-full border-collapse text-left'>
                            <thead className='bg-[#0f4c81] text-white'>
                                <tr className='border-slate-200 border-b font-bold text-xs uppercase tracking-wider'>
                                    <th className='px-4 py-4 font-bold text-white'>SL.NO</th>
                                    <th className='px-4 py-4 font-bold text-white'>Name</th>
                                    <th className='px-4 py-4 font-bold text-white'>Email</th>
                                    <th className='px-4 py-4 text-center font-bold text-white'>Action</th>
                                    <th className='px-4 py-4 font-bold text-white'>Application Form / Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {savedRecords.map((record, index) => {
                                    const id = record.pashD_Id || record.PASHD_Id;
                                    const _pasrId = record.pasR_Id || record.PASR_Id;

                                    return (
                                        <tr
                                            key={id || index}
                                            className='border-slate-100 border-b text-slate-600 text-xs transition-colors even:bg-slate-50/20 hover:bg-slate-50/50'>
                                            <td className='px-4 py-3.5 font-bold text-slate-700'>{index + 1}</td>
                                            <td className='px-4 py-3.5 font-bold text-slate-800'>{getStudentName(record)}</td>
                                            <td className='px-4 py-3.5 font-medium text-slate-600'>{getStudentEmail(record)}</td>
                                            <td className='px-4 py-3.5 text-center'>
                                                <div className='flex items-center justify-center space-x-1.5'>
                                                    <Button
                                                        onClick={() => handleEdit(record)}
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-8 w-8 rounded-lg text-blue-600 transition-colors hover:bg-blue-50'
                                                        title='Edit Record'>
                                                        <Edit3 className='h-4 w-4' />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(record)}
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-8 w-8 rounded-lg text-destructive transition-colors hover:bg-destructive/10'
                                                        title='Delete Record'>
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className='px-4 py-3.5'>{renderApplicationAndPayment(record)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
