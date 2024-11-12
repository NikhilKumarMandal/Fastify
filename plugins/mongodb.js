import fastifyPlugin from "fastify-plugin";
import mongoose from "mongoose";

const connectDb = fastifyPlugin(async (fastify, opts) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        fastify.decorate("mongoose", mongoose);
        fastify.log.info("Database connected successfully");
    } catch (error) {
        fastify.log.error("Database connection error:", error);
        process.exit(1);
    }
});

export default connectDb;
