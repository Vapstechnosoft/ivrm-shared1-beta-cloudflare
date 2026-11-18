'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    useNdaPhotoApprovalList,
    useNdaPhotoInitialData,
    useNdaPhotoSave
} from '@/hooks/admission/preadmission/useNdaStudentPhotoApproval';
import { Camera, ChevronRight, Loader2, UserSquare2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { NdaStaffPhotoList } from './_components/NdaStaffPhotoList';
import { NdaStudentPhotoList } from './_components/NdaStudentPhotoList';
import { NdaStudentPhotoSearch } from './_components/NdaStudentPhotoSearch';

export default function NdaStudentPhotoApprovalPage() {
    const [selectionType, setSelectionType] = useState<'Student' | 'Staff'>('Student');
    const [results, setResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Data fetching
    const { data: initialData, isLoading: isInitialLoading } = useNdaPhotoInitialData(selectionType);
    const listMutation = useNdaPhotoApprovalList();
    const saveMutation = useNdaPhotoSave();

    // Sync initial results if returned by Getdata
    useEffect(() => {
        if (initialData?.studentList?.length > 0) {
            setResults(initialData.studentList);
            setShowResults(true);
        }
    }, [initialData]);

    const handleSearch = async (formData: any) => {
        try {
            setSelectionType(formData.type);
            const payload = {
                dup: formData.type,
                ASMAY_Id: formData.academic_year ? Number(formData.academic_year) : undefined,
                ASMCL_Id: formData.classname ? Number(formData.classname) : undefined,
                ASMS_Id: formData.sectionname ? Number(formData.sectionname) : undefined
            };

            const res = (await listMutation.mutateAsync(payload)) as any;

            const records = Array.isArray(res) ? res : res?.studentList || res?.ndA_Studentphotodata || res?.data || [];
            if (records.length > 0) {
                setResults(records);
                setShowResults(true);
                toast.success(`Fetched ${records.length} ${formData.type} records`);
            } else {
                setResults([]);
                setShowResults(false);
                toast.error(`No records found for the selected criteria`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to fetch records');
        }
    };

    const handleSave = async (selectedRecords: any[]) => {
        try {
            // Map records to the exact field names and structure required by the latest API payload
            const mappedRecords = selectedRecords.map((r: any) => ({
                astureQ_Id: r.ASTUREQ_Id,
                amsT_Id: r.AMST_Id,
                astureQ_ConformFlg: Number(r.ASTUREQ_ConformFlg || 0),
                astureQ_ConformFlgM: Number(r.ASTUREQ_ConformFlgM || 0),
                astureQ_ConformFlgF: Number(r.ASTUREQ_ConformFlgF || 0),
                astureQ_ConformFlgG: Number(r.ASTUREQ_ConformFlgG || 0),
                studentName: r.StudentName,
                astureQ_AdmNo: r.ASTUREQ_AdmNo,
                astureQ_StudentPhoto: r.ASTUREQ_StudentPhoto,
                astureQ_FatherPhoto: r.ASTUREQ_FatherPhoto,
                astureQ_MotherPhoto: r.ASTUREQ_MotherPhoto,
                astureQ_GuardianPhoto: r.ASTUREQ_GuardianPhoto,
                astureQ_PickupOnePhoto: r.ASTUREQ_PickupOnePhoto,
                astureQ_PickupTwoPhoto: r.ASTUREQ_PickupTwoPhoto,
                astureQ_ConformFlgPickupOne: Number(r.ASTUREQ_ConformFlgPickupOne || 0),
                astureQ_ConformFlgPickupTwo: Number(r.ASTUREQ_ConformFlgPickupTwo || 0)
            }));

            const payload = {
                selectedImageslist: mappedRecords,
                dup: ''
            };

            const res = (await saveMutation.mutateAsync(payload)) as any;

            if (res?.success) {
                toast.success(res?.message || 'Approval status updated successfully');
                setShowResults(false);
            } else {
                toast.error(res?.message || 'Failed to update approval status');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Error occurred while saving');
        }
    };

    const handleReset = () => {
        setShowResults(false);
        setResults([]);
    };

    if (isInitialLoading) {
        return (
            <div className='flex h-screen w-full flex-col items-center justify-center gap-6 bg-slate-50'>
                <div className='relative'>
                    <Loader2 className='h-20 w-20 animate-spin text-indigo-600' />
                    <Camera className='-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-8 w-8 text-indigo-400' />
                </div>
                <div className='text-center'>
                    <h2 className='font-black text-2xl text-slate-800 tracking-tight'>INITIALIZING PHOTO PORTAL</h2>
                    <p className='mt-2 font-bold text-slate-400 text-xs uppercase tracking-[0.3em]'>Loading configurations & assets</p>
                </div>
            </div>
        );
    }

    return (
        <div className='fade-in container mx-auto animate-in space-y-12 p-4 duration-1000 md:p-10'>
            {/* Header Section */}
            <div className='group relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-10 shadow-2xl shadow-indigo-100/30 md:flex-row md:items-center'>
                <div className='-mr-32 -mt-32 absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl transition-transform duration-700 group-hover:scale-110' />
                <div className='relative z-10 flex items-center gap-8'>
                    <div className='flex h-24 w-24 transform items-center justify-center rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-700 text-white shadow-2xl shadow-indigo-200 transition-transform duration-500 group-hover:rotate-6'>
                        <Camera className='h-12 w-12' />
                    </div>
                    <div>
                        <div className='flex items-center gap-3'>
                            <h1 className='font-black text-5xl text-indigo-950 tracking-tighter'>PHOTO APPROVAL</h1>
                            <Badge className='rounded-full border-none bg-indigo-50 px-4 py-1.5 font-black text-[10px] text-indigo-600 uppercase tracking-widest'>
                                v2.0
                            </Badge>
                        </div>
                        <div className='mt-2 flex items-center gap-2'>
                            <p className='font-bold text-indigo-500 text-xs uppercase tracking-widest'>Notre Dame Academy</p>
                            <ChevronRight className='h-3 w-3 text-slate-300' />
                            <p className='font-bold text-slate-400 text-xs uppercase tracking-widest'>Master Module</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-12'>
                {/* Filter Section */}
                <Card className='overflow-hidden rounded-[3rem] border-none bg-white/70 shadow-2xl ring-1 ring-slate-100 backdrop-blur-xl'>
                    <CardContent className='p-10'>
                        <div className='mb-10 flex items-center gap-4'>
                            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner'>
                                <UserSquare2 className='h-6 w-6' />
                            </div>
                            <div>
                                <h2 className='font-black text-2xl text-slate-800 tracking-tight'>SELECTION CRITERIA</h2>
                                <p className='mt-1 font-bold text-[10px] text-slate-400 uppercase leading-none tracking-widest'>
                                    Configure filters to fetch profile images
                                </p>
                            </div>
                        </div>
                        <NdaStudentPhotoSearch
                            academicList={initialData?.academicYear || []}
                            classList={initialData?.classlist || []}
                            sectionList={initialData?.sectionList || []}
                            onSubmit={handleSearch}
                            onReset={handleReset}
                            isLoading={listMutation.isPending}
                        />
                    </CardContent>
                </Card>

                {/* Results Section */}
                {showResults && (
                    <div className='slide-in-from-bottom animate-in space-y-8 duration-700'>
                        <Card className='overflow-hidden rounded-[3rem] border-none bg-white/70 shadow-2xl ring-1 ring-slate-100 backdrop-blur-xl'>
                            <CardContent className='p-10'>
                                {selectionType === 'Student' ? (
                                    <NdaStudentPhotoList
                                        key={`student-${results.length}-${new Date().getTime()}`}
                                        students={results}
                                        onSave={handleSave}
                                        isSaving={saveMutation.isPending}
                                        onCancel={handleReset}
                                    />
                                ) : (
                                    <NdaStaffPhotoList
                                        key={`staff-${results.length}-${new Date().getTime()}`}
                                        staff={results}
                                        onSave={handleSave}
                                        isSaving={saveMutation.isPending}
                                        onCancel={handleReset}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <div className='h-20' />
        </div>
    );
}
