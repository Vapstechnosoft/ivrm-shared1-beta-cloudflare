'use client';

import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
// Ensure these paths are correct for your project structure
import ReportFilter from './components/ReportFilter';
import TimeTableGrid from './components/TimeTableGrid';

export default function ClassSectionTimeTableReplacementPage() {
    // We use filterData to control the visibility and pass params to the grid
    const [filterData, setFilterData] = useState<any | null>(null);

    const handleFetch = (data: any) => {
        // If data is null (from Cancel button), it hides the grid
        // If data is present, it shows the grid and passes the values
        setFilterData(data);
    };

    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Class_Section_TimeTable_Report`
    });

    return (
        <div className='space-y-6 p-4'>
            <div className='flex flex-col gap-1'>{/* You can add page titles or breadcrumbs here if needed */}</div>

            <div className='mt-4'>
                {/* 1. Pass the handleFetch function to the filter component */}
                <ReportFilter onFetch={handleFetch} />
            </div>

            <div className='mt-4'>
                {/* 2. Conditional Rendering: Grid appears only when filterData is truthy */}
                {filterData && (
                    <div className='fade-in slide-in-from-top-4 animate-in duration-500'>
                        <div ref={componentRef} className='printable-content print:p-4'>
                            <TimeTableGrid params={filterData} onPrint={handlePrint} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
