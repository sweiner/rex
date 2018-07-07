# REX
## DO-178B/C Requirements Management Server
[![Build Status](https://travis-ci.org/sweiner/rex.svg?branch=master)](https://travis-ci.org/sweiner/rex)

## Introduction
`REX` is a full featured requirements management server which was designed specifically for Aerospace DO-178B/C software processes.  The goal of `REX` is to provide a free, customizable, and simple alternative to other proprietary requirements management tools such as DOORS or JAMA.  `REX` is accessed through a convenient REST API, and can support any number of custom client applications.

## Features
### Change Managment
- Change Logs
- Version Control
- Diff Capability

### Searching
- Search based on JSON filter criteria

### Reporting
- TBD

## Development Installation Instructions
1. Install NodeJS from https://nodejs.org/en/
2. Run `npm install` from within the project directory
3. Follow the instructions to install MongoDB and create the data directory from https://docs.mongodb.com/manual/tutorial/
4. Add mongod to your path
5. run `npm start` from within the project directory
   * This will start `mongod`, `nodemon`, and `tsc --watch` automatically.
   * By default, the server will be located at http://localhost:3000