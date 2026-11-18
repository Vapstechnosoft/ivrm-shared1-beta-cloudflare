'use client';

import { useState } from 'react';
import { SMSForm } from './_components/sms-form';
import { SMSList } from './_components/sms-list';

export default function GeneralSendSMSSRKVSPage() {
    const [studentData, setStudentData] = useState<any[]>([]);
    const [formParams, setFormParams] = useState<any>(null);

    const handleDataFetched = (data: any[], params: any) => {
        setStudentData(data);
        setFormParams(params);
    };

    const handleReset = () => {
        setStudentData([]);
        setFormParams(null);
    };

    return (
        <div className='container mx-auto space-y-6 py-6'>
            <SMSForm onDataFetched={handleDataFetched} onReset={handleReset} />
            {formParams && <SMSList data={studentData} params={formParams} />}
        </div>
    );
}
