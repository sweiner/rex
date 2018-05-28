import * as mocha from 'mocha';
import * as request from 'request';
import * as chai from 'chai';

import mongoose from 'mongoose';
import { startServer, stopServer } from '../../server';

const server_location = "http://localhost:3000";
const database = "mongodb://localhost/test";

mocha.describe('History - Basic',function() {
    mocha.before(function() {
        startServer(database);
    });

    mocha.it('Should be empty on a newly created Requirement', function() {
        let req = request.get(server_location+'/requirements', function(res) {
            console.log(res);
        });
    });

    mocha.after(function(){
        stopServer();
    });
});
