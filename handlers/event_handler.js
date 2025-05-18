const { Client } = require("discord.js");
const fs = require("fs");

module.exports = (client) => {
  try {
    fs.readdirSync("./Eventos/").forEach((file) => {
      const events = fs
        .readdirSync("./Eventos/")
        .filter((file) => file.endsWith(".js"));
      for (let file of events) {
        let pull = require(`../Eventos/${file}`);
        if (pull) {
          client.events.set(file, file.split(".js"));
        }
      }
    });
    
  } catch (e) {
    console.log(e);
  }
};