# 03 · Guia do cliente

O que o comprador vê e faz. Nenhum destes ecrãs pede registo, palavra-passe ou instalação de
aplicação: são páginas web normais, abertas a partir de um link recebido por WhatsApp, email
ou QR code.

---

## 1. O link de rastreio

```
https://<domínio-do-estúdio>/acompanhar/<token>
```

O `<token>` tem 36 caracteres hexadecimais e é a única credencial. Quem tiver o link vê a
encomenda — **trata-o como uma palavra-passe** e não o publique em redes sociais.

O link:

- não expira;
- não pede login;
- funciona em qualquer navegador moderno (Chrome, Safari, Firefox, Edge);
- é diferente por encomenda, mesmo para o mesmo comprador.

Se o endereço estiver incompleto ou o token não existir, a página devolve:

> **Ops!** Não conseguimos encontrar esta encomenda. Verifica o link.

---

## 2. Ecrã de rastreio (`/acompanhar/:token`)

A página é desenhada de cima para baixo, para leitura num telemóvel:

### 2.1 Capa e identidade

No topo aparece a fotografia de capa do estúdio (quando definida) e, sobre ela, o logótipo, o
nome da empresa e o número da encomenda (`#2026-0148`). É a assinatura white-label: o comprador
vê a marca do estúdio, não a OrbitTrack.

### 2.2 Estado atual

Um cartão central com três informações:

| Elemento | Origem |
| --- | --- |
| Estado | `encomendas.estado` — ex.: `A imprimir` |
| Previsão de entrega | `encomendas.previsao_entrega` (ou «A definir») |
| Nota pública | `encomendas.notas_publicas`, quando preenchida |

O estado aparece em maiúsculas e com a cor primária da empresa no badge. As **notas internas
nunca aparecem aqui**.

### 2.3 Histórico de fabrico

Uma linha do tempo vertical, do mais recente para o mais antigo. Cada entrada mostra:

- o nome do estado no momento da transição;
- a mensagem gravada (por exemplo «Estado atualizado para: A imprimir»);
- a data e hora.

O ponto mais recente fica destacado com a cor primária. Este histórico é cumulativo: mudar de
estado acrescenta uma entrada, nunca apaga as anteriores.

### 2.4 Peças e certificados

Para cada peça da encomenda:

- nome, quantidade, material, cor e resolução de camada;
- botão **Ver 3D & VR**, que abre o passaporte digital da peça;
- se existir certificado, o nível do selo e o código (`AB7K-92QX`);
- ligação direta para a página de verificação do certificado.

### 2.5 Contactos

No rodapé surgem os contactos que o estúdio configurou: email (`mailto:`), telefone
(`tel:`), website e Instagram. Se um campo estiver vazio, o respetivo botão não é mostrado.

---

## 3. Passaporte 3D (`/peca/:tokenPeca`)

Cada peça tem o seu próprio token, independente do token da encomenda. A página abre num
visualizador escuro, a ocupar o ecrã inteiro.

### 3.1 Modelo 3D

O modelo `.glb` (ou `.gltf`) enviado pelo estúdio é carregado com `useGLTF` e apresentado com
iluminação de estúdio. Podes:

- **arrastar** para rodar;
- **fazer scroll** ou pinçar para aproximar e afastar;
- ver o modelo com sombras e reflexos suaves.

Se a peça não tiver modelo carregado, aparece uma mensagem a explicar que o ficheiro pode ser
anexado no painel do vendedor.

### 3.2 Modo AR — «Ver na Câmara (AR)»

Ao tocar no botão, o navegador pede permissão para usar a câmara. Com a permissão concedida:

1. O vídeo da câmara traseira (`facingMode: 'environment'`) passa a ocupar o ecrã inteiro.
2. O modelo 3D é desenhado por cima do vídeo, com fundo transparente.
3. Um aviso recorda: «Aponte a câmara para a sua secretária. Rode ou faça zoom na peça para
   ver em tamanho real.»
4. **Fechar Câmara** desliga o vídeo e volta ao fundo escuro.

Requisitos e limites:

