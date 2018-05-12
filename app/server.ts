/* app/server.ts */

// Import everything from express and assign it to the express variable
import express from 'express';
import bodyParser from 'body-parser';
import * as db from './db';

// Import WelcomeController from controllers entry point
import {WelcomeController} from './controllers';
import {UsersController} from './controllers';

// Local functions
function normalizePort(val: number|string): number|string|boolean {
  let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
  if (isNaN(port)) return val;
  else if (port >= 0) return port;
  else return false;
}

// Create a new express application instance
const app: express.Application = express();
const bp: any = bodyParser();
// The port the express app will listen on
const port: number|string|boolean = normalizePort(process.env.PORT || 3000);

// Connect to Mongo
db.connect();

// Mount the WelcomeController at the /welcome route
//app.use(bodyParser.json());
app.use('/welcome', WelcomeController);
app.use('/users', UsersController);

// Serve the application at the given port
app.listen(port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${port}/`);
});

