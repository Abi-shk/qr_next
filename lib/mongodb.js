// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = "mongodb+srv://abhi:abhi@cluster0.gzcbr5y.mongodb.net/qr_scanner?retryWrites=true&w=majority&appName=Cluster0";

const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve the value across module reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}



export default clientPromise;
