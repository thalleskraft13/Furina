const personagensAbismo = {
  t5: ["Mavuika", "Nahida"],
    t4: [
         ["Xiangling", "Iansan", "Yaoyao"],
         ["Sethos", "Xingqiu", "KukiShinobu"]
    ],
    t5_mochileiro: ["Mona", "Diluc", "Qiqi", "Jean", "Keqing"],
    t4_mochileiro: ["Noelle", "Barbara", "Charlotte", "Chongyun", "Mika", "ShikanoinHeizou", "Bennett", "Thoma", "Chevreuse", "LanYan", "Rosaria", "KujouSara"- "Xinyan"],

    elementos: {
      Hydro: ["Furina", "Mona", "Barbara", "Xingqiu"],
      Electro: ["YaeMiko", "Keqing", "RaidenShogun", "KujouSara", "Beidou",  "Iansan", "KukiShinobu", "Sethos"],
      Anemo: ["ShikanoinHeizou", "LanYan", "Jean", "Faruzan",  "Scaramouche"],
      Cryo: ["Layla", "Rosaria", "Qiqi", "Charlotte", "Chongyun", "Mika"],
      Pyro: ["Thoma", "Arlecchino", "Chevreuse", "Diluc", "Bennett", "Xinyan", "Mavuika", 'Xiangling'],
      Geo: ["Noelle", "Xilonen"],
      Dendro: ["Nahida", "Yaoyao"]
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
    },

    // Mona (Suporte Hydro)
Mona: {
  nome: "Mona",
  papel: "Suporte",
  elemento: "Hydro",
  ataques: {
    normal: {
      descricao: "Ataques Hydro com catalisador.",
      executar: (status, atributos) => atributos.atk * 1.0 * (1 + ((status.bonusDanoHydro || 0) / 100))
    },
    elemental: {
      descricao: "Aplica ilusão Hydro que atrai inimigos e reduz resistência Hydro.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          i.resistenciaHydro = Math.max(0, (i.resistenciaHydro || 0) - 25);
        });
        return true;
      }
    },
    ult: {
      descricao: "Aplica marca astral que aumenta dano recebido pelos inimigos.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          i.status = i.status || {};
          i.status.marcaAstral = true;
          i.status.receberDanoExtra = (i.status.receberDanoExtra || 0) + 20; // % de dano extra
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta recarga de energia em 20%.",
      aplicar: (status) => {
        status.recargaEnergia = (status.recargaEnergia || 100) + 20;
      }
    },
    c2: {
      descricao: "Aumenta dano Hydro em 15%.",
      aplicar: (status) => {
        status.bonusDanoHydro = (status.bonusDanoHydro || 0) + 15;
      }
    },
    c3: {
      descricao: "Aumenta duração da marca astral em 2 segundos.",
      aplicar: (status) => {
        status.duracaoMarcaAstral = (status.duracaoMarcaAstral || 0) + 2;
      }
    },
    c4: {
      descricao: "Aumenta taxa crítica em 10%.",
      aplicar: (status) => {
        status.taxaCritica = (status.taxaCritica || 5) + 10;
      }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 15%.",
      aplicar: (status) => {
        status.cdUlt = (status.cdUlt || 100) - 15;
      }
    },
    c6: {
      descricao: "Após aplicar marca astral, aliados recebem 20% de dano bônus por 10s.",
      aplicarUlt: (status, equipe = []) => {
        equipe.forEach(p => {
          p.status = p.status || {};
          p.status.danoBonus = (p.status.danoBonus || 0) + 20;
        });
      }
    }
  }
},

    // Diluc (DPS Pyro)
Diluc: {
  nome: "Diluc",
  papel: "DPS",
  elemento: "Pyro",
  ataques: {
    normal: {
      descricao: "Ataques rápidos com espada, causando dano Pyro.",
      executar: (status, atributos) => atributos.atk * 1.3 * (1 + ((status.bonusDanoPyro || 0) / 100))
    },
    elemental: {
      descricao: "Desferre golpes flamejantes que causam dano Pyro em área.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          i.status = i.status || {};
          i.status.danoPyroContinuo = true; // Marca que sofre dano Pyro contínuo
        });
        return atributos.atk * 1.8;
      }
    },
    ult: {
      descricao: "Chama as chamas do Inferno para atacar inimigos à frente, causando alto dano Pyro.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          i.status = i.status || {};
          i.status.danoPyro = (i.status.danoPyro || 0) + atributos.atk * 3.5;
          // Pode adicionar efeito de queimadura extra, etc.
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta dano de ataques normais em 15%.",
      aplicar: (status) => {
        status.bonusDanoNormal = (status.bonusDanoNormal || 0) + 15;
      }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 20%.",
      aplicar: (status) => {
        status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 20;
      }
    },
    c3: {
      descricao: "Aumenta nível da habilidade elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 1) + 3;
      }
    },
    c4: {
      descricao: "Aumenta taxa crítica em 10%.",
      aplicar: (status) => {
        status.taxaCritica = (status.taxaCritica || 5) + 10;
      }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 15%.",
      aplicar: (status) => {
        status.cdUlt = (status.cdUlt || 100) - 15;
      }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta o dano Pyro em 30% por 15 segundos.",
      aplicarUlt: (status) => {
        status.bonusDanoPyro = (status.bonusDanoPyro || 0) + 30;
      }
    }
  }
},
    // Qiqi (Curandeira Cryo)
Qiqi: {
  nome: "Qiqi",
  papel: "Curandeira",
  elemento: "Cryo",
  ataques: {
    normal: {
      descricao: "Ataques rápidos com espada, causando dano Cryo.",
      executar: (status, atributos) => atributos.atk * 1.05 * (1 + ((status.bonusDanoCryo || 0) / 100))
    },
    elemental: {
      descricao: "Marca aliados para regeneração de vida quando atacam.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          if (!p.status) p.status = {};
          p.status.regeneracaoVida = (p.status.regeneracaoVida || 0) + atributos.atk * 0.2;
        });
        return true;
      }
    },
    ult: {
      descricao: "Invoca o poder do Cryo para curar aliados e causar dano Cryo em área.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        equipe.forEach(p => {
          p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + atributos.hpMax * 0.35);
        });
        inimigos.forEach(i => {
          i.status = i.status || {};
          i.status.danoCryo = (i.status.danoCryo || 0) + atributos.atk * 2.5;
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta cura em 20%.",
      aplicar: (status) => {
        status.curaBonus = (status.curaBonus || 0) + 20;
      }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 15%.",
      aplicar: (status) => {
        status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 15;
      }
    },
    c3: {
      descricao: "Aumenta nível da habilidade elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 1) + 3;
      }
    },
    c4: {
      descricao: "Aumenta taxa crítica em 10%.",
      aplicar: (status) => {
        status.taxaCritica = (status.taxaCritica || 5) + 10;
      }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 15%.",
      aplicar: (status) => {
        status.cdUlt = (status.cdUlt || 100) - 15;
      }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta a regeneração de vida em 30% por 10 segundos.",
      aplicarUlt: (status) => {
        status.regeneracaoVida = (status.regeneracaoVida || 0) + 30;
      }
    }
  }
},
    // Jean (Suporte / Curandeira Anemo)
