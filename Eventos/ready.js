const Furina = require("../index.js");
const { connect } = require("mongoose");
const { ActivityType } = require("discord.js");

Furina.once("ready", async() => {
  connect(process.env.mongo)

  console.log("Ah, mas é claro! A grande estrela deste palco digital acaba de fazer sua entrada triunfal... estou online no Discord!")

  Furina.user.setActivity('No comando das estrelas, pronta para brilhar.', { type: ActivityType.Playing });

})