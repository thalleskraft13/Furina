const { Schema, model } = require("mongoose");

const personagemSchema = new Schema({
  nome: { type: String, required: true },
  c: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  ascensao: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },

  atributos: {
    hp: { type: Number, default: 0 },
    atk: { type: Number, default: 0 },
    def: { type: Number, default: 0 },

    recargaEnergia: { type: Number, default: 100 },
    taxaCritica: { type: Number, default: 5 },
    danoCritico: { type: Number, default: 50 },

    bonusPyro: { type: Number, default: 0 },
    bonusHydro: { type: Number, default: 0 },
    bonusElectro: { type: Number, default: 0 },
    bonusCryo: { type: Number, default: 0 },
    bonusAnemo: { type: Number, default: 0 },
    bonusGeo: { type: Number, default: 0 },
    bonusDendro: { type: Number, default: 0 },
    bonusFisico: { type: Number, default: 0 },
  },

  elemento: { type: String, default: "Anemo" },

  talentos: {
    ataqueNormal: { type: Number, default: 1 },
    ataqueCarga: { type: Number, default: 1 },
    habilidadeElemental: { type: Number, default: 1 },
    supremo: { type: Number, default: 1 },
  },
});

const usuarioSchema = new Schema({
  id: { type: String, required: true }, // Discord User ID
  uid: { type: String, default: "0" },
  notificar: { type: Boolean, default: true },
  primogemas: { type: Number, default: 0 },
  mora: { type: Number, default: 0 },
  daily: { type: Number, default: 0 },
  codigos: { type: Array, default: [] },
  guilda: { type: String, default: "0" },

  premium: { type: Number, default: 0 },
  itens: { type: Array, default: [] },
  equipe: { type: Array, default: [] },
  abismo: {
    camada: { type: Number, default: 1},
    piso: { type: Number, default: 1 },
  },
  vitoriasPvP: { type: Number, default: 0 },
  derrotasPvP: { type: Number, default: 0 },


  conquistas: { type: Array, default: [] },

  level: {
    ar: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    xpMax: { type: Number, default: 375 },
  },

  gacha: {
    pity: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      garantia5: { type: Boolean, default: false },
    },
  },

  personagens: { type: [personagemSchema], default: [] },

  aviso: {
    ativado: { type: Boolean, default: false },
    texto: { type: String, default: "" },
  },

  blacklist: {
    motivo: { type: String, default: "Não sei, não quero saber, e tenho raiva de quem saiba." },
    equipe: {
      id: { type: String, default: null },
      username: { type: String, default: null },
    },
    tempo: {
      ilimitado: { type: Boolean, default: false },
      tempo: { type: Number, default: 0 },
    },
  },

  regioes: {
    mondstadt: {
      reputacao: {
        nv: { type: Number, default: 0 },
        xp: { type: Number, default: 0 },
      },
      exploracao: {
        bausPreciosos: { type: Number, default: 0 },
        bausComuns: { type: Number, default: 0 },
        bausLuxuosos: { type: Number, default: 0 },
        time: { type: Number, default: 0 },
        resgatado: { type: Boolean, default: true },
        resgatar: { type: Boolean, default: false },
      },
      estatuaDosSetes: {
        nv: { type: Number, default: 0 },
        quantidade: { type: Number, default: 0 },
        anemoculus: { type: Number, default: 0 },
      },
    },

    liyue: {
      reputacao: {
        nv: { type: Number, default: 0 },
        xp: { type: Number, default: 0 },
      },
      exploracao: {
        bausPreciosos: { type: Number, default: 0 },
        bausComuns: { type: Number, default: 0 },
        bausLuxuosos: { type: Number, default: 0 },
        time: { type: Number, default: 0 },
        resgatado: { type: Boolean, default: true },
        resgatar: { type: Boolean, default: false },
      },
      estatuaDosSetes: {
        nv: { type: Number, default: 0 },
        quantidade: { type: Number, default: 0 },
        geoculus: { type: Number, default: 0 },
      },
    },

    inazuma: {
      reputacao: {
        nv: { type: Number, default: 0 },
        xp: { type: Number, default: 0 },
      },
      exploracao: {
        bausPreciosos: { type: Number, default: 0 },
        bausComuns: { type: Number, default: 0 },
        bausLuxuosos: { type: Number, default: 0 },
        time: { type: Number, default: 0 },
        resgatado: { type: Boolean, default: true },
        resgatar: { type: Boolean, default: false },
      },
      estatuaDosSetes: {
        nv: { type: Number, default: 0 },
        quantidade: { type: Number, default: 0 },
        electroculus: { type: Number, default: 0 },
      },
    },
  sumeru: {
      reputacao: {
        nv: { type: Number, default: 0 },
        xp: { type: Number, default: 0 },
      },
      exploracao: {
        bausPreciosos: { type: Number, default: 0 },
        bausComuns: { type: Number, default: 0 },
        bausLuxuosos: { type: Number, default: 0 },
        time: { type: Number, default: 0 },
        resgatado: { type: Boolean, default: true },
        resgatar: { type: Boolean, default: false },
      },
      estatuaDosSetes: {
        nv: { type: Number, default: 0 },
        quantidade: { type: Number, default: 0 },
        electroculus: { type: Number, default: 0 },
      },
    },
    },

  perfil: {
    sobremim: { type: String, default: "Use o comando '/perfil sobremim' pra editar." },
    tema: { type: String, default: "0" },
  },
});

module.exports = model("Usuarios", usuarioSchema);
