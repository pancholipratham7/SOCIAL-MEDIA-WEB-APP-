const mongoose = require("mongoose");
const dotenv = require("dotenv");

//adding the env variables to process.env
dotenv.config({ path: "./config.env" });

class Database {
  constructor() {
    this.connect();
  }
  connect() {
    const DB = process.env.DATABASE.replace(
      "<password>",
      process.env.DATABASE_PASSWORD
    );
    //Connecting our express application to hosted mongodb database through mongoose
    mongoose
      .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(function () {
        console.log("MONGODB CONNECTION SETUP");
      }) //Though here in the above line we are using catch to catch the rejected promise but then also it is recommended to use both this catch as well process.on("unhandledRejection") event handler
      .catch((err) => console.log(err));
  }
}

module.exports = new Database();