Jean: {
  nome: "Jean",
  papel: "Suporte",
  elemento: "Anemo",
  ataques: {
    normal: {
      descricao: "Ataques rápidos com espada, causando dano Anemo.",
      executar: (status, atributos) => atributos.atk * 1.1 * (1 + ((status.bonusDanoAnemo || 0) / 100))
    },
    elemental: {
      descricao: "Ataque Anemo que cura aliados próximos e aplica dano Anemo em inimigos.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        // Cura aliados próximos
        equipe.forEach(p => {
          p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + atributos.hpMax * 0.3);
        });
        // Aplica dano Anemo nos inimigos próximos
        inimigos.forEach(i => {
          i.status = i.status || {};
          i.status.danoAnemo = (i.status.danoAnemo || 0) + atributos.atk * 1.5;
        });
        return true;
      }
    },
    ult: {
      descricao: "Invoca um tornado que suga inimigos e regenera vida de aliados baseando-se no ataque de Jean.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + atributos.atk * 0.5);
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta cura em 20%.",
      aplicar: (status) => {
        status.curaBonus = (status.curaBonus || 0) + 20;
      }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 15%.",
      aplicar: (status) => {
        status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 15;
      }
    },
    c3: {
      descricao: "Aumenta nível da habilidade elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 1) + 3;
      }
    },
    c4: {
      descricao: "Aumenta taxa crítica em 10%.",
      aplicar: (status) => {
        status.taxaCritica = (status.taxaCritica || 5) + 10;
      }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 20%.",
      aplicar: (status) => {
        status.cdUlt = (status.cdUlt || 100) - 20;
      }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta dano Anemo e cura em 30% por 10 segundos.",
      aplicarUlt: (status) => {
        status.bonusDanoAnemo = (status.bonusDanoAnemo || 0) + 30;
        status.curaBonus = (status.curaBonus || 0) + 30;
      }
    }
  }
},
    // Keqing (DPS Electro)
Keqing: {
  nome: "Keqing",
  papel: "DPS",
  elemento: "Electro",
  ataques: {
    normal: {
      descricao: "Ataques rápidos com espada que causam dano Electro.",
      executar: (status, atributos) => atributos.atk * 1.2 * (1 + ((status.bonusDanoElectro || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Ataque rápido que causa dano Electro e permite teleporte curto.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          i.status = i.status || {};
          i.status.danoElectro = (i.status.danoElectro || 0) + atributos.atk * 1.5;
        });
        return true;
      }
    },
    ult: {
      descricao: "Desencadeia um ataque poderoso que causa dano em área Electro.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          i.status = i.status || {};
          i.status.danoElectro = (i.status.danoElectro || 0) + atributos.atk * 3.0;
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta dano de ataque normal em 15%.",
      aplicar: (status) => {
        status.bonusDanoNormal = (status.bonusDanoNormal || 0) + 15;
      }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 20%.",
      aplicar: (status) => {
        status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 20;
      }
    },
    c3: {
      descricao: "Aumenta nível da habilidade elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 1) + 3;
      }
    },
    c4: {
      descricao: "Aumenta taxa crítica em 10%.",
      aplicar: (status) => {
        status.taxaCritica = (status.taxaCritica || 5) + 10;
      }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 15%.",
      aplicar: (status) => {
        status.cdUlt = (status.cdUlt || 100) - 15;
      }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta o dano crítico em 40% por 15 segundos.",
      aplicarUlt: (status) => {
        status.bonusDanoCritico = (status.bonusDanoCritico || 0) + 40;
      }
    }
  }
},
    // Noelle (Defensora Geo / Curandeira)
Noelle: {
  nome: "Noelle",
  papel: "Defensora",
  elemento: "Geo",
  ataques: {
    normal: {
      descricao: "Ataques físicos com espada, causando dano Geo.",
      executar: (status, atributos) => atributos.atk * 1.1 * (1 + ((status.bonusDanoGeo || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Cria uma barreira que protege a equipe e causa dano Geo em inimigos próximos.",
      executar: (status, atributos, inimigos = []) => {
        status.escudoBonus = (status.escudoBonus || 0) + atributos.def * 1.5;
        inimigos.forEach(i => {
          i.status = i.status || {};
          i.status.danoGeo = (i.status.danoGeo || 0) + atributos.atk * 1.2;
        });
        return true;
      }
    },
    ult: {
      descricao: "Transforma ataques normais em ataques Geo que curam aliados com base no ataque de Noelle.",
      executar: (status, atributos, equipe = []) => {
        status.ataquesGeoCurativos = true;
        equipe.forEach(p => {
          if (!p.status) p.status = {};
          p.status.curaPorAtaque = atributos.atk * 0.2;
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta defesa em 20%.",
      aplicar: (status) => {
        status.bonusDef = (status.bonusDef || 0) + 20;
      }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 15%.",
      aplicar: (status) => {
        status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 15;
      }
    },
    c3: {
      descricao: "Aumenta nível da habilidade elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 1) + 3;
      }
    },
    c4: {
      descricao: "Aumenta cura dos ataques normais em 15%.",
      aplicar: (status) => {
        status.curaBonus = (status.curaBonus || 0) + 15;
      }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 20%.",
      aplicar: (status) => {
        status.cdUlt = (status.cdUlt || 100) - 20;
      }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta a cura dos ataques normais em 30% por 15 segundos.",
      aplicarUlt: (status) => {
        status.curaBonus = (status.curaBonus || 0) + 30;
      }
    }
  }
},

// Barbara (Curandeira Hydro)
Barbara: {
  nome: "Barbara",
  papel: "Curandeira",
  elemento: "Hydro",
  ataques: {
    normal: {
      descricao: "Ataques Hydro com catalisador, dano base.",
      executar: (status, atributos) => atributos.atk * 1.0
    },
    habilidade_elemental: {
      descricao: "Aplica marca Hydro nos aliados, que regenera HP ao longo do tempo.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          if (!p.status) p.status = {};
          p.status.marcaHydro = true;
          // Cura ao longo do tempo, simulada aqui por aumento instantâneo para simplificação
          p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + atributos.hpMax * 0.1);
        });
        return true;
      }
    },
    ult: {
      descricao: "Restaura HP para toda a equipe com base no ataque de Barbara.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + atributos.atk * 0.6);
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta cura em 20%.",
      aplicar: (status) => {
        status.curaBonus = (status.curaBonus || 0) + 20;
      }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 15%.",
      aplicar: (status) => {
        status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 15;
      }
    },
    c3: {
      descricao: "Aumenta nível da habilidade elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 1) + 3;
      }
    },
    c4: {
      descricao: "Aumenta taxa crítica em 10%.",
      aplicar: (status) => {
        status.taxaCritica = (status.taxaCritica || 5) + 10;
      }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 20%.",
      aplicar: (status) => {
        status.cdUlt = (status.cdUlt || 100) - 20;
      }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta a cura da equipe em 25% por 10 segundos.",
      aplicarUlt: (status) => {
        status.curaBonus = (status.curaBonus || 0) + 25;
      }
    }
  }
},
// Charlotte (Suporte Cryo)
Charlotte: {
  nome: "Charlotte",
  papel: "Suporte",
  elemento: "Cryo",
  ataques: {
    normal: {
      descricao: "Ataques Cryo com lança, dano base.",
      executar: (status, atributos) => atributos.atk * 1.05
    },
    habilidade_elemental: {
      descricao: "Aplica dano Cryo em área e reduz velocidade de movimento dos inimigos atingidos.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          if (!i.status) i.status = {};
          i.status.reduzirVelocidade = 20; // Reduz velocidade em 20%
          i.status.hpAtual = (i.status.hpAtual || i.atributos.hpMax) - atributos.atk * 0.8;
        });
        return true;
      }
    },
    ult: {
      descricao: "Cria uma barreira Cryo que absorve dano e aplica Cryo nos inimigos próximos.",
      executar: (status, atributos, inimigos = []) => {
        status.escudoBonus = (status.escudoBonus || 0) + atributos.hpMax * 0.3;
        inimigos.forEach(i => {
          if (!i.status) i.status = {};
          i.status.marcadoCryo = true;
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta dano da habilidade elemental em 15%.",
      aplicar: (status) => { status.bonusDanoCryo = (status.bonusDanoCryo || 0) + 15; }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 10%.",
      aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 10; }
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
      descricao: "Após usar o ultimate, aumenta o dano dos aliados em 25% por 10 segundos.",
      aplicarUlt: (status) => { status.danoBonus = (status.danoBonus || 0) + 25; }
    }
  }
},
    // Chongyun (DPS Cryo)
