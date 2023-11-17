const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "express-app",
  brokers: [
    "localhost:9094",
    "localhost:9095",
    "localhost:9096",
    "localhost:9097",
  ],
});

module.exports = kafka;
