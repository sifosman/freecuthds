"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cutlistController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const template_service_1 = require("../services/template.service");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Botsailor webhook URL for sending cutting list links
const BOTSAILOR_WEBHOOK_URL = 'https://www.botsailor.com/webhook/whatsapp-workflow/145613.157394.183999.1748553417';
// Import the Cutlist model with CommonJS require to avoid TypeScript module resolution issues
const Cutlist = require('../models/cutlist.model').default;
// Prepare cutlist data for template rendering
const prepareCutlistData = (cutlistData) => {
    return {
        dimensions: cutlistData.dimensions || [],
        unit: cutlistData.unit || 'mm',
        rawText: cutlistData.rawText || '',
        customerName: cutlistData.customerName || 'Customer',
        projectName: cutlistData.projectName || 'Cutting List Project',
        id: cutlistData._id
    };
};
// View cutlist by ID
const viewCutlistById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cutlistId = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(cutlistId)) {
            return res.status(400).send('Invalid cutting list ID');
        }
        const cutlist = yield Cutlist.findById(cutlistId);
        if (!cutlist) {
            return res.status(404).send('Cutting list not found');
        }
        // Prepare data for template
        const templateData = prepareCutlistData(cutlist);
        // Render the template
        const htmlContent = yield (0, template_service_1.renderTemplate)('cutlist-template', templateData);
        // Return HTML page
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);
    }
    catch (error) {
        console.error('Error viewing cutting list:', error);
        res.status(500).send('Server error');
    }
});
// Update cutting list by ID
const updateCutlistById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cutlistId = req.params.id;
        const { cutlistData } = req.body;
        console.log('Received update data:', JSON.stringify(req.body, null, 2));
        if (!mongoose_1.default.Types.ObjectId.isValid(cutlistId)) {
            return res.status(400).json({ success: false, message: 'Invalid cutting list ID' });
        }
        const cutlist = yield Cutlist.findById(cutlistId);
        if (!cutlist) {
            return res.status(404).json({ success: false, message: 'Cutting list not found' });
        }
        // Update dimensions from cutPieces sent by frontend
        if (cutlistData && cutlistData.cutPieces) {
            cutlist.dimensions = cutlistData.cutPieces;
        }
        // Update stockPieces if provided
        if (cutlistData && cutlistData.stockPieces) {
            cutlist.stockPieces = cutlistData.stockPieces;
        }
        // Update materials if provided
        if (cutlistData && cutlistData.materials) {
            cutlist.materials = cutlistData.materials;
        }
        yield cutlist.save();
        // For the response, map dimensions back to cutPieces for frontend consistency
        const responseData = Object.assign(Object.assign({}, cutlist.toObject()), { cutPieces: cutlist.dimensions || [] });
        res.json({
            success: true,
            message: 'Cutting list updated successfully',
            cutlist: responseData
        });
    }
    catch (error) {
        console.error('Error updating cutting list:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// Get cutlist data as JSON
const getCutlistData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const cutlistId = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(cutlistId)) {
            return res.status(400).json({ success: false, message: 'Invalid cutting list ID' });
        }
        const cutlist = yield Cutlist.findById(cutlistId);
        if (!cutlist) {
            return res.status(404).json({ success: false, message: 'Cutting list not found' });
        }
        console.log('Original cutlist from database:', JSON.stringify(cutlist, null, 2));
        console.log('Original dimensions:', JSON.stringify(cutlist.dimensions, null, 2));
        // Create a modified response with dimensions mapped to cutPieces for frontend compatibility
        const responseData = Object.assign(Object.assign({}, cutlist.toObject()), { cutPieces: cutlist.dimensions || [] // Map dimensions to cutPieces for frontend
         });
        // Log the structure after mapping to verify cutPieces is present
        console.log('Response data structure:');
        console.log('- cutPieces exists:', !!responseData.cutPieces);
        console.log('- cutPieces is array:', Array.isArray(responseData.cutPieces));
        console.log('- cutPieces length:', ((_a = responseData.cutPieces) === null || _a === void 0 ? void 0 : _a.length) || 0);
        console.log('- dimensions exists:', !!responseData.dimensions);
        console.log('- stockPieces exists:', !!responseData.stockPieces);
        console.log('- materials exists:', !!responseData.materials);
        console.log('Full response data being sent:', JSON.stringify(responseData, null, 2));
        res.json({
            success: true,
            cutlist: responseData
        });
    }
    catch (error) {
        console.error('Error getting cutlist data:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// Get all cutlists
const getAllCutlists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cutlists = yield Cutlist.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            cutlists
        });
    }
    catch (error) {
        console.error('Error getting all cutlists:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// Helper function to send cutlist link via WhatsApp
const sendCutlistLinkViaWhatsApp = (cutlistId, phoneNumber, customerName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Skip if no phone number is provided
        if (!phoneNumber) {
            console.log('No phone number provided, skipping WhatsApp notification');
            return { success: false, message: 'No phone number provided' };
        }
        // Format phone number - ensure it has correct format for WhatsApp
        let formattedPhone = phoneNumber.replace(/[^0-9+]/g, '');
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+' + formattedPhone;
        }
        // Generate the cutlist URL
        const baseUrl = process.env.BASE_URL || 'https://hds-sifosmans-projects.vercel.app';
        const cutlistUrl = `${baseUrl}/cutlist-edit/${cutlistId}`;
        // Get the cutlist from the database
        const cutlist = yield Cutlist.findById(cutlistId);
        if (!cutlist) {
            console.error('Cutlist not found when sending WhatsApp message');
            return { success: false, message: 'Cutlist not found' };
        }
        // Prepare the data to send to Botsailor webhook
        const webhookData = {
            recipient: formattedPhone,
            customer_name: customerName || cutlist.customerName || 'Customer',
            cutlist_url: cutlistUrl,
            dimensions_count: ((_a = cutlist.dimensions) === null || _a === void 0 ? void 0 : _a.length) || 0,
            project_name: cutlist.projectName || 'Cutting List Project'
        };
        console.log('Sending cutlist link to WhatsApp via Botsailor webhook:', webhookData);
        // Send the data to the Botsailor webhook
        const response = yield axios_1.default.post(BOTSAILOR_WEBHOOK_URL, webhookData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });
        console.log('Botsailor webhook response:', response.data);
        return { success: true, message: 'WhatsApp message sent successfully' };
    }
    catch (error) {
        console.error('Error sending cutlist link to WhatsApp:', error);
        return {
            success: false,
            message: `Error sending WhatsApp message: ${error instanceof Error ? error.message : String(error)}`
        };
    }
});
// Create cutlist from n8n data
const createFromN8nData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received data for cutlist creation:', JSON.stringify(req.body, null, 2));
        const { cutlistData, phoneNumber, senderName, ocrText } = req.body;
        let newCutlist;
        let whatsAppResult = { success: false, message: 'WhatsApp message not sent' };
        // If we don't have cutlist data directly, but we have OCR text, create a new cutlist
        if (!cutlistData && ocrText) {
            // Process the OCR text to extract dimensions with better logging
            console.log('Creating cutlist from OCR text');
            console.log('OCR Text to process:', ocrText);
            const { processOcrText } = require('../services/ocr-disabled.service');
            const ocrResults = processOcrText(ocrText);
            console.log('Extracted dimensions from OCR text:', JSON.stringify(ocrResults.dimensions, null, 2));
            console.log('Number of dimensions extracted:', ocrResults.dimensions.length);
            // Create default stock piece (2000 x 1200 with infinite quantity)
            const stockPieces = [{
                    id: `stock-${Date.now()}`,
                    width: 2000,
                    length: 1200,
                    quantity: 999 // Represent "infinite" quantity
                }];
            // Create default material
            const materials = [{
                    id: `material-${Date.now()}`,
                    name: 'white melamine',
                    type: 'melamine',
                    thickness: 16 // Default thickness in mm
                }];
            // Create a new cutlist with the extracted dimensions and defaults for other fields
            newCutlist = new Cutlist({
                rawText: ocrText,
                unit: ocrResults.unit || 'mm',
                dimensions: ocrResults.dimensions || [], // These are the cut pieces extracted from OCR
                stockPieces: stockPieces,
                materials: materials,
                customerName: senderName || 'WhatsApp User',
                projectName: 'Cutting List from WhatsApp',
                phoneNumber: phoneNumber || '',
            });
            yield newCutlist.save();
            console.log('Created new cutlist with ID:', newCutlist._id);
            // Automatically send the cutlist link via WhatsApp
            if (phoneNumber) {
                whatsAppResult = yield sendCutlistLinkViaWhatsApp(newCutlist._id.toString(), phoneNumber, senderName || 'WhatsApp User');
            }
        }
        // If we have cutlist data directly, use it
        else if (cutlistData) {
            console.log('Creating cutlist from provided data');
            // Create a new cutlist with the provided data
            newCutlist = new Cutlist(Object.assign(Object.assign({}, cutlistData), { customerName: senderName || 'WhatsApp User', projectName: 'Cutting List from WhatsApp', phoneNumber: phoneNumber || '' }));
            yield newCutlist.save();
            console.log('Created new cutlist with ID:', newCutlist._id);
            // Automatically send the cutlist link via WhatsApp
            if (phoneNumber) {
                whatsAppResult = yield sendCutlistLinkViaWhatsApp(newCutlist._id.toString(), phoneNumber, senderName || 'WhatsApp User');
            }
        }
        else {
            // If we don't have either cutlist data or OCR text, return an error
            return res.status(400).json({
                success: false,
                message: 'No cutlist data or OCR text provided'
            });
        }
        // Return the cutlist ID and a URL for editing, plus WhatsApp status
        const baseUrl = process.env.BASE_URL || 'https://hds-sifosmans-projects.vercel.app';
        const editUrl = `${baseUrl}/cutlist-edit/${newCutlist._id}`;
        return res.status(201).json({
            success: true,
            message: 'Cutlist created successfully',
            cutlistId: newCutlist._id,
            editUrl: editUrl,
            cutlist: newCutlist,
            whatsAppNotification: whatsAppResult
        });
    }
    catch (error) {
        console.error('Error creating cutlist from n8n data:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating cutlist',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
// Export controller as an object with methods
exports.cutlistController = {
    viewCutlistById,
    updateCutlistById,
    getCutlistData,
    getAllCutlists,
    createFromN8nData
};