Chongyun: {
  nome: "Chongyun",
  papel: "DPS",
  elemento: "Cryo",
  ataques: {
    normal: {
      descricao: "Ataques físicos rápidos com espada claymore.",
      executar: (status, atributos) => atributos.atk * 1.2 * (1 + ((status.bonusDanoFisico || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Cria uma área Cryo que converte ataques normais em dano Cryo por um curto período.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(inimigo => {
          if (!inimigo.status) inimigo.status = {};
          inimigo.status.zonaCryo = true;
        });
        return true;
      }
    },
    ult: {
      descricao: "Desencadeia um ataque em área com dano massivo Cryo.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(inimigo => {
          inimigo.status.hpAtual = (inimigo.status.hpAtual || inimigo.atributos.hpMax) - atributos.atk * 2.5;
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta dano da habilidade elemental em 20%.",
      aplicar: (status) => { status.bonusDanoCryo = (status.bonusDanoCryo || 0) + 20; }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 15%.",
      aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 15; }
    },
    c3: {
      descricao: "Aumenta ataque em 25%.",
      aplicar: (status) => { status.bonusAtk = (status.bonusAtk || 0) + 25; }
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
      descricao: "Aumenta dano crítico em 35% por 15 segundos após usar o ultimate.",
      aplicarUlt: (status) => { status.bonusDanoCritico = (status.bonusDanoCritico || 0) + 35; }
    }
  }
},

// Mika (Suporte Cryo)
Mika: {
  nome: "Mika",
  papel: "Suporte",
  elemento: "Cryo",
  ataques: {
    normal: {
      descricao: "Ataques com arco, dano base Cryo.",
      executar: (status, atributos) => atributos.atk * 1.0 * (1 + ((status.bonusDanoCryo || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Cria uma área que cura aliados e aplica Cryo nos inimigos dentro dela.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        // Cura aliados na área
        equipe.forEach(p => {
          p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + atributos.atk * 0.3);
        });

        // Aplica status Cryo nos inimigos na área
        inimigos.forEach(i => {
          if (!i.status) i.status = {};
          i.status.aplicadoCryo = true;
        });

        return true;
      }
    },
    ult: {
      descricao: "Aumenta a resistência elemental da equipe e fortalece escudos por um tempo.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          if (!p.status) p.status = {};
          p.status.resistenciaElementalBonus = (p.status.resistenciaElementalBonus || 0) + 20;
          p.status.escudoBonus = (p.status.escudoBonus || 0) + 25;
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta a cura da habilidade elemental em 25%.",
      aplicar: (status) => { status.curaBonus = (status.curaBonus || 0) + 25; }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 20%.",
      aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 20; }
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
      descricao: "Após usar o ultimate, aumenta cura em 40% por 12 segundos.",
      aplicarUlt: (status) => { status.curaBonus = (status.curaBonus || 0) + 40; }
    }
  }
},
// Shikanoin Heizou (Suporte Anemo)
ShikanoinHeizou: {
  nome: "Shikanoin Heizou",
  papel: "Suporte",
  elemento: "Anemo",
  ataques: {
    normal: {
      descricao: "Ataques rápidos com espada, dano Anemo.",
      executar: (status, atributos) => atributos.atk * 1.05 * (1 + ((status.bonusDanoAnemo || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Cria uma área de vento que aumenta a velocidade de ataque da equipe e aplica Anemo nos inimigos.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        // Aumenta velocidade de ataque dos aliados
        equipe.forEach(p => {
          if (!p.status) p.status = {};
          p.status.velocidadeAtaque = (p.status.velocidadeAtaque || 0) + 20;
        });

        // Aplica status Anemo nos inimigos na área
        inimigos.forEach(i => {
          if (!i.status) i.status = {};
          i.status.aplicadoAnemo = true;
        });

        return true;
      }
    },
    ult: {
      descricao: "Gera um tornado que puxa inimigos e causa dano Anemo contínuo.",
      executar: (status, atributos, inimigos = []) => {
        // Causa dano contínuo aos inimigos
        inimigos.forEach(i => {
          i.hp = Math.max(0, (i.hp || 1000) - atributos.atk * 0.8);
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta dano da habilidade elemental em 20%.",
      aplicar: (status) => { status.bonusDanoHabilidadeElemental = (status.bonusDanoHabilidadeElemental || 0) + 20; }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 15%.",
      aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 15; }
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
      descricao: "Após usar o ultimate, aumenta dano Anemo em 30% por 10 segundos.",
      aplicarUlt: (status) => { status.bonusDanoAnemo = (status.bonusDanoAnemo || 0) + 30; }
    }
  }
},
    // Thoma (Suporte Pyro)
Thoma: {
  nome: "Thoma",
  papel: "Suporte",
  elemento: "Pyro",
  ataques: {
    normal: {
      descricao: "Ataques rápidos com lança, causando dano Pyro.",
      executar: (status, atributos) => atributos.atk * 1.1 * (1 + ((status.bonusDanoPyro || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Cria um escudo que absorve dano baseado no ataque e aplica Pyro nos inimigos próximos.",
      executar: (status, atributos, inimigos = []) => {
        status.escudo = (status.escudo || 0) + atributos.atk * 0.4;

        inimigos.forEach(inimigo => {
          if (!inimigo.status) inimigo.status = {};
          inimigo.status.aplicadoPyro = true;
        });

        return true;
      }
    },
    ult: {
      descricao: "Desencadeia uma explosão Pyro que causa dano em área e fortalece o escudo.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          p.status.escudo = (p.status.escudo || 0) + atributos.atk * 0.3;
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta escudo em 20%.",
      aplicar: (status) => { status.bonusEscudo = (status.bonusEscudo || 0) + 20; }
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
      descricao: "Reduz cooldown do ultimate em 20%.",
      aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 20; }
    },
    c6: {
      descricao: "Quando o escudo está ativo, aumenta dano Pyro em 25%.",
      aplicarUlt: (status) => { status.bonusDanoPyro = (status.bonusDanoPyro || 0) + 25; }
    }
  }
},

// Chevreuse (Suporte Pyro)
Chevreuse: {
  nome: "Chevreuse",
  papel: "Suporte",
  elemento: "Pyro",
  ataques: {
    normal: {
      descricao: "Ataques básicos que causam dano Pyro moderado.",
      executar: (status, atributos) => atributos.atk * 0.9 * (1 + ((status.bonusDanoPyro || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Cria uma chama que cura aliados próximos e aplica Pyro nos inimigos.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        // Cura aliados próximos
        equipe.forEach(p => {
          p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + atributos.hpMax * 0.2);
        });
        // Marca inimigos com Pyro para dano extra
        inimigos.forEach(i => {
          if (!i.status) i.status = {};
          i.status.aplicadoPyro = true;
        });
        return true;
      }
    },
    ult: {
      descricao: "Aumenta o ataque e resistência Pyro da equipe por um tempo.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          if (!p.status) p.status = {};
          p.status.bonusAtkPyro = (p.status.bonusAtkPyro || 0) + 15;
          p.status.bonusResistPyro = (p.status.bonusResistPyro || 0) + 20;
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta a cura da habilidade elemental em 25%.",
      aplicar: (status) => { status.curaBonus = (status.curaBonus || 0) + 25; }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 15%.",
      aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 15; }
    },
    c3: {
      descricao: "Aumenta ataque em 20%.",
      aplicar: (status) => { status.bonusAtk = (status.bonusAtk || 0) + 20; }
    },
    c4: {
      descricao: "Aumenta resistência elemental Pyro da equipe em 15%.",
      aplicar: (status) => { status.bonusResistPyro = (status.bonusResistPyro || 0) + 15; }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 20%.",
      aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 20; }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta ataque da equipe em 30% por 15 segundos.",
      aplicarUlt: (status) => { status.bonusAtk = (status.bonusAtk || 0) + 30; }
    }
  }
},

    // LanYan (Escudeira Anemo)
LanYan: {
  nome: "LanYan",
  papel: "Escudeira",
  elemento: "Anemo",
  ataques: {
    normal: {
      descricao: "Ataques Anemo com espada, dano base.",
      executar: (status, atributos) => atributos.atk * 1.1 * (1 + ((status.bonusDanoAnemo || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Cria uma barreira Anemo que reduz resistência elemental dos inimigos próximos.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          // reduz 20% de resistência elemental Hydro, Electro, Pyro e Cryo
          ["Hydro", "Electro", "Pyro", "Cryo"].forEach(elemento => {
            const keyResist = `resistencia${elemento}`;
            i[keyResist] = Math.max(0, (i[keyResist] || 0) - 20);
          });
        });
        // adiciona escudo para o personagem
        status.escudoBonus = (status.escudoBonus || 0) + atributos.hpMax * 0.25;
        return true;
      }
    },
    ult: {
      descricao: "Aumenta a defesa da equipe e regenera escudo por um tempo.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          if (!p.status) p.status = {};
          p.status.defesaBonus = (p.status.defesaBonus || 0) + 25;
          p.status.escudoBonus = (p.status.escudoBonus || 0) + atributos.hpMax * 0.3;
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta escudo em 20%.",
      aplicar: (status) => { status.bonusEscudo = (status.bonusEscudo || 0) + 20; }
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
      descricao: "Inimigos afetados pela barreira têm resistência reduzida em 10% adicional.",
      aplicar: (status) => { status.penetracaoResistencia = (status.penetracaoResistencia || 0) + 10; }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 20%.",
      aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 20; }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta a defesa da equipe em 40% por 15 segundos.",
      aplicarUlt: (status) => { status.defesaBonus = (status.defesaBonus || 0) + 40; }
    }
  }
},

    // Rosaria (DPS Cryo)
Rosaria: {
  nome: "Rosaria",
  papel: "DPS",
  elemento: "Cryo",
  ataques: {
    normal: {
      descricao: "Ataques rápidos com lança, causando dano Cryo.",
      executar: (status, atributos) => atributos.atk * 1.2 * (1 + ((status.bonusDanoCryo || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Ataca inimigos com dano Cryo e aumenta chance de crítico da equipe.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          if (!p.status) p.status = {};
          p.status.taxaCritica = (p.status.taxaCritica || 5) + 15;
        });
        return true;
      }
    },
    ult: {
      descricao: "Desferre um ataque Cryo em área que reduz resistência dos inimigos.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          const keyResist = `resistenciaCryo`;
          i[keyResist] = Math.max(0, (i[keyResist] || 0) - 25);
        });
        return atributos.atk * 2.5;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta dano Cryo em 20%.",
      aplicar: (status) => { status.bonusDanoCryo = (status.bonusDanoCryo || 0) + 20; }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 15%.",
      aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 15; }
    },
    c3: {
      descricao: "Aumenta ataque em 20%.",
      aplicar: (status) => { status.bonusAtk = (status.bonusAtk || 0) + 20; }
    },
    c4: {
      descricao: "Ataques do ultimate ignoram 15% da resistência dos inimigos.",
      aplicar: (status) => { status.penetracaoResistencia = (status.penetracaoResistencia || 0) + 15; }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 20%.",
      aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 20; }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta dano crítico em 30% por 15 segundos.",
      aplicarUlt: (status) => { status.bonusDanoCritico = (status.bonusDanoCritico || 0) + 30; }
    }
  }
},
    // KujouSara (Suporte Electro)
KujouSara: {
  nome: "KujouSara",
  papel: "Suporte",
  elemento: "Electro",
  ataques: {
    normal: {
      descricao: "Ataques rápidos com arco, causando dano Electro.",
      executar: (status, atributos) => atributos.atk * 1.0 * (1 + ((status.bonusDanoElectro || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Invoca corvo que aplica Electro e aumenta ataque da equipe.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          if (!p.status) p.status = {};
          p.status.bonusAtk = (p.status.bonusAtk || 0) + 20;
        });
        return true;
      }
    },
    ult: {
      descricao: "Causa dano Electro em área e fortalece escudos dos aliados.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          p.status.escudoBonus = (p.status.escudoBonus || 0) + 25;
        });
        return atributos.atk * 2.8;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta dano do ataque normal em 15%.",
      aplicar: (status) => { status.bonusDanoElectro = (status.bonusDanoElectro || 0) + 15; }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 20%.",
      aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 20; }
    },
    c3: {
      descricao: "Aumenta ataque em 15%.",
      aplicar: (status) => { status.bonusAtk = (status.bonusAtk || 0) + 15; }
    },
    c4: {
      descricao: "Aumenta escudo em 25%.",
      aplicar: (status) => { status.bonusEscudo = (status.bonusEscudo || 0) + 25; }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 15%.",
      aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 15; }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta ataque em 30% por 15 segundos.",
      aplicarUlt: (status) => { status.bonusAtk = (status.bonusAtk || 0) + 30; }
    }
  }
},
    
