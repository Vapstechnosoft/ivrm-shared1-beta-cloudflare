export interface IOnlinePaymentStudenyInformationList {
    amst_Id: number;

    amsT_FirstName: string;
    amsT_MiddleName: string;
    amsT_LastName: string;
    amsT_RegistrationNo: string;
    amsT_AdmNo: string;
    classname: string;
    sectionname: string;
    amst_email_id: string;
    asmcL_ID: number;
    amst_mobile: number;
    asmaY_Id: number;
    amaY_RollNo: string;
}
export interface FeeStructure {
    fmH_FeeName: string;
    ftI_Name: string;
    fsS_OBArrearAmount: number;
    fsS_NetAmount: number;
    fsS_TotalToBePaid: number;
    fsS_ConcessionAmount: number;
    fsS_FineAmount: number;
    fsS_ToBePaid: number;
}

export interface IGroupTermMapping {
    grp: {
        checkedgrplst: boolean;
        grpdisable: boolean;
        fmgG_GroupName: string;
        fmgG_Id: string;
    };
    trm_list: {
        fmgG_GroupName: string;
        fmgG_Id: string;
        fmT_Name: string;
        fmT_Id: string;
        fmT_Order: number;
        checkedheadlst: boolean;
        fmT_Amount: number;
        preAdmFlag: boolean;
        termdisablechk: boolean;
    }[];
}

export interface OnlineGroupTermMapping {
    grp: {
        checkedgrplst: boolean;
        grpdisable: boolean;
        fmgG_GroupName: string;
        fmgG_Id: string;
    };
    trm_list: {
        checkedheadlst: boolean;
        termdisablechk: boolean;
        fmgG_GroupName: string;
        fmgG_Id: number;
        fmT_Name: string;
        fmT_Id: string;
        fmT_Order: number;
        preAdmFlag: boolean;
        fmT_Amount: number;
    }[];
}
