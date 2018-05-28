"use strict";
/* app/server.ts */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import everything from express and assign it to the express variable
const express_1 = __importDefault(require("express"));
const db = __importStar(require("./db"));
// Import WelcomeController from controllers entry point
const controllers_1 = require("./controllers");
const controllers_2 = require("./controllers");
// Local functions
function normalizePort(val) {
    let port = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(port))
        return val;
    else if (port >= 0)
        return port;
    else
        return false;
}
// Create a new express application instance
const app = express_1.default();
// The port the express app will listen on
exports.port = normalizePort(process.env.PORT || 3000);
// Variable to hold the server for programmatic testing
let server = null;
// List of active connections for graceful server shutdown
let connections = [];
// Export server creation for use in testing
function startServer(database) {
    // Connect to Mongo
    db.connect(database)
        .catch((reason) => {
        console.error('ERROR: Could not connect to MongoDB... Aborting');
        process.exit(1);
    });
    // Mount the WelcomeController at the /welcome route
    //app.use(bodyParser.json());
    app.use('/welcome', controllers_1.WelcomeController);
    app.use('/users', controllers_2.UsersController);
    app.use('/requirements', controllers_1.RequirementsController);
    // Serve the application at the given port
    server = app.listen(exports.port, () => {
        // Success callback
        console.log(`Listening at http://localhost:${exports.port}/`);
    });
    server.on('connection', connection => {
        connections.push(connection);
        connection.on('close', () => connections = connections.filter(curr => curr !== connection));
    });
}
exports.startServer = startServer;
function stopServer() {
    if (server) {
        console.log('Received kill signal, shutting down gracefully');
        console.log('Disconnecting from MongoDB...');
        db.disconnect();
        server.close(() => {
            console.log('Closed out remaining connections');
            process.exit(0);
        });
        setTimeout(() => {
            console.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
        connections.forEach(curr => curr.end());
        setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
    }
}
exports.stopServer = stopServer;
process.on('SIGTERM', stopServer);
process.on('SIGINT', stopServer);
// Start the server when the app is run directly
if (require.main === module) {
    startServer();
}
