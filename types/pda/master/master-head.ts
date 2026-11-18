export interface IPDAMasterHead {
    pdamH_Id: number;
    pdamH_HeadName: string;
    fmH_Id: number;
    pdamH_ActiveFlag: boolean;
    fmH_FeeName?: string;
}

export interface IPDAMasterHeadResponse {
    pdadata: IPDAMasterHead[];
    headdata: { fmH_Id: number; fmH_FeeName: string; Selected?: boolean }[];
    returnval?: boolean;
    returnduplicatestatus?: string;
    message?: string;
}