// Xinyan (DPS Pyro)
Xinyan: {
  nome: "Xinyan",
  papel: "DPS",
  elemento: "Pyro",
  ataques: {
    normal: {
      descricao: "Ataques físicos com espada que causam dano Pyro.",
      executar: (status, atributos) => atributos.atk * 1.15 * (1 + ((status.bonusPyro || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Gera escudo baseado no ataque e aplica dano Pyro em área.",
      executar: (status, atributos) => {
        status.escudoBonus = (status.escudoBonus || 0) + atributos.atk * 0.3;
        return true;
      }
    },
    ult: {
      descricao: "Causa dano Pyro em área e reduz resistência Pyro dos inimigos.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          i.resistenciaPyro = Math.max(0, (i.resistenciaPyro || 0) - 20);
        });
        return atributos.atk * 3.0;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta dano do ataque normal em 15%.",
      aplicar: (status) => { status.bonusDanoFisico = (status.bonusDanoFisico || 0) + 15; }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 20%.",
      aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 20; }
    },
    c3: {
      descricao: "Aumenta nível da habilidade elemental em 3.",
      aplicar: (status) => { status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 1) + 3; }
    },
    c4: {
      descricao: "Aumenta escudo em 30%.",
      aplicar: (status) => { status.bonusEscudo = (status.bonusEscudo || 0) + 30; }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 15%.",
      aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 15; }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta ataque em 40% por 15 segundos.",
      aplicarUlt: (status) => { status.bonusAtk = (status.bonusAtk || 0) + 40; }
    }
  }
},
    RaidenShogun: {
  nome: "Raiden Shogun",
  papel: "DPS",
  elemento: "Electro",
  ataques: {
    normal: {
      descricao: "Ataques rápidos com dano Electro.",
      executar: (status, atributos) => atributos.atk * 1.2 * (1 + ((status.bonusElectro || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Invoca um ataque Electro que regenera energia para a equipe.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          p.status.energiaRecuperada = (p.status.energiaRecuperada || 0) + atributos.atk * 0.15;
        });
        return true;
      }
    },
    ult: {
      descricao: "Causa grande dano Electro em área e aumenta dano da equipe.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          p.status.bonusDanoElectro = (p.status.bonusDanoElectro || 0) + 25;
        });
        return atributos.atk * 3.5;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta dano do ataque normal em 15%.",
      aplicar: (status) => { status.bonusDanoElectro = (status.bonusDanoElectro || 0) + 15; }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 20%.",
      aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 20; }
    },
    c3: {
      descricao: "Aumenta o nível da habilidade elemental em 3.",
      aplicar: (status) => { status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 1) + 3; }
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
      descricao: "Após usar o ultimate, aumenta dano crítico em 40% por 15 segundos.",
      aplicarUlt: (status) => {
        status.bonusDanoCritico = (status.bonusDanoCritico || 0) + 40;
        status.bonusTaxaCritica = (status.bonusTaxaCritica || 0) + 40;
      }
    }
  }
},
    YaeMiko: {
  nome: "Yae Miko",
  papel: "Suporte",
  elemento: "Electro",
  ataques: {
    normal: {
      descricao: "Ataques com dano Electro rápido e preciso.",
      executar: (status, atributos) => atributos.atk * 1.0 * (1 + ((status.bonusElectro || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Invoca espíritos que causam dano Electro contínuo.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          i.hp = Math.max(0, i.hp - atributos.atk * 0.25);
          i.status.aplicadoElectro = true;
        });
        return true;
      }
    },
    ult: {
      descricao: "Aumenta o dano Electro da equipe e reduz resistência Electro dos inimigos.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        equipe.forEach(p => {
          p.status.bonusDanoElectro = (p.status.bonusDanoElectro || 0) + 20;
        });
        inimigos.forEach(i => {
          i.resistenciaElectro = Math.max(0, (i.resistenciaElectro || 0) - 15);
        });
        return atributos.atk * 3.2;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta dano do ataque normal em 15%.",
      aplicar: (status) => { status.bonusDanoElectro = (status.bonusDanoElectro || 0) + 15; }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 15%.",
      aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 15; }
    },
    c3: {
      descricao: "Aumenta nível da habilidade elemental em 2.",
      aplicar: (status) => { status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 1) + 2; }
    },
    c4: {
      descricao: "Aumenta proficiência elemental em 20%.",
      aplicar: (status) => { status.profElemento = (status.profElemento || 0) + 20; }
    },
    c5: {
      descricao: "Reduz cooldown do ultimate em 15%.",
      aplicar: (status) => { status.cdUlt = (status.cdUlt || 100) - 15; }
    },
    c6: {
      descricao: "Após usar o ultimate, aumenta o dano Electro da equipe em 30% por 12 segundos.",
      aplicarUlt: (status) => {
        status.bonusDanoElectro = (status.bonusDanoElectro || 0) + 30;
      }
    }
  }
},
    Scaramouche: {
  nome: "Scaramouche",
  papel: "DPS",
  elemento: "Anemo",
  ataques: {
    normal: {
      descricao: "Ataques rápidos com dano Anemo.",
      executar: (status, atributos) => atributos.atk * 1.15 * (1 + ((status.bonusAnemo || 0) / 100))
    },
    habilidade_elemental: {
      descricao: "Causa dano Anemo em área e aplica debuff que reduz defesa inimiga.",
      executar: (status, atributos, inimigos = []) => {
        inimigos.forEach(i => {
          i.hp = Math.max(0, i.hp - atributos.atk * 0.4);
          i.status.defesaReduzida = (i.status.defesaReduzida || 0) + 15; // Reduz defesa 15%
        });
        return true;
      }
    },
    ult: {
      descricao: "Ataque poderoso que aumenta o dano Anemo do usuário.",
      executar: (status, atributos) => {
        status.bonusDanoAnemo = (status.bonusDanoAnemo || 0) + 30;
        return atributos.atk * 3.7;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta dano do ataque normal em 15%.",
      aplicar: (status) => { status.bonusDanoAnemo = (status.bonusDanoAnemo || 0) + 15; }
    },
    c2: {
      descricao: "Reduz cooldown da habilidade elemental em 20%.",
      aplicar: (status) => { status.cdHabilidadeElemental = (status.cdHabilidadeElemental || 100) - 20; }
    },
    c3: {
      descricao: "Aumenta nível da habilidade elemental em 3.",
      aplicar: (status) => { status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 1) + 3; }
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
      descricao: "Após usar o ultimate, aumenta dano crítico em 40% por 15 segundos.",
      aplicarUlt: (status) => {
        status.bonusDanoCritico = (status.bonusDanoCritico || 0) + 40;
        status.bonusTaxaCritica = (status.bonusTaxaCritica || 0) + 40;
      }
    }
  }
},
    Nahida: {
  nome: "Nahida",
  papel: "Suporte",
  elemento: "Dendro",
  ataques: {
    normal: {
      descricao: "Ataques Dendro à distância com seu catalisador.",
      executar: (status, atributos) =>
        atributos.atk * 1.0 * (1 + ((status.bonusDanoDendro || 0) / 100))
    },
    elemental: {
      descricao: "Marca inimigos com a Semente de Skandha, causando dano Dendro escalado com Proficiência Elemental.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const danoBase = atributos.prof * 1.5 + atributos.atk * 0.4;

        inimigos.forEach((i) => {
          i.hpAtual = Math.max(0, i.hpAtual - danoBase);
        });

        return true;
      }
    },
    ult: {
      descricao: "Ativa o Templo da Ilusão, concedendo bônus baseados no elemento da equipe.",
      executar: (status, atributos, equipe = []) => {
        const elementosEquipe = [...new Set(equipe.map(p => p.elemento))];

        elementosEquipe.forEach(el => {
          switch (el) {
            case "Pyro":
              status.danoTotal = (status.danoTotal || 0) + 20;
              break;
            case "Electro":
              status.recargaEnergia = (status.recargaEnergia || 100) + 30;
              break;
            case "Hydro":
              status.curaBonus = (status.curaBonus || 0) + 25;
              break;
          }
        });

        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Os inimigos afetados por sua habilidade elemental sofrem -30 de DEF.",
      aplicar: (status, alvo) => {
        alvo.def = Math.max(0, (alvo.def || 0) - 30);
      }
    },
    c2: {
      descricao: "Aumenta dano da habilidade elemental com base em 20% da proficiência.",
      aplicar: (status, atributos) => {
        status.bonusDanoDendro = (status.bonusDanoDendro || 0) + atributos.prof * 0.2;
      }
    },
    c3: {
      descricao: "Aumenta nível da Habilidade Elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 0) + 3;
      }
    },
    c4: {
      descricao: "Inimigos marcados recebem 10% mais dano de reações elementais.",
      aplicar: (status) => {
        status.reacaoBonus = (status.reacaoBonus || 0) + 10;
      }
    },
    c5: {
      descricao: "Aumenta o nível do Supremo em 3.",
      aplicar: (status) => {
        status.nivelSupremo = (status.nivelSupremo || 0) + 3;
      }
    },
    c6: {
      descricao: "Aumenta Proficiência Elemental dos aliados em 100 após uso do supremo.",
      aplicarUlt: (status, atributos, equipe) => {
        equipe.forEach((aliado) => {
          aliado.atributos.prof = (aliado.atributos.prof || 0) + 100;
        });
      }
    }
  }
},

  Mavuika: {
  nome: "Mavuika",
  papel: "DPS",
  elemento: "Pyro",
  ataques: {
    normal: {
      descricao: "Ataques rápidos imbuídos com chamas divinas.",
      executar: (status, atributos) =>
        atributos.atk * 1.3 * (1 + ((status.bonusDanoPyro || 0) / 100))
    },
    elemental: {
      descricao: "Lança uma lança flamejante do céu, causando dano massivo e aplicando 'Julgamento Ardente'.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const danoBase = atributos.atk * 2.8;
        inimigos.forEach((inimigo) => {
          inimigo.hpAtual = Math.max(0, inimigo.hpAtual - danoBase);
          inimigo.julgamentoArdente = true; // status especial para outros efeitos
          inimigo.resistenciaPyro = Math.max(0, (inimigo.resistenciaPyro || 0) - 25);
        });
        return true;
      }
    },
    ult: {
      descricao: "Desperta a Chama Celestial, buffando todo o time e causando dano em área.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const danoUlt = atributos.atk * 3.5;
        inimigos.forEach((i) => {
          i.hpAtual = Math.max(0, i.hpAtual - danoUlt);
        });

        equipe.forEach((aliado) => {
          aliado.status.danoTotal = (aliado.status.danoTotal || 0) + 25;
          aliado.status.taxaCritica = (aliado.status.taxaCritica || 0) + 10;
        });

        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Enquanto 'Julgamento Ardente' estiver ativo, inimigos recebem +20% de dano Pyro.",
      aplicar: (status, alvo) => {
        if (alvo.julgamentoArdente) {
          status.bonusDanoPyro = (status.bonusDanoPyro || 0) + 20;
        }
      }
    },
    c2: {
      descricao: "Recupera 15% de energia ao eliminar inimigo sob efeito de 'Julgamento Ardente'.",
      aplicar: (status, contexto) => {
        if (contexto.alvo?.julgamentoArdente && contexto.inimigoDerrotado) {
          status.recargaEnergia = (status.recargaEnergia || 100) + 15;
        }
      }
    },
    c3: {
      descricao: "Aumenta o nível da habilidade elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 0) + 3;
      }
    },
    c4: {
      descricao: "Aliados sob efeito do Supremo de Mavuika recebem +50 de Proficiência Elemental.",
      aplicarUlt: (status, atributos, equipe) => {
        equipe.forEach((a) => {
          a.atributos.prof = (a.atributos.prof || 0) + 50;
        });
      }
    },
    c5: {
      descricao: "Aumenta o nível do Supremo em 3.",
      aplicar: (status) => {
        status.nivelSupremo = (status.nivelSupremo || 0) + 3;
      }
    },
    c6: {
      descricao: "Quando Mavuika está em campo, o time ignora 20% da resistência elemental inimiga.",
      aplicar: (status) => {
        status.penetracaoElemental = (status.penetracaoElemental || 0) + 20;
      }
    }
  }
},
    Xiangling: {
  nome: "Xiangling",
  papel: "Sub DPS",
  elemento: "Pyro",
  ataques: {
    normal: {
      descricao: "Ataques com sua lança em sequência, causando dano físico.",
      executar: (status, atributos) =>
        atributos.atk * 1.0 * (1 + ((status.bonusDanoFisico || 0) / 100))
    },
    elemental: {
      descricao: "Invoca o Guoba que cospe fogo, causando dano Pyro escalado com ATK.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const danoGuoba = atributos.atk * 2.0;
        inimigos.forEach((inimigo) => {
          inimigo.hpAtual = Math.max(0, inimigo.hpAtual - danoGuoba);
          inimigo.resistenciaPyro = Math.max(0, (inimigo.resistenciaPyro || 0) - 10);
        });
        return true;
      }
    },
    ult: {
      descricao: "Lança o redemoinho flamejante de Pyronado, causando múltiplos hits.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const hits = 3;
        const danoTotal = atributos.atk * 1.5 * hits;
        inimigos.forEach((i) => {
          i.hpAtual = Math.max(0, i.hpAtual - danoTotal);
        });
        status.bonusDanoPyro = (status.bonusDanoPyro || 0) + 15; // buff temporário pós-ult
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Inimigos atingidos por Guoba têm resistência Pyro reduzida em 15%.",
      aplicar: (status, alvo) => {
        alvo.resistenciaPyro = Math.max(0, (alvo.resistenciaPyro || 0) - 15);
      }
    },
    c2: {
      descricao: "Duração do Pyronado aumentada em 40%.",
      aplicar: (status) => {
        status.duracaoUlt = (status.duracaoUlt || 100) + 40;
      }
    },
    c3: {
      descricao: "Aumenta o nível do Supremo em 3.",
      aplicar: (status) => {
        status.nivelSupremo = (status.nivelSupremo || 0) + 3;
      }
    },
    c4: {
      descricao: "Todos os inimigos atingidos por Guoba recebem dano extra ao longo do tempo (DOT).",
      aplicar: (status, alvo) => {
        alvo.dotPyro = (alvo.dotPyro || 0) + 150;
      }
    },
    c5: {
      descricao: "Aumenta o nível da Habilidade Elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 0) + 3;
      }
    },
    c6: {
      descricao: "Após usar Supremo, todos os ataques normais causam dano Pyro por 10 segundos.",
      aplicarUlt: (status) => {
        status.infundidoPyro = true;
        status.buffPyroNormal = {
          duracao: 10, // tempo em turnos ou segundos (dependendo da lógica)
          danoExtra: 0.6 // 60% do ATK como dano Pyro extra
        };
      }
    }
  }
},

