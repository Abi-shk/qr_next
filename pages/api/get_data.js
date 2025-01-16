import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
    if (req.method === "GET") {
      try {
        const client = await clientPromise;
        const db = client.db("qr_scanner");
        const collection = db.collection("user");
  
        // Fetch all users with validated set to true
        const validatedUsers = await collection.find({ validated: true }).toArray();
  
        res.status(200).json({ success: true, data: validatedUsers });
      } catch (error) {
        console.error("Error fetching validated users:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  