const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require("discord.js");

class PerfilGenshin {
  static temas = null;

  // Carrega os temas da pasta /personagens
  static carregarTemas() {
    if (this.temas) return this.temas;

    const dir = path.join(__dirname, 'personagens');
    const arquivos = fs.readdirSync(dir);
    const temas = {};

    arquivos.forEach(file => {
      if (file.endsWith('.js')) {
        const tema = require(path.join(dir, file));
        if (tema && tema.nome) {
          temas[tema.nome] = tema;
        }
      }
    });

    this.temas = temas;
    return temas;
  }

  constructor(interaction, personagem, userData) {
    this.canvas = createCanvas(1280, 720);
    this.ctx = this.canvas.getContext('2d');
    this.userData = userData;
    this.interaction = interaction;

    const temas = PerfilGenshin.carregarTemas();
    this.tema = temas[personagem] || temas["Furina"];
  }

  async carregarAvatar() {
    this.avatarImg = await loadImage(this.userData.userAvatar);
  }

  // Função para desenhar retângulo arredondado com sombra/glow
  roundedRect(x, y, width, height, radius, fill, glow) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fillStyle = fill;
    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = 20;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Quebra texto em múltiplas linhas
  wrapText(text, x, y, maxWidth, lineHeight, maxLines = 12) {
    const ctx = this.ctx;
    const words = text.split(' ');
    let line = '', lines = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
        lines++;
        if (lines >= maxLines) {
          ctx.fillText("...", x, y);
          return;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  // Desenha o fundo da imagem com gradientes e bolhas decorativas
  desenharFundo() {
    const ctx = this.ctx;
    const { grad1, grad2, bolha } = this.tema;

    // Gradiente superior
    const g1 = ctx.createLinearGradient(0, 0, 0, 480);
    grad1.forEach(([stop, color]) => g1.addColorStop(stop, color));
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, this.canvas.width, 480);

    // Gradiente inferior
    const g2 = ctx.createLinearGradient(0, 480, 0, this.canvas.height);
    grad2.forEach(([stop, color]) => g2.addColorStop(stop, color));
    ctx.fillStyle = g2;
    ctx.fillRect(0, 480, this.canvas.width, this.canvas.height);

    // Bolhas decorativas
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const r = Math.random() * 25 + 10;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = bolha(i);
      ctx.fill();
    }

    // Retângulo inferior - duas camadas
    const baseColorSuperior = this.tema.fundoRetanguloSuperior;
    const baseColorInferior = this.tema.fundoRetanguloInferior;

    const rect1Y = 145 + 280 / 2; // avatarY + avatarSize/2
    const rect1Height = this.canvas.height - rect1Y;
    ctx.fillStyle = baseColorSuperior;
    this.drawBottomRoundedRect(0, rect1Y, this.canvas.width, rect1Height, 40);
    ctx.fill();

    ctx.fillStyle = baseColorInferior;
    const rect2Y = rect1Y;
    const rect2Height = 145 + 280 - rect2Y; // avatarY + avatarSize - rect2Y
    this.drawTopRoundedRect(0, rect2Y, this.canvas.width, rect2Height, 40);
    ctx.fill();
  }

