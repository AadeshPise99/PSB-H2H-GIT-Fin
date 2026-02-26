# PSB H2H AutoFlow

An internal operations application for managing Host-to-Host (H2H) file transfers and transaction processing between PSB (Payment Service Bank) and partner banking systems.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PSB H2H AutoFlow                            │
├─────────────────────────────────────────────────────────────────────┤
│   Frontend (React + TypeScript + Vite)                              │
│   └─ Port: 3000                                                     │
├─────────────────────────────────────────────────────────────────────┤
│   Backend (Node.js + Express)                                       │
│   └─ Port: 5000                                                     │
├─────────────────────────────────────────────────────────────────────┤
│   Databases                                                         │
│   ├─ MySQL (FRQ ID Lookup via batch_id)                             │
│   └─ MongoDB (Invoice/Transaction Storage)                          │
├─────────────────────────────────────────────────────────────────────┤
│   External Services                                                 │
│   └─ SFTP Server (Secure File Transfer)                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Workflow (5-Step Process)

| Step | Name | Description |
|------|------|-------------|
| **1** | **Inbound Cron** | Receives transaction data from PSB via FTP cron job |
| **2** | **Fetch Invoices** | Retrieves invoice records from MongoDB with FRQ lookup from MySQL |
| **3** | **Create Response** | Generates funding response XML with amount/date validation |
| **4** | **H2H FTP** | Uploads XML files to SFTP server with visual file manager |
| **5** | **Outbound Cron** | Triggers status/repayment callbacks and H2H limit processing |

### Step 2: Fetch Invoices - Data Flow

```
MongoDB (transaction_summary)          MongoDB (transaction)              MySQL (unique_id_generator)
┌─────────────────────────┐           ┌──────────────────────┐           ┌─────────────────────────┐
│ • psbidentifier         │  $lookup  │ • transactioninvoice │  batch_id │ • batch_id              │
│ • psbtransactionbatch   │ ────────► │   number             │ ────────► │ • unique_id (FRQ)       │
│   referenceno           │           │ • transactioninvoice │           │                         │
│ • product               │           │   amount             │           │                         │
│ • createDate            │           │ • transactionfinance │           │                         │
│                         │           │   requestamount      │           │                         │
└─────────────────────────┘           └──────────────────────┘           └─────────────────────────┘
```

### Step 3: Create Response - Validation Rules

| Field | Validation | Error Message |
|-------|------------|---------------|
| **Amount** | Must be ≤ Finance Request Amount (from invoice) | "Amount cannot exceed the finance request amount of ₹{amount}" |
| **Due Date** | Must be a future date (> today) | "Due date must be a future date" |

---

## ✨ Features

