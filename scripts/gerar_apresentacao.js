// orbittrack/scripts/gerar_tudo.cjs
const PptxGenJS = require('pptxgenjs');
const { jsPDF } = require('jspdf');
const path = require('path');

async function gerarMateriais() {
    const publicPath = path.join(__dirname, '..', 'public');
    
    // --- GERAR POWERPOINT (5 Estrelas) ---
    const ppt = new PptxGenJS();
    ppt.layout = 'LAYOUT_16x9';

    // Slide 1: Capa
    const s1 = ppt.addSlide();
    s1.addText('OrbitTrack', { x: 0, y: 1.5, w: '100%', fontSize: 60, bold: true, align: 'center', color: '4F46E5' });
    s1.addText('SaaS de Gestão e Acompanhamento de Impressão 3D', { x: 0, y: 3, w: '100%', fontSize: 24, align: 'center', color: '333333' });

    // Slide 2: Problema
    const s2 = ppt.addSlide();
    s2.addText('O Problema', { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '4F46E5' });
    s2.addText('A comunicação entre oficinas de impressão 3D e clientes é caótica, descentralizada e gera insegurança.', { x: 0.5, y: 1.5, fontSize: 18 });

    // Slide 3: Solução
    const s3 = ppt.addSlide();
    s3.addText('A Solução OrbitTrack', { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '4F46E5' });
    s3.addText('- Portal White-label (Marca Própria)\n- Timeline de produção real-time\n- Passaporte Digital das Peças\n- Verificação de Autenticidade', { x: 0.5, y: 1.5, fontSize: 18 });

    await ppt.writeFile({ filePath: path.join(publicPath, 'Apresentacao_OrbitTrack.pptx') });
    console.log('PPTX gerado com sucesso em /public');

    // --- GERAR PDF (Documentação de Vendas) ---
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('OrbitTrack - Documento de Vendas', 20, 20);
    doc.setFontSize(12);
    doc.text('Este documento resume o valor de negócio do OrbitTrack.', 20, 30);
    doc.text('1. Profissionalização da Oficina', 20, 50);
    doc.text('2. Aumento da confiança do cliente através do Viewer 3D', 20, 60);
    doc.text('3. Segurança técnica (Supabase + RLS)', 20, 70);
    
    doc.save(path.join(publicPath, 'Apresentacao_OrbitTrack.pdf'));
    console.log('PDF gerado com sucesso em /public');
}

gerarMateriais().catch(console.error);