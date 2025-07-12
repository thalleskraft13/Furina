module.exports = {
  nome: "RaidenShogun",
  grad1: [
    [0, "#1b1027"], // roxo escuro
    [1, "#311e45"]  // transição mais clara
  ],
  grad2: [
    [0, "#311e45"],
    [1, "#472d61"]
  ],
  bolha: (i) => {
    const cores = [
      "rgba(204, 153, 255, 0.2)",  // roxo claro
      "rgba(142, 68, 173, 0.2)",   // roxo vibrante
      "rgba(155, 89, 182, 0.15)"   // roxo suave
    ];
    return cores[i % cores.length];
  },
  primaria: "#bb6bd9", // Cor eletro vibrante
  sombra: "#9b59b6",   // Sombra roxa elegante
  texto: "#ffffff",    // Texto branco
  gradNome: [
    [0, "#f3e5ff"],
    [1, "#dda0ff"]
  ],
  fundoCaixa: "rgba(187, 107, 217, 0.1)",
  fundoRetanguloSuperior: "rgba(187, 107, 217, 0.15)",
  fundoRetanguloInferior: "rgba(27, 16, 39, 0.5)",
  fundoUID: "rgba(187, 107, 217, 0.2)",
  textoUID: "#ffffff",
  sombraCaixa: "#bb6bd9",
  fonteTitulo: "bold 36px 'Segoe UI'",
  fonteTexto: "20px 'Segoe UI'",
  fonteEstatisticas: "bold 30px 'Segoe UI'",
  fonteNome: "bold 70px 'Segoe UI'",
  corEstatisticas: "#e0d5ff",
  paddingCaixa: 30
};
