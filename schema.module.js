const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("my_database", "my_user", "", {
  host: "127.0.0.1",
  dialect: "mysql",
  port: 54680,
});

const Order = sequelize.define(
  "orders",
  {
    userLineUid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "orders", // Set the explicit table name
  }
);

const ProductType = sequelize.define(
  "product_type",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "product_type", // Set the explicit table name
  }
);

const Product = sequelize.define(
  "products",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "product_type", // Check if this matches the actual table name
        key: "id",
      },
    },
  },
  {
    tableName: "products", // Set the explicit table name
  }
);

Product.hasMany(Order);
Order.belongsTo(Product);
ProductType.hasMany(Product);
Product.belongsTo(ProductType);

module.exports = {
  Order,
  Product,
  ProductType,
  sequelize,
};
