"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
// Import routes
const optimizer_routes_1 = __importDefault(require("./routes/optimizer.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const botsailor_routes_1 = __importDefault(require("./routes/botsailor.routes"));
const ocr_routes_1 = __importDefault(require("./routes/ocr.routes"));
const cutlist_routes_1 = __importDefault(require("./routes/cutlist.routes"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from the public directory
app.use(express_1.default.static('public'));
// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/freecut';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
// Routes
app.use('/api/optimizer', optimizer_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/botsailor', botsailor_routes_1.default);
app.use('/api/ocr', ocr_routes_1.default);
app.use('/api/cutlist', cutlist_routes_1.default);
// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to HDS Group Cutlist API',
        version: '1.3.0',
        endpoints: [
            '/api/optimizer',
            '/api/projects',
            '/api/botsailor',
            '/api/ocr',
            '/api/cutlist'
        ]
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
