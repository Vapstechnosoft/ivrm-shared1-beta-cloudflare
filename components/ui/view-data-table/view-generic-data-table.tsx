'use client';

import { DataTable } from '@/components/ui/view-data-table/view-data-table';
import type { ApiSearchparams } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Database, RefreshCw } from 'lucide-react';
import { forwardRef } from 'react';
import type { DataTableRef } from './view-data-table';

interface GenericDataTableProps<T> {
    // Data props
    data?: T[];
    total?: number;
    columns: ColumnDef<T>[];
    totalItems?: number;

    // State props
    isLoading: boolean;
    error?: Error | null;
    success?: boolean;
    errorMessage?: string;
    // Table configuration
    showViewOptions?: boolean;
    showSearch?: boolean;
    showSorting?: boolean;
    showPagination?: boolean;
    columnPinning?: { left?: string[]; right?: string[] };

    // Row selection
    maxSelectableRows?: number;
    defaultSelectedRowIds?: string[];
    onRowSelectionChange?: (selectedRows: T[]) => void;
    onSearchQueryChange?: (value: ApiSearchparams) => void;
    getRowId?: (row: T, index: number) => string;

    // Custom messages
    loadingMessage?: string;
    errorTitle?: string;
    noDataTitle?: string;
    noDataDescription?: string;
    requestFailedTitle?: string;

    // Custom icons
    LoadingIcon?: React.ComponentType<{ className?: string }>;
    ErrorIcon?: React.ComponentType<{ className?: string }>;
    NoDataIcon?: React.ComponentType<{ className?: string }>;

    // Custom loading/error components
    LoadingComponent?: React.ComponentType;
    ErrorComponent?: React.ComponentType<{ error: Error; message: string }>;
    NoDataComponent?: React.ComponentType;
    searchQuery?: string;
    currentApiParams?: ApiSearchparams;
}

export const GenericDataTable = forwardRef<DataTableRef, GenericDataTableProps<any>>(function GenericDataTable<T>(
    {
        data = [],
        columns,
        totalItems = 0,
        isLoading,
        error,
        success = true,
        errorMessage,
        showViewOptions = false,
        showSearch = false,
        showSorting = false,
        showPagination = false,
        columnPinning,
        maxSelectableRows = 0,
        defaultSelectedRowIds,
        onRowSelectionChange,
        onSearchQueryChange,
        getRowId,
        loadingMessage = 'Loading data...',
        errorTitle = 'Error Loading Data',
        requestFailedTitle = 'Request Failed',
        LoadingIcon = RefreshCw,
        ErrorIcon = Database,
        LoadingComponent,
        ErrorComponent,
        currentApiParams
    }: GenericDataTableProps<T>,
    ref: React.Ref<DataTableRef>
) {
    // Loading state
    if (isLoading) {
        if (LoadingComponent) return <LoadingComponent />;
        return (
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <LoadingIcon className='h-8 w-8 animate-spin text-secondary' />
                <p className='text-muted-foreground text-sm'>{loadingMessage}</p>
            </div>
        );
    }

    // Error state
    if (error) {
        if (ErrorComponent) return <ErrorComponent error={error} message={error.message} />;
        return (
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <div className='rounded-full bg-destructive/10 p-3'>
                    <ErrorIcon className='h-6 w-6 text-destructive' />
                </div>
                <div className='space-y-2 text-center'>
                    <h3 className='font-semibold text-destructive'>{errorTitle}</h3>
                    <p className='text-muted-foreground text-sm'>{error.message || errorMessage || 'Failed to load data'}</p>
                </div>
            </div>
        );
    }

    // Request failed state
    if (!success) {
        return (
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <div className='rounded-full bg-destructive/10 p-3'>
                    <ErrorIcon className='h-6 w-6 text-destructive' />
                </div>
                <div className='space-y-2 text-center'>
                    <h3 className='font-semibold text-destructive'>{requestFailedTitle}</h3>
                    <p className='text-muted-foreground text-sm'>{errorMessage || 'Failed to fetch data'}</p>
                </div>
            </div>
        );
    }

    // No data state - but still render DataTable to show toolbar
    if (data.length === 0) {
        return (
            <div className='overflow-hidden rounded-lg bg-card'>
                <DataTable
                    ref={ref}
                    isLoading={false}
                    columns={columns}
                    data={[]} // Empty array
                    totalItems={0}
                    showViewOptions={showViewOptions}
                    columnPinning={columnPinning}
                    maxSelectableRows={maxSelectableRows}
                    showSearch={showSearch}
                    showSorting={showSorting}
                    onRowSelectionChange={onRowSelectionChange}
                />
            </div>
        );
    }

    return (
        <div className='overflow-hidden rounded-lg bg-card'>
            <DataTable
                ref={ref}
                isLoading={false}
                columns={columns}
                data={data}
                totalItems={totalItems}
                showViewOptions={false}
                showSearch={showSearch}
                showSorting={showSorting}
                showPagination={showPagination}
                columnPinning={columnPinning}
                maxSelectableRows={maxSelectableRows}
                defaultSelectedRowIds={defaultSelectedRowIds}
                getRowId={getRowId}
                onRowSelectionChange={(selectedRows) => {
                    if (onRowSelectionChange) {
                        onRowSelectionChange(selectedRows);
                    }
                }}
                onSearchQueryChange={(value) => {
                    if (onSearchQueryChange) {
                        onSearchQueryChange(value);
                    }
                }}
                currentApiParams={currentApiParams}
            />
        </div>
    );
}) as <T>(props: GenericDataTableProps<T> & { ref?: React.Ref<DataTableRef> }) => React.ReactElement;

