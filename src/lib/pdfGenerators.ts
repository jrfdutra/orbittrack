import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const gerarCertificadoPDF = (encomenda: any, item: any, certificado: any) => {
  const doc = new jsPDF();
  
  // Design do Certificado (exemplo simples)
  doc.setFontSize(24);
  doc.text('CERTIFICADO DE AUTENTICIDADE', 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Emitido para: ${encomenda.nome_comprador}`, 20, 50);
  doc.text(`Peça: ${item.nome_peca}`, 20, 60);
  doc.text(`Selo de Qualidade: ${certificado.nivel_selo}`, 20, 70);
  
  doc.setFontSize(10);
  doc.text(`Código de Verificação: ${certificado.codigo_verificacao}`, 20, 90);
  
  // ... adicionar mais detalhes e o QR code
  
  doc.save(`certificado_${item.nome_peca}.pdf`);
};

export const gerarReciboPDF = (encomenda: any) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('RECIBO', 20, 20);
  
  // ... utilizar jspdf-autotable para listar itens
  
  doc.save(`recibo_${encomenda.numero_encomenda}.pdf`);
};
