# REX
### DO-178B/C Requirements Management Server
[![Build Status](https://travis-ci.org/sweiner/rex.svg?branch=master)](https://travis-ci.org/sweiner/rex) [![codecov](https://codecov.io/gh/sweiner/rex/branch/master/graph/badge.svg)](https://codecov.io/gh/sweiner/rex)

## Introduction
`REX` is a full featured requirements management web server which was designed specifically for Aerospace DO-178B/C software processes.  The goal of `REX` is to provide a free, customizable, and simple alternative to other proprietary requirements management tools such as DOORS or JAMA.  `REX` is accessed through a convenient REST API, and can support any number of custom client applications.

## Current Features
### RESTful API
Each requirement is uniquely identified by a name / id which is specified in the URL.
```
GET http://servername/requirements/REQ001
```

### Flexible Requirement Schemas
Requirement data is structured using a simple JSON structure in the request body.  Each requirement has a customizable data field, and an optional log field to track changes.

```
PUT http://servername/requirements/REQ001
```
```json
{
    "data": {
        "name": "Execute Flight Plan",
        "description": "The flight plan shall be executed when the EXEC button is pressed"
    },
    "log": "Initial requirement from customer."
}
```
Requirement schemas can be customized on an individual basis with no database restructring.  Need more information for certification?  No problem, simply upload a new version of the requirement:

```
PUT http://servername/requirements/REQ001
```
```json
{
    "data": {
        "name": "Execute Flight Plan",
        "description": "The flight plan shall be executed when the EXEC button is pressed",
        "type": "Systems Requirement",
        "tracing": ["HLR001", "HLR002", "HLR003"]
    },
    "log": "Updated with fields recommended by the DER."
}
```
Deletes are also recorded and tracked in the history.

```
DELETE http://servername/requirements/REQ001
```
```json
{
    "log": "Customer now hates this requirement."
}
```

### Change Managment
`REX` automatically tracks changes and stores a history containing all of the log messages and versions of the requirement:

```
GET http://servername/requirements/history/REQ001
```
```json
[
    {
        "log": "Initial requirement from customer.",
        "version": 0
    },
    {
        "log": "Updated with fields recommended by the DER.",
        "version": 1
    },
    {
        "log": "Customer now hates this requirement.",
        "version": 2
    }
]
```
Versions are accessed by supplying the version number to the history api
```
GET http://servername/requirements/history/REQ001/0
```
```json
{
    "data": {
        "name": "Execute Flight Plan",
        "description": "The flight plan shall be executed when the EXEC button is pressed"
    }
}
```
## Planned Features
### Searching & Filtering
- Filter based on JSON filter criteria.
### Baselines & Reversion
- Baseline an existing set of requirements.  Get baseline information for SCI reports.  Reversion to baselines
### Folders
- Organize requirements in a tree structure

## Development Installation Instructions
1. Install NodeJS from https://nodejs.org/en/
2. Run `npm install` from within the project directory
3. Follow the instructions to install MongoDB and create the data directory from https://docs.mongodb.com/manual/tutorial/
4. Add mongod to your path
5. run `npm start` from within the project directory
   * This will start `mongod`, `nodemon`, and `tsc --watch` automatically.
   * By default, the server will be located at http://localhost:3000