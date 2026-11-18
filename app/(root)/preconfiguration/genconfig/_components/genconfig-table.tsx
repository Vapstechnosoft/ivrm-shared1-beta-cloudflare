'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import type { IGeneralConfiguration } from '@/types/preconfiguration/general-config';
import { columns } from './columns';

interface GenConfigDataTableProps {
    data: IGeneralConfiguration[];
    isLoading: boolean;
}

export function GenConfigDataTable({ data, isLoading }: GenConfigDataTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>General Settings Grid View</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable<IGeneralConfiguration, any> columns={columns} data={data} isLoading={isLoading} totalItems={data.length} />
            </CardContent>
        </Card>
    );
}
