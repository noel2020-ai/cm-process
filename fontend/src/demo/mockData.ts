import type { FileEntry, FilePreview, LoadLog, SqlServerRelatedTable } from "../types";

const masterRows: Record<string, unknown>[] = [
  {
    MasterId: "1001",
    CustomerCode: "CUST-001",
    CustomerName: "North Ridge Supply",
    Segment: "Enterprise",
    Region: "North America",
    Country: "United States",
    Industry: "Industrial Services",
    AnnualRevenue: 1250000,
    AccountStatus: "Active",
    PrimaryManager: "A. Cruz",
    LastReviewDate: "2026-05-10",
    OnboardingChannel: "Direct",
  },
  {
    MasterId: "1002",
    CustomerCode: "CUST-002",
    CustomerName: "Green Summit Retail",
    Segment: "Mid Market",
    Region: "Asia Pacific",
    Country: "Philippines",
    Industry: "Retail",
    AnnualRevenue: 845000,
    AccountStatus: "Active",
    PrimaryManager: "M. Reyes",
    LastReviewDate: "2026-05-18",
    OnboardingChannel: "Partner",
  },
  {
    MasterId: "1005",
    CustomerCode: "CUST-005",
    CustomerName: "Everfield Components",
    Segment: "Enterprise",
    Region: "Asia Pacific",
    Country: "Singapore",
    Industry: "Manufacturing",
    AnnualRevenue: 3185000,
    AccountStatus: "At Risk",
    PrimaryManager: "L. Torres",
    LastReviewDate: "2026-05-26",
    OnboardingChannel: "Direct",
  },
  {
    MasterId: "1007",
    CustomerCode: "CUST-007",
    CustomerName: "Cedar Point Energy",
    Segment: "Enterprise",
    Region: "North America",
    Country: "United States",
    Industry: "Energy Services",
    AnnualRevenue: 4120000,
    AccountStatus: "Escalated",
    PrimaryManager: "S. Flores",
    LastReviewDate: "2026-06-11",
    OnboardingChannel: "Direct",
  },
];

export const demoFiles: FileEntry[] = [
  {
    name: "master_customer_records.csv",
    relative_path: "demo/shared/master_customer_records.csv",
    extension: ".csv",
    size_bytes: 2048,
    modified_at: "2026-06-30T09:00:00.000Z",
  },
];

export const demoPreview: FilePreview = {
  file: demoFiles[0],
  headers: Object.keys(masterRows[0]),
  inferred_types: {
    MasterId: "object",
    CustomerCode: "object",
    CustomerName: "object",
    Segment: "object",
    Region: "object",
    Country: "object",
    Industry: "object",
    AnnualRevenue: "int64",
    AccountStatus: "object",
    PrimaryManager: "object",
    LastReviewDate: "object",
    OnboardingChannel: "object",
  },
  rows: masterRows,
  row_count: masterRows.length,
  offset: 0,
  limit: masterRows.length,
  validation_errors: [],
};

export const getDemoPreviewPage = (offset: number, limit: number): FilePreview => ({
  ...demoPreview,
  rows: masterRows.slice(offset, offset + limit),
  offset,
  limit,
});

export const demoLogs: LoadLog[] = [
  {
    id: 1,
    filename: "demo/shared/master_customer_records.csv",
    table_name: "master_customer_records",
    row_count: 8,
    status: "success",
    error_message: null,
    created_at: "2026-06-30T09:15:00.000Z",
  },
];

