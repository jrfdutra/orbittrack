# 04 · Referência das RPC públicas

Contrato entre o portal do comprador e o PostgreSQL. O portal **não lê tabelas**: executa
quatro funções `SECURITY DEFINER` com `GRANT EXECUTE` para `anon`. Este documento é a
referência para integrações, depuração e alterações ao esquema.

Ficheiro de origem: `supabase/schema.sql`.

---

## 1. Porque existem funções públicas

As nove tabelas de negócio têm Row Level Security ligada e políticas que só autorizam o
vendedor autenticado dono dos dados. Se o portal tentasse `select` em `encomendas` com a chave
`anon`, receberia zero linhas.

As quatro funções resolvem isso sem abrir as tabelas:

- correm com os privilégios do criador (`SECURITY DEFINER`), ignorando a RLS;
- filtram por token ou código, nunca por `id`;
- devolvem `json_build_object` com uma lista fechada de campos.

Consequência: adicionar uma coluna sensível não a expõe automaticamente — só aparece no portal
se for acrescentada ao `json_build_object`.

---

## 2. `obter_encomenda_publica(p_token TEXT)`

Usada por `/acompanhar/:token` (`src/pages/publico/AcompanharEncomenda.tsx`).

### Chamada

```ts
const { data, error } = await supabase
  .rpc('obter_encomenda_publica', { p_token: token });
```

### Payload devolvido

```jsonc
{
  "encomenda": {
    "id": "uuid",
    "numero_encomenda": "2026-0148",
    "nome_comprador": "Ana Ribeiro",
    "estado": "A imprimir",
    "previsao_entrega": "2026-11-04",
    "notas_publicas": "Peça em PETG preto.",
    "criada_em": "2026-10-28T09:12:00+00:00"
  },
  "empresa": {
    "nome": "Atelier Camada",
    "logotipo_url": "https://.../logo.png",
    "foto_capa_url": "https://.../capa.jpg",
    "cor_primaria": "#4f46e5",
    "cor_secundaria": "#312e81",
    "descricao": "Impressão 3D de precisão",
    "email": "geral@ateliercamada.pt",
    "telefone": "+351912000000",
    "website": "https://ateliercamada.pt",
    "instagram": "@ateliercamada",
    "texto_rodape": "Obrigado pela sua encomenda!"
  },
  "itens": [
    {
      "id": "uuid",
      "nome_peca": "Suporte Headset",
      "descricao": "Suporte de mesa",
      "quantidade": 1,
      "preco_unitario": 15.0,
      "material": "PETG",
      "cor": "Preto Matte",
      "altura_camada": "0.2",
      "enchimento_percentagem": 20,
      "tempo_impressao_minutos": 240,
      "peso_gramas": 120.0,
      "impressora_usada": "Bambu P1S",
      "ficheiro_3d_url": "https://.../modelos_3d/....glb",
      "numero_serie": "SN-001",
      "data_impressao": "2026-10-29",
      "token_peca": "24 caracteres hex"
    }
  ],
  "historico": [
    { "id": "uuid", "estado": "A imprimir", "mensagem": "...", "criado_em": "..." }
  ],
  "fotos": [
    { "id": "uuid", "url": "https://...", "legenda": "...", "item_id": "uuid", "criada_em": "..." }
  ],
  "recibo": {
    "id": "uuid", "numero_recibo": "2026-0007", "data_emissao": "2026-10-30",
    "valor_total": 15.0, "metodo_pagamento": "MB Way", "observacoes": null
  },
  "certificados": [
    {
      "id": "uuid", "item_id": "uuid", "codigo_verificacao": "AB7K-92QX",
      "texto_personalizado": null, "nivel_selo": "prata",
      "criterios": ["Impressão 3D validada", "..."],
      "prazo_garantia_meses": 12, "emitido_em": "..."
    }
  ],
  "avaliacao": { "estrelas": 5, "comentario": "Excelente" },
  "estados_config": [ { "nome": "Recebida", "ordem": 0, "cor": "#6b7280" } ]
}
```

### Comportamento

| Situação | Resultado |
| --- | --- |
| Token válido | Objeto acima (`itens`, `historico`, `fotos`, `certificados`, `estados_config` são sempre arrays; `recibo` e `avaliacao` podem ser `null`) |
| Token inexistente | `NULL` (o JSON não é construído) |
| Token vazio | `NULL` |

O front-end trata `data == null` ou `data.encomenda` ausente como «encomenda não encontrada».

### Ordenação

- `itens` — ordem de inserção (sem `ORDER BY` explícito).
- `historico` — `criado_em DESC` (mais recente primeiro).
- `fotos` — `criada_em DESC`.
- `certificados` — `emitido_em DESC`.
- `recibo`, `avaliacao` — apenas o mais recente (`LIMIT 1`).
- `estados_config` — `ordem ASC`.

