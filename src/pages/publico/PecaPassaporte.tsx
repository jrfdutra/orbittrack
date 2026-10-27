import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Viewer3D from '../../components/viewer3d/Viewer3D';

const PecaPassaporte = () => {
  const { token_peca } = useParams();
  // Fetch dados da peça e ficheiro 3D
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Passaporte da Peça</h1>
      {/* Componente Viewer3D */}
      <Viewer3D url="URL_DO_MODELO_3D_DA_PECA" />
      
      {/* Ficha técnica, certificado, etc. */}
    </div>
  );
};

export default PecaPassaporte;
