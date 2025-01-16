import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const client = await clientPromise;
      const db = client.db("qr_scanner");
      const collection = db.collection("user");

      const data = req.body;

      // Validate data is an array of objects
      if (!Array.isArray(data) || !data.length) {
        return res.status(400).json({ success: false, message: "Invalid data format" });
      }

      // Clear existing data in the collection
      await collection.deleteMany({});

      // Insert each object as a separate document in the collection
      const result = await collection.insertMany(data);

      console.log(`Inserted ${result.insertedCount} documents`);

      res.status(201).json({ success: true, insertedCount: result.insertedCount });
    } catch (error) {
      console.error("Error inserting CSV data:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