### Campos deliberadamente ausentes

`notas_internas`, `email_comprador`, `telefone_comprador`, `nif`, `morada`,
`utilizador_id`, `criterios` de outros certificados, `empresa_id`. Não há forma de os obter
por esta função.

---

## 3. `obter_peca_publica(p_token_peca TEXT)`

Usada por `/peca/:tokenPeca` (`src/pages/publico/PecaPassaporte.tsx`).

### Chamada

```ts
const { data } = await supabase
  .rpc('obter_peca_publica', { p_token_peca: tokenPeca });
```

### Payload

```jsonc
{
  "peca": {
    "id": "uuid",
    "nome_peca": "Suporte Headset",
    "descricao": "...",
    "quantidade": 1,
    "material": "PETG",
    "cor": "Preto Matte",
    "altura_camada": "0.2",
    "enchimento_percentagem": 20,
    "tempo_impressao_minutos": 240,
    "peso_gramas": 120.0,
    "impressora_usada": "Bambu P1S",
    "ficheiro_3d_url": "https://.../....glb",
    "numero_serie": "SN-001",
    "data_impressao": "2026-10-29"
  },
  "empresa": {
    "nome": "...", "logotipo_url": "...", "cor_primaria": "#4f46e5",
    "cor_secundaria": "#312e81", "email": "...", "telefone": "...",
    "website": "...", "instagram": "...", "texto_rodape": "..."
  },
  "encomenda": { "numero_encomenda": "2026-0148", "token_publico": "36 hex" },
  "fotos": [ { "url": "https://...", "legenda": "..." } ],
  "certificado": {
    "codigo_verificacao": "AB7K-92QX",
    "texto_personalizado": null,
    "nivel_selo": "prata",
    "criterios": ["..."],
    "prazo_garantia_meses": 12,
    "emitido_em": "..."
  }
}
```

`certificado` é `null` quando a peça não tem selo. `fotos` filtra por `item_id`, não pela
encomenda inteira.

**Nota:** o payload inclui `preco_unitario`? **Não.** O passaporte mostra especificações
técnicas, nunca preços.

---

## 4. `verificar_certificado(p_codigo TEXT)`

Usada por `/verificar` e `/verificar/:codigo`
(`src/pages/publico/VerificarCertificado.tsx`).

### Chamada

```ts
const { data } = await supabase
  .rpc('verificar_certificado', { p_codigo: codigo.trim() });
```

### Comparação

```sql
WHERE UPPER(REPLACE(c.codigo_verificacao, '-', ''))
    = UPPER(REPLACE(p_codigo,              '-', ''))
```

Aceita `AB7K-92QX`, `ab7k92qx` e `AB7K92QX` como o mesmo certificado. Não remove espaços —
o front-end faz `.trim()`.

### Payload válido

```jsonc
{
  "valido": true,
  "empresa": "Atelier Camada",
  "logotipo_url": "https://...",
  "peca": "Suporte Headset",     // "N/A" se item_id for NULL
  "numero_serie": "SN-001",
  "nivel_selo": "prata",
  "criterios": ["Impressão 3D validada", "..."],
  "prazo_garantia_meses": 12,
  "emitido_em": "2026-10-30T...",
  "cor_primaria": "#4f46e5"
}
```

### Payload inválido

```json
{ "valido": false }
```

Sem código de erro e sem distinção entre «não existe» e «código malformado» — decisão
deliberada para não dar pistas a quem tenta adivinhar códigos.

**⚠ Limitação:** não há limite de tentativas. O espaço é grande (32⁸ ≈ 1,1 × 10¹²
combinações, com alfabeto sem `I`, `O`, `0`, `1`), mas um atacante persistente pode fazer
enumeração. Se isso for uma preocupação, adiciona rate limiting ao nível da rede ou um
contador na função.

---

## 5. `submeter_avaliacao(p_token, p_estrelas, p_comentario)`

Já implementada e com `GRANT` para `anon`, mas **ainda sem formulário no portal**.

```ts
await supabase.rpc('submeter_avaliacao', {
  p_token: token,
  p_estrelas: 5,
  p_comentario: 'Excelente acabamento',
});
```

| Parâmetro | Tipo | Regra |
| --- | --- | --- |
| `p_token` | `TEXT` | `encomendas.token_publico` |
| `p_estrelas` | `INTEGER` | 1 a 5 (`CHECK` na tabela) |
| `p_comentario` | `TEXT` | Opcional, `NULL` por omissão |

Respostas:

