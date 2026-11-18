'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { ColumnDef } from '@tanstack/react-table';
export interface QualificationDetail {
    id: number;
    qualification: string;
    board: string;
    year: string;
    percentage: string;
}
export interface ExperienceDetail {
    id: number;
    company: string;
    designation: string;
    from: string;
    to: string;
    experience: string;
}
export interface FamilyDetail {
    id: number;
    name: string;
    relation: string;
    occupation: string;
    contactNo: string;
}
export interface LanguageDetail {
    id: number;
    language: string;
    read: boolean;
    write: boolean;
    speak: boolean;
}
export interface DocumentDetail {
    id: number;
    documentType: string;
    fileName: string;
    filePath: string;
}
export interface Candidate {
    id: number;
    hrcD_Id: number;
    hrcD_FullName: string;
    hrcD_FirstName: string;
    hrcD_MiddleName?: string;
    hrcD_LastName: string;
    hrmJ_Id: number;
    hrmJ_JobTiTle: string;
    hrcD_ExpFrom: number;
    hrcD_ExpTo: number;
    applydate: string;
    hrcD_RecruitmentStatus: string;
    hrcD_EmailId: string;
    hrcD_MobileNo: number;
    hrcD_CreatedBy: number;
    hrcD_ActiveFlg: boolean | number;

    // Legacy fields for form state (if still used by the frontend)
    firstName: string;
    middleName?: string;
    lastName: string;
    skill: string;
    mobileNo: string;
    emailId: string;
    qualification: string;
    jobTitle: string;
    currentCompany?: string;
    totalExp: string;
    lastCTC: string;
    expectedCTC: string;
    applicationDate: string;
    interviewDate: string;
    dateOfBirth: string;
    nationality: string;
    religion: string;
    caste: string;
    gender: string;
    maritalStatus: string;
    bloodGroup: string;
    positionType: string;
    position: string;
    aadharNo?: string;
    panCardNo?: string;
    refHR?: string;
    source?: string;
    remark?: string;
    consultency?: string;
    resumeCV?: string;
    localAddressLine1: string;
    localAddressLine2?: string;
    localPlace: string;
    localPincode: string;
    permanentAddressLine1: string;
    permanentAddressLine2?: string;
    permanentPlace: string;
    permanentPincode: string;
    sameAsLocalAddress: boolean;
    status: string;
    createdAt: string;
}
interface CandidateColumnsProps {
    onEdit: (row: Candidate) => void;
    onToggle: (row: Candidate) => void;
}
export const getCandidateColumns = ({ onEdit, onToggle }: CandidateColumnsProps): ColumnDef<Candidate>[] => [
    {
        id: 'serialNumber',
        header: 'SL.NO',
        cell: ({ row }) => <div>{row.index + 1}</div>
    },
    {
        id: 'fullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
        cell: ({ row }) => <div className='capitalize'>{row.original.hrcD_FullName}</div>
    },
    {
        accessorKey: 'hrcD_EmailId',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
        cell: ({ row }) => <div>{row.getValue('hrcD_EmailId')}</div>
    },
    {
        accessorKey: 'hrmJ_JobTiTle',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Job Title' />,
        cell: ({ row }) => <div>{row.getValue('hrmJ_JobTiTle')}</div>
    },
    {
        id: 'actions',
        header: 'Action',
        enableSorting: false,
        cell: ({ row }) => {
            const entity = row.original;
            return (
                <ActionButtons
                    rowData={entity}
                    buttons={{ edit: true, toggle: true, delete: false }}
                    onEdit={onEdit}
                    onToggle={() => onToggle?.(entity)}
                    toggleConditionKey='hrcD_ActiveFlg'
                />
            );
        }
    }
];
export const candidateColumns = getCandidateColumns({
    onEdit: () => {},
    onToggle: () => {}
});
