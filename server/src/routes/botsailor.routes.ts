import express, { Router, RequestHandler } from 'express';
import { botsailorController } from '../controllers/botsailor.controller';

const router: Router = express.Router();

// GET status of Botsailor connection
router.get('/status', botsailorController.getConnectionStatus as RequestHandler);

// Commenting out routes with missing methods to fix build errors
// These can be re-enabled once the controller methods are implemented

/*
// POST receive data from Botsailor
router.post('/receive', botsailorController.receiveData as RequestHandler);

// POST send data to Botsailor
router.post('/send', botsailorController.sendData as RequestHandler);

// POST sync project data with Botsailor
router.post('/sync/:projectId', botsailorController.syncProject as RequestHandler);

// GET available materials from Botsailor
router.get('/materials', botsailorController.getMaterials as RequestHandler);

// GET available stock pieces from Botsailor
router.get('/stock', botsailorController.getStockPieces as RequestHandler);

// POST process cutting list image with OCR
router.post('/process-image', botsailorController.processCutlistImage as RequestHandler);
*/

// POST receive WhatsApp image webhook from Botsailor
router.post('/whatsapp/inbound', botsailorController.receiveWhatsAppWebhook as RequestHandler);

// POST send cutlist link to WhatsApp via Botsailor webhook
router.post('/whatsapp/send-cutlist', botsailorController.sendCutlistLink as unknown as RequestHandler);

export default router;
