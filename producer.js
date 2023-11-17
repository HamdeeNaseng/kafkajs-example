const express = require("express");
const { Kafka } = require("kafkajs");
const { Order, Product, sequelize } = require("./schema");

const app = express();
const port = 8000;

const retry = (fn, retries, delay) =>
  fn().catch((error) =>
    retries > 0
      ? new Promise((resolve) => setTimeout(() => resolve(retry(fn, retries - 1, delay)), delay))
      : Promise.reject(error)
  );

const kafka = new Kafka({
  // clientId: "express-app",
  // brokers: ["localhost:9092", "localhost:9093"],
  brokers: ["localhost:9097","localhost:9094", "localhost:9095", "localhost:9096"],
});

// Example of using retry with a delay
retry(() => kafka.producer().connect(), 3, 1000)
  .then(() => {
    console.log("Connected to Kafka");
    // Your Kafka-related code here
  })
  .catch((error) => console.error("Failed to connect to Kafka:", error));


const producer = kafka.producer();

app.use(express.json());

app.post("/api/create-product", async (req, res) => {
  const productData = req.body;
  try {
    // const product = await Product.create(productData);
    // const productResponse = {
    //   ...product.dataValues,
    //   type: "create",
    // };

    await producer.connect();
    const product = await producer.send({
      topic: "message-queue",
      messages: [
        {
          value: JSON.stringify(productData),
        },
      ],
    });
    const productResponse = {
        ...product.dataValues,
        status: 200,
      };

    await producer.disconnect();

    res.json(productResponse);
  } catch (error) {
    res.json({
      message: "something wront",
      error,
    });
  }
});

app.post("/api/update-product/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const { ProductName, amount, productType } = req.body;
    const product = await Product.findOne({
      where: {
        id: productId,
      },
    });

    if (product == null) {
      res.status(404).json({ message: "Product not found" });
    } else {
      if (ProductName != null) {
        product.name = ProductName;
      }
      if (amount != null) {
        product.amount = amount;
      }
      if (productType != null) {
        product.productType = productType;
      }

      await product.save();

      const updatedProductResponse = {
        ...product.dataValues, // Fix here: use product.dataValues instead of updatedProduct.dataValues
        type: "update",
      };

      await producer.connect();
      await producer.send({
        topic: "message-product",
        messages: [
          {
            value: JSON.stringify(updatedProductResponse),
          },
        ],
      });
      await producer.disconnect();

      res.json(updatedProductResponse);
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.json({
      message: "something went wrong",
      error,
    });
  }
});


app.post("/api/placeorder", async (req, res) => {
  try {
    const { productId, userId } = req.body;

    const product = await Product.findOne({
      where: {
        id: productId,
      },
    });

    if (product.amount <= 0) {
      res.json({
        message: "product out of stock",
      });
      return false;
    }

    // reduce amount
    product.amount -= 1;
    await product.save();

    // create order with status pending
    const order = await Order.create({
      productId: product.id,
      userLineUid: userId,
      status: "pending",
    });

    const orderData = {
      productName: product.name,
      productTypeId: product.productTypeId,
      userId,
      orderId: order.id,
    };

    await producer.connect();

    if(product.productTypeId == 1){
     
      await producer.send({
        topic: "electronic",
        messages: [
          {
            value: JSON.stringify(orderData)
          },
        ],
      });
    }
    
    await producer.send({
      topic: "message-topic",
      messages: [
        {
          value: JSON.stringify(orderData)
        },
      ],
    });
    await producer.disconnect();

    res.json({
      message: `buy product ${product.name} successful. waiting message for confirm.`,
    });
  } catch (error) {
    res.json({
      message: "something wront",
      error,
    });
  }
});

app.listen(port, async () => {
  await sequelize.sync();
  console.log(`Express app listening at http://localhost:${port}`);
});
