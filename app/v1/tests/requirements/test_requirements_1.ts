/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

import * as mocha from 'mocha';
import * as request from 'request';
import * as chai from 'chai';

import mongoose from 'mongoose';
import { startServer, stopServer } from '../../../server';

const server_location = 'http://localhost:3000';
const database = 'mongodb://localhost/test';

mocha.describe('Requirements Creation - Basic', function() {
    mocha.before(function(done) {
        const promise = startServer(database);
        promise.then((connection: any) => {
            done();
        })
        .catch((reason: any) => {
            console.error('ERROR: Could not connect to MongoDB... Aborting');
            process.exit(1);
        });
    });

    mocha.it('Should return null when an non-existant ID is accessed', function(done) {
        const req = request.get(server_location + '/requirements/browse/REQ001', function(err, res, body) {
            chai.expect(body).to.equal('null');
            done();
        });
    });

    mocha.it('Should return a requirement record when created', function(done) {
        const data = { description: 'This is a sample requirement' };
        const options: request.CoreOptions = {
            method: 'POST',
            body: data,
            json: true
          };

        request.post(server_location + '/requirements/create/REQ001', options, function(err, res, body) {

            chai.expect(body.data).to.deep.equal(data);
            chai.expect(body.id).to.equal('REQ001');
            chai.expect(body._id).to.exist;
            chai.expect(body.deleted).to.equal(false);
            chai.expect(body.history).to.have.length(1);
            done();
        });
    });

    mocha.it('Should reject the creation of a new requirement with an ID that matches an existing one', function (done) {
        const data = { description: 'This is a sample requirement' };
        const options: request.CoreOptions = {
            method: 'POST',
            body: data,
            json: true
          };

        request.post(server_location + '/requirements/create/REQ001', options, function(err, res, body) {

            chai.expect(body.data).to.be.undefined;
            chai.expect(body.id).to.be.undefined;
            chai.expect(body._id).to.be.undefined;
            chai.expect(body.deleted).to.be.undefined;
            chai.expect(body.history).to.be.undefined;

            // Error params
            chai.expect(body.error.code).to.equal(11000);
            chai.expect(body.error.message).contains('duplicate key error');

            done();
        });
    });

    mocha.it('Should create a requirement with blank data if the body is empty', function (done) {
        const options: request.CoreOptions = {
            method: 'POST',
            json: true
          };

          const req = request.post(server_location + '/requirements/create/REQ002', options, function(err, res, body) {
            chai.expect(body.data).to.deep.equal({});
            chai.expect(body.id).to.equal('REQ002');
            chai.expect(body._id).to.exist;
            chai.expect(body.deleted).to.equal(false);
            chai.expect(body.history).to.have.length(1);
            done();
        });
    });

    mocha.after(function() {
        const promise = mongoose.connection.dropDatabase();

        promise.then((value) => {
            stopServer();
        })
        .catch ((reason) => {
            console.log(reason);
            stopServer();
        });

    });
});