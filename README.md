# REX
Requirements Management

## Development Installation Instructions
1. Install NodeJS from https://nodejs.org/en/
2. Run `npm install` from within the project directory
3. Follow the instructions to install MongoDB and create the data directory from https://docs.mongodb.com/manual/tutorial/
4. Add mongod to your path
5. run `npm start` from within the project directory
   * This will start `mongod`, `nodemon`, and `tsc --watch` automatically.
   * By default, the server will be located at http://localhost:3000