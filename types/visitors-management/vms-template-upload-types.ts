export interface VMSTemplateUploadDTO {
    ismmT_Id: number;
    ismmT_TemplateName: string;
    ismmT_TemplateType: string;
    ismmT_FilePath?: string;
    ismmT_Description: string;
    ismmT_SubmittedBy?: string;
    ismmT_SubmittedDate?: string;
    ismmT_Status?: 'Pending' | 'Approved' | 'Rejected';
    ismmT_MDRemarks?: string;
    ismmT_ActiveFlag?: boolean;
}

export interface TemplateTypeItem {
    id: number;
    name: string;
}
