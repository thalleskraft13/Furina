const Furina = require("../index.js");

Furina.on("messageCreate", async(message) => {
  if (message.author.bot) return;

  await Furina.RankAventureiro.addXp(message.author.id, 5);
  
})