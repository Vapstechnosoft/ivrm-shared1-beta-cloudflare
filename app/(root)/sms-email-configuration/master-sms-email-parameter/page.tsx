'use client';

import { MasterSmsEmailParameterForm } from '@/components/sms-email-configuration/master-sms-email-parameter/master-sms-email-parameter-form';

export default function MasterSmsEmailParameterPage() {
    return (
        <div className='flex flex-col gap-6 p-6'>
            <MasterSmsEmailParameterForm />
        </div>
    );
}
