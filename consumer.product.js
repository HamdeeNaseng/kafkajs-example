const { Kafka } = require("kafkajs");
const axios = require("axios");

const LINE_NOTIFY_API_URL = "https://notify-api.line.me/api/notify";
const ACCESS_TOKEN = "UbCwDvwgz7yCwfHO5DEN1QUwg2JTbtCa8iue2Waub4P"; // Replace with your LINE Notify access token

const kafka = new Kafka({
  clientId: "express-app",
  // brokers: ["localhost:9092", "localhost:9093"], // Adjust Kafka brokers as needed
  brokers: [
    "localhost:9097",
    "localhost:9094",
    "localhost:9095",
    "localhost:9096",
  ],
});

const consumer = kafka.consumer({ groupId: "message-group-product" });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "message-product", fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageData = JSON.parse(message.value.toString());
          console.log("=== Consumer Message", messageData);

          const headers = {
            "Content-Type": "application/x-www-form-urlencoded", // Change Content-Type
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          };

          // Parse the ISO date strings and format them
          const updatedAt = new Date(messageData.updatedAt);
          const createdAt = new Date(messageData.createdAt);

          let type = "The";
          switch (messageData.type) {
            case "create":
              type = "*\udbc0\udc78*\n*🗂Create*";
              break;
            case "update":
              type = "*\udbc0\udc8d*\n*🪛Update*";
              break;
            case "delete":
              type = "*\udbc0\udc8e*\n*🗑Delete*";
              break;
            default:
              break;
          }

          const notificationMessage =
            `${type} product:\n` +
            `Name:  *${messageData.name}*\n` +
            `ID: *${messageData.id}*\n` +
            `Amount: ${messageData.amount}\n` +
            `Product Type ID: ${messageData.productTypeId}\n` +
            `Updated At: _${formatDate(updatedAt)}_\n` +
            `Created At: _${formatDate(createdAt)}_\nsuccessful!`;

          console.log(notificationMessage);

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

// Function to format a date to 'DD/MM/YYYY HH:mm:ss'
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
