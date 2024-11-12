import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import env from '@fastify/env';

const fastify = Fastify({
  logger: true
});

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
