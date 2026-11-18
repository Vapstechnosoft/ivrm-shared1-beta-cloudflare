import type { IUserAccessibleModules } from '@/types';

export const feesModule: IUserAccessibleModules = {
    id: 2,
    name: 'Fees Management',
    icon: 'BadgeIndianRupee',
    menu: [
        {
            id: 2,
            name: 'Fees',
            icon: 'BadgeIndianRupee',
            sub_menu: [
                {
                    id: 4,
                    name: 'Configuration',
                    icon: 'BadgeIndianRupee',
                    pages: [
                        {
                            id: 21,
                            name: 'Fee configuration',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/configuration/masterfeeconfig',
                            title: 'Fee configuration',
                            description: 'Fee configuration'
                        }
                    ]
                },
                {
                    id: 5,
                    name: 'Masters',
                    icon: 'BadgeIndianRupee',
                    pages: [
                        {
                            id: 22,
                            name: 'Master Fee Head',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/feehead',
                            title: 'Master Fee Head',
                            description: 'Manage Master Fee Head Details'
                        },
                        {
                            id: 23,
                            name: 'Master Mode Of Payment',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/modeofpayment',
                            title: 'Master Mode Of Payment',
                            description: 'Manage Master Mode Of Payment Details'
                        },
                        {
                            id: 24,
                            name: 'Master Payment Gateway Details',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/paymentGatewayDetails',
                            title: 'Master Payment Gateway Details',
                            description: 'Manage Master Payment Gateway Details'
                        },
                        {
                            id: 25,
                            name: 'Master Fine Slab',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/masterfineslab',
                            title: 'Master Fine Slab',
                            description: 'Manage Master Fine Slab Details'
                        },
                        {
                            id: 26,
                            name: 'Concession Category',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/masterfeeconcession',
                            title: 'Concession Category',
                            description: 'Manage Concession Category Details'
                        },

                        {
                            id: 600,
                            name: 'Master Concession Category Details',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/masterfeeconcessiondetails',
                            title: 'Master Concession Category Details',
                            description: 'Manage Master Concession Category Details'
                        },
                        {
                            id: 650,
                            name: 'Master Concession Category Group Head Mapping',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/concessioncategorygroupheadmapping',
                            title: 'Master Concession Category Group Head Mapping',
                            description: 'Manage Master Concession Category Group Head Mapping'
                        },
                        {
                            id: 27,
                            name: 'Master Fee Terms',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/feemasterterms',
                            title: 'Master Fee Terms',
                            description: 'Manage Master Fee Terms Details'
                        },
                        {
                            id: 28,
                            name: 'Master Term Fee Head',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/mastertermfeehead',
                            title: 'Master Term Fee Head',
                            description: 'Manage Master Term Fee Head Details'
                        },
                        {
                            id: 601,
                            name: 'Master Term Fee Head Due Date',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/mastertermfeeheadduedate',
                            title: 'Master Term Fee Head Due Date',
                            description: 'Manage Master Term Fee Head Due Date'
                        },
                        {
                            id: 2001,
                            name: 'Master Terms Period',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/masterTermsPeriod',
                            title: 'Master Terms Period',
                            description: 'Manage Master Terms Period'
                        },
                        {
                            id: 29,
                            name: 'Master Class Category',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/classcategory',
                            title: ' Master Class Category',
                            description: 'Manage Master Class Category'
                        },
                        {
                            id: 30,
                            name: 'Master Yearly Class Category',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/category',
                            title: 'Master Yearly Class Category',
                            description: 'Manage Master Yearly Class Category'
                        },
                        {
                            id: 31,
                            name: 'Master Fee Installment',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/feesinstallment',
                            title: 'Master Fee Installment',
                            description: 'Manage Master Fee Installment'
                        },
                        {
                            id: 32,
                            name: 'Master Installment due date',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/feesinstallmentduedate',
                            title: 'Master Installment due date',
                            description: 'Manage Master Installment due date'
                        },
                        {
                            id: 33,
                            name: 'Master Fee Group Grouping',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/groupsgrouping',
                            title: 'Master Fee Group Grouping',
                            description: 'Manage Master Fee Group Grouping'
                        },
                        {
                            id: 34,
                            name: 'Master Fee Groups',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/mastergroup',
                            title: 'Master Fee Groups',
                            description: 'Manage Master Fee Groups'
                        },
                        {
                            id: 35,
                            name: 'Master Fee Yearly Groups',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/yearlygroup',
                            title: 'Master Fee Yearly Groups',
                            description: 'Manage Master Fee Yearly Groups'
                        },

                        {
                            id: 36,
                            name: 'Master Fee Yearly Groups Mapping',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/yearlygroupmapping',
                            title: 'Master Fee Yearly Groups Mapping',
                            description: 'Manage Master Fee Yearly Groups Mapping'
                        },
                        {
                            id: 37,
                            name: 'Master Fee Group wise Auto Receipt',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/groupwiseautoreceipt',
                            title: 'Master Fee Group wise Auto Receipt',
                            description: 'Manage Master Fee Group wise Auto Receipt'
                        },
                        {
                            id: 38,
                            name: 'Master Fee Yearly Rebate Settings',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/yearlyrebatesetting',
                            title: 'Master Yearly Rebate Settings',
                            description: 'Manage Master Yeary Rebate Settings'
                        },
                        {
                            id: 39,
                            name: 'Master Fee Privilege',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/feeprevilege',
                            title: 'Master Fee Privilege',
                            description: 'Manage Master Fee Privilege Details'
                        },
                        {
                            id: 391,
                            name: 'Master College Fee Privilege',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/college/masters/masterclgfeeprevilege',
                            title: 'Master College Fee Privilege',
                            description: 'Manage Master College Fee Privilege Details'
                        },
                        {
                            id: 40,
                            name: 'Master Online Payment Head Group',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/onlinepaymentheadgroupmapping',
                            title: 'Master Online Payment Head Group',
                            description: 'Manage Master Online Payment Head Group Mapping Details'
                        },
                        {
                            id: 900,
                            name: 'Master Student Fee Group Mapping',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/studentfeegroupmapping',
                            title: 'Master Student Fee Group Mapping',
                            description: 'Manage Master Student Fee Group Mapping Details'
                        },
                        {
                            id: 501,
                            name: 'Master Fee Other Student',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/feeotherstudent',
                            title: 'Master Fee Other Student',
                            description: 'Manage Master Fee Other Student Details'
                        },
                        {
                            id: 502,
                            name: 'Master Special Fee Head',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/specialFeeHead',
                            title: 'Master Special Fee Head',
                            description: 'Manage Master Special Fee Head Details'
                        },
                        {
                            id: 506,
                            name: 'Master Fee Tally Master',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/masters/feecompanygroupmapping',
                            title: 'Master Fee Tally Master',
                            description: 'Manage Fee Tally  Details'
                        }
                    ]
                },
                {
                    id: 6,
                    name: 'Transactions',
                    icon: 'BadgeIndianRupee',
                    pages: [
                        {
                            id: 40,
                            name: 'Fee Amount Entry',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/feeamountentry',
                            title: 'Fee Amount Entry',
                            description: 'Manage Fee Amount Entry Details'
                        },
                        {
                            id: 41,
                            name: 'Third Party Transaction',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/thirdPartyTransaction',
                            title: 'Third Party Transaction',
                            description: 'Manage Third Party Transaction'
                        },
                        {
                            id: 42,
                            name: 'Fee Opening Balance',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/feeopeningbalance',
                            title: 'Fee Opening Balance',
                            description: 'Manage Fee Opening Balance'
                        },
                        {
                            id: 43,
                            name: 'Fee Waivedoff',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/waivedoff',
                            title: 'Fee Waivedoff',
                            description: 'Manage Fee Waivedoff'
                        },
                        {
                            id: 500,
                            name: 'Fee Preadmission Transaction',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/feepreadmissiontrasaction',
                            title: 'Fee Preadmission Transaction',
                            description: 'Manage Fee Preadmission Transaction'
                        },
                        {
                            id: 508,
                            name: 'Fee Refundable',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/feerefundable',
                            title: 'Fee Refundable',
                            description: 'Manage Fee Refundable'
                        },
                        {
                            id: 505,
                            name: 'Fee Transaction',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/feetransaction',
                            title: 'Fee Transaction',
                            description: 'Fee Transaction'
                        },
                        {
                            id: 506,
                            name: 'Fee Adjustment',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/feeadjustment',
                            title: 'Fee Adjustment',
                            description: 'Manage Fee Adjustment'
                        },
                        {
                            id: 507,
                            name: 'Fee Master Concession',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/feeconcession',
                            title: 'Fee Master Concession',
                            description: 'Manage Fee Master Concession'
                        },
                        {
                            id: 515,
                            name: 'Fee Receipt Import Delete',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/feesreceiptimportdelete',
                            title: 'Fee Receipt Import Delete',
                            description: 'Manage Fee Receipt Import Delete'
                        },
                        {
                            id: 516,
                            name: 'Fee Receipt Import',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/feesreceiptimportstthomas',
                            title: 'Fee Receipt Import',
                            description: 'Manage Fee Receipt Import'
                        },
                        {
                            id: 517,
                            name: 'Bank Payment Import',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/bankpaymentimportstthomas',
                            title: 'Bank Payment Import',
                            description: 'Manage Bank Payment Import'
                        },
                        {
                            id: 518,
                            name: 'Fee Staff Other Transaction',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/stafftransaction',
                            title: 'Fee Staff Other Transaction',
                            description: 'Fee Staff Other Transaction'
                        },
                        {
                            id: 519,
                            name: 'Student Fee Enable Partial Payment',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/transactions/studentfeeenablepartialpayment',
                            title: 'Student Fee Enable Partial Payment',
                            description: 'Manage Student Fee Enable Partial Payment'
                        },
                        {
                            id: 520,
                            name: 'College Fee Waived Off',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/college/transaction/clgfeewaivedoff',
                            title: 'College Fee Waived Off',
                            description: 'Manage College Fee Waived Off Details'
                        },
                        {
                            id: 521,
                            name: 'College Fee Refundable',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/college/transaction/clgfeerefundable',
                            title: 'College Fee Refundable',
                            description: 'Manage College Fee Refundable Details'
                        },
                        {
                            id: 522,
                            name: 'College Fee Cheque Bounce',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/college/transaction/clgfeechequebounce',
                            title: 'College Fee Cheque Bounce',
                            description: 'Manage College Fee Cheque Bounce Details'
                        },
                        {
                            id: 523,
                            name: 'College Fee Opening Balance',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/college/transaction/clgfeeopeningbalance',
                            title: 'College Fee Opening Balance',
                            description: 'Manage College Fee Opening Balance Details'
                        }
                    ]
                },
                {
                    id: 2001,
                    name: 'Reports',
                    icon: 'BadgeIndianRupee',
                    pages: [
                        {
                            id: 10011,
                            name: 'Fee Defaulter report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/feedefaulterreport',
                            title: 'Fee Defaulter Report',
                            description: 'Fee Defaulter Report'
                        },
                        {
                            id: 10012,
                            name: 'Daily Fee Collection Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/dailyfeecollectionreport',
                            title: 'Daily Fee Collection Report',
                            description: 'Manage Daily Fee Collection Report Details'
                        },
                        {
                            id: 10013,
                            name: 'Yearly Fee Collection Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/yearlyfeecollectionreport',
                            title: 'Yearly Fee Collection Report',
                            description: 'Manage Yearly Fee Collection Report Details'
                        },
                        {
                            id: 10014,
                            name: 'Audit Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/auditreport',
                            title: 'Audit Report',
                            description: 'Manage Audit Report Details'
                        },
                        {
                            id: 10015,
                            name: 'Fee Concession Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/feeconcessionreport',
                            title: 'Fee Concession Report',
                            description: 'Manage Fee Concession Report Details'
                        },
                        {
                            id: 10016,
                            name: 'Fee Head Wise Report ',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/headwisereport',
                            title: 'Fee Head Wise Report',
                            description: 'Manage Fee Head Wise Report Details'
                        },
                        {
                            id: 10017,
                            name: 'Fee Due Date Report ',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/feeduedatereport',
                            title: 'Fee Due Date Report',
                            description: 'Manage Fee Due Date Report Details'
                        },
                        {
                            id: 10018,
                            name: 'Fee Month End Report ',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/feemonthendreport',
                            title: 'Fee Month End Report',
                            description: 'Manage Fee Month End Report Details'
                        },
                        {
                            id: 10019,
                            name: 'Fee Class Category Report ',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/classcategoryreport',
                            title: 'Fee Class Category Report',
                            description: 'Manage Fee Class Category Report Details'
                        },
                        {
                            id: 10020,
                            name: 'Fee Consolidated Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/feeconsolidatedreport',
                            title: 'Fee Consolidated Report',
                            description: 'Manage Fee Consolidated Report Details'
                        },
                        {
                            id: 10021,
                            name: 'Fee Installment Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/feesinstallmentreport',
                            title: 'Fee Installment Report',
                            description: 'Manage Fee Installment Report Details'
                        },
                        {
                            id: 10022,
                            name: 'Fee Receipt Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/feereceiptreport',
                            title: 'Fee Receipt Report',
                            description: 'Manage Fee Receipt Report Details'
                        },
                        {
                            id: 10023,
                            name: 'Fee Accounts Position Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/feeaccountspositionReport',
                            title: 'Fee Accounts Position Report',
                            description: 'Manage Fee Accounts Position Report Details'
                        },
                        {
                            id: 10024,
                            name: 'Fee Student Term Wise Paid Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/feestudenttermwisepaidreport',
                            title: 'Fee Student Term Wise Paid Report',
                            description: 'Manage Fee Student Term Wise Paid Report Details'
                        },
                        {
                            id: 10025,
                            name: 'Excel Not Imported Student Details Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/excelnotimportedstudentdetailsreport',
                            title: 'Excel Not Imported Student Details Report',
                            description: 'Manage Excel Not Imported Student Details Report'
                        },
                        {
                            id: 10026,
                            name: 'Fee Group Wise Student Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/feegroupwisestudentreport',
                            title: 'Fee Group Wise Student Report',
                            description: 'Manage Fee Group Wise Student Report Details'
                        },
                        {
                            id: 10027,
                            name: 'Fee Defaulter Report',
                            icon: 'BadgeIndianRupee',
                            url: '/fees/feereports/feedefaulterreportstthomas',
                            title: 'Fee Defaulter Report',
                            description: 'Manage Fee Defaulter Report Details'
                        }
                    ]
                }
            ]
        }
    ]
};
