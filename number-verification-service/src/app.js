// src/app.js
const fastify = require("fastify")({ logger: true });
const routes = require("./routes/numberVerification");
const { PORT } = require("./config");

fastify.register(routes);

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Number Verification running on ${PORT}`);
});