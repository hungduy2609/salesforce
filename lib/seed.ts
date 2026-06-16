import type { Activity, CrmData, OpportunityStage } from "./types";

export const opportunityStages: OpportunityStage[] = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost"
];

export const seedData: CrmData = {
  accounts: [
    {
      id: "acc-001",
      name: "ABC Software",
      industry: "Software",
      website: "https://abc.example.com",
      phone: "+84 28 5550 1200",
      owner: "Duy",
      createdAt: "2026-05-18",
      updatedAt: "2026-06-12"
    },
    {
      id: "acc-002",
      name: "XYZ Corp",
      industry: "Finance",
      website: "https://xyz.example.com",
      phone: "+84 24 5550 3344",
      owner: "Linh",
      createdAt: "2026-05-21",
      updatedAt: "2026-06-09"
    },
    {
      id: "acc-003",
      name: "Demo Ltd",
      industry: "Retail",
      website: "https://demo.example.com",
      phone: "+84 28 5550 6677",
      owner: "Duy",
      createdAt: "2026-05-24",
      updatedAt: "2026-06-10"
    },
    {
      id: "acc-004",
      name: "Lotus Cloud",
      industry: "Technology",
      website: "https://lotus.example.com",
      phone: "+84 28 5550 9100",
      owner: "Mai",
      createdAt: "2026-05-29",
      updatedAt: "2026-06-11"
    }
  ],
  contacts: [
    {
      id: "con-001",
      firstName: "Nguyen Van",
      lastName: "A",
      accountId: "acc-001",
      title: "QA Manager",
      department: "Quality Engineering",
      email: "a@abc.example.com",
      phone: "+84 90 111 2222",
      mobile: "+84 90 111 2233",
      status: "Active",
      owner: "Duy",
      createdAt: "2026-05-19",
      updatedAt: "2026-06-12"
    },
    {
      id: "con-002",
      firstName: "Tran Thi",
      lastName: "B",
      accountId: "acc-002",
      title: "CEO",
      department: "Executive",
      email: "b@xyz.example.com",
      phone: "+84 91 222 3333",
      mobile: "+84 91 222 3344",
      status: "Active",
      owner: "Linh",
      createdAt: "2026-05-23",
      updatedAt: "2026-06-10"
    },
    {
      id: "con-003",
      firstName: "Le Van",
      lastName: "C",
      accountId: "acc-003",
      title: "Operations Lead",
      department: "Operations",
      email: "c@demo.example.com",
      phone: "+84 92 333 4444",
      mobile: "+84 92 333 4455",
      status: "Inactive",
      owner: "Duy",
      createdAt: "2026-05-27",
      updatedAt: "2026-06-05"
    },
    {
      id: "con-004",
      firstName: "Pham",
      lastName: "Minh",
      accountId: "acc-004",
      title: "Product Director",
      department: "Product",
      email: "minh@lotus.example.com",
      phone: "+84 93 444 5555",
      mobile: "+84 93 444 5566",
      status: "Active",
      owner: "Mai",
      createdAt: "2026-05-31",
      updatedAt: "2026-06-13"
    },
    {
      id: "con-005",
      firstName: "Hoang",
      lastName: "Nhi",
      accountId: "acc-001",
      title: "Automation Architect",
      department: "Engineering",
      email: "nhi@abc.example.com",
      phone: "+84 94 555 6666",
      mobile: "+84 94 555 6677",
      status: "Active",
      owner: "Duy",
      createdAt: "2026-06-01",
      updatedAt: "2026-06-12"
    }
  ],
  leads: [
    {
      id: "lead-001",
      firstName: "Website",
      lastName: "Lead",
      company: "Green Studio",
      title: "Head of Growth",
      email: "website@green.example.com",
      phone: "+84 95 111 2222",
      source: "Website",
      status: "New",
      owner: "Duy",
      createdAt: "2026-06-01",
      updatedAt: "2026-06-12"
    },
    {
      id: "lead-002",
      firstName: "Facebook",
      lastName: "Lead",
      company: "An Phu Logistics",
      title: "Sales Director",
      email: "social@anphu.example.com",
      phone: "+84 95 222 3333",
      source: "Facebook",
      status: "Working",
      owner: "Linh",
      createdAt: "2026-06-03",
      updatedAt: "2026-06-11"
    },
    {
      id: "lead-003",
      firstName: "Referral",
      lastName: "Lead",
      company: "Blue River Bank",
      title: "IT Manager",
      email: "referral@brb.example.com",
      phone: "+84 95 333 4444",
      source: "Referral",
      status: "Qualified",
      owner: "Mai",
      createdAt: "2026-06-04",
      updatedAt: "2026-06-13"
    },
    {
      id: "lead-004",
      firstName: "Event",
      lastName: "Guest",
      company: "Northwind Asia",
      title: "Procurement Lead",
      email: "event@northwind.example.com",
      phone: "+84 95 444 5555",
      source: "Event",
      status: "New",
      owner: "Duy",
      createdAt: "2026-06-06",
      updatedAt: "2026-06-10"
    },
    {
      id: "lead-005",
      firstName: "Partner",
      lastName: "Lead",
      company: "Mekong Robotics",
      title: "COO",
      email: "partner@mekong.example.com",
      phone: "+84 95 555 6666",
      source: "Partner",
      status: "Converted",
      owner: "Linh",
      createdAt: "2026-06-08",
      updatedAt: "2026-06-13"
    }
  ],
  opportunities: [
    {
      id: "opp-001",
      name: "CRM Automation Deal",
      accountId: "acc-001",
      contactId: "con-001",
      amount: 5000,
      stage: "Proposal",
      closeDate: "2026-06-28",
      owner: "Duy",
      createdAt: "2026-05-26",
      updatedAt: "2026-06-12"
    },
    {
      id: "opp-002",
      name: "QA Platform Deal",
      accountId: "acc-002",
      contactId: "con-002",
      amount: 12500,
      stage: "Negotiation",
      closeDate: "2026-07-08",
      owner: "Linh",
      createdAt: "2026-05-30",
      updatedAt: "2026-06-13"
    },
    {
      id: "opp-003",
      name: "Retail Cloud Pilot",
      accountId: "acc-003",
      contactId: "con-003",
      amount: 3000,
      stage: "Prospecting",
      closeDate: "2026-07-15",
      owner: "Duy",
      createdAt: "2026-06-02",
      updatedAt: "2026-06-07"
    },
    {
      id: "opp-004",
      name: "Lotus AI Expansion",
      accountId: "acc-004",
      contactId: "con-004",
      amount: 18000,
      stage: "Closed Won",
      closeDate: "2026-06-18",
      owner: "Mai",
      createdAt: "2026-06-05",
      updatedAt: "2026-06-13"
    },
    {
      id: "opp-005",
      name: "ABC Regression Suite",
      accountId: "acc-001",
      contactId: "con-005",
      amount: 8200,
      stage: "Qualification",
      closeDate: "2026-07-02",
      owner: "Duy",
      createdAt: "2026-06-07",
      updatedAt: "2026-06-12"
    }
  ],
  activities: [
    activity("act-001", "contact", "con-001", "Call", "Called Nguyen Van A", "Discussed CRM automation coverage.", "2026-06-12", "Completed"),
    activity("act-002", "opportunity", "opp-001", "Task", "Follow up proposal", "Send revised pricing and timeline.", "2026-06-15", "Open"),
    activity("act-003", "account", "acc-001", "Note", "Created Opportunity CRM Deal", "Stakeholders requested a short demo.", "2026-06-11", "Completed"),
    activity("act-004", "lead", "lead-002", "Email", "Sent qualification email", "Requested automation budget and timeline.", "2026-06-14", "Open"),
    activity("act-005", "contact", "con-002", "Task", "Book executive review", "Coordinate proposal walkthrough.", "2026-06-17", "Open"),
    activity("act-006", "opportunity", "opp-002", "Call", "Negotiation call", "Reviewed procurement checklist.", "2026-06-13", "Completed"),
    activity("act-007", "lead", "lead-001", "Task", "Qualify website lead", "Confirm use case and team size.", "2026-06-16", "Open"),
    activity("act-008", "account", "acc-004", "Note", "Expansion approved", "Pilot success metrics accepted.", "2026-06-13", "Completed"),
    activity("act-009", "contact", "con-005", "Email", "Sent regression suite deck", "Shared technical deck and sample report.", "2026-06-12", "Completed"),
    activity("act-010", "opportunity", "opp-005", "Task", "Prepare sandbox", "Configure test workspace for ABC.", "2026-06-20", "Open")
  ]
};

function activity(
  id: string,
  relatedType: Activity["relatedType"],
  relatedId: string,
  type: Activity["type"],
  subject: string,
  description: string,
  dueDate: string,
  status: Activity["status"]
): Activity {
  return {
    id,
    relatedType,
    relatedId,
    type,
    subject,
    description,
    dueDate,
    status,
    createdBy: "Duy",
    createdAt: dueDate
  };
}
