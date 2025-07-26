module.exports = {
  nome: "YaeMiko",
  grad1: [
    [0, "#ffb6f9"],
    [1, "#ff80e6"]
  ],
  grad2: [
    [0, "#ff80e6"],
    [1, "#7a007a"]
  ],
  bolha: (i) => {
    const cores = [
      "rgba(255, 179, 255, 0.3)",
      "rgba(240, 120, 240, 0.2)",
      "rgba(200, 60, 200, 0.15)"
    ];
    return cores[i % cores.length];
  },
  primaria: "#cc3399",
  sombra: "#7a007a",
  texto: "#2b002b",
  gradNome: [
    [0, "#2b002b"],
    [1, "#550044"]
  ],
  fundoCaixa: "rgba(255, 230, 250, 0.5)",
  fundoRetanguloSuperior: "rgba(255, 200, 240, 0.4)",
  fundoRetanguloInferior: "rgba(200, 100, 200, 0.2)",
  fundoUID: "rgba(255, 190, 235, 0.6)",
  textoUID: "#2b002b",
  sombraCaixa: "#cc66aa",
  fonteTitulo: "bold 36px 'Segoe UI'",
  fonteTexto: "20px 'Segoe UI'",
  fonteEstatisticas: "bold 30px 'Segoe UI'",
  fonteNome: "bold 70px 'Segoe UI'",
  corEstatisticas: "#2b002b",
  paddingCaixa: 30
};
