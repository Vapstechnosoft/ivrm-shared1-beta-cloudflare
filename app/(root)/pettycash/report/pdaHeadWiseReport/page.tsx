'use client';

import { useState } from 'react';
import { PDAHeadWiseReportForm } from './_components/PDAHeadWiseReportForm';
import { PDAHeadWiseReportGrid } from './_components/PDAHeadWiseReportGrid';

export default function PDAHeadWiseReportPage() {
    const [reportData, setReportData] = useState<any>(null);

    return (
        <div className='min-h-screen bg-gray-50/30'>
            <div className='container space-y-6 p-6'>
                <PDAHeadWiseReportForm setReportData={setReportData} reportData={reportData} />
                <PDAHeadWiseReportGrid reportData={reportData} />
            </div>
        </div>
    );
}
