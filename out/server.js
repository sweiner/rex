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
const port = normalizePort(process.env.PORT || 3000);
// Connect to Mongo
db.connect();
// Mount the WelcomeController at the /welcome route
//app.use(bodyParser.json());
app.use('/welcome', controllers_1.WelcomeController);
app.use('/users', controllers_2.UsersController);
app.use('/requirements', controllers_1.RequirementsController);
// Serve the application at the given port
app.listen(port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${port}/`);
});
