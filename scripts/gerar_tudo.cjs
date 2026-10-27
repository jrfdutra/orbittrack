const PptxGenJS = require('pptxgenjs');
const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

async function gerarMateriais() {
    const publicPath = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath);

    const ppt = new PptxGenJS();
    ppt.layout = 'LAYOUT_16x9';

    const s1 = ppt.addSlide();
    s1.background = { color: '0F172A' };
    s1.addText('OrbitTrack', { x: 0, y: 1.5, w: '100%', fontSize: 60, bold: true, align: 'center', color: 'FFFFFF' });
    s1.addText('Gestão Inteligente para Impressão 3D', { x: 0, y: 3, w: '100%', fontSize: 24, align: 'center', color: '3B82F6' });

    const s2 = ppt.addSlide();
    s2.addText('O Problema', { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '0F172A' });
    s2.addText('Oficinas de impressão 3D lidam com:\n- Comunicação fragmentada\n- Falta de transparência\n- Ausência de profissionalismo', { x: 0.5, y: 1.5, fontSize: 18, color: '333333' });

    const s3 = ppt.addSlide();
    s3.addText('A Solução: OrbitTrack', { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '0F172A' });
    s3.addText('- Portal White-label\n- Timeline real-time\n- Passaporte Digital\n- Visualizador 3D', { x: 0.5, y: 1.5, fontSize: 18, color: '333333' });

    await ppt.writeFile({ filePath: path.join(publicPath, 'Apresentacao_OrbitTrack.pptx') });

    const doc = new jsPDF();
    doc.text('OrbitTrack - Proposta de Valor', 20, 20);
    doc.text('- Acompanhamento 24/7\n- Visualização 3D\n- Certificação Digital', 20, 40);
    doc.save(path.join(publicPath, 'Apresentacao_OrbitTrack.pdf'));

    console.log('Ficheiros gerados na pasta public!');
}

gerarMateriais().catch(console.error);