const relatedMap: Record<string, SqlServerRelatedTable[]> = {
  "1001": [
    {
      table_name: "dbo.master_contacts",
      rows: [
        {
          ContactId: 1,
          MasterId: "1001",
          ContactName: "Elena Park",
          RoleTitle: "Procurement Director",
          EmailAddress: "elena.park@example.local",
          PhoneNumber: "+1-555-0101",
          ContactStatus: "Active",
        },
        {
          ContactId: 2,
          MasterId: "1001",
          ContactName: "Marcus Cole",
          RoleTitle: "Operations Lead",
          EmailAddress: "marcus.cole@example.local",
          PhoneNumber: "+1-555-0102",
          ContactStatus: "Active",
        },
      ],
    },
    {
      table_name: "dbo.master_orders",
      rows: [
        {
          OrderId: 1,
          MasterId: "1001",
          OrderNumber: "ORD-1001-01",
          OrderDate: "2026-04-11",
          OrderAmount: 185000,
          FulfillmentStatus: "Delivered",
          DeliveryRegion: "West",
        },
        {
          OrderId: 2,
          MasterId: "1001",
          OrderNumber: "ORD-1001-02",
          OrderDate: "2026-05-09",
          OrderAmount: 92000,
          FulfillmentStatus: "In Transit",
          DeliveryRegion: "Central",
        },
      ],
    },
    {
      table_name: "dbo.master_risk_flags",
      rows: [
        {
          RiskFlagId: 1,
          MasterId: "1001",
          RiskCategory: "Credit Review",
          SeverityLevel: "Low",
          FlagStatus: "Open",
          OwnerName: "A. Cruz",
          Notes: "Quarterly review scheduled.",
        },
      ],
    },
  ],
  "1002": [
    {
      table_name: "dbo.master_contacts",
      rows: [
        {
          ContactId: 3,
          MasterId: "1002",
          ContactName: "Leah Dizon",
          RoleTitle: "Finance Manager",
          EmailAddress: "leah.dizon@example.local",
          PhoneNumber: "+63-555-0103",
          ContactStatus: "Active",
        },
      ],
    },
    {
      table_name: "dbo.master_orders",
      rows: [
        {
          OrderId: 3,
          MasterId: "1002",
          OrderNumber: "ORD-1002-01",
          OrderDate: "2026-05-21",
          OrderAmount: 48000,
          FulfillmentStatus: "Delivered",
          DeliveryRegion: "Metro",
        },
      ],
    },
    {
      table_name: "dbo.master_risk_flags",
      rows: [],
    },
  ],
  "1005": [
    {
      table_name: "dbo.master_contacts",
      rows: [
        {
          ContactId: 6,
          MasterId: "1005",
          ContactName: "Daniel Ong",
          RoleTitle: "Commercial Director",
          EmailAddress: "daniel.ong@example.local",
          PhoneNumber: "+65-555-0106",
          ContactStatus: "Escalated",
        },
      ],
    },
    {
      table_name: "dbo.master_orders",
      rows: [
        {
          OrderId: 5,
          MasterId: "1005",
          OrderNumber: "ORD-1005-01",
          OrderDate: "2026-05-14",
          OrderAmount: 510000,
          FulfillmentStatus: "Delayed",
          DeliveryRegion: "Regional Hub",
        },
        {
          OrderId: 6,
          MasterId: "1005",
          OrderNumber: "ORD-1005-02",
          OrderDate: "2026-06-08",
          OrderAmount: 125000,
          FulfillmentStatus: "Delivered",
          DeliveryRegion: "Regional Hub",
        },
      ],
    },
    {
      table_name: "dbo.master_risk_flags",
      rows: [
        {
          RiskFlagId: 3,
          MasterId: "1005",
          RiskCategory: "Payment Delay",
          SeverityLevel: "High",
          FlagStatus: "Escalated",
          OwnerName: "L. Torres",
          Notes: "Two invoices exceeded agreed terms.",
        },
        {
          RiskFlagId: 4,
          MasterId: "1005",
          RiskCategory: "Contract Renewal",
          SeverityLevel: "Medium",
          FlagStatus: "Open",
          OwnerName: "L. Torres",
          Notes: "Commercial terms under negotiation.",
        },
      ],
    },
  ],
  "1007": [
    {
      table_name: "dbo.master_contacts",
      rows: [
        {
          ContactId: 8,
          MasterId: "1007",
          ContactName: "Samuel Reed",
          RoleTitle: "Risk Controller",
          EmailAddress: "samuel.reed@example.local",
          PhoneNumber: "+1-555-0108",
          ContactStatus: "Escalated",
        },
      ],
    },
    {
      table_name: "dbo.master_orders",
      rows: [
        {
          OrderId: 8,
          MasterId: "1007",
          OrderNumber: "ORD-1007-01",
          OrderDate: "2026-06-10",
          OrderAmount: 890000,
          FulfillmentStatus: "Escalated",
          DeliveryRegion: "South",
        },
      ],
    },
    {
      table_name: "dbo.master_risk_flags",
      rows: [
        {
          RiskFlagId: 5,
          MasterId: "1007",
          RiskCategory: "Operational Incident",
          SeverityLevel: "High",
          FlagStatus: "Escalated",
          OwnerName: "S. Flores",
          Notes: "Service interruption affected June delivery batch.",
        },
      ],
    },
  ],
};

export const getDemoRelatedTables = (masterId: string): SqlServerRelatedTable[] =>
  relatedMap[masterId] ?? [
    { table_name: "dbo.master_contacts", rows: [] },
    { table_name: "dbo.master_orders", rows: [] },
    { table_name: "dbo.master_risk_flags", rows: [] },
  ];