function sortDataByAcademicYear(arr: any[]) {
    if (!Array.isArray(arr) || arr.length <= 1) return arr;

    const hasAcademicYear = arr.some((item) => {
        if (!item || typeof item !== 'object') return false;
        return (
            item.asmaY_Year != null ||
            item.ASMAY_Year != null ||
            item.asmaY_Order != null ||
            item.ASMAY_Order != null ||
            item.asmaY_Id != null ||
            item.ASMAY_Id != null ||
            item.academicYear != null ||
            item.ex_AcademicYear != null
        );
    });

    if (!hasAcademicYear) return arr;

    return [...arr].sort((a, b) => {
        if (!a || !b) return 0;
        const yearA =
            a.asmaY_Year ??
            a.ASMAY_Year ??
            a.ex_AcademicYear ??
            a.academicYear ??
            a.asmaY_Order ??
            a.ASMAY_Order ??
            a.asmaY_Id ??
            a.ASMAY_Id ??
            '';
        const yearB =
            b.asmaY_Year ??
            b.ASMAY_Year ??
            b.ex_AcademicYear ??
            b.academicYear ??
            b.asmaY_Order ??
            b.ASMAY_Order ??
            b.asmaY_Id ??
            b.ASMAY_Id ??
            '';

        if (yearA && yearB) {
            if (typeof yearA === 'number' && typeof yearB === 'number') {
                return yearB - yearA;
            }
            return String(yearB).localeCompare(String(yearA), undefined, { numeric: true, sensitivity: 'base' });
        }
        return 0;
    });
}

// Hook for common API response pattern
export function useDataTableProps(
    response: any,
    options?: {
        dataKey?: string;
        totalKey?: string;
        successKey?: string;
        messageKey?: string;
        sortByYearDesc?: boolean;
    }
) {
    const { dataKey = 'data', totalKey = 'total', successKey = 'success', messageKey = 'message', sortByYearDesc = true } = options || {};

    let extractedData: any[] = [];
    if (Array.isArray(response)) {
        extractedData = [...response];
    } else {
        const rawData = response?.[dataKey];
        extractedData = Array.isArray(rawData) ? [...rawData] : Array.isArray(response) ? [...response] : [];
    }

    if (sortByYearDesc && Array.isArray(extractedData) && extractedData.length > 0) {
        extractedData = sortDataByAcademicYear(extractedData);
    }

    return {
        data: extractedData,
        totalItems: response?.[totalKey] || extractedData.length || 0,
        success: response?.[successKey] !== false,
        errorMessage: response?.[messageKey]
    };
}
