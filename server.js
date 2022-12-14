require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);
const app = express();
const PORT = process.env.PORT || 3000;

// Create the server and set the default routes as shown below :
app.get("/", (req, res) => {
  res.set({ "Access-Control-Allow-Origin": "*" });
  return res.redirect("/index.html");
});
app.listen(PORT, () => {
  console.log(`Sever is listening at ${PORT}.`);
});
app.use("/", express.static(__dirname + "/"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Make a function to perform HMAC operation on the passoward using phone number as the key.
const generateHmac = (password, phone) => {
  const hmac = crypto.createHmac("sha256", phone);
  let data = hmac.update(password);
  let cryptedPass = data.digest("hex");
  console.log("HMAC: " + cryptedPass);
  return cryptedPass;
};

// Sign-up function
app.post("/sign_up", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let phone = req.body.phone;
  let password = req.body.password;
  let message = req.body.message;
  let cryptedPass = generateHmac(password, phone);

  let data = {
    name: name,
    email: email,
    phone: phone,
    password: cryptedPass,
    message: message,
  };

  // Connect to mongodb
  async function run() {
    try {
      await client.connect();
      // database and collection code goes here
      const db = client.db("sample_signup_form"); // Name of the database
      const coll = db.collection("user"); // Name of the collection

      // 1. Create
      const result = await coll.insertOne(data);
      // display the results of your operation
      console.log(result.insertedIds);

    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);

  // Redirect to success page
  res.set({ "Access-Control-Allow-Origin": "*" });
  return res.redirect("/success.html");
});