import * as mocha from 'mocha';
import * as request from 'request';
import * as chai from 'chai';

import mongoose from 'mongoose';
import { startServer, stopServer } from '../../server';

const server_location = "http://localhost:3000";
const database = "mongodb://localhost/test";

mocha.describe('Requirements Browsing - Basic',function() {
    mocha.before(function(done) {
        let promise = startServer(database);
        promise.then((connection) => {
            done();
        })
        .catch((reason) => {
            console.error('ERROR: Could not connect to MongoDB... Aborting');
            process.exit(1);
        });
    });

    mocha.it('Should return null when an non-existant ID is accessed', function(done) {
        let req = request.get(server_location+'/requirements/browse/REQ001', function(err, res, body) {
            chai.expect(body).to.equal('null');
            done();
        });
    });

    mocha.it('Should return a requirement record when created', function(done) {
        let data = { description: 'This is a sample requirement' };
        let options: request.CoreOptions = {
            method: 'POST',
            body: {data: data},
            json: true
          };
        
        request.post(server_location+'/requirements/create/REQ001', options, function(err,res,body) {
            
            chai.expect(body.data).to.deep.equal(data);
            chai.expect(body.id).to.equal('REQ001');
            chai.expect(body._id).to.exist;
            chai.expect(body.deleted).to.equal(false);
            chai.expect(body.history).to.be.empty;
            done();
        });

    mocha.after(function(){
        let promise = mongoose.connection.dropDatabase();

        promise.then((value) => {
            stopServer();
        })
        .catch ((reason) => {
            console.log(reason);
            stopServer();
        });
        
    });
});