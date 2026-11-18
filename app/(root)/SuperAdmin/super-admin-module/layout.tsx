import type React from 'react';
import { WizardNavigationBanner } from './_components/wizard-navigation-banner';

export default function SuperAdminModuleLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex min-h-full flex-col'>
            <WizardNavigationBanner />
            <div className='flex-1'>{children}</div>
        </div>
    );
}