  // Funções para retângulos arredondados só top ou só bottom (usadas no fundo)
  drawTopRoundedRect(x, y, width, height, radius) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  drawBottomRoundedRect(x, y, width, height, radius) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y);
    ctx.closePath();
  }

  // Desenha o avatar com borda, sombra e máscara circular
  desenharAvatar() {
    const ctx = this.ctx;
    const { primaria, sombra } = this.tema;
    const { avatarImg } = this;
    const x = 70, y = 145, size = 280;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 + 6, 0, Math.PI * 2);
    ctx.strokeStyle = primaria;
    ctx.lineWidth = 8;
    ctx.shadowColor = sombra;
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarImg, x, y, size, size);
    ctx.restore();
  }

  // Desenha o nome do usuário com gradiente e o retângulo do UID no canto direito
  desenharNomeEUID() {
    const ctx = this.ctx;
    const { userName, uid } = this.userData;
    const {
      gradNome,
      primaria,
      fundoUID,
      sombraCaixa,
      textoUID
    } = this.tema;

    // Nome com gradiente
    const nameX = 380;
    const nameY = 350;
    const gName = ctx.createLinearGradient(0, 0, 400, 0);
    gradNome.forEach(([stop, color]) => gName.addColorStop(stop, color));
    ctx.fillStyle = gName;
    ctx.font = this.tema.fonteNome || "bold 70px Segoe UI";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(userName, nameX, nameY);

    // Retângulo UID no canto superior direito
    const uidText = uid || "000000000";
    ctx.font = this.tema.fonteEstatisticas || "bold 50px Segoe UI";
    const paddingX = 25;
    const paddingY = 15;
    const textMetrics = ctx.measureText(uidText);
    const rectWidth = textMetrics.width + paddingX * 2;
    const rectHeightUID = 50 + paddingY * 2;
    const rectX = this.canvas.width - rectWidth - 70;
    const rectYUID = 100 - 50 / 2 - paddingY;

    this.roundedRect(rectX, rectYUID, rectWidth, rectHeightUID, 25, fundoUID, sombraCaixa);

    ctx.fillStyle = textoUID;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(uidText, rectX + rectWidth / 2, rectYUID + rectHeightUID / 2);
  }

  // Desenha as caixas inferiores: estatísticas e sobre mim
  desenharCaixas() {
    const ctx = this.ctx;
    const {
      primaria,
      texto,
      fundoCaixa,
      sombraCaixa,
      fonteEstatisticas,
      fonteTexto
    } = this.tema;
    const {
      primogemas,
      mora,
      conquistas,
      rankLevel,
      xp,
      sobremim
    } = this.userData;

    // Posicionamento
    const avatarX = 70;
    const avatarSize = 280;
    const rect2Y = avatarX + avatarSize / 2 + 135; // corrigido para alinhar com retângulo inferior
    const lowerRectTop = 145 + 280; // avatarY + avatarSize
    const lowerRectHeight = this.canvas.height - lowerRectTop;
    const lowerRectY = lowerRectTop;

    // Caixa estatísticas (esquerda)
    const statsBoxX = avatarX + 40;
    const statsBoxY = lowerRectY + 30;
    const statsBoxW = 400;
    const statsBoxH = lowerRectHeight;

    this.roundedRect(statsBoxX, statsBoxY, statsBoxW, statsBoxH, 30, fundoCaixa, sombraCaixa);

    ctx.font = fonteEstatisticas || "bold 30px Segoe UI";
    ctx.fillStyle = texto;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    const statsStartY = statsBoxY + 30;
    const lineHeight = 50;
    ctx.fillText(`Primogemas: ${primogemas.toLocaleString()}`, statsBoxX + 30, statsStartY);
    ctx.fillText(`Mora: ${mora.toLocaleString()}`, statsBoxX + 30, statsStartY + lineHeight);
    ctx.fillText(`Conquistas: ${conquistas.toLocaleString()}`, statsBoxX + 30, statsStartY + lineHeight * 2);
    ctx.fillText(`Rank: ${rankLevel}`, statsBoxX + 30, statsStartY + lineHeight * 3);
    ctx.fillText(`XP: ${xp.toLocaleString()}`, statsBoxX + 30, statsStartY + lineHeight * 4);

    // Caixa "Sobre mim" (direita)
    const sobreBoxX = statsBoxX + statsBoxW + 50;
    const sobreBoxY = statsBoxY;
    const sobreBoxW = this.canvas.width - sobreBoxX - 40;
    const sobreBoxH = statsBoxH;

    this.roundedRect(sobreBoxX, sobreBoxY, sobreBoxW, sobreBoxH, 30, fundoCaixa, sombraCaixa);

    // Título "Sobre mim"
    ctx.font = this.tema.fonteTitulo || "bold 36px Segoe UI";
    ctx.fillStyle = texto;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText("Sobre mim:", sobreBoxX + 30, sobreBoxY + 30);

    // Texto sobre mim
    ctx.font = fonteTexto || "20px Segoe UI";
    ctx.fillStyle = texto;
    this.wrapText(sobremim, sobreBoxX + 30, sobreBoxY + 80, sobreBoxW - 60, 28, 12);
  }

  // Método principal para gerar a imagem
  async gerarImagem() {
    await this.carregarAvatar();
    this.desenharFundo();
    this.desenharAvatar();
    this.desenharNomeEUID();
    this.desenharCaixas();

    const file = new AttachmentBuilder(await this.canvas.toBuffer(), { name: 'perfil.png' });
    return file;
  }
}

module.exports = PerfilGenshin;
