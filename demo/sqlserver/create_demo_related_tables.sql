IF OBJECT_ID('dbo.master_contacts', 'U') IS NOT NULL
    DROP TABLE dbo.master_contacts;
GO

IF OBJECT_ID('dbo.master_orders', 'U') IS NOT NULL
    DROP TABLE dbo.master_orders;
GO

IF OBJECT_ID('dbo.master_risk_flags', 'U') IS NOT NULL
    DROP TABLE dbo.master_risk_flags;
GO

CREATE TABLE dbo.master_contacts (
    ContactId INT IDENTITY(1,1) PRIMARY KEY,
    MasterId VARCHAR(50) NOT NULL,
    ContactName VARCHAR(150) NOT NULL,
    RoleTitle VARCHAR(120) NOT NULL,
    EmailAddress VARCHAR(180) NOT NULL,
    PhoneNumber VARCHAR(50) NULL,
    ContactStatus VARCHAR(50) NOT NULL
);
GO

CREATE TABLE dbo.master_orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    MasterId VARCHAR(50) NOT NULL,
    OrderNumber VARCHAR(50) NOT NULL,
    OrderDate DATE NOT NULL,
    OrderAmount DECIMAL(18,2) NOT NULL,
    FulfillmentStatus VARCHAR(50) NOT NULL,
    DeliveryRegion VARCHAR(100) NOT NULL
);
GO

CREATE TABLE dbo.master_risk_flags (
    RiskFlagId INT IDENTITY(1,1) PRIMARY KEY,
    MasterId VARCHAR(50) NOT NULL,
    RiskCategory VARCHAR(100) NOT NULL,
    SeverityLevel VARCHAR(50) NOT NULL,
    FlagStatus VARCHAR(50) NOT NULL,
    OwnerName VARCHAR(120) NOT NULL,
    Notes VARCHAR(500) NULL
);
GO

INSERT INTO dbo.master_contacts (MasterId, ContactName, RoleTitle, EmailAddress, PhoneNumber, ContactStatus) VALUES
('1001', 'Elena Park', 'Procurement Director', 'elena.park@example.local', '+1-555-0101', 'Active'),
('1001', 'Marcus Cole', 'Operations Lead', 'marcus.cole@example.local', '+1-555-0102', 'Active'),
('1002', 'Leah Dizon', 'Finance Manager', 'leah.dizon@example.local', '+63-555-0103', 'Active'),
('1003', 'Jonas Weber', 'Supply Planning Head', 'jonas.weber@example.local', '+49-555-0104', 'Active'),
('1004', 'Nina Clarke', 'Warehouse Supervisor', 'nina.clarke@example.local', '+1-555-0105', 'Active'),
('1005', 'Daniel Ong', 'Commercial Director', 'daniel.ong@example.local', '+65-555-0106', 'Escalated'),
('1006', 'Rhea Malik', 'Clinical Partnerships Lead', 'rhea.malik@example.local', '+971-555-0107', 'Active'),
('1007', 'Samuel Reed', 'Risk Controller', 'samuel.reed@example.local', '+1-555-0108', 'Escalated');
GO

INSERT INTO dbo.master_orders (MasterId, OrderNumber, OrderDate, OrderAmount, FulfillmentStatus, DeliveryRegion) VALUES
('1001', 'ORD-1001-01', '2026-04-11', 185000.00, 'Delivered', 'West'),
('1001', 'ORD-1001-02', '2026-05-09', 92000.00, 'In Transit', 'Central'),
('1002', 'ORD-1002-01', '2026-05-21', 48000.00, 'Delivered', 'Metro'),
('1003', 'ORD-1003-01', '2026-03-30', 265000.00, 'Review Hold', 'North'),
('1005', 'ORD-1005-01', '2026-05-14', 510000.00, 'Delayed', 'Regional Hub'),
('1005', 'ORD-1005-02', '2026-06-08', 125000.00, 'Delivered', 'Regional Hub'),
('1006', 'ORD-1006-01', '2026-04-27', 76000.00, 'Delivered', 'Gulf'),
('1007', 'ORD-1007-01', '2026-06-10', 890000.00, 'Escalated', 'South');
GO

INSERT INTO dbo.master_risk_flags (MasterId, RiskCategory, SeverityLevel, FlagStatus, OwnerName, Notes) VALUES
('1001', 'Credit Review', 'Low', 'Open', 'A. Cruz', 'Quarterly review scheduled.'),
('1003', 'Documentation Gap', 'Medium', 'Open', 'R. Santos', 'Awaiting renewed compliance pack.'),
('1005', 'Payment Delay', 'High', 'Escalated', 'L. Torres', 'Two invoices exceeded agreed terms.'),
('1005', 'Contract Renewal', 'Medium', 'Open', 'L. Torres', 'Commercial terms under negotiation.'),
('1007', 'Operational Incident', 'High', 'Escalated', 'S. Flores', 'Service interruption affected June delivery batch.'),
('1008', 'Dormant Account', 'Low', 'Closed', 'D. Ramos', 'No activity in the last ninety days.');
GO
