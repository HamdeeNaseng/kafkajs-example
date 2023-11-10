const { Sequelize, DataTypes } = require('sequelize')

// use sequenlize
const sequelize = new Sequelize('tutorial', 'root', 'root', {
  host: '127.0.0.1',
  dialect: 'mysql',
  port: 3306
});

const Order = sequelize.define('orders', {
  userLineUid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

const Product = sequelize.define('products', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productTypeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'product_type', // Check if this matches the actual table name
      key: 'id',
    }
  }
});


const ProductType = sequelize.define('product_type', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  detail: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

Product.hasMany(Order)
Order.belongsTo(Product)
ProductType.hasMany(Product)
Product.belongsTo(ProductType);
module.exports = {
  Order,
  Product,
  ProductType,
  sequelize
}