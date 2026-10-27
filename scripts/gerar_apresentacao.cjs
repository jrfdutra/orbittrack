const PptxGenJS = require('pptxgenjs');
const { jsPDF } = require('jspdf');
const fs = require('fs');

async function gerarApresentacoes() {
    // 1. Gerar PDF
    const doc = new jsPDF();
    doc.setFontSize(30);
    doc.text('OrbitTrack - Apresentação', 105, 100, { align: 'center' });
    doc.save('public/Apresentacao_OrbitTrack.pdf');
    console.log('PDF gerado: public/Apresentacao_OrbitTrack.pdf');

    // 2. Gerar PPT
    const ppt = new PptxGenJS();
    
    // Slide 1
    const slide1 = ppt.addSlide();
    slide1.addText('OrbitTrack', { x: 1, y: 1, fontSize: 48, bold: true });
    slide1.addText('O futuro do acompanhamento de impressão 3D', { x: 1, y: 2, fontSize: 24 });

    // Slide 2
    const slide2 = ppt.addSlide();
    slide2.addText('História Institucional', { x: 0.5, y: 0.5, fontSize: 32, bold: true });
    slide2.addText('Transformamos o caos da comunicação Maker-Cliente em confiança profissional.', { x: 0.5, y: 1.5, fontSize: 18 });

    // Slide 3
    const slide3 = ppt.addSlide();
    slide3.addText('Funcionalidades', { x: 0.5, y: 0.5, fontSize: 32, bold: true });
    slide3.addText('- Portal White-label\n- Acompanhamento Real-time\n- Passaporte Digital da Peça\n- Visualizador 3D\n- Verificação Pública', { x: 0.5, y: 1.5, fontSize: 18 });

    await ppt.writeFile({ filePath: 'public/Apresentacao_OrbitTrack.pptx' });
    console.log('PPT gerado: public/Apresentacao_OrbitTrack.pptx');
}

gerarApresentacoes().catch(console.error);
