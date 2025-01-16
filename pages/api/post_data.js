import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db("qr_scanner");

        const { userid, food } = req.body;

        // Check if userid is provided
        if (!userid) {
            return res.status(400).json({ error: "User ID is required." });
        }

        // Find the user by userid
        const user = await db.collection("user").findOne({ userid });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // If food is provided, parse and update the food preferences
        if (food) {
            // Example: Parse food input like "Veg: 1, Chicken: 2"
            const foodData = food.split(", ").reduce((acc, item) => {
                const [key, value] = item.split(": ");
                acc[key.trim()] = parseInt(value.trim(), 10);
                return acc;
            }, {});

            await db.collection("user").updateOne(
                { userid },
                { $set: { food: foodData } }
            );
        }

        // Update the "validated" field to true
        await db.collection("user").updateOne(
            { userid },
            { $set: { validated: true } }
        );

        // Fetch the updated user data
        const updatedUser = await db.collection("user").findOne({ userid });

        res.status(200).json({ 
            message: "User validated successfully.", 
            data: updatedUser 
        });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ 
            error: "Failed to process request", 
            details: error.message 
        });
    }
}
