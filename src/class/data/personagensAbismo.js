const personagensAbismo = {
  t5: ["Xilonen", "Furina"],
  t4: [
    ["Beidou", "Yanfei", "Faruzan"],
    ["Mika", "Charlotte", "Chongyun"]
  ],
  t5_mochileiro: ["Mona", "Diluc", "Qiqi", "Jean", "Keqing"],
  t4_mochileiro: [
    "Noelle", "Barbara", "Charlotte", "Chongyun", "Mika",
    "ShikanoinHeizou", "Bennett", "Thoma", "Chevreuse",
    "LanYan", "Rosaria", "KujouSara", "Xinyan"
  ],

  elementos: {
    Hydro: ["Furina", "Mona", "Barbara", "Qiqi"],
    Electro: ["YaeMiko", "Keqing", "RaidenShogun", "KujouSara", "Beidou", "ShikanoinHeizou"],
    Anemo: ["ShikanoinHeizou", "LanYan", "Jean", "Faruzan", "Scaramouche"],
    Cryo: ["Layla", "Rosaria", "Qiqi", "Charlotte", "Chongyun", "Mika"],
    Pyro: ["Thoma", "Arlecchino", "Chevreuse", "Diluc", "Bennett", "Xinyan"],
    Geo: ["Noelle", "Xilonen"],
  },

  personagens: {

    // Xilonen (Curandeira Geo)
    Xilonen: {
      nome: "Xilonen",
      papel: "Curandeira",
      elemento: "Geo",
      ataques: {
        normal: {
          descricao: "Ataques Geo com bastão, dano base.",
          executar: (status, atributos) => atributos.atk * 1.1 * (1 + ((status.bonusDanoGeo || 0) / 100))
        },
        elemental: {
          descricao: "Cura aliados e remove resistência elemental inimiga (exceto Geo, Dendro e Anemo).",
          executar: (status, atributos, equipe = [], inimigos = []) => {
            // Cura aliados
            equipe.forEach(p => {
              p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + atributos.hpMax * 0.25);
            });

            // Identifica elementos da equipe, sem duplicatas
            const elementosEquipe = [...new Set(equipe.map(p => p.elemento))];

            // Elementos que NÃO serão removidos da resistência no inimigo
            const ignorar = ["Geo", "Dendro", "Anemo"];

            // Elementos para afetar
            const elementosAFatiar = elementosEquipe.filter(el => !ignorar.includes(el));

            // Para cada inimigo e cada elemento afetado, reduz resistência
            inimigos.forEach(i => {
              elementosAFatiar.forEach(el => {
                const keyResist = `resistencia${el}`;
                i[keyResist] = Math.max(0, (i[keyResist] || 0) - 25);
              });
            });

            return true;
          }
        },
        ult: {
          descricao: "Cura aliados e fortalece barreira.",
          executar: (status, atributos) => {
            status.hpAtual = Math.min(atributos.hpMax, (status.hpAtual || atributos.hpMax) + atributos.hpMax * 0.4);
            status.escudoBonus = (status.escudoBonus || 0) + 30;
            return true;
          }
        }
      },
      constelacoes: {
        c1: {
          descricao: "Cura aumentada em 20%.",
          aplicar: (status) => { status.curaBonus = (status.curaBonus || 0) + 20; }
        },
        c2: {
          descricao: "Reduz cooldown da habilidade elemental em 15%.",
          aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 15; }
        },
        c3: {
          descricao: "Aumenta cura em 30%.",
          aplicar: (status) => { status.curaBonus = (status.curaBonus || 0) + 30; }
        },
        c4: {
          descricao: "Aumenta taxa crítica em 10%.",
          aplicar: (status) => { status.taxaCritica = (status.taxaCritica || 5) + 10; }
        },
        c5: {
          descricao: "Reduz cooldown do ultimate em 20%.",
          aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 20; }
        },
        c6: {
          descricao: "Cura em 40% mais após ult.",
          aplicarUlt: (status, atributos) => {
            status.curaBonus = (status.curaBonus || 0) + atributos.hpMax * 0.4;
          }
        }
      }
    },

    // Furina (Suporte Hydro)
    Furina: {
      nome: "Furina",
      papel: "Suporte",
      elemento: "Hydro",
      ataques: {
        normal: {
          descricao: "Ataques Hydro com dano base.",
          executar: (status, atributos) => atributos.atk * 1.0
        },
        elemental: {
          descricao: "Aplica Hydro no inimigo e aumenta dano da equipe após ult.",
          executar: (status, atributos, equipe = []) => {
            // Marca para buff de dano após ult
            equipe.forEach(p => {
              if (!p.status) p.status = {};
              p.status.buffDanoFurina = true;
            });
            return true;
          }
        },
        ult: {
          descricao: "Aumenta dano de todos os personagens baseado na vida de Furina.",
          executar: (status, atributos, equipe = []) => {
            equipe.forEach(p => {
              if (!p.status) p.status = {};
              p.status.danoBonus = (p.status.danoBonus || 0) + atributos.hpMax * 0.05;
            });
            return true;
          }
        }
      },
      constelacoes: {
        c1: {
          descricao: "Aumenta dano Hydro em 15%.",
          aplicar: (status) => { status.bonusDanoHydro = (status.bonusDanoHydro || 0) + 15; }
        },
        c2: {
          descricao: "Reduz tempo de recarga da habilidade elemental em 10%.",
          aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 10; }
        },
        c3: {
          descricao: "Aumenta cura em 20%.",
          aplicar: (status) => { status.curaBonus = (status.curaBonus || 0) + 20; }
        },
        c4: {
          descricao: "Aumenta taxa crítica em 10%.",
          aplicar: (status) => { status.taxaCritica = (status.taxaCritica || 5) + 10; }
        },
        c5: {
          descricao: "Reduz cooldown do ultimate em 15%.",
          aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 15; }
        },
        c6: {
          descricao: "Após ult, dano dos aliados aumenta 25% por 10 segundos.",
          aplicarUlt: (status) => {
            status.danoBonus = (status.danoBonus || 0) + 25;
          }
        }
      }
    },

    // Bennett (Suporte / Curandeiro Pyro)
    Bennett: {
      nome: "Bennett",
      papel: "Suporte",
      elemento: "Pyro",
      ataques: {
        normal: {
          descricao: "Ataques Pyro com espada.",
          executar: (status, atributos) => atributos.atk * 1.1
        },
        elemental: {
          descricao: "Causa dano Pyro e pode curar aliados próximos se estiverem com pouca vida.",
          executar: (status, atributos, equipe = []) => {
            equipe.forEach(p => {
              if ((p.status?.hpAtual ?? p.atributos.hpMax) < p.atributos.hpMax * 0.5) {
                p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + atributos.atk * 0.2);
              }
            });
            return true;
          }
        },
        ult: {
          descricao: "Aumenta o dano do personagem DPS baseado no ataque normal de Bennett.",
          executar: (status, atributos, equipe = []) => {
            const bonus = atributos.atk * 0.5;
            equipe.forEach(p => {
              if (p.papel === "DPS") {
                p.status.danoBonus = (p.status.danoBonus || 0) + bonus;
              }
            });
            return true;
          }
        }
      },
      constelacoes: {
        c1: {
          descricao: "Aumenta ataque normal em 15%.",
          aplicar: (status) => { status.bonusAtk = (status.bonusAtk || 0) + 15; }
        },
        c2: {
          descricao: "Reduz cooldown da habilidade elemental em 20%.",
          aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 20; }
        },
        c3: {
          descricao: "Aumenta cura em 25%.",
          aplicar: (status) => { status.curaBonus = (status.curaBonus || 0) + 25; }
        },
        c4: {
          descricao: "Aumenta taxa crítica em 10%.",
          aplicar: (status) => { status.taxaCritica = (status.taxaCritica || 5) + 10; }
        },
        c5: {
          descricao: "Reduz cooldown do ultimate em 15%.",
          aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 15; }
        },
        c6: {
          descricao: "Aumenta dano do ultimate em 30%.",
          aplicarUlt: (status) => { status.danoBonusUlt = (status.danoBonusUlt || 0) + 30; }
        }
      }
    },

    // Arlecchino (DPS Pyro)
    Arlecchino: {
      nome: "Arlecchino",
      papel: "DPS",
      elemento: "Pyro",

      ataques: {
        normal: {
          descricao: "Ataques físicos rápidos com a lança, causando dano Pyro.",
          executar: (status, atributos) => atributos.atk * 1.2 * (1 + ((atributos.bonusPyro || 0) / 100))
        },
        habilidade_elemental: {
          descricao: "Marca os inimigos com uma marca que transforma ataques subsequentes em ataques de fogo e impede cura por aliados.",
          executar: (status, atributos, inimigos = []) => {
            inimigos.forEach(inimigo => {
              if (!inimigo.status) inimigo.status = {};
              inimigo.status.marcadoPorArlecchino = true;
            });
            return true;
          }
        },
        supremo: {
          descricao: "Cura Arlecchino e remove a marca de ataque, permitindo que ela volte a ser curada por aliados.",
          executar: (status, atributos, personagem) => {
            // Cura baseada em hp máximo
            const cura = atributos.hpMax * 0.3;
            personagem.atributos.hp = Math.min(personagem.atributos.hpMax, (personagem.atributos.hp || personagem.atributos.hpMax) + cura);
            personagem.status.marcadoPorArlecchino = false;
            return cura;
          }
        }
      },

      constelacoes: {
        c1: {
          descricao: "Após usar a habilidade elemental, o próximo ataque causa 15% de dano adicional.",
          aplicar: (status) => {
            status.danoExtra = (status.danoExtra || 0) + 15;
          }
        },
        c2: {
          descricao: "Reduz o tempo de recarga da habilidade elemental em 20%.",
          aplicar: (status) => {
            status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 20;
          }
        },
        c3: {
          descricao: "Aumenta o nível da habilidade elemental em 3.",
          aplicar: (status) => {
            status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 1) + 3;
          }
        },
        c4: {
          descricao: "Os ataques transformados em fogo pela habilidade elemental ignoram 20% da resistência dos inimigos.",
          aplicar: (status) => {
            status.penetracaoResistencia = (status.penetracaoResistencia || 0) + 20;
          }
        },
        c5: {
          descricao: "Aumenta o nível do supremo em 3.",
          aplicar: (status) => {
            status.nivelSupremo = (status.nivelSupremo || 1) + 3;
          }
        },
        c6: {
          descricao: "Após usar o supremo, aumenta o dano crítico e a taxa crítica em 40% por 15 segundos.",
          aplicarUlt: (status) => {
            status.bonusDanoCritico = (status.bonusDanoCritico || 0) + 40;
            status.bonusTaxaCritica = (status.bonusTaxaCritica || 0) + 40;
          }
        }
      }
    },

    // Beidou (Escudeira Electro)
    Beidou: {
      nome: "Beidou",
      papel: "Escudeira",
      elemento: "Electro",
      ataques: {
        normal: {
          descricao: "Ataques Electro com espada.",
          executar: (status, atributos) => atributos.atk * 1.15
        },
        elemental: {
          descricao: "Cria escudo baseado no ataque.",
          executar: (status) => {
            status.escudoBonus = (status.escudoBonus || 0) + (status.atributos?.atk || 0) * 0.3;
            return true;
          }
        },
        ult: {
          descricao: "Ataque poderoso com dano extra baseado no ataque.",
          executar: (status, atributos) => atributos.atk * 3.0
        }
      },
      constelacoes: {
        c1: {
          descricao: "Aumenta dano do escudo em 15%.",
          aplicar: (status) => { status.bonusEscudo = (status.bonusEscudo || 0) + 15; }
        },
        c2: {
          descricao: "Reduz cooldown da habilidade elemental em 20%.",
          aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 20; }
        },
        c3: {
          descricao: "Aumenta ataque em 20%.",
          aplicar: (status) => { status.bonusAtk = (status.bonusAtk || 0) + 20; }
        },
        c4: {
          descricao: "Aumenta taxa crítica em 10%.",
          aplicar: (status) => { status.taxaCritica = (status.taxaCritica || 5) + 10; }
        },
        c5: {
          descricao: "Reduz cooldown do ultimate em 15%.",
          aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 15; }
        },
        c6: {
          descricao: "Aumenta dano do ultimate em 30%.",
          aplicarUlt: (status) => { status.danoBonusUlt = (status.danoBonusUlt || 0) + 30; }
        }
      }
    },

    // Faruzan (Suporte Anemo)
    Faruzan: {
      nome: "Faruzan",
      papel: "Suporte",
      elemento: "Anemo",
      ataques: {
        normal: {
          descricao: "Ataque Anemo com dano base.",
          executar: (status, atributos) => atributos.atk * 1.1
        },
        elemental: {
          descricao: "Aumenta proficiência elemental da equipe e chance de reação.",
          executar: (status, atributos, equipe = []) => {
            equipe.forEach(p => {
              if (!p.status) p.status = {};
              p.status.profElemento = (p.status.profElemento || 0) + 20;
            });
            return true;
          }
        },
        ult: {
          descricao: "Ataque Anemo que puxa inimigos e aumenta proficiência elemental.",
          executar: (status, atributos, equipe = []) => {
            equipe.forEach(p => {
              if (!p.status) p.status = {};
              p.status.profElemento = (p.status.profElemento || 0) + 30;
            });
            return true;
          }
        }
      },
      constelacoes: {
        c1: {
          descricao: "Aumenta proficiência elemental em 25%.",
          aplicar: (status) => { status.profElemento = (status.profElemento || 0) + 25; }
        },
        c2: {
          descricao: "Reduz cooldown da habilidade elemental em 15%.",
          aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 15; }
        },
        c3: {
          descricao: "Aumenta ataque em 15%.",
          aplicar: (status) => { status.bonusAtk = (status.bonusAtk || 0) + 15; }
        },
        c4: {
          descricao: "Aumenta taxa crítica em 10%.",
          aplicar: (status) => { status.taxaCritica = (status.taxaCritica || 5) + 10; }
        },
        c5: {
          descricao: "Reduz cooldown do ultimate em 15%.",
          aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 15; }
        },
        c6: {
          descricao: "Aumenta proficiência elemental da equipe em 40% após ult.",
          aplicarUlt: (status) => { status.profElemento = (status.profElemento || 0) + 40; }
        }
      }
    }
  }
};

module.exports = personagensAbismo;
