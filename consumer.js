const { Kafka } = require("kafkajs");
const axios = require("axios");

const LINE_NOTIFY_API_URL = "https://notify-api.line.me/api/notify";
const ACCESS_TOKEN = "UbCwDvwgz7yCwfHO5DEN1QUwg2JTbtCa8iue2Waub4P"; // Replace with your LINE Notify access token

const kafka = new Kafka({
  clientId: "express-app",
  // brokers: ['localhost:9092', 'localhost:9093'], // Adjust Kafka brokers as needed
  brokers: [
    "localhost:9094",
    "localhost:9095",
    "localhost:9096",
    "localhost:9097",
  ],
});

const consumer = kafka.consumer({ groupId: "message-group" });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "message-topic", fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageData = JSON.parse(message.value.toString());
          if (messageData.productTypeId != 1) {
            console.log("=== Consumer Message", messageData);

            const headers = {
              "Content-Type": "application/x-www-form-urlencoded", // Change Content-Type
              Authorization: `Bearer ${ACCESS_TOKEN}`,
            };

            const notificationMessage = `Buy product: ${messageData.productName} successful!`;

            // Instead of URLSearchParams, you can use a simpler approach:
            const data = new URLSearchParams();
            data.append("message", notificationMessage);

            const config = {
              headers,
            };

            const response = await axios.post(
              LINE_NOTIFY_API_URL,
              data.toString(),
              config
            );

            console.log("=== LINE Notify Log", response.data);
          }
          // Update order status as 'success' in your database
          // This is an example and should be implemented accordingly using an ORM or database library
        } catch (error) {
          console.error(
            "Error sending LINE Notify message:",
            error.response.data
          );
        }
      },
    });
  } catch (error) {
    console.error("Error connecting to Kafka:", error);
  }
};

run().catch(console.error);
