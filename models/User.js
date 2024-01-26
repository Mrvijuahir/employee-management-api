const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(db) {}
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("manager", "employee"),
        allowNull: false,
        defaultValue: "employee",
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue("password", bcrypt.hashSync(value));
        },
      },
      casual_leave: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 12,
      },
      sick_leave: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 6,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      paranoid: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  return User;
};
