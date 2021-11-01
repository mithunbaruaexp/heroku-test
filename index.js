const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rwibp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("SkyTravel");
    const travelPackagesCollection = database.collection("TravelPackages");
    const travelersDataCollection = database.collection("TravelersData");

    //GET API for travel package
    app.get("/packages", async (req, res) => {
      const cursor = travelPackagesCollection.find({});
      const travelPackages = await cursor.toArray();

      res.send(travelPackages);
    });

    //POST API for booking a service
    app.post("/all-travelers-data", async (req, res) => {
      const data = req.body;
      const result = await travelersDataCollection.insertOne(data);
      res.json(result);
    });

    //GET API for travelers data
    app.get("/all-travelers-data", async (req, res) => {
      const cursor = travelersDataCollection.find({});
      const packageData = await cursor.toArray();

      res.send(packageData);
    });

    //DELETE API
    app.delete("/all-travelers-data/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await travelersDataCollection.deleteOne(query);

      res.json(result);
    });

    //POST API for adding a service
    app.post("/packages", async (req, res) => {
      const data = req.body;
      const result = await travelPackagesCollection.insertOne(data);
      res.json(result);
    });

    //UPDATE API to update status
    app.put("/all-travelers-data/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: updateData.status,
        },
      };

      const result = await travelersDataCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Sky Travel server is running on browser");
});
app.listen(port, () => {
  console.log("Running sky travel server on port", port);
});
