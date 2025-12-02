// =====================================================
//  Gerador de Convites Personalizados em PDF
// =====================================================

(async () => {
  // Carregar pdf-lib
  const pdfLibScript = document.createElement("script");
  pdfLibScript.src = "https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js";
  document.head.appendChild(pdfLibScript);

  // Carregar fontkit
  const fontkitScript = document.createElement("script");
  fontkitScript.src = "https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.0.0/dist/fontkit.umd.min.js";
  document.head.appendChild(fontkitScript);

  pdfLibScript.onload = () => {
    fontkitScript.onload = () => {

      const form = document.getElementById("pdfForm");
      const popup = document.getElementById("popup");
      const popupClose = document.getElementById("popupClose");

      form.addEventListener("submit", gerarPDF);
      popupClose.addEventListener("click", () => popup.classList.add("hidden"));

      // =====================================================
      // Função principal
      // =====================================================
      async function gerarPDF(e) {
        e.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const sobrenome = document.getElementById("sobrenome").value.trim();
        const complemento = document.getElementById("complemento").value.trim();

        if (!nome) {
          alert("O campo Nome é obrigatório.");
          return;
        }

        // Linha 1
        let linha1 = nome;
        if (sobrenome) linha1 += " " + sobrenome;

        // Linha 2 (opcional)
        let linha2 = complemento || null;

        // Caminhos dos arquivos
        const pdfPath = "./assets/Convite Virtual.pdf";
        const fontPath = "./assets/Hello My Love Pro.otf";

        // Carregar PDF e fonte
        const existingPdfBytes = await fetch(pdfPath).then(res => res.arrayBuffer());
        const fontBytes = await fetch(fontPath).then(res => res.arrayBuffer());

        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
        pdfDoc.registerFontkit(fontkit);
        const customFont = await pdfDoc.embedFont(fontBytes);

        const page = pdfDoc.getPages()[0];

        // Configurações de texto
        const fontSize = 148;
        const color = PDFLib.rgb(0.149, 0.184, 0.098);
        const baseY = 2460;
        const lineSpacing = fontSize * 0.85;

        const linhas = [linha1];
        if (linha2) linhas.push(linha2);

        const { width } = page.getSize();

        // Desenhar texto
        linhas.forEach((texto, index) => {
          const textWidth = customFont.widthOfTextAtSize(texto, fontSize);
          const xCenter = (width - textWidth) / 2;
          const yPos = baseY - (index * lineSpacing);

          page.drawText(texto, {
            x: xCenter,
            y: yPos,
            size: fontSize,
            font: customFont,
            color: color
          });
        });

        // Baixar arquivo
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = linha1.replace(/[\\/:*?"<>|]/g, "") + ".pdf";
        link.click();

        // 🔥 Resetar formulário
        form.reset();

        // 🔥 Exibir popup
        popup.classList.remove("hidden");
      }
    };
  };
})();