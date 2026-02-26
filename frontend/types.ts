export interface CronResult {
  status: number;
  statusText: string;
  time: number;
  response: string;
  timestamp: string;
}

export type Screen = 'cron1' | 'invoices' | 'xml-gen' | 'ftp' | 'cron2';

export interface Invoice {
  psbtransactionbatchreferenceno: string;
  transactioninvoicenumber: string;
  transactioninvoiceamount: string;
  transactionfinancerequestamount: string;
  transactionfinancerequestid: string;
  product: string;
  transactioninvoicedate: string;
  frqId: string; // FRQ from MySQL lookup
}

export type ServerLocation = 'psb-source' | 'h2h-input' | 'h2h-output' | 'psb-dest';

export interface InvoiceFile {
  id: string;
  filename: string;
  timestamp: Date;
  location: ServerLocation;
  content: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  stage: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type ResponseType = 'transaction' | 'repayment';

export interface ResponseFormData {
  headerDatetime: string; // Header datetime
  action: 'fund' | 'decline' | 'liquidate' | 'overdue' | 'annotate' | 'approve';
  actionDate: string;
  amount: string;
  comment: string;
  id: string;
  dueDate: string;
  bankRef: string;
  // Repayment-specific fields
  liquidationSeq: string;
  finalLiquidation: 'Y' | 'N';
}

export interface StoredFile {
  id: string;
  name: string;
  content: string;
  size: string;
  date: string;
  type: 'file' | 'folder';
  path?: string; // For remote simulation
}