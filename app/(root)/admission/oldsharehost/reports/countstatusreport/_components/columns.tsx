'use client';
import type { ColumnDef } from '@tanstack/react-table';

export interface IApplicationStatus {
    PASRAPS_ID: number;
    data: number;
}

export interface IAdmissionStatus {
    PAMS_Id?: number;
    PAMST_Status?: string;
    Data_count?: number;
    status_cursor?: string;
    aps_cursor?: string | number;
}

export const getApplicationStatusColumns = (): ColumnDef<IApplicationStatus>[] => {
    return [
        {
            accessorKey: 'slno',
            header: () => <div className='text-center font-bold text-black'>SL.NO</div>,
            cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
            size: 50
        },
        {
            accessorKey: 'PASRAPS_ID',
            header: () => <div className='text-center font-bold text-black'>Application Status</div>,
            cell: ({ row }) => {
                const id = row.original.PASRAPS_ID;
                let statusName: string | number = id;
                if (id === 787926) statusName = 'APP WAITING';
                if (id === 787927) statusName = 'APP REJECTED';
                if (id === 787928) statusName = 'APP ACCEPTED';
                return <div className='text-center'>{statusName}</div>;
            }
        },
        {
            accessorKey: 'data',
            header: () => <div className='text-center font-bold text-black'>Count</div>,
            cell: ({ row }) => <div className='text-center'>{row.original.data}</div>
        }
    ];
};

export const getAdmissionStatusColumns = (): ColumnDef<IAdmissionStatus>[] => {
    return [
        {
            accessorKey: 'slno',
            header: () => <div className='text-center font-bold text-black'>SL.NO</div>,
            cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
            size: 50
        },
        {
            accessorKey: 'PAMST_Status',
            header: () => <div className='text-center font-bold text-black'>Admission Status</div>,
            cell: ({ row }) => <div className='text-center'>{row.original.status_cursor || row.original.PAMST_Status}</div>
        },
        {
            accessorKey: 'Data_count',
            header: () => <div className='text-center font-bold text-black'>Count</div>,
            cell: ({ row }) => <div className='text-center'>{row.original.aps_cursor || row.original.Data_count}</div>
        }
    ];
};
