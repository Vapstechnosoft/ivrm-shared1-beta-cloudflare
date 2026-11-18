export interface IMasterInstDocumentList {
    aiD_Id: number;
    tenant_Id: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number | null;
    documentType: string;
    description: string;
    activeFlag: boolean;
    createdDate: string;
    updatedDate: string | null;
}
