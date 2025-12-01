// =====================================================
//  Gerador de Convites Personalizados em PDF
// =====================================================

(async () => {
  // Carrega pdf-lib
  const pdfLibScript = document.createElement("script");
  pdfLibScript.src = "https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js";
  document.head.appendChild(pdfLibScript);

  // Carrega fontkit
  const fontkitScript = document.createElement("script");
  fontkitScript.src = "https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.0.0/dist/fontkit.umd.min.js";
  document.head.appendChild(fontkitScript);

  pdfLibScript.onload = () => {
    fontkitScript.onload = () => {

      // Interface
      document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;max-width:350px;margin:50px auto;
                    font-family:Arial;text-align:center;">
          <h2>Gerar convite personalizado</h2>

          <input id="nome" type="text" placeholder="Nome (obrigatório)"
              style="padding:10px;font-size:16px;border:1px solid #ccc;border-radius:6px;">

          <input id="sobrenome" type="text" placeholder="Sobrenome (opcional)"
              style="padding:10px;font-size:16px;border:1px solid #ccc;border-radius:6px;">

          <input id="complemento" type="text" placeholder="Complemento (ex: e família)"
              style="padding:10px;font-size:16px;border:1px solid #ccc;border-radius:6px;">

          <button id="gerar"
              style="padding:12px;font-size:16px;background:#11aa66;color:white;
                     border:none;border-radius:6px;cursor:pointer;">
            Gerar PDF
          </button>
        </div>
      `;

      document.getElementById("gerar").addEventListener("click", gerarPDF);

      // =====================================================
      // Função principal
      // =====================================================
      async function gerarPDF() {
        const nome = document.getElementById("nome").value.trim();
        const sobrenome = document.getElementById("sobrenome").value.trim();
        const complemento = document.getElementById("complemento").value.trim();

        if (!nome) {
          alert("O campo Nome é obrigatório.");
          return;
        }

        // ==== Construção das linhas ====

        // Linha 1: nome + sobrenome
        let linha1 = nome;
        if (sobrenome.length > 0) linha1 += " " + sobrenome;

        // Linha 2: complemento (opcional)
        let linha2 = complemento.length > 0 ? complemento : null;

        const pdfPath = "./assets/Convite Virtual.pdf";
        const fontPath = "./assets/Hello My Love Pro.otf";

        // Carregar PDF e fonte
        const existingPdfBytes = await fetch(pdfPath).then(res => res.arrayBuffer());
        const fontBytes = await fetch(fontPath).then(res => res.arrayBuffer());

        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
        pdfDoc.registerFontkit(fontkit);
        const customFont = await pdfDoc.embedFont(fontBytes);

        const page = pdfDoc.getPages()[0];

        // Configurações
        const fontSize = 140;
        const color = PDFLib.rgb(0.149, 0.184, 0.098); // #262f19
        const baseY = 2460;

        // Criar array com as linhas na ordem certa
        const linhas = [linha1];
        if (linha2) linhas.push(linha2);

        const { width } = page.getSize();

        // Linhas mais próximas
        const lineSpacing = fontSize * 0.85;

        // Desenhar linha por linha
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

        // Exportar PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);

        // Nome do arquivo = exatamente o digitado na linha 1
        const nomeArquivo = linha1.replace(/[\\/:*?"<>|]/g, "") + ".pdf";

        link.download = nomeArquivo;
        link.click();
      }
    };
  };
})();