Iansan: {
  nome: "Iansan",
  papel: "Suporte",
  elemento: "Electro",
  ataques: {
    normal: {
      descricao: "Cortes rápidos energizados com trovões danificam o inimigo.",
      executar: (status, atributos) =>
        atributos.atk * 1.15 * (1 + ((status.bonusDanoElectro || 0) / 100))
    },
    elemental: {
      descricao: "Dispara rajadas elétricas em forma de lança, marcando inimigos com 'Sopro de Trovão'.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const dano = atributos.atk * 2.2;
        inimigos.forEach((inimigo) => {
          inimigo.hpAtual = Math.max(0, inimigo.hpAtual - dano);
          inimigo.debuffIansan = {
            marcado: true,
            resistenciaElectro: Math.max(0, (inimigo.resistenciaElectro || 0) - 20)
          };
        });
        return true;
      }
    },
    ult: {
      descricao: "Invoca a Tempestade de Oyá, dando recarga, dano e velocidade de ação ao time.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach((aliado) => {
          aliado.status.recargaEnergia = (aliado.status.recargaEnergia || 100) + 40;
          aliado.status.danoTotal = (aliado.status.danoTotal || 0) + 20;
          aliado.status.velocidade = (aliado.status.velocidade || 100) + 25;
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta o dano em inimigos marcados com 'Sopro de Trovão' em 25%.",
      aplicar: (status, alvo) => {
        if (alvo.debuffIansan?.marcado) {
          status.danoTotal = (status.danoTotal || 0) + 25;
        }
      }
    },
    c2: {
      descricao: "A cada reação Electro gerada, aumenta a Proficiência Elemental de todos os aliados em 40 por 8s.",
      aplicar: (status, contexto, equipe) => {
        if (contexto.reacaoElemental === "Electro") {
          equipe.forEach((aliado) => {
            aliado.atributos.prof = (aliado.atributos.prof || 0) + 40;
          });
        }
      }
    },
    c3: {
      descricao: "Aumenta o nível da Habilidade Elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 0) + 3;
      }
    },
    c4: {
      descricao: "Aliados sob efeito da Tempestade recebem imunidade a interrupções e +20% de resistência elemental.",
      aplicarUlt: (status, equipe) => {
        equipe.forEach((aliado) => {
          aliado.status.resistenciaElemental = (aliado.status.resistenciaElemental || 0) + 20;
          aliado.status.imunidadeInterrupcao = true;
        });
      }
    },
    c5: {
      descricao: "Aumenta o nível do Supremo em 3.",
      aplicar: (status) => {
        status.nivelSupremo = (status.nivelSupremo || 0) + 3;
      }
    },
    c6: {
      descricao: "Se Iansan estiver em campo, todos os ataques Electro ignoram 20% da resistência do inimigo.",
      aplicar: (status) => {
        status.penetracaoElectro = (status.penetracaoElectro || 0) + 20;
      }
    }
  }
},

