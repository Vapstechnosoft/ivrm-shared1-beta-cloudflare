'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { ReceiptIndianRupee } from 'lucide-react';
import { Edit } from 'lucide-react';

import { ROLES } from '@/constants';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useDocumentDownload, useStudentApplicationForm } from '@/hooks/admission/preadmission/useTransactions';
import { ApplicationFormCell } from '../../../../preadmission/transactions/document-view/_components/columns';
import { toast } from 'sonner';
import PaymentDialog from './payment-dialog';
import ToggleStudentApplicationForm from './toggle-form';

export const studentApplicationColumns: ColumnDef<IPreadmissionStudentApplicationList>[] = [
    {
        accessorKey: 'pasr_id',
        header: ({ column }) => <DataTableColumnHeader className='w-full pl-6 font-bold text-blue-600' column={column} title='Sl.No' />,
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
        accessorKey: 'pasR_RegistrationNo',
        header: ({ column }) => <DataTableColumnHeader className='font-bold text-blue-600' column={column} title='Application No' />,
        cell: ({ row }) => <div>{row.getValue('pasR_RegistrationNo') ?? 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'student_name',
        header: ({ column }) => <DataTableColumnHeader className='font-bold text-blue-600' column={column} title='Student Name' />,
        cell: ({ row }) => <div>{row.getValue('student_name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'pasR_Sex',
        header: ({ column }) => <DataTableColumnHeader className='font-bold text-blue-600' column={column} title='Gender' />,
        cell: ({ row }) => <div>{row.getValue('pasR_Sex')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'applied_class_name',
        header: ({ column }) => <DataTableColumnHeader className='font-bold text-blue-600' column={column} title='Applied Class' />,
        cell: ({ row }) => <div>{row.getValue('applied_class_name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'application_status',
        header: ({ column }) => (
            <DataTableColumnHeader className='text-nowrap font-bold text-blue-600' column={column} title='Application Status' />
        ),
        cell: ({ row }) => <div>{row.getValue('application_status')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'admission_status',
        header: ({ column }) => (
            <DataTableColumnHeader className='text-nowrap font-bold text-blue-600' column={column} title='Admission Status' />
        ),
        cell: ({ row }) => <div>{row.getValue('admission_status')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'applied_by',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap font-bold text-blue-600' column={column} title='User Name' />,
        cell: ({ row }) => <div>{row.getValue('applied_by')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'application_form',
        header: ({ column }) => (
            <DataTableColumnHeader className='text-nowrap font-bold text-blue-600' column={column} title='Application Form' />
        ),
        cell: ({ row }) => {
            const appId = row.original.pasr_id;
            return <ApplicationFormCell pasrId={appId} rowData={row.original as any} />;
        },
        enableSorting: false
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader className='text-center font-bold text-blue-600' column={column} title='Actions' />,
        accessorFn: (row: any) => {
            return row;
        },
        enableHiding: false,
        enableSorting: false,
        cell: ({ cell }: { cell: any }) => {
            const { openEditForm } = useFormContext<IPreadmissionStudentApplicationList>();
            const session = useSession();
            const [pasrId, setPasrId] = useState<number>(0);

            const { data: applicationFormDetails, isLoading: applicationFormDetailsLoading } = useStudentApplicationForm(pasrId);

            useEffect(() => {
                if (session?.status === 'authenticated' && session?.data?.role === undefined) {
                    window.location.reload();
                }
            }, [session?.data?.role, session?.status]);

            // Trigger form open when applicationFormDetails is loaded
            useEffect(() => {
                if (pasrId && applicationFormDetails?.data && !applicationFormDetailsLoading) {
                    try {
                        const resp = applicationFormDetails.data;
                        const student = resp?.student_details || resp || {};
                        const normalizeGender = (sex: string | undefined | null) => {
                            if (!sex) return undefined;
                            const s = sex.toUpperCase();
                            if (s === 'M' || s === 'MALE') return 'Male';
                            if (s === 'F' || s === 'FEMALE') return 'Female';
                            return sex;
                        };

                        const payload = {
                            ...student,
                            pasR_Id: student.pasR_Id || student.pasr_id || resp.pasr_id || resp.pasR_Id,
                            pasR_DOB: student.pasR_DOB ? new Date(student.pasR_DOB) : undefined,
                            pasR_Sex: student.pasR_Sex || student.pasr_sex || resp.pasr_sex || resp.pasR_Sex || undefined,
                            asmcL_Id: Number(student.asmcL_Id || resp.asmcL_Id || resp.pasR_AppliedClassId || student.asmcL_id || 0),
                            caste_Id: Number(
                                student.caste_Id || resp.caste_id || resp.ic_Id || student.caste_id || student.imC_Id || student.amC_Id || 0
                            ),
                            religion_Id: Number(student.religion_Id || resp.religion_id || student.religion_id || 0),
                            casteCategory_Id: Number(student.casteCategory_Id || resp.casteCategory_Id || student.imCC_Id || 0),
                            pasR_Nationality: String(
                                student.pasR_Nationality ||
                                    student.nationality_id ||
                                    resp.nationality_id ||
                                    student.pasR_PerCountry ||
                                    resp.pasR_PerCountry ||
                                    ''
                            ),
                            pasR_FatherNationality: String(
                                student.pasR_FatherNationality ||
                                    student.father_nationality_id ||
                                    resp.father_nationality_id ||
                                    student.pasR_ConCountry ||
                                    resp.pasR_ConCountry ||
                                    ''
                            ),
                            pasR_MotherNationality: String(
                                student.pasR_MotherNationality ||
                                    student.mother_nationality_id ||
                                    resp.mother_nationality_id ||
                                    student.pasR_ConCountry ||
                                    resp.pasR_ConCountry ||
                                    ''
                            ),
                            pasR_TransportReqdFlag: Number(student.pasR_TransportReqdFlag ?? resp.pasR_TransportReqdFlag ?? 0),
                            pasR_ConState: Number(
                                student.pasR_ConState || resp.pasR_ConState || student.pasr_constate || resp.pasr_constate || 0
                            ),
                            pasR_PerState: Number(
                                student.pasR_PerState || resp.pasR_PerState || student.pasr_perstate || resp.pasr_perstate || 0
                            ),
                            pasR_ConCountry: String(
                                student.pasR_ConCountry ||
                                    resp.pasR_ConCountry ||
                                    student.pasr_concountry ||
                                    resp.pasr_concountry ||
                                    student.ivrmmC_Id ||
                                    resp.ivrmmC_Id ||
                                    ''
                            ),
                            pasR_PerCountry: String(
                                student.pasR_PerCountry ||
                                    resp.pasR_PerCountry ||
                                    student.pasr_percountry ||
                                    resp.pasr_percountry ||
                                    student.ivrmmC_Id ||
                                    resp.ivrmmC_Id ||
                                    ''
                            ),
                            selectedSourceDetails: (resp?.student_sources || resp?.studentSource || []).map((s: any) => ({
                                pamS_Id: String(s.pamS_Id)
                            })),
                            selectedRefrenceDetails: (resp?.student_refrences || resp?.studentReference || []).map((r: any) => ({
                                pamR_Id: String(r.pamR_Id)
                            })),
                            siblingsDetails: resp?.student_siblings || [],
                            previousSchoolDetails: resp?.previous_schools || [],
                            selectedDocuments: (resp?.student_documents || []).map((d: any) => ({
                                pasrD_Id: d.pasrD_Id,
                                pasR_Id: d.pasR_Id,
                                amsmD_Id: d.amsmD_Id,
                                document_Path: d.document_Path
                            }))
                        };
                        openEditForm(payload);
                        setPasrId(0); // Reset after opening
                    } catch (error) {
                        console.error('Error fetching application details:', error);
                        toast.error('Unable to fetch application details');
                        setPasrId(0); // Reset on error
                    }
                }
            }, [pasrId, applicationFormDetails, applicationFormDetailsLoading]);

            return (
                <div className='flex items-start justify-start gap-2'>
                    <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        disabled={applicationFormDetailsLoading}
                        onClick={() => {
                            const rowData = cell.row.original;
                            setPasrId(rowData.pasr_id);
                        }}
                        className='w-fit p-1'>
                        {applicationFormDetailsLoading ? (
                            <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent' />
                        ) : (
                            <Edit className='h-4 w-4' />
                        )}
                    </Button>
                    <div className='flex w-full justify-between gap-2'>
                        {cell.row.original.is_fee_applicable === 1 ? (
                            cell.row.original.payment_status === 0 ? (
                                <PaymentDialog cell={cell} />
                            ) : (
                                <Badge className='cursor-not-allowed bg-green-500 p-3 font-extrabold text-black hover:bg-green-600'>
                                    <ReceiptIndianRupee className='h-4 w-4' /> Paid
                                </Badge>
                            )
                        ) : (
                            <p className='text-slate-600 text-sm'>No Fee</p>
                        )}
                        {session?.data?.role?.toUpperCase() === ROLES.ADMIN && <ToggleStudentApplicationForm cell={cell} />}
                    </div>
                </div>
            );
        }
    }
];
