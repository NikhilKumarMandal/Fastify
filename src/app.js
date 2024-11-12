import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import env from '@fastify/env';
import connectDb from '../plugins/mongodb.js';



const fastify = Fastify({
  logger: true
});

// register plugins
fastify.register(cors);
fastify.register(sensible);

fastify.register(env, {
  dotenv: true,
  schema: {
    type: 'object',
    required: ['PORT', 'MONGODB_URI', 'JWT_TOKEN'],
    properties: {
      PORT: { type: 'string', default: '3000' },
      MONGODB_URI: { type: 'string' },
      JWT_TOKEN: { type: 'string' },
    },
  },
});

// regsiter custom plugins
fastify.register(connectDb)


fastify.get("/test-db", async (request, reply) => {
  try {
    const mongoose = fastify.mongoose;
    const connectionStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    reply.send({ connectionStatus });
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: "Unable to retrieve database connection status" });
  }
});


const start = async () => {
  try {
    await fastify.after(); // Wait for all plugins to be registered

    const PORT = process.env.PORT || 3000;
    await fastify.listen({ port: PORT });
    fastify.log.info(`Server started on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