| ⚠ | Detalhe |
| --- | --- |
| HTTPS obrigatório | `getUserMedia` só funciona em `https://` ou em `localhost`. Num IP de rede local em HTTP a câmara é bloqueada. |
| Permissão explícita | Se a permissão for negada, o botão não faz nada. É preciso reabrir as permissões do site nas definições do navegador. |
| Sem ancoragem | O modelo **flutua** sobre a imagem; não fica fixo a uma mesa nem reage ao movimento da câmara. Não é AR de superfície (ARCore/ARKit). |
| iOS | Safari suporta o vídeo; a experiência é mais estável em Chrome Android. Requer iOS 13 ou superior. |
| Bateria | A câmara e o WebGL juntos aquecem o telemóvel; em sessões longas fecha o modo AR. |

### 3.3 «Tamanho Real» (escala 1:1)

O botão alterna a câmara virtual do Three.js para um campo de visão mais estreito e aproxima o
modelo, simulando escala real. O texto do botão muda para **Escala 1:1 Ativa**.

**⚠ Limitação:** é uma aproximação visual, não uma medição. A escala aparente depende do
tamanho do ecrã e da distância a que o telemóvel está da peça. Para medir, usa uma régua.

### 3.4 Ficha técnica

Sob o visualizador (em telemóvel, abaixo; em ecrã largo, numa coluna à direita):

| Campo | Nota |
| --- | --- |
| Nome e descrição da peça | Texto do catálogo do estúdio |
| Material | Por omissão `PLA` quando vazio |
| Cor | — quando não definida |
| Resolução (camada) | Em milímetros |
| Preenchimento | Percentagem, quando registada |

### 3.5 Certificado no passaporte

Se a peça tiver certificado, aparece um cartão âmbar com o nível do selo, o código de
verificação e o botão **Verificar Certificado Oficial**, que abre `/verificar/<código>` num
novo separador.

---

## 4. Verificar um certificado (`/verificar` e `/verificar/:codigo`)

Página autónoma, pensada para ser aberta por quem recebeu uma peça em segunda mão ou quer
confirmar uma alegação de originalidade.

1. Introduz o código no formato `XXXX-XXXX` (também aceita sem hífen e em minúsculas).
2. Toca em **Verificar**.

Resultado possível:

**Certificado autêntico** — cartão verde com:

- nome da empresa;
- nome da peça;
- número de série, quando existir;
- nível do selo (`bronze`, `prata` ou `ouro`).

**Código inválido** — cartão vermelho: «Não foi possível confirmar a autenticidade deste
certificado.»

Notas:

- O código é comparado sem distinção de maiúsculas nem de hífenes.
- Um certificado cuja peça tenha sido apagada continua a verificar como válido, mas mostra
  `N/A` no campo da peça — a prova de emissão mantém-se, o vínculo à peça perde-se.
- A verificação é somente de leitura: não revela dados do comprador, morada, NIF nem notas
  internas.

---

## 5. Privacidade — o que o comprador consegue ver

| Exposto | Não exposto |
| --- | --- |
| Nome do comprador | Email e telefone do comprador |
| Estado, previsão e notas públicas | Notas internas |
| Histórico de estados | NIF, morada e dados fiscais da empresa |
| Peças, especificações e modelos 3D | Outras encomendas da mesma empresa |
| Contactos que o estúdio publicou | Credenciais, tokens de outras peças |

O portal não tem acesso direto às tabelas: só executa as quatro funções públicas descritas em
[04 · Referência das RPC](04-referencia-rpc.md), que devolvem exclusivamente os campos acima.

---

## 6. Problemas frequentes

| Sintoma | Causa provável | Resolução |
| --- | --- | --- |
| «Não conseguimos encontrar esta encomenda» | Token truncado ao copiar, ou encomenda apagada | Pedir o link completo ao estúdio |
| Página em branco no 3D | `.glb` com texturas em falta ou demasiado pesado | Pedir ao estúdio um modelo mais leve; testar noutro navegador |
| Botão AR sem efeito | HTTPS ausente ou permissão negada | Abrir em `https://`, autorizar a câmara nas definições do site |
| Modelo gigante ou minúsculo | Exportação fora de escala | Assinalar ao estúdio; a escala é definida no ficheiro |
| Cores diferentes do esperado | O estúdio alterou a cor primária | Recarregar a página — a cor é lida em tempo real |
| Certificado «inválido» | Código mal copiado (`O` vs `0`, `I` vs `1`) | O alfabeto exclui estes caracteres; confirmar o código no cartão |