- **Dual Mode Operation**: Toggle between real backend API calls and simulated responses (bypass CORS)
- **XML Response Generator**: Form-based XML generation for banking transaction/repayment responses
- **Visual FTP Client**: Drag-and-drop interface for local ↔ remote file transfers
- **Batch Lookup**: Fetch FRQ (Funding Request) data by Batch ID from MySQL
- **Invoice Search**: Query invoices by PSB Channel Partner Identifier with MongoDB aggregation
- **FRQ Lookup**: Automatic FRQ retrieval from MySQL based on PSB transaction batch reference
- **Form Validation**: Amount validation against finance request limits, future date validation for due dates
- **Local Storage**: Save generated XMLs in browser for later upload
- **Response Types**: Support for both Transaction and Repayment response formats
- **Responsive UI**: Full-width layout optimized for desktop/laptop displays (1280px+)
- **Modern Color Scheme**: Navy blue (#303087) and purple (#973795) professional theme

---

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (Icons)

### Backend
- Node.js
- Express 5
- MySQL2
- MongoDB
- ssh2-sftp-client
- Axios
- dotenv

### Testing
- Vitest (Frontend)
- Jest + Supertest (Backend)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MySQL database
- MongoDB instance
- SFTP server access
- Google Gemini API key (optional, for AI features)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd PSB-H2H-GIT-Fin

# Install all dependencies (root, frontend, and backend)
npm run install-all
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000

# External API
API_BASE_URL=<your-api-base-url>
API_KEY=<your-api-key>

# MySQL
MYSQL_HOST=<host>
MYSQL_PORT=3306
MYSQL_USER=<username>
MYSQL_PASSWORD=<password>
MYSQL_DATABASE=<database-name>

# MongoDB
MONGO_URI=<mongodb-connection-string>
MONGO_DATABASE=<database-name>

# SFTP
SFTP_HOST=<sftp-host>
SFTP_PORT=2222
SFTP_USER=<username>
SFTP_PASSWORD=<password>
```

### Running the Application

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
npm run start:backend   # Start backend on port 5000
npm run start:frontend  # Start frontend on port 3000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/bob/transactions/ftp-cron-movement` | Inbound cron trigger |
| `POST` | `/api/v2/bob/invoices/fetch` | Fetch invoices from MongoDB |
| `POST` | `/api/v2/bob/fetch-frq` | Fetch FRQ ID by Batch ID (MySQL) |
| `POST` | `/api/v2/bob/sftp/list` | List files on SFTP server |
| `POST` | `/api/v2/bob/sftp/upload` | Upload file to SFTP server |
| `GET`  | `/api/v2/bob/sftp/config` | Get SFTP connection info (no password) |
| `POST` | `/api/v2/bob/transactions/status-repayment-callback` | Status/Repayment callback cron |
| `POST` | `/api/v2/bob/cron/h2h-limit-callback` | H2H limit callback cron |
| `GET`  | `/health` | Health check endpoint |

---

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

---

## 📁 Project Structure

```
PSB-H2H-GIT-Fin/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── psb.routes.js       # API route definitions
│   │   ├── services/
│   │   │   └── psb.service.js      # Business logic & DB operations
│   │   └── server.js               # Express server setup
│   ├── tests/                      # Backend tests
│   └── package.json
├── frontend/
│   ├── components/
│   │   ├── NavButton.tsx           # Navigation button component
│   │   ├── InboundCron.tsx         # Step 1: Inbound cron trigger
│   │   ├── FetchInvoices.tsx       # Step 2: Invoice search & display
│   │   ├── CreateResponse.tsx      # Step 3: XML response generator
│   │   ├── FTPClient.tsx           # Step 4: SFTP file manager
│   │   └── OutboundCron.tsx        # Step 5: Outbound cron triggers
│   ├── styles.ts                   # Shared Tailwind styles
│   ├── App.tsx                     # Main React component
│   ├── types.ts                    # TypeScript interfaces
│   ├── constants.ts                # XML templates & prompts
│   └── package.json
├── package.json                    # Root package with scripts
└── README.md
```

---

## 🔄 Recent Changes

### Invoice Table Enhancements
- **MongoDB Aggregation**: Uses `$lookup` to join `transaction_summary` with `transaction` collection
- **MySQL FRQ Lookup**: Fetches Finance Request ID from MySQL `unique_id_generator` table using batch reference
- **New Table Columns**:
  - PSB Batch Ref (from MongoDB)
  - Transaction Invoice Number
  - Transaction Finance Request ID
  - Invoice Amount (₹ formatted)
  - Finance Request Amount (₹ formatted)
  - Product
  - Invoice Date
  - FRQ (from MySQL)

### Form Validation
- **Amount Validation**: Cannot exceed the finance request amount from selected invoice
- **Due Date Validation**: Must be a future date (date picker restricts past dates)
- **Inline Errors**: Validation on blur and form submission

### UI/UX Improvements
- **Color Scheme**: Updated to navy blue (#303087) and purple (#973795)
- **Full-Width Layout**: Removed max-width constraints for better desktop experience
- **Component Architecture**: Refactored into modular components with shared styles

---

## 📜 License

ISC
