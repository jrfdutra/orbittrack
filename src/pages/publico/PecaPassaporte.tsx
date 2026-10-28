import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Camera, Box, ArrowLeft, Award, ExternalLink, X, Glasses } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

const PecaPassaporte = () => {
  const { tokenPeca } = useParams<{ tokenPeca: string }>();
  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [vrMode, setVrMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (tokenPeca) fetchPassaporte();
    return () => {
      stopCamera();
    };
  }, [tokenPeca]);

  async function fetchPassaporte() {
    try {
      const { data, error } = await supabase
        .rpc('obter_peca_publica', { p_token_peca: tokenPeca });

      if (error || !data || !data.peca) {
        throw new Error('Passaporte da peça não encontrado');
      }

      setDados(data);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      alert('Não foi possível aceder à câmara para o modo de Realidade Aumentada.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (erro || !dados) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6 text-center">
      <div>
        <Box className="w-16 h-16 mx-auto text-gray-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Passaporte Indisponível</h1>
        <p className="text-gray-400">Não foi possível carregar o passaporte 3D desta peça. Verifique o link.</p>
      </div>
    </div>
  );

  const { peca, empresa, encomenda, certificado } = dados;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top Bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          {empresa.logotipo_url && (
            <img src={empresa.logotipo_url} alt="Logo" className="w-8 h-8 object-contain rounded-lg bg-white p-1" />
          )}
          <div>
            <h1 className="font-bold text-sm leading-tight">{empresa.nome}</h1>
            <p className="text-xs text-gray-400">Passaporte Digital · #{encomenda.numero_encomenda}</p>
          </div>
        </div>
        <a 
          href={`/acompanhar/${encomenda.token_publico}`}
          className="text-xs font-semibold px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Encomenda
        </a>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Viewer 3D com Suporte a Câmara Real (AR) */}
        <div className="flex-1 relative bg-gray-900 flex flex-col min-h-[450px] overflow-hidden">
          
          {/* Vídeo da Câmara em Segundo Plano para AR */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${
              cameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Controlos Superiores do Viewer */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap justify-between gap-2 pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                >
                  <Camera size={16} /> Ver na Câmara (AR)
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg bg-red-600 hover:bg-red-700 text-white transition-all"
                >
                  <X size={16} /> Fechar Câmara
                </button>
              )}

              <button
                onClick={() => setVrMode(!vrMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                  vrMode 
                    ? 'bg-amber-500 text-black shadow-amber-500/20' 
                    : 'bg-gray-800/90 backdrop-blur text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <Glasses size={16} /> {vrMode ? 'Escala 1:1 Ativa' : 'Tamanho Real'}
              </button>
            </div>
          </div>

          {cameraActive && (
            <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
              <div className="bg-black/70 backdrop-blur border border-white/10 text-white p-3 rounded-xl text-xs max-w-md mx-auto text-center pointer-events-auto shadow-2xl">
                <p className="font-bold">Modo Realidade Aumentada (Câmara)</p>
                <p className="opacity-80 text-[11px] mt-0.5">Aponte a câmara para a sua secretária. Rode ou faça zoom na peça para ver em tamanho real.</p>
              </div>
            </div>
          )}

          {/* Renderizador Three.js Canvas */}
          <div className="flex-1 w-full h-full relative z-10">
            {peca.ficheiro_3d_url ? (
              <Canvas 
                dpr={[1, 2]} 
                shadows 
                gl={{ alpha: true }}
                camera={{ fov: vrMode ? 55 : 45, position: [0, 0, vrMode ? 3.5 : 5] }}
              >
                {!cameraActive && <color attach="background" args={['#0f172a']} />}
                <ambientLight intensity={cameraActive ? 1.5 : 0.8} />
                <directionalLight position={[5, 10, 5]} intensity={1.2} />
                <Suspense fallback={null}>
                  <Stage environment={cameraActive ? undefined : 'city'} intensity={0.6}>
                    <Model url={peca.ficheiro_3d_url} />
                  </Stage>
                </Suspense>
                <OrbitControls makeDefault enableZoom={true} />
              </Canvas>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-500 space-y-3">
                <Box size={48} className="text-gray-600 animate-pulse" />
                <p className="text-sm font-medium">Nenhum ficheiro 3D (.glb / .gltf) carregado para esta peça.</p>
                <p className="text-xs text-gray-600 max-w-xs">Pode anexar o modelo 3D no formulário de edição da encomenda no painel.</p>
              </div>
            )}
          </div>
        </div>

        {/* Ficha Técnica & Passaporte */}
        <div className="w-full md:w-[400px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto space-y-6 z-20">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Peça Certificada
            </span>
            <h2 className="text-2xl font-black mt-2 text-white">{peca.nome_peca}</h2>
            {peca.descricao && <p className="text-sm text-gray-400 mt-1">{peca.descricao}</p>}
          </div>

          <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Especificações de Fabrico Aditivo</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500 block">Material</span>
                <strong className="text-gray-200">{peca.material || 'PLA'}</strong>
              </div>
              <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500 block">Cor</span>
                <strong className="text-gray-200">{peca.cor || '—'}</strong>
              </div>
              <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500 block">Resolução (Camada)</span>
                <strong className="text-gray-200">{peca.altura_camada}mm</strong>
              </div>
              <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500 block">Preenchimento</span>
                <strong className="text-gray-200">{peca.enchimento_percentagem ? `${peca.enchimento_percentagem}%` : '—'}</strong>
              </div>
            </div>
          </div>

          {certificado && (
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Award size={20} />
                <span>Certificado de Autenticidade</span>
              </div>
              <div className="text-xs text-amber-200/80 space-y-1">
                <p>Nível do Selo: <strong className="uppercase text-amber-300">{certificado.nivel_selo}</strong></p>
                <p className="font-mono text-amber-300 font-bold">Código: {certificado.codigo_verificacao}</p>
              </div>
              <a 
                href={`/verificar/${certificado.codigo_verificacao}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                Verificar Certificado Oficial <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PecaPassaporte;