```json
{ "sucesso": true }
{ "sucesso": false, "erro": "Encomenda não encontrada." }
{ "sucesso": false, "erro": "Esta encomenda já foi avaliada." }
```

Regra de negócio: **uma avaliação por encomenda**, imposta pela função (não há `UNIQUE` na
tabela). A função não valida `p_estrelas` explicitamente — um valor fora do intervalo provoca
erro do `CHECK`, devolvido como exceção do PostgREST, não como `{sucesso: false}`.

---

## 6. Funções auxiliares (não públicas)

Sem `GRANT` para `anon`; usadas pelo front-end autenticado ou por triggers.

| Função | Assinatura | Efeito |
| --- | --- | --- |
| `gerar_numero_encomenda` | `(p_empresa_id UUID) → TEXT` | Próximo `AAAA-NNNN` da empresa, calculado por `MAX` do sufixo do ano corrente. |
| `gerar_numero_recibo` | `(p_empresa_id UUID) → TEXT` | Equivalente para recibos. |
| `gerar_codigo_verificacao` | `() → TEXT` | Código aleatório no alfabeto seguro. |
| `atualizar_timestamp` | trigger | Mantém `atualizada_em` em `empresas` e `encomendas`. |
| `criar_estados_padrao` | trigger | Cria a lista inicial de estados ao inserir uma empresa. |
| `criar_empresa_para_utilizador` | trigger | Cria a linha em `empresas` no registo de um utilizador. |

`gerar_numero_encomenda` tem uma condição de corrida teórica: duas inserções simultâneas na
mesma empresa podem calcular o mesmo número. O `UNIQUE(empresa_id, numero_encomenda)` rejeita
a segunda — o utilizador vê um erro e repete.

---

## 7. Tabelas e RLS

Todas as tabelas têm `ENABLE ROW LEVEL SECURITY`. Nenhuma política autoriza `anon`: o acesso
público passa exclusivamente pelas funções acima.

| Tabela | SELECT | INSERT/UPDATE/DELETE |
| --- | --- | --- |
| `empresas` | Dono (`utilizador_id = auth.uid()`) | UPDATE pelo dono; INSERT via trigger |
| `configuracao_estados` | Dono da empresa | `FOR ALL` pelo dono |
| `encomendas` | Dono da empresa | `FOR ALL` pelo dono |
| `itens_encomenda` | Dono da encomenda | `FOR ALL` pelo dono |
| `historico_estados` | Dono da encomenda | `FOR ALL` pelo dono |
| `fotos_encomenda` | Dono da encomenda | `FOR ALL` pelo dono |
| `recibos` | Dono da encomenda | `FOR ALL` pelo dono |
| `certificados` | Dono da encomenda | `FOR ALL` pelo dono |
| `avaliacoes` | Dono da encomenda | **Só SELECT**; INSERT apenas via `submeter_avaliacao` |

O padrão repete-se: `empresa_id IN (SELECT id FROM empresas WHERE utilizador_id = auth.uid())`,
ou o equivalente através de `encomenda_id`.

### Storage

Dois buckets públicos, ambos criados no `schema.sql`:

| Bucket | Conteúdo | Leitura | Escrita |
| --- | --- | --- | --- |
| `empresas` | Logótipos e capas | `public` | `authenticated` (INSERT/UPDATE) |
| `encomendas` | Modelos 3D (`modelos_3d/`) e fotos | `public` | `authenticated` (INSERT/UPDATE) |

**⚠ Nota de segurança:** a política de INSERT valida apenas `bucket_id`, não o caminho. Um
utilizador autenticado pode escrever na pasta de outro. Para multi-tenant rigoroso, adiciona
`AND (storage.foldername(name))[1] = auth.uid()::text` e passa a usar pastas por utilizador no
front-end.

---

## 8. Extensões e pré-requisitos

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

`gen_random_bytes` vem do `pgcrypto`, já ativo em projetos Supabase. `gen_random_uuid()` é
nativo do PostgreSQL 13+ e não exige extensão.

---

## 9. Resumo dos tokens

| Token | Onde nasce | Formato | Onde é usado |
| --- | --- | --- | --- |
| `encomendas.token_publico` | `DEFAULT encode(gen_random_bytes(18), 'hex')` | 36 hex | `/acompanhar/:token` |
| `itens_encomenda.token_peca` | `DEFAULT encode(gen_random_bytes(12), 'hex')` | 24 hex | `/peca/:tokenPeca` |
| `certificados.codigo_verificacao` | Front-end, alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` | `XXXX-XXXX` | `/verificar/:codigo` |

Ambos os tokens de URL são gerados pela base de dados e nunca mudam. O código do certificado é
gerado no browser no momento da emissão; colisões são impedidas pelo `UNIQUE`.
