'use client';

import { Button } from '@/components/ui/button';
import type { ICollegeStudentDetails } from '@/types/fees/college/transaction/transaction';
import { BookOpen, GraduationCap, Phone, User, Users, X } from 'lucide-react';
import { useState } from 'react';
import Portal from './portal';

interface CollegeStudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    student?: ICollegeStudentDetails | null;
    loading?: boolean;
}

export default function CollegeStudentProfileModal({
    isOpen,
    onClose,
    student,
    loading = false
}: CollegeStudentProfileModalProps) {
    const [activeTab, setActiveTab] = useState<'academic' | 'personal' | 'parent'>('academic');

    if (!isOpen) return null;

    return (
        <Portal>
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
                <div className='relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200'>
                    {/* Header */}
                    <div className='flex items-center justify-between border-b bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white'>
                        <div className='flex items-center gap-3'>
                            <GraduationCap className='h-6 w-6' />
                            <div>
                                <h2 className='text-lg font-bold'>College Student Profile</h2>
                                <p className='text-xs text-blue-100'>Detailed academic and student information</p>
                            </div>
                        </div>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={onClose}
                            className='text-white hover:bg-white/20 hover:text-white rounded-full p-2'>
                            <X className='h-5 w-5' />
                        </Button>
                    </div>

                    {loading ? (
                        <div className='p-12 text-center text-muted-foreground'>
                            <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mb-3'></div>
                            <p>Loading student information...</p>
                        </div>
                    ) : (
                        <div className='p-6 space-y-6'>
                            {/* Profile Overview Card */}
                            <div className='flex items-center gap-6 rounded-xl border bg-gray-50/70 p-4'>
                                <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary shadow'>
                                    <img
                                        src={
                                            student?.amcst_Photoname ||
                                            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                                        }
                                        alt='Student Photo'
                                        className='h-full w-full object-cover'
                                    />
                                </div>
                                <div className='space-y-1 flex-1'>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='text-xl font-bold text-gray-900 uppercase'>
                                            {`${student?.amcst_FirstName || ''} ${student?.amcst_MiddleName || ''} ${student?.amcst_LastName || ''}`.trim() ||
                                                'STUDENT'}
                                        </h3>
                                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800'>
                                            Active Student
                                        </span>
                                    </div>
                                    <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600'>
                                        <p>
                                            <span className='font-semibold text-gray-800'>Adm No:</span>{' '}
                                            <span className='font-mono'>{student?.amcst_AdmNo || 'N/A'}</span>
                                        </p>
                                        <p>
                                            <span className='font-semibold text-gray-800'>Reg No:</span>{' '}
                                            <span className='font-mono'>{student?.amcst_RegistrationNo || 'N/A'}</span>
                                        </p>
                                        <p>
                                            <span className='font-semibold text-gray-800'>Course / Branch:</span>{' '}
                                            {student?.amco_CourseName || 'N/A'} - {student?.amB_BranchName || 'N/A'}
                                        </p>
                                        <p>
                                            <span className='font-semibold text-gray-800'>Semester:</span>{' '}
                                            {student?.amsE_SEMName || '1st Semester'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className='flex border-b text-sm font-medium'>
                                <button
                                    type='button'
                                    onClick={() => setActiveTab('academic')}
                                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors ${
                                        activeTab === 'academic'
                                            ? 'border-primary text-primary font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}>
                                    <BookOpen className='h-4 w-4' /> Academic Details
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setActiveTab('personal')}
                                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors ${
                                        activeTab === 'personal'
                                            ? 'border-primary text-primary font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}>
                                    <User className='h-4 w-4' /> Personal Info
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setActiveTab('parent')}
                                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors ${
                                        activeTab === 'parent'
                                            ? 'border-primary text-primary font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}>
                                    <Users className='h-4 w-4' /> Parent Details
                                </button>
                            </div>

                            {/* Tab Contents */}
                            {activeTab === 'academic' && (
                                <div className='grid grid-cols-2 gap-4 text-sm'>
                                    <div className='rounded-lg border p-3.5 space-y-1 bg-white shadow-xs'>
                                        <span className='text-xs text-muted-foreground uppercase font-semibold'>Course</span>
                                        <p className='font-medium text-gray-800'>{student?.amco_CourseName || 'Bachelor of Computer Applications (BCA)'}</p>
                                    </div>
                                    <div className='rounded-lg border p-3.5 space-y-1 bg-white shadow-xs'>
                                        <span className='text-xs text-muted-foreground uppercase font-semibold'>Branch</span>
                                        <p className='font-medium text-gray-800'>{student?.amB_BranchName || 'BCA'}</p>
                                    </div>
                                    <div className='rounded-lg border p-3.5 space-y-1 bg-white shadow-xs'>
                                        <span className='text-xs text-muted-foreground uppercase font-semibold'>Current Semester</span>
                                        <p className='font-medium text-gray-800'>{student?.amsE_SEMName || '1st Semester'}</p>
                                    </div>
                                    <div className='rounded-lg border p-3.5 space-y-1 bg-white shadow-xs'>
                                        <span className='text-xs text-muted-foreground uppercase font-semibold'>Portal Username</span>
                                        <p className='font-mono font-medium text-gray-800'>{student?.portalusername || student?.amcst_AdmNo || 'N/A'}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'personal' && (
                                <div className='grid grid-cols-2 gap-4 text-sm'>
                                    <div className='rounded-lg border p-3.5 space-y-1 bg-white shadow-xs'>
                                        <span className='text-xs text-muted-foreground uppercase font-semibold'>Mobile Number</span>
                                        <p className='font-medium text-gray-800 flex items-center gap-1.5'>
                                            <Phone className='h-3.5 w-3.5 text-primary' /> {student?.amcst_Mobile || '9876543210'}
                                        </p>
                                    </div>
                                    <div className='rounded-lg border p-3.5 space-y-1 bg-white shadow-xs'>
                                        <span className='text-xs text-muted-foreground uppercase font-semibold'>Admission Number</span>
                                        <p className='font-mono font-medium text-gray-800'>{student?.amcst_AdmNo || 'N/A'}</p>
                                    </div>
                                    <div className='rounded-lg border p-3.5 space-y-1 bg-white shadow-xs'>
                                        <span className='text-xs text-muted-foreground uppercase font-semibold'>Registration Number</span>
                                        <p className='font-mono font-medium text-gray-800'>{student?.amcst_RegistrationNo || 'N/A'}</p>
                                    </div>
                                    <div className='rounded-lg border p-3.5 space-y-1 bg-white shadow-xs'>
                                        <span className='text-xs text-muted-foreground uppercase font-semibold'>Student Status</span>
                                        <p className='font-medium text-emerald-700'>Studying (Regular)</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'parent' && (
                                <div className='grid grid-cols-2 gap-4 text-sm'>
                                    <div className='rounded-lg border p-3.5 space-y-1 bg-white shadow-xs'>
                                        <span className='text-xs text-muted-foreground uppercase font-semibold'>Father Name</span>
                                        <p className='font-medium text-gray-800'>{student?.amcst_FatherName || 'N/A'}</p>
                                    </div>
                                    <div className='rounded-lg border p-3.5 space-y-1 bg-white shadow-xs'>
                                        <span className='text-xs text-muted-foreground uppercase font-semibold'>Emergency Contact</span>
                                        <p className='font-medium text-gray-800 flex items-center gap-1.5'>
                                            <Phone className='h-3.5 w-3.5 text-primary' /> {student?.amcst_Mobile || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className='flex justify-end pt-2 border-t'>
                                <Button type='button' variant='outline' onClick={onClose} className='px-6'>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Portal>
    );
}
