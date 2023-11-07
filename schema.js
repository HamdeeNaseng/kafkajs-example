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
  }
})

Product.hasMany(Order)
Order.belongsTo(Product)

module.exports = {
  Order,
  Product,
  sequelize
}