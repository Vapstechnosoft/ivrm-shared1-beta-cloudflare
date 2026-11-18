import type { IUserAccessibleModules } from '@/types';

export const pettycashModule: IUserAccessibleModules = {
    id: 888,
    name: 'Petty Cash',
    icon: 'Banknote',
    menu: [
        {
            id: 1,
            name: 'Petty Cash',
            icon: 'BadgeIndianRupee',
            sub_menu: [
                {
                    id: 1,
                    name: 'Masters',
                    icon: 'BadgeIndianRupee',
                    pages: [
                        {
                            id: 600,
                            name: 'Master particulars',
                            icon: 'BadgeIndianRupee',
                            url: '/pettycash/masterparticulars',
                            title: 'Master Particulars',
                            description: 'Manage Master Particulars Details'
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'Transaction',
                    icon: 'BadgeIndianRupee',
                    pages: [
                        {
                            id: 61105,
                            name: 'PC PARTICULARS REQUISITION',
                            icon: 'BadgeIndianRupee',
                            url: '/pettycash/Transaction/pcREQUISITION',
                            title: 'PC Particulars Requisition',
                            description: 'Manage PC Particulars Requisition Details'
                        }
                    ]
                },
                {
                    id: 3,
                    name: 'Reports',
                    icon: 'BadgeIndianRupee',
                    pages: [
                        {
                            id: 60321230,
                            name: 'Pc Requisition Report',
                            icon: 'BadgeIndianRupee',
                            url: '/pettycash/PcRequisitionReport',
                            title: 'Pc Requisition Report',
                            description: 'View Pc Requisition Reports'
                        },
                        {
                            id: 60321231,
                            name: 'Income Report',
                            icon: 'BadgeIndianRupee',
                            url: '/pettycash/incomereport',
                            title: 'Income Report',
                            description: 'View Income Reports'
                        },
                        {
                            id: 60321232,
                            name: 'Bank Credit And Debit Report',
                            icon: 'BadgeIndianRupee',
                            url: '/pettycash/BankCopyReportVVVS',
                            title: 'Bank Credit And Debit Report',
                            description: 'View Bank Credit And Debit Reports'
                        }
                    ]
                }
            ]
        }
    ]
};
