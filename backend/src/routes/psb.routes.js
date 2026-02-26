const express = require('express');
const router = express.Router();
const psbService = require('../services/psb.service');

// Cron 1: Inbound Cron
router.post('/v2/bob/transactions/ftp-cron-movement', psbService.runCron1);

// SFTP List
router.post('/v2/bob/sftp/list', psbService.listSftpFiles);

// SFTP Upload
router.post('/v2/bob/sftp/upload', psbService.uploadSftpFile);

// Cron 2: Outbound Cron - Status Repayment Callback
router.post('/v2/bob/transactions/status-repayment-callback', psbService.runCron2);

// Cron 2: Outbound Cron - H2H Limit Callback
router.post('/v2/bob/cron/h2h-limit-callback', psbService.runH2HLimitCallback);

// Fetch FRQ from MySQL by Batch ID
router.post('/v2/bob/fetch-frq', psbService.fetchFrqByBatchId);

// Fetch Invoices from MongoDB
router.post('/v2/bob/invoices/fetch', psbService.fetchInvoices);

// Get SFTP config (display only, no password)
router.get('/v2/bob/sftp/config', psbService.getSftpConfig);

module.exports = router;
