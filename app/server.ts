/* app/server.ts */

// Import everything from express and assign it to the express variable
import express from 'express';
import mongoose from 'mongoose';
import * as http from 'http';
import * as db from './db';

// Import WelcomeController from controllers entry point
import { RequirementsController, HistoryController } from './controllers';
import { UsersController } from './controllers';
import { Socket } from 'net';

// Local functions
function normalizePort(val: number | string): number | string | boolean {
    let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
}

// Create a new express application instance
const app: express.Application = express();
// The port the express app will listen on
export const port: number | string | boolean = normalizePort(process.env.PORT || 3000);
// Variable to hold the server for programmatic testing
let server: http.Server | null = null;
// List of active connections for graceful server shutdown
let connections:Socket[]  = [];

// Export server creation for use in testing
// The promise is for use in testing to ensure the database connection has
// been established before trying to access elements
export function startServer(database?:string): Promise<typeof mongoose> {
    // Connect to Mongo
    let promise: Promise<typeof mongoose> = db.connect(database);

    // Mount the WelcomeController at the /welcome route
    //app.use(bodyParser.json());
    app.use('/users', UsersController);
    app.use('/requirements', RequirementsController);
    app.use('/history', HistoryController);

    // Define error handling middleware
    app.use(function(err:Error, req:express.Request, res:express.Response, next: ((value?:any) => void)){
        console.log(err.stack);
        if (res.statusCode < 400) {
            res.status(500);
        }
        res.json({'error':err.message || 'An unspecified error has occrred'});
        next();
    });

    // Serve the application at the given port
    server = app.listen(port, () => {
        // Success callback
        //console.log(`Listening at http://localhost:${port}/`);
    });

    server.on('connection', connection => {
        connections.push(connection);
        connection.on('close', () => connections = connections.filter(curr => curr !== connection));
    });

    return promise;
}

export function stopServer() {
    if(server) {
        console.log('Received kill signal, shutting down gracefully');
        console.log('Disconnecting from MongoDB...')
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

// Handle Abrupt server shutdowns
process.on('SIGTERM', stopServer);
process.on('SIGINT', stopServer);

// Start the server when the app is run directly
if (require.main === module) {
    let promise = startServer();

    promise.catch((reason) => {
        console.error('ERROR: Could not connect to MongoDB... Aborting');
        process.exit(1);
    });
}

