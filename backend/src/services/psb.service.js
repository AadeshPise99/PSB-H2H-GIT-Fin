const axios = require('axios');
const Client = require('ssh2-sftp-client');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

// API Configuration (from .env)
const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

// MySQL Configuration (from .env)
const MYSQL_CONFIG = {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

// MongoDB Configuration (from .env)
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DATABASE = process.env.MONGO_DATABASE;

// SFTP Configuration (from .env)
const SFTP_CONFIG = {
    host: process.env.SFTP_HOST,
    port: process.env.SFTP_PORT || '2222',
    user: process.env.SFTP_USER,
    password: process.env.SFTP_PASSWORD
};

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'API-KEY': API_KEY
    }
});

exports.runCron1 = async (req, res) => {
    try {
        const response = await axiosInstance.post('/v2/cron/ftp-movement-cron', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error in runCron1:', error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
    }
};

exports.listSftpFiles = async (req, res) => {
    let sftp = new Client();
    try {
        const { path } = req.body;

        // Use server-side SFTP credentials from .env
        await sftp.connect({
            host: SFTP_CONFIG.host,
            port: parseInt(SFTP_CONFIG.port) || 22,
            username: SFTP_CONFIG.user,
            password: SFTP_CONFIG.password,
            tryKeyboard: true,
            readyTimeout: 30000
        });

        const fileList = await sftp.list(path || '/');

        // Transform for frontend compatibility
        const formattedFiles = fileList.map(f => ({
            id: `remote_${Math.random().toString(36).substr(2, 9)}`,
            name: f.name,
            type: f.type === 'd' ? 'folder' : 'file',
            size: f.size.toString(),
            date: new Date(f.modifyTime).toISOString().split('T')[0], // Simplified date
            content: '' // Content not fetched on list
        }));

        res.json({ status: 'success', files: formattedFiles });
    } catch (error) {
        console.error('Error in listSftpFiles:', error.message);
        res.status(500).json({ message: `SFTP Error: ${error.message}` });
    } finally {
        sftp.end();
    }
};

exports.uploadSftpFile = async (req, res) => {
    let sftp = new Client();
    try {
        const { path, filename, content } = req.body;

        // Use server-side SFTP credentials from .env
        await sftp.connect({
            host: SFTP_CONFIG.host,
            port: parseInt(SFTP_CONFIG.port) || 22,
            username: SFTP_CONFIG.user,
            password: SFTP_CONFIG.password,
            tryKeyboard: true,
            readyTimeout: 30000
        });

        // Verify remote path exists
        const dirExists = await sftp.exists(path);
        if (!dirExists) {
             return res.status(404).json({ message: `Remote directory does not exist: ${path}` });
        }

        // Handle potential trailing slash in path
        const safePath = path.endsWith('/') ? path.slice(0, -1) : path;
        const remoteFilePath = `${safePath}/${filename}`;

        await sftp.put(Buffer.from(content), remoteFilePath);

        res.json({ status: 'success', message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error in uploadSftpFile:', error.message);
        res.status(500).json({ message: `SFTP Upload Error: ${error.message}` });
    } finally {
        sftp.end();
    }
};

exports.runCron2 = async (req, res) => {
    try {
        const response = await axiosInstance.post('/v2/cron/status-repayment-callback-cron', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error in runCron2:', error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
    }
};

// H2H Limit Callback Cron
exports.runH2HLimitCallback = async (req, res) => {
    try {
        const response = await axiosInstance.post('/v2/cron/h2h-limit-callback-cron', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error in runH2HLimitCallback:', error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
    }
};

// Fetch FRQ (Finance Request ID) from MySQL using Batch ID
exports.fetchFrqByBatchId = async (req, res) => {
    let connection;
    try {
        const { batchId } = req.body;

        if (!batchId) {
            return res.status(400).json({ message: 'Batch ID is required' });
        }

        connection = await mysql.createConnection(MYSQL_CONFIG);

        const [rows] = await connection.execute(
            'SELECT unique_id FROM unique_id_generator WHERE batch_id = ?',
            [batchId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No FRQ found for the given Batch ID' });
        }

        // Return all unique_ids found (there might be multiple)
        const frqIds = rows.map(row => row.unique_id);

        res.json({
            status: 'success',
            count: frqIds.length,
            frqIds: frqIds,
            // Return first one as primary (for single selection use case)
            primaryFrq: frqIds[0]
        });
    } catch (error) {
        console.error('Error in fetchFrqByBatchId:', error.message);
        res.status(500).json({ message: `MySQL Error: ${error.message}` });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

// Helper function to get FRQ by batch ID (internal use)
const getFrqByBatchId = async (batchId) => {
    let connection;
    try {
        if (!batchId) {
            console.log('getFrqByBatchId: No batchId provided');
            return null;
        }

        // Create connection with explicit database
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT) || 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: 'api-gateway'
        });

        // Use explicit database.table reference
        const [rows] = await connection.execute(
            'SELECT unique_id FROM `api-gateway`.unique_id_generator WHERE batch_id = ?',
            [batchId]
        );

        if (rows.length === 0) {
            console.log(`FRQ not found for batch_id: ${batchId}`);
            return null;
        }

        console.log(`FRQ found: ${rows[0].unique_id} for batch_id: ${batchId}`);
        return rows[0].unique_id;
    } catch (error) {
        console.error(`MySQL Error for batch_id ${batchId}:`, error.message);
        console.error('Full error:', error);
        return null;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

// Fetch Invoices from MongoDB with $lookup to transaction collection
exports.fetchInvoices = async (req, res) => {
    let mongoClient;
    try {
        const { psbIdentifier, limit = 5 } = req.body;

        if (!psbIdentifier) {
            return res.status(400).json({ message: 'PSB Identifier is required' });
        }

        // Validate limit (5-15)
        const fetchLimit = Math.min(Math.max(parseInt(limit) || 5, 5), 15);

        // Connect to MongoDB
        mongoClient = new MongoClient(MONGO_URI);
        await mongoClient.connect();

        const db = mongoClient.db(MONGO_DATABASE);
        const collection = db.collection('transaction_summary');

        // Aggregation pipeline with $lookup to transaction collection
        const invoices = await collection.aggregate([
            {
                $match: {
                    psbidentifier: psbIdentifier,
                    isArchived: false
                }
            },
            {
                $sort: { createDate: -1 }
            },
            {
                $limit: fetchLimit
            },
            {
                $lookup: {
                    from: "transaction",
                    localField: "psbtransactionbatchreferenceno",
                    foreignField: "psbtransactionbatchreferenceno",
                    as: "transactionDetails"
                }
            },
            {
                $unwind: "$transactionDetails"
            },
            {
                $project: {
                    _id: 0,
                    psbtransactionbatchreferenceno: 1,
                    transactioninvoicenumber: "$transactionDetails.transactioninvoicenumber",
                    transactioninvoiceamount: "$transactionDetails.transactioninvoiceamount",
                    transactionfinancerequestamount: "$transactionDetails.transactionfinancerequestamount",
                    transactionfinancerequestid: "$transactionDetails.transactionfinancerequestid",
                    product: "$product",
                    transactioninvoicedate: {
                        $toDate: "$transactionDetails.transactioninvoicedate"
                    }
                }
            }
        ]).toArray();

        // Fetch FRQ from MySQL for each invoice using psbtransactionbatchreferenceno
        const invoicesWithFrq = await Promise.all(
            invoices.map(async (invoice) => {
                const frqId = await getFrqByBatchId(invoice.psbtransactionbatchreferenceno);
                return {
                    ...invoice,
                    frqId: frqId || 'N/A'
                };
            })
        );

        res.json({
            status: 'success',
            count: invoicesWithFrq.length,
            invoices: invoicesWithFrq
        });
    } catch (error) {
        console.error('Error in fetchInvoices:', error.message);
        res.status(500).json({ message: `Error: ${error.message}` });
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
};

// Get SFTP config (without exposing password to frontend)
exports.getSftpConfig = async (req, res) => {
    res.json({
        protocol: 'SFTP',
        host: SFTP_CONFIG.host,
        port: SFTP_CONFIG.port,
        user: SFTP_CONFIG.user
        // Password NOT exposed to frontend
    });
};

// Fetch CP Data from MongoDB using CP Identifier (for Exposure Update)
exports.fetchCpData = async (req, res) => {
    let mongoClient;
    try {
        const { cpIdentifier } = req.body;

        if (!cpIdentifier) {
            return res.status(400).json({ message: 'CP Identifier is required' });
        }

        // Connect to MongoDB
        mongoClient = new MongoClient(MONGO_URI);
        await mongoClient.connect();

        const db = mongoClient.db(MONGO_DATABASE);
        const collection = db.collection('channel_partners');

        // Aggregation pipeline: join channel_partners with programs collection
        const result = await collection.aggregate([
            // Step 1: Find the specific channel partner by cpreferenceid
            {
                $match: {
                    cpreferenceid: cpIdentifier
                }
            },
            // Step 2: Join with the "programs" collection
            {
                $lookup: {
                    from: "programs",
                    localField: "psbplatformprogramid",
                    foreignField: "id",
                    as: "program_data"
                }
            },
            // Step 3: Flatten the array created by $lookup
            {
                $unwind: "$program_data"
            },
            // Step 4: Project the fields we need
            {
                $project: {
                    _id: 0,
                    tmchannelpartnerid: 1,
                    tmprogramid: "$program_data.tmprogramid"
                }
            }
        ]).toArray();

        if (result.length === 0) {
            return res.status(404).json({ message: 'No CP data found for the given CP Identifier' });
        }

        res.json({
            status: 'success',
            data: result[0]
        });
    } catch (error) {
        console.error('Error in fetchCpData:', error.message);
        res.status(500).json({ message: `MongoDB Error: ${error.message}` });
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
};
