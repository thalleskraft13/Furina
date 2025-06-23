const mongoose = require('mongoose');
const chalk = require('chalk');
require('dotenv').config();

const mongoURI = process.env.mongo;

const connectMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log(chalk.green.bold('✅ Conectado ao MongoDB com sucesso!'));
  } catch (error) {
    console.error(chalk.red.bold('❌ Erro ao conectar no MongoDB:'), chalk.red(error));
    process.exit(1); // encerra o processo se não conectar
  }
};

module.exports = connectMongo;
