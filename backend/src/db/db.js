const mongoose =require("mongoose");

const connectDB=async()=>{
    try{
        const conn= await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("Connected to MongoDB");

        // Safely drop legacy non-sparse indexes if present on payments collection
        try {
            const paymentCollection = mongoose.connection.collection("payments");
            const indexes = await paymentCollection.indexes();
            for (const idx of indexes) {
                if (idx.name === "razorpayPaymentId_1" || idx.name === "razorpayOrderId_1") {
                    await paymentCollection.dropIndex(idx.name);
                    console.log(`Dropped legacy index: ${idx.name}`);
                }
            }
        } catch (e) {
            // Ignore index drop errors if collection doesn't exist yet
        }
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

module.exports=connectDB;