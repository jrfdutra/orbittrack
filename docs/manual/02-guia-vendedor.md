# 02 · Guia do vendedor

Manual de operação do painel. Segue a ordem natural de trabalho: criar conta → configurar a
empresa → preparar catálogo → registar encomendas → acompanhar e certificar.

> Todos os ecrãs do painel vivem em `/painel` e exigem sessão ativa. Abaixo de 768 px o menu
> lateral passa a gaveta (botão de menu no topo) e as tabelas transformam-se em cartões.

---

## 1. Criar conta e entrar

1. Abre `/registar`.
2. Indica email e palavra-passe.
3. Ao concluir, o Supabase dispara o trigger `criar_empresa_para_utilizador`, que cria
   automaticamente uma linha em `empresas` com o nome «A minha empresa» e outro trigger
   (`criar_estados_padrao`) que gera a lista inicial de estados de fabrico.

Se a palavra-passe for esquecida, `/recuperar-senha` envia o email de reposição; o link abre
`/redefinir-senha`.

**⚠ Limitação:** não há confirmação de email obrigatória nem gestão de equipas — uma conta
corresponde a uma empresa.

---

## 2. Configurar a identidade da empresa

Ecrã: **A Minha Empresa** (`/painel/empresa`).

Tudo o que definires aqui aparece no portal que o comprador vê. É a única parte do produto
que o cliente final associa à tua marca.

| Campo | Efeito no portal |
| --- | --- |
| Nome da Empresa | Título no cabeçalho e no passaporte 3D |
| NIF | Uso interno; **não** é exposto publicamente |
| Descrição / Slogan | Texto sob o nome |
| Cor Primária | Alimenta `--primary`: cabeçalho, selos, botões, badges de estado |
| Cor Secundária | Gradientes e detalhes de destaque |
| Email de Contacto | Botão de contacto no rodapé |
| Telefone / WhatsApp | Botão de chamada (`tel:`) no rodapé |
| Website | Ligação no rodapé |
| Instagram | Ligação para `instagram.com/<handle>` |
| Morada | Uso interno |
| Texto de Rodapé | Mensagem final («Obrigado pela preferência!») |
| Logótipo | Imagem quadrada, idealmente PNG com transparência, ≤ 512 × 512 px |
| Foto de Capa | Imagem horizontal, 1200 × 400 px ou equivalente |

O upload usa o bucket `empresas` do Supabase Storage. Recomenda-se ficheiros abaixo de 1 MB
para o portal abrir depressa em 4G.

**Boa prática:** escolhe a cor primária antes de partilhares o primeiro link. Mudá-la depois
altera todos os links já enviados, porque a cor é lida em tempo real da base de dados.

---

## 3. Definir os estados de fabrico

Ecrã: **Estados** (`/painel/estados`).

Os estados são a espinha dorsal do rastreio. O comprador vê o histórico como uma linha do
tempo, pela ordem em que os estados foram aplicados — não pela ordem desta lista.

Para cada estado defines:

- **Nome** — texto que o comprador lê (ex.: `Recebida`, `A imprimir`, `Acabamento`, `Enviada`).
- **Cor** — usada no badge de estado.
- **Mensagem padrão** — texto opcional gravado no histórico quando o estado é aplicado.

Operações disponíveis: adicionar, reordenar, editar cor/mensagem e **Guardar Alterações**.
O botão só persiste o conjunto completo, por isso confirma sempre o aviso de sucesso.

**⚠ Limitação:** mudar o nome de um estado **não** reescreve o histórico já gravado. As
encomendas antigas mantêm o texto que tinham no momento da transição.

---

## 4. Catálogo de produtos e consumo de filamento

Ecrã: **Produtos & Consumo** (`/painel/produtos`), com dois separadores.

### 4.1 Produtos Pré-Definidos

Serve para orçamentar rapidamente peças que imprimes com frequência. Cada produto guarda:

| Campo | Exemplo |
| --- | --- |
| Nome | `Suporte Headset Premium` |
| Material | `PLA`, `PETG`, `ABS`, `Resina` |
| Cor | `Preto Matte` |
| Peso | `120 g` — base do cálculo de custo de material |
| Tempo | `240 min` — base do cálculo de ocupação da máquina |
| Preço base | `15,00 €` |

O cartão mostra peso, tempo e preço lado a lado; o ícone de lixo remove o produto.

### 4.2 Stock de Filamentos & Consumo

Cada carretel tem marca/material, cor, peso total, peso restante e preço por quilo. A barra
mostra a percentagem restante e muda de cor por faixa (verde → âmbar → vermelho).

Para abater consumo há dois caminhos:

1. **Botões rápidos** `-50 g`, `-100 g`, `-250 g` — para o consumo típico de uma peça.
2. **Registo manual** — gramas exatas, quando pesas o carretel antes e depois.

O valor nunca desce abaixo de zero.

**⚠ Limitação importante:** este módulo ainda guarda os dados apenas em memória
(`useState`). Recarregar a página, mudar de rota ou fechar o separador repõe os dois exemplos
iniciais. **Não uses o stock como inventário de confiança até a persistência ser adicionada.**

### 4.3 Cálculo de custo de material

```
custo = (peso_da_peça_em_g / 1000) × preço_por_kg_do_filamento
```

Exemplo: peça de 120 g com filamento a 22,00 €/kg → `0,120 × 22,00 = 2,64 €`.

---

## 5. Registar uma encomenda

Ecrã: **Encomendas → + Nova Encomenda** (`/painel/encomendas/nova`).

### 5.1 Dados do comprador

