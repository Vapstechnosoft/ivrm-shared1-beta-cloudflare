import type { masterPageSchema } from '@/schemas/super-admin/super-admin-module/general-setting/master-page';
import type { z } from 'zod';

export interface IMasterPage extends z.infer<typeof masterPageSchema> {
    createdDate?: string;
    updatedDate?: string;
    userId?: number;
    ivrmP_ActiveFlag?: number | boolean;
    ivrmP_BrowerUrl?: string;
    ivrmP_BrowserUrl?: string;
    IVRMP_BrowserUrl?: string;
    // Fields retrieved from API but not in Form
    ivrmP_PageURL?: string;
    ivrM_Module_Category_Id?: number;
    ivrmP_TemplateFlag?: boolean;
}
