const chalk = require("chalk");
const FurinaApplication = require("./Furina/furinaDoDiscord");
const FurinaHelper = require("./FurinaHelper/bot");
const Neuvilette = require("./Neuvilette/bot")
const connectMongo = require("./Furina/client/mongodb/connectMongo");

(async () => {
  try {
    console.log(chalk.blueBright("✨ Iniciando o espetáculo da Furina...\n"));

    // Furina
    const Furina = new FurinaApplication();
    await Furina.start();
    console.log(chalk.greenBright("✅ Furina iniciado com sucesso!"));

    console.log(chalk.magentaBright("\n——————————————————————————————————————————————\n"));

    // Helper
    const Helper = new FurinaHelper();
   // await Helper.start();
  console.log(chalk.cyanBright("✅ Furina Helper iniciado com sucesso!"));

    console.log(chalk.magentaBright("\n——————————————————————————————————————————————\n"));

    const NeuviletteBot = new Neuvilette();
    await NeuviletteBot.start();
    console.log(chalk.cyanBright("✅ Neuvilette iniciado com sucesso!"));

    console.log(chalk.yellowBright("\n🌟 Ambos os bots estão online e prontos!\n"));
  } catch (err) {
    console.error(chalk.redBright("❌ Erro ao iniciar os bots:\n"), err);
  }
})();
