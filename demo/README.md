# Demo Data

This folder contains sample data to demonstrate the dashboard flow:

1. The master file is loaded from the shared folder into the app.
2. Each master row includes a `MasterId`.
3. Clicking a master row loads related SQL Server records from three tables using `MasterId`.

## Shared Folder File

Use this folder as your shared source folder:

```env
SHARED_FOLDER_PATH=C:/Users/noel.fernandez/Desktop/SE Projects/customer_master_app/demo/shared
```

The file to scan is:

- `demo/shared/master_customer_records.csv`

## SQL Server Demo Tables

Run this script in SSMS against your demo database:

- `demo/sqlserver/create_demo_related_tables.sql`

Then set these backend values in `backend/.env`:

```env
SQLSERVER_MASTER_ID_COLUMN=MasterId
SQLSERVER_RELATED_TABLES=dbo.master_contacts,dbo.master_orders,dbo.master_risk_flags
```

## Expected Demo Flow

1. Scan the shared folder.
2. Select `master_customer_records.csv`.
3. Preview and load the file.
4. Click a row in the master table.
5. The detail section will load related rows from:
   - `dbo.master_contacts`
   - `dbo.master_orders`
   - `dbo.master_risk_flags`