Yaoyao: {
  nome: "Yaoyao",
  papel: "Healer",
  elemento: "Dendro",
  ataques: {
    normal: {
      descricao: "Ataques com sua lança acompanhados de Dendro suave.",
      executar: (status, atributos) =>
        atributos.atk * 1.0 * (1 + ((status.bonusDanoDendro || 0) / 100))
    },
    elemental: {
      descricao: "Invoca Yuegui (modo lançamento) que cura o aliado com menor HP e causa dano Dendro.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const cura = atributos.hpMax * 0.2;
        const dano = atributos.atk * 1.5;

        // Cura o aliado com menor HP
        let alvo = equipe.reduce((a, b) =>
          (a.status.hpAtual || a.atributos.hpMax) < (b.status.hpAtual || b.atributos.hpMax) ? a : b
        );
        alvo.status.hpAtual = Math.min(alvo.atributos.hpMax, (alvo.status.hpAtual || alvo.atributos.hpMax) + cura);

        // Causa dano ao inimigo com mais vida
        let inimigo = inimigos.sort((a, b) => b.hpAtual - a.hpAtual)[0];
        if (inimigo) inimigo.hpAtual = Math.max(0, inimigo.hpAtual - dano);

        return true;
      }
    },
    ult: {
      descricao: "Modo Yuegui persistente: cura o time em área e causa pulsos de dano Dendro.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const cura = atributos.hpMax * 0.15;
        const dano = atributos.atk * 2.2;

        equipe.forEach(p => {
          p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + cura);
        });

        inimigos.forEach(i => {
          i.hpAtual = Math.max(0, i.hpAtual - dano);
        });

        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Quando Yuegui cura, dá +15% de proficiência elemental por 8s ao alvo.",
      aplicar: (status, contexto) => {
        if (contexto.acao === "elemental" || contexto.acao === "ult") {
          status.prof = (status.prof || 0) + 15;
        }
      }
    },
    c2: {
      descricao: "Aumenta cura da habilidade elemental em 25%.",
      aplicar: (status) => {
        status.curaBonus = (status.curaBonus || 0) + 25;
      }
    },
    c3: {
      descricao: "Aumenta o nível da Habilidade Elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 0) + 3;
      }
    },
    c4: {
      descricao: "Quando um aliado recebe cura da Yaoyao, ganha escudo de 10% do HP por 6s.",
      aplicar: (status, atributos) => {
        status.escudoBonus = (status.escudoBonus || 0) + atributos.hpMax * 0.1;
      }
    },
    c5: {
      descricao: "Aumenta o nível do Supremo em 3.",
      aplicar: (status) => {
        status.nivelSupremo = (status.nivelSupremo || 0) + 3;
      }
    },
    c6: {
      descricao: "Aliados com escudo de Yuegui recebem +20% de cura recebida.",
      aplicar: (status) => {
        if (status.escudoBonus) {
          status.curaBonus = (status.curaBonus || 0) + 20;
        }
      }
    }
  }
},
    KukiShinobu: {
  nome: "Kuki Shinobu",
  papel: "Healer",
  elemento: "Electro",
  ataques: {
    normal: {
      descricao: "Ataques rápidos com espada de curto alcance, causando dano físico.",
      executar: (status, atributos) =>
        atributos.atk * 1.0 * (1 + ((status.bonusDanoFisico || 0) / 100))
    },
    elemental: {
      descricao: "Cria o Anel de Purificação que consome HP para curar aliados e causar dano Electro por pulsos.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const hpSacrificado = atributos.hpMax * 0.05;
        const cura = atributos.hpMax * 0.12;
        const dano = atributos.hpMax * 0.1;

        // Aplica sacrifício de HP à própria Kuki
        status.hpAtual = Math.max(1, (status.hpAtual || atributos.hpMax) - hpSacrificado);

        // Cura equipe
        equipe.forEach(p => {
          p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + cura);
        });

        // Causa dano a todos os inimigos
        inimigos.forEach(i => {
          i.hpAtual = Math.max(0, i.hpAtual - dano);
        });

        return true;
      }
    },
    ult: {
      descricao: "Libera uma onda de julgamento que causa dano em área baseado em HP máximo.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const dano = atributos.hpMax * 0.25;

        inimigos.forEach(i => {
          i.hpAtual = Math.max(0, i.hpAtual - dano);
        });

        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta a área do Anel de Purificação em 50%.",
      aplicar: (status) => {
        status.areaEfeito = (status.areaEfeito || 100) + 50;
      }
    },
    c2: {
      descricao: "Alvos com menos de 50% de vida recebem 15% a mais de cura.",
      aplicar: (status, alvo) => {
        if ((alvo.status.hpAtual || alvo.atributos.hpMax) < alvo.atributos.hpMax / 2) {
          status.curaBonus = (status.curaBonus || 0) + 15;
        }
      }
    },
    c3: {
      descricao: "Aumenta o nível da Habilidade Elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 0) + 3;
      }
    },
    c4: {
      descricao: "Cada inimigo atingido pela Ultimate gera 0.5 de energia para a equipe.",
      aplicarUlt: (status, equipe, inimigos) => {
        const energiaPorInimigo = 0.5;
        const energiaTotal = inimigos.length * energiaPorInimigo;
        equipe.forEach(p => {
          p.status.energia = (p.status.energia || 0) + energiaTotal;
        });
      }
    },
    c5: {
      descricao: "Aumenta o nível do Supremo em 3.",
      aplicar: (status) => {
        status.nivelSupremo = (status.nivelSupremo || 0) + 3;
      }
    },
    c6: {
      descricao: "Quando o HP da própria Kuki está abaixo de 25%, sua resistência a interrupções aumenta e ela recebe +150 EM.",
      aplicar: (status, atributos) => {
        if ((status.hpAtual || atributos.hpMax) < atributos.hpMax * 0.25) {
          status.resistenciaInterrupcao = true;
          status.prof = (status.prof || 0) + 150;
        }
      }
    }
  }
},
    Xingqiu: {
  nome: "Xingqiu",
  papel: "Suporte",
  elemento: "Hydro",
  ataques: {
    normal: {
      descricao: "Ataques com espada rápida que aplicam Hydro em alguns acertos.",
      executar: (status, atributos) =>
        atributos.atk * 1.1 * (1 + ((status.bonusDanoHydro || 0) / 100))
    },
    elemental: {
      descricao: "Espadas chuvosas causam dano Hydro duplo e reduzem dano recebido.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const dano = atributos.atk * 2.4;

        // Reduz dano recebido dos aliados (duração simulada)
        equipe.forEach(p => {
          p.status.reducaoDanoPercent = (p.status.reducaoDanoPercent || 0) + 20;
        });

        // Dano direto a um inimigo
        let inimigo = inimigos[0];
        if (inimigo) inimigo.hpAtual = Math.max(0, inimigo.hpAtual - dano);

        return true;
      }
    },
    ult: {
      descricao: "Cria espadas orbitais que atacam com o personagem ativo após ataques normais e carregados.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          p.status.espadasXingqiu = 3;
          p.status.danoExtraHydro = atributos.atk * 0.8;
        });
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Inimigos atingidos pela habilidade têm a resistência Hydro reduzida em 15% por 4s.",
      aplicar: (status, inimigo) => {
        inimigo.resistenciaHydro = Math.max(0, (inimigo.resistenciaHydro || 0) - 15);
      }
    },
    c2: {
      descricao: "Aumenta o número de espadas orbitais da Ultimate em +1.",
      aplicarUlt: (status, atributos) => {
        status.espadasXingqiu = (status.espadasXingqiu || 3) + 1;
      }
    },
    c3: {
      descricao: "Aumenta o nível da Habilidade Elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 0) + 3;
      }
    },
    c4: {
      descricao: "Recupera 6 de energia sempre que a Ult termina.",
      aplicarUlt: (status, equipe) => {
        equipe.forEach(p => {
          p.status.energia = (p.status.energia || 0) + 6;
        });
      }
    },
    c5: {
      descricao: "Aumenta o nível do Supremo em 3.",
      aplicar: (status) => {
        status.nivelSupremo = (status.nivelSupremo || 0) + 3;
      }
    },
    c6: {
      descricao: "Aumenta o dano da Ultimate em 50% do ATK de Xingqiu.",
      aplicarUlt: (status, atributos) => {
        status.danoExtraHydro = (status.danoExtraHydro || 0) + atributos.atk * 0.5;
      }
    }
  }
},

Sethos: {
  nome: "Sethos",
  papel: "DPS",
  elemento: "Electro",
  ataques: {
    normal: {
      descricao: "Dispara flechas Electro com velocidade e dano moderado.",
      executar: (status, atributos) =>
        atributos.atk * 1.2 * (1 + ((status.bonusDanoElectro || 0) / 100))
    },
    ataque_carga: {
      descricao: "Disparo carregado concentrado com dano Electro elevado.",
      executar: (status, atributos) =>
        atributos.atk * 2.5 * (1 + ((status.bonusDanoElectro || 0) / 100))
    },
    elemental: {
      descricao: "Dispara uma flecha explosiva de energia que causa dano Electro em área.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const dano = atributos.atk * 2.8;

        inimigos.forEach(i => {
          i.hpAtual = Math.max(0, i.hpAtual - dano);
        });

        return true;
      }
    },
    ult: {
      descricao: "Cria um campo de pulsos de energia Electro que ataca automaticamente inimigos próximos.",
      executar: (status, atributos, equipe = [], inimigos = []) => {
        const danoPorPulso = atributos.atk * 1.4;
        inimigos.forEach(i => {
          i.hpAtual = Math.max(0, i.hpAtual - danoPorPulso * 2); // 2 pulsos instantâneos
        });
        status.danoAoLongoDoTempo = true;
        return true;
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Ataques carregados consomem 25% menos stamina e causam +15% de dano.",
      aplicar: (status) => {
        status.bonusDanoElectro = (status.bonusDanoElectro || 0) + 15;
        status.reducaoCustoStamina = true;
      }
    },
    c2: {
      descricao: "Sempre que causar reação Electro, recupera 5 de energia.",
      aplicar: (status, contexto) => {
        if (contexto.reacaoElemental) {
          status.energia = (status.energia || 0) + 5;
        }
      }
    },
    c3: {
      descricao: "Aumenta o nível da Habilidade Elemental em 3.",
      aplicar: (status) => {
        status.nivelHabilidadeElemental = (status.nivelHabilidadeElemental || 0) + 3;
      }
    },
    c4: {
      descricao: "O campo da Ultimate agora aplica Electro a cada 1,5s em área.",
      aplicarUlt: (status) => {
        status.aplicacaoContinuaElectro = true;
      }
    },
    c5: {
      descricao: "Aumenta o nível do Supremo em 3.",
      aplicar: (status) => {
        status.nivelSupremo = (status.nivelSupremo || 0) + 3;
      }
    },
    c6: {
      descricao: "Os disparos carregados ignoram 50% da DEF dos inimigos.",
      aplicar: (status) => {
        status.ignorarDef = (status.ignorarDef || 0) + 50;
      }
    }
  }
},

    Neuvillette: {
  nome: "Neuvillette",
  papel: "DPS",
  elemento: "Hydro",
  ataques: {
    normal: {
      descricao: "Dispara rajadas de água com seu bastão, causando dano Hydro.",
      executar: (status, atributos) => {
        return atributos.atk * 1.2 + (status.bonusAtk || 0);
      }
    },
    elemental: {
      descricao: "Libera uma onda de julgamento Hydro em área.",
      executar: (status, atributos) => {
        return atributos.atk * 2.0 + (status.danoBonus || 0);
      }
    },
    ult: {
      descricao: "Invoca a Suprema Autoridade Hydro, causando dano massivo e cura com base no HP.",
      executar: (status, atributos, equipe = []) => {
        equipe.forEach(p => {
          const cura = atributos.hp * 0.1;
          if (!p.status) p.status = {};
          p.status.hpAtual = Math.min(p.atributos.hpMax, (p.status.hpAtual || p.atributos.hpMax) + cura);
        });
        return atributos.atk * 3.5 + (status.danoBonusUlt || 0);
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Aumenta o dano de ataques carregados em 20%.",
      aplicar: (status) => {
        status.danoCarga = (status.danoCarga || 0) + 20;
      }
    },
    c2: {
      descricao: "Recupera 10 de energia ao usar o Supremo.",
      aplicarUlt: (status) => {
        status.energiaRecuperada = (status.energiaRecuperada || 0) + 10;
      }
    },
    c3: {
      descricao: "Aumenta o dano de habilidades elementais em 25%.",
      aplicar: (status) => {
        status.danoBonus = (status.danoBonus || 0) + 25;
      }
    },
    c4: {
      descricao: "Aumenta a proficiência elemental em 100.",
      aplicar: (status) => {
        status.profElementalBonus = (status.profElementalBonus || 0) + 0.2; // 0.2 multiplicador adicional
      }
    },
    c5: {
      descricao: "Aumenta o dano do Supremo em 30%.",
      aplicarUlt: (status) => {
        status.danoBonusUlt = (status.danoBonusUlt || 0) + 30;
      }
    },
    c6: {
      descricao: "Aumenta a taxa crítica em 20% e dano crítico em 40%.",
      aplicar: (status) => {
        status.taxaCritica = (status.taxaCritica || 5) + 20;
        status.danoCritico = (status.danoCritico || 50) + 40;
      }
    }
  }
},
    Zhongli: {
  nome: "Zhongli",
  papel: "Escudeiro",
  elemento: "Geo",
  ataques: {
    normal: {
      descricao: "Desfere ataques Geo com sua lança.",
      executar: (status, atributos) => {
        return atributos.atk * 1.0 + (status.bonusAtk || 0);
      }
    },
    elemental: {
      descricao: "Cria um escudo de jade que absorve dano com base no HP máximo de Zhongli.",
      executar: (status, atributos, equipe = []) => {
        const escudo = atributos.hp * 0.25;
        equipe.forEach(p => {
          if (!p.status) p.status = {};
          p.status.escudo = (p.status.escudo || 0) + escudo;
        });
        return true; // Não causa dano diretamente
      }
    },
    ult: {
      descricao: "Invoca um meteoro que causa dano Geo massivo e petrifica inimigos.",
      executar: (status, atributos) => {
        return atributos.atk * 3.0 + atributos.hp * 0.2 + (status.danoBonusUlt || 0);
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "O escudo de jade também aumenta a resistência a interrupção em 20%.",
      aplicar: (status) => {
        status.resistenciaInterrupcao = (status.resistenciaInterrupcao || 0) + 20;
      }
    },
    c2: {
      descricao: "Os inimigos atingidos pela habilidade elemental têm a resistência Geo reduzida em 20%.",
      aplicar: (status) => {
        status.reducaoResGeo = (status.reducaoResGeo || 0) + 20;
      }
    },
    c3: {
      descricao: "Aumenta o dano do Supremo em 20%.",
      aplicarUlt: (status) => {
        status.danoBonusUlt = (status.danoBonusUlt || 0) + 20;
      }
    },
    c4: {
      descricao: "O escudo de jade regenera 5% do HP do personagem protegido a cada 2s.",
      aplicar: (status) => {
        status.regenComEscudo = (status.regenComEscudo || 0) + 5;
      }
    },
    c5: {
      descricao: "Aumenta o dano da habilidade elemental em 25%.",
      aplicar: (status) => {
        status.danoBonus = (status.danoBonus || 0) + 25;
      }
    },
    c6: {
      descricao: "Ao atingir inimigos com o meteoro, reduz a resistência de todos os elementos em 20% por 20s.",
      aplicarUlt: (status) => {
        status.reducaoResGlobal = (status.reducaoResGlobal || 0) + 20;
      }
    }
  }
},
    Fischl: {
  nome: "Fischl",
  papel: "Suporte",
  elemento: "Electro",
  ataques: {
    normal: {
      descricao: "Dispara flechas encantadas com Electro.",
      executar: (status, atributos) => {
        return atributos.atk * 1.1 + (status.bonusAtk || 0);
      }
    },
    elemental: {
      descricao: "Invoca Oz, o corvo da escuridão, que causa dano Electro contínuo.",
      executar: (status, atributos, equipe = [], contexto = {}) => {
        if (!contexto.turnosOz) contexto.turnosOz = 3;
        contexto.ozDano = atributos.atk * 0.8 + (status.danoBonus || 0);
        return atributos.atk * 1.5 + (status.danoBonus || 0);
      }
    },
    ult: {
      descricao: "Fischl se funde com Oz e causa múltiplos ataques Electro em linha reta.",
      executar: (status, atributos) => {
        return atributos.atk * 2.8 + (status.danoBonusUlt || 0);
      }
    }
  },
  constelacoes: {
    c1: {
      descricao: "Oz ataca junto com Fischl sempre que ela usa ataque normal.",
      aplicar: (status) => {
        status.ozAtaqueExtra = true;
      }
    },
    c2: {
      descricao: "Oz permanece em campo por 2s a mais.",
      aplicar: (status) => {
        status.ozDuracaoExtra = (status.ozDuracaoExtra || 0) + 2;
      }
    },
    c3: {
      descricao: "Aumenta o dano da habilidade elemental em 25%.",
      aplicar: (status) => {
        status.danoBonus = (status.danoBonus || 0) + 25;
      }
    },
    c4: {
      descricao: "Quando Oz atinge um inimigo, Fischl regenera 2% do HP.",
      aplicar: (status) => {
        status.ozCura = (status.ozCura || 0) + 2;
      }
    },
    c5: {
      descricao: "Aumenta o dano do Supremo em 20%.",
      aplicarUlt: (status) => {
        status.danoBonusUlt = (status.danoBonusUlt || 0) + 20;
      }
    },
    c6: {
      descricao: "Quando Fischl causa reação Electro, ela ganha 30% de ATK por 10s.",
      aplicar: (status) => {
        status.reacaoBonusAtk = (status.reacaoBonusAtk || 0) + 30;
      }
    }
  }
}



    
    

  }
};

module.exports = personagensAbismo;
