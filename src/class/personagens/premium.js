module.exports = {
  nome: "Premium",

  // Mantemos o fundo da Furina original
  grad1: [
    [0, "#05182a"],
    [1, "#0f3e60"]
  ],
  grad2: [
    [0, "#0f3e60"],
    [1, "#d3e6f3dd"]
  ],

  // Bolhas oceânicas sutis como na Furina original
  bolha: (i) => {
    const tons = [
      "rgba(78, 201, 255, 0.25)",
      "rgba(78, 201, 255, 0.15)",
      "rgba(78, 201, 255, 0.10)"
    ];
    return tons[i % tons.length];
  },

  // Agora os destaques são dourados, mantendo elegância
  primaria: "#FFD966",           // dourado Furina refinado
  sombra: "#FFD966",
  sombraCaixa: "#FFD966",

  texto: "#ffffff",

  gradNome: [
    [0, "#fff2cc"],
    [1, "#ffffff"]
  ],

  fundoCaixa: "rgba(255, 217, 102, 0.15)", // caixa com toque de dourado
  fundoRetanguloSuperior: "rgba(255, 217, 102, 0.35)",
  fundoRetanguloInferior: "rgba(10, 20, 40, 0.3)",

  fundoUID: "rgba(255, 217, 102, 0.25)", // UID destacado com brilho dourado
  textoUID: "#ffffff",

  fonteTitulo: "bold 36px 'Segoe UI'",
  fonteTexto: "20px 'Segoe UI'",
  fonteEstatisticas: "bold 30px 'Segoe UI'",
  fonteNome: "bold 70px 'Segoe UI'",

  corEstatisticas: "#eeeeee",
  paddingCaixa: 30
};
