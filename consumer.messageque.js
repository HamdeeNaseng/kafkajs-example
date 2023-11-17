const { Kafka } = require("kafkajs");
const { Order, Product, sequelize } = require("./schema");

const kafka = new Kafka({
  clientId: "express-app",
  brokers: [
    "localhost:9094",
    "localhost:9095",
    "localhost:9096",
    "localhost:9097",
  ],
});

const kafkaTopic = "message-queue";
const kafkaGroup = "message-queue-group";
const consumer = kafka.consumer({ groupId: kafkaGroup });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: kafkaTopic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageData = JSON.parse(message.value.toString());
          console.log("=== Consumer Message", messageData);
          
          const productName = message.name;
          console.log("productName, " + productName);

          const product = await Product.create(messageData);
          const productResponse = {
            ...product.dataValues,
            status: [200, "Create product successfully"],
          };
          console.log(productResponse);
        } catch (error) {
          console.error("Error processing message:", error);
        }
      },
    });
  } catch (error) {
    console.error("Error connecting to Kafka:", error);
  }
};

run().catch(console.error);
