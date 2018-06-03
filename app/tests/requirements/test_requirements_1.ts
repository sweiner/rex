import * as mocha from 'mocha';
import * as request from 'request';
import * as chai from 'chai';

import mongoose from 'mongoose';
import { startServer, stopServer } from '../../server';

const server_location = "http://localhost:3000";
const database = "mongodb://localhost/test";

mocha.describe('Requirements Browsing - Basic',function() {
    mocha.before(function() {
        startServer(database);
    });

    mocha.it('Should return null when an non-existant ID is accessed', function() {
        let req = request.get(server_location+'/requirements/browse/REQ001', function(res) {
            chai.expect(res).to.equal([]);
        });
    });

    mocha.it('Should return a requirement record when created', function() {
        let req = request.post(server_location+'/requirements/create/REQ001',
        { 
            body: { 
                'data': {
                    'description': 'This is a sample requirement'
                } 
            }
        }, function (res) {
            chai.expect(res).to.contain.keys('data');
        });
    });

    mocha.after(function(){
        stopServer();
    });
});