| Campo | Obrigatório | Nota |
| --- | --- | --- |
| Nome do Comprador | Sim | Aparece no portal |
| Email | Sim | Contacto do comprador |
| Telefone | Não | **Necessário** para o botão de WhatsApp |
| Previsão de Entrega | Sim | Data mostrada como «Previsão» no portal |
| Notas Públicas | Não | Visíveis para o comprador |
| Notas Internas | Não | **Nunca** saem do painel |

### 5.2 Peças

Cada peça tem nome, quantidade, preço unitário (obrigatórios) e, opcionalmente, material, cor
e resolução em mm. Usa **Adicionar Peça** para mais linhas e o ícone de lixo para remover.

### 5.3 Modelo 3D

No cartão da peça, o seletor de ficheiro aceita `.glb` e `.gltf`. O ficheiro sobe para o bucket
`encomendas`, na pasta `modelos_3d/`, e a URL pública fica gravada em
`itens_encomenda.ficheiro_3d_url`.

Recomendações:

- Um `.glb` é preferred a um `.gltf` com texturas separadas — é um único ficheiro.
- Mantém abaixo de 10 MB; acima disso o telemóvel do comprador demora a abrir o passaporte.
- O modelo deve estar à escala real, em centímetros ou milímetros coerentes com a peça física,
  para o modo de tamanho real fazer sentido.

### 5.4 O que acontece ao guardar

Numa encomenda nova:

1. O front-end chama a RPC `gerar_numero_encomenda(empresa_id)`, que devolve o próximo
   `AAAA-NNNN` da empresa (ex.: `2026-0148`).
2. Insere a encomenda com `estado = 'Recebida'`.
3. Insere as peças em `itens_encomenda`.
4. O `token_publico` e o `token_peca` são gerados pelo valor por omissão da coluna
   (`encode(gen_random_bytes(n), 'hex')`) — não é preciso pedi-los.

Ao editar, as peças são apagadas e reinseridas com os valores atuais. **Atenção:** isso
invalida certificados associados às peças antigas, porque `certificados.item_id` passa a
`NULL` (`ON DELETE SET NULL`). Emite certificados depois de a encomenda estar estável.

---

## 6. Gerir a lista de encomendas

Ecrã: **Encomendas** (`/painel/encomendas`).

Em desktop, uma tabela com cinco ações por linha. Abaixo de 768 px, cartões com as mesmas
ações — «Nº Encomenda», «Comprador», «Estado de Fabrico», «Previsão» e «Ações & Certificado».

### 6.1 Mudar o estado

O estado é um seletor na linha. Ao mudar:

1. Atualiza `encomendas.estado`.
2. Insere uma linha em `historico_estados` com a mensagem
   `Estado atualizado para: <novo estado>`.

Esse histórico é exatamente o que o comprador vê na linha do tempo. **Cada mudança de estado é
uma comunicação** — evita alterações cosméticas que gerem ruído na cronologia do cliente.

### 6.2 Emitir certificado

O botão de selo percorre todas as peças da encomenda:

1. Se a peça ainda não tem certificado, gera um código de 8 caracteres a partir do alfabeto
   `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sem `I`, `O`, `0`, `1` para evitar confusões),
   no formato `XXXX-XXXX`.
2. Insere em `certificados` com `nivel_selo = 'prata'` e três critérios por omissão:
   «Impressão 3D validada», «Controlo dimensional OK», «Acabamento verificado».
3. Peças que já têm certificado são ignoradas — a operação é idempotente.

**⚠ Limitação:** o nível do selo (`bronze`/`prata`/`ouro`), os critérios e o prazo de garantia
são fixos no código. Personalizar exige alteração do front-end.

### 6.3 Copiar o link público

Copia para a área de transferência:

```
https://<o-teu-domínio>/acompanhar/<token_publico>
```

É este o link que o comprador usa. Não expira e não pede login — trata-o como uma credencial.

### 6.4 Enviar por WhatsApp

Abre `wa.me` com uma mensagem pré-preenchida:

> Olá *&lt;nome&gt;*! A sua encomenda #*&lt;número&gt;* está com o estado: **&lt;estado&gt;**.
> Acompanhe o progresso em tempo real aqui: &lt;link&gt;

Requer `telefone_comprador` preenchido; caso contrário, a ação avisa e não abre nada.

### 6.5 Eliminar

Pede confirmação e apaga a encomenda. Por `ON DELETE CASCADE`, leva consigo peças, histórico,
fotos, recibos, certificados e avaliações. **Ação irreversível** — o link público passa a
devolver «não encontrada».

---

## 7. Rotina semanal recomendada

| Momento | Ação |
| --- | --- |
| Segunda | Revisar previsões da semana e ajustar datas desatualizadas |
| Ao iniciar uma peça | Mudar o estado; o comprador recebe a cronologia certa |
| Ao terminar | Mudar para «Acabamento» e, se aplicável, emitir certificado |
| Antes de enviar | Copiar link ou usar WhatsApp com a mensagem já preenchida |
| Sexta | Verificar stock de filamento e repor no catálogo |

---

## 8. Perguntas frequentes

**O comprador precisa de conta?**
Não. O token do link é a credencial.

**Posso mudar a marca depois de enviar links?**
Sim. A identidade é lida em tempo real: os links antigos passam a mostrar a nova cor e o novo
logótipo.

**O comprador vê as notas internas?**
Não. A função pública devolve apenas `notas_publicas`.

**Posso ter duas empresas na mesma conta?**
Não. Uma conta ↔ uma linha em `empresas`.

**O que acontece se apagar uma peça da encomenda?**
Ao guardar a edição, as peças são recriadas com novos IDs. Os certificados antigos ficam com
`item_id = NULL` e deixam de aparecer no portal, embora o código continue verificável.

**Onde vejo o feedback dos clientes?**
A tabela `avaliacoes` existe e o Dashboard mostra a média, mas ainda não há formulário ligado
no portal — o valor só muda com inserção manual na base de dados.
