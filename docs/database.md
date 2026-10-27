# Base de dados

## 1. Visão geral

O esquema está em `supabase/schema.sql` e define nove tabelas de negócio, oito índices,
cinco funções auxiliares, quatro RPCs públicas e dois buckets de Storage. O modelo é
multiempresa: quase todas as tabelas de negócio pendem de `empresas` ou de `encomendas`,
e a RLS filtra pelo utilizador autenticado.

O diagrama entidade-relação simplificado está em
[`../assets/er.png`](../assets/er.png).

## 2. Tabelas

### 2.1 `empresas`

Perfil white-label do vendedor.

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | UUID PK | `uuid_generate_v4()` |
| `utilizador_id` | UUID NOT NULL | FK `auth.users(id)` `ON DELETE CASCADE`; **sem UNIQUE** |
| `nome` | TEXT NOT NULL | Default “A minha empresa” |
| `logotipo_url`, `foto_capa_url` | TEXT | URLs de Storage |
| `cor_primaria`, `cor_secundaria` | TEXT NOT NULL | Default `#2563eb` / `#1e40af` |
| `descricao`, `email`, `telefone`, `website`, `instagram`, `morada`, `nif` | TEXT | Sem validação de formato |
| `texto_rodape` | TEXT | Default “Obrigado pela sua encomenda!” |
| `criada_em`, `atualizada_em` | TIMESTAMPTZ | Trigger de atualização |

Risco: sem `UNIQUE(utilizador_id)`, o mesmo utilizador pode ter várias empresas e as
consultas com `.single()` falham ou devolvem resultados ambíguos.

### 2.2 `configuracao_estados`

Estados configuráveis por empresa.

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | UUID PK | — |
| `empresa_id` | UUID NOT NULL | FK `empresas` CASCADE |
| `nome` | TEXT NOT NULL | **sem UNIQUE(empresa_id, nome)** |
| `ordem` | INTEGER NOT NULL | **sem UNIQUE(empresa_id, ordem)** |
| `cor` | TEXT NOT NULL | Default `#6b7280` |
| `mensagem_padrao` | TEXT | Não aplicada automaticamente |
| `criado_em` | TIMESTAMPTZ | — |

O trigger `tr_empresa_estados_padrao` cria sete estados (Recebida, Em fila, A imprimir,
Acabamento, Controlo de qualidade, Enviada, Entregue) após a inserção de uma empresa.

### 2.3 `encomendas`

Entidade central.

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | UUID PK | — |
| `empresa_id` | UUID NOT NULL | FK `empresas` CASCADE |
| `token_publico` | TEXT NOT NULL UNIQUE | Default `encode(gen_random_bytes(18),'hex')` |
| `numero_encomenda` | TEXT NOT NULL | `UNIQUE(empresa_id, numero_encomenda)` |
| `nome_comprador` | TEXT NOT NULL | — |
| `email_comprador`, `telefone_comprador` | TEXT | Dados pessoais |
| `estado` | TEXT NOT NULL | Default “Recebida”; **texto livre, não FK** |
| `previsao_entrega` | DATE | Nula permitida; UI pública não trata null |
| `notas_publicas`, `notas_internas` | TEXT | `notas_internas` não deve ser exposta |
| `criada_em`, `atualizada_em` | TIMESTAMPTZ | Trigger de atualização |

Problemas: `gen_random_bytes` exige `pgcrypto`, que **não** é criado explicitamente no
script; `numero_encomenda` é obrigatório mas o formulário não o envia; `estado` não está
ligado a `configuracao_estados`.

### 2.4 `itens_encomenda`

Peças de cada encomenda.

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | UUID PK | — |
| `encomenda_id` | UUID NOT NULL | FK `encomendas` CASCADE |
| `nome_peca` | TEXT NOT NULL | — |
| `descricao` | TEXT | — |
| `quantidade` | INTEGER NOT NULL | Default 1; **sem CHECK > 0** |
| `preco_unitario` | NUMERIC(10,2) | Pode ser nulo; **sem CHECK >= 0** |
| `material`, `cor`, `altura_camada`, `impressora_usada` | TEXT | Parâmetros técnicos |
| `enchimento_percentagem` | INTEGER | Sem CHECK 0–100 |
| `tempo_impressao_minutos` | INTEGER | Sem CHECK > 0 |
| `peso_gramas` | NUMERIC(10,2) | — |
| `ficheiro_3d_url` | TEXT | URL pública no bucket `encomendas` |
| `numero_serie` | TEXT | Sem UNIQUE |
| `token_peca` | TEXT UNIQUE | Default 12 bytes; usado no passaporte |
| `data_impressao` | DATE | — |

### 2.5 `historico_estados`

Registo de mudanças de estado, com mensagem. Não tem `utilizador_id`, `fotos` ou tipo de
evento. A aplicação **nunca** insere nesta tabela: não existe UI de alteração de estado.

### 2.6 `fotos_encomenda`

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | UUID PK | — |
| `encomenda_id` | UUID NOT NULL | FK `encomendas` CASCADE |
| `item_id` | UUID | FK `itens_encomenda` `ON DELETE SET NULL` |
| `url` | TEXT NOT NULL | URL pública |
| `legenda` | TEXT | — |
| `criada_em` | TIMESTAMPTZ | — |

### 2.7 `recibos`

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | UUID PK | — |
| `encomenda_id` | UUID NOT NULL | FK `encomendas` CASCADE; **sem UNIQUE**, permite vários recibos |
| `numero_recibo` | TEXT NOT NULL | **sem UNIQUE** |
| `data_emissao` | DATE NOT NULL | Default `CURRENT_DATE` |
| `valor_total` | NUMERIC(10,2) NOT NULL | Default 0; sem CHECK >= 0 |
| `metodo_pagamento`, `observacoes` | TEXT | — |

Não existe emissão, PDF ligado ou numeração aplicada.

### 2.8 `certificados`

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | UUID PK | — |
| `encomenda_id` | UUID NOT NULL | FK `encomendas` CASCADE |
| `item_id` | UUID | FK `itens_encomenda` `ON DELETE SET NULL` |
| `codigo_verificacao` | TEXT NOT NULL UNIQUE | Gerado por `gerar_codigo_verificacao()` com `RANDOM()` |
| `texto_personalizado` | TEXT | — |
| `nivel_selo` | TEXT NOT NULL | CHECK `bronze`, `prata`, `ouro` |
| `criterios` | JSONB | Default `[]` |
| `prazo_garantia_meses` | INTEGER | Default 12 |
| `emitido_em` | TIMESTAMPTZ | — |

O código tem 8 caracteres de um alfabeto de 32, gerado com `RANDOM()` (não
criptográfico) e sem retry em colisão. O selo é uma classificação da oficina, não uma
certificação independente.

### 2.9 `avaliacoes`

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | UUID PK | — |
| `encomenda_id` | UUID NOT NULL | FK `encomendas` CASCADE; **sem UNIQUE** |
| `estrelas` | INTEGER NOT NULL | CHECK 1–5 |
| `comentario` | TEXT | — |
| `criada_em` | TIMESTAMPTZ | — |

A RPC `submeter_avaliacao` verifica a existência de avaliação antes de inserir, mas sem
constraint a corrida entre dois pedidos pode criar duplicados.

## 3. Relações

```
auth.users 1 ─── n empresas
empresas   1 ─── n configuracao_estados
empresas   1 ─── n encomendas
encomendas 1 ─── n itens_encomenda
encomendas 1 ─── n historico_estados
encomendas 1 ─── n fotos_encomenda
encomendas 1 ─── n recibos
encomendas 1 ─── n certificados
encomendas 1 ─── n avaliacoes
itens_encomenda 1 ─── n fotos_encomenda (opcional)
itens_encomenda 1 ─── n certificados (opcional)
```

## 4. Funções e triggers

| Objeto | Tipo | Estado |
| --- | --- | --- |
| `gerar_numero_encomenda(uuid)` | função | `MAX+1` por empresa/ano; não chamada pela UI; insegura sob concorrência |
| `gerar_numero_recibo(uuid)` | função | `REC-AAAA-NNNN`; sem UNIQUE; não usada |
| `gerar_codigo_verificacao()` | função | `RANDOM()`, 8 caracteres; sem retry |
| `atualizar_timestamp()` | trigger | `empresas` e `encomendas` |
| `criar_estados_padrao()` | trigger | Após INSERT em `empresas` |
| `criar_empresa_para_utilizador()` | trigger | `SECURITY DEFINER` sobre `auth.users`; frágil, sem `search_path` |

A função de criação de empresa em `auth.users` é um ponto único de falha: se o trigger
não existir, falhar ou for removido numa migração, o registo cria o utilizador mas não a
empresa. Não há mecanismo de reparação na aplicação.

## 5. RPCs públicas

| RPC | Devolve | Usada pela UI? | Observações |
| --- | --- | --- | --- |
| `obter_encomenda_publica(p_token)` | JSON com encomenda, empresa, itens, histórico, fotos, recibo, certificados, avaliação e estados | **Não** | `SECURITY DEFINER`, sem `SET search_path`, sem rate limit; devolve IDs internos e URLs de ficheiros |
| `obter_peca_publica(p_token_peca)` | JSON com peça, empresa, encomenda, fotos e certificado | **Não** | Mesmo padrão; não devolve `token_publico` da encomenda |
| `verificar_certificado(p_codigo)` | JSON com validade, empresa, peça, selo e critérios | **Não** | Normaliza hífenes e maiúsculas; devolve `{valido:false}` se não encontrar |
| `submeter_avaliacao(p_token, p_estrelas, p_comentario)` | JSON `{sucesso}` ou `{erro}` | **Não** | Sem rate limit; sem validação do estado da encomenda; sem constraint única |

As quatro funções têm `GRANT EXECUTE` para `anon` e `authenticated`. Nenhuma fixa
`search_path`, e nenhuma é chamada pelo frontend. As páginas públicas consultam as
tabelas diretamente, pelo que falham por RLS.

## 6. Índices

Existem índices para `encomendas.empresa_id`, `encomendas.token_publico`,
`itens_encomenda.encomenda_id`, `itens_encomenda.token_peca`,
`historico_estados.encomenda_id`, `fotos_encomenda.encomenda_id`,
`certificados.codigo_verificacao` e `configuracao_estados.empresa_id`.

Faltam índices explícitos para `recibos.encomenda_id`, `avaliacoes.encomenda_id` e
`empresas.utilizador_id` (este último coberto parcialmente pela FK, mas sem UNIQUE).
`token_publico` e `codigo_verificacao` já têm UNIQUE, que cria índice.

## 7. Storage

| Bucket | Público | Conteúdo previsto |
| --- | --- | --- |
| `empresas` | **Sim** | Logótipos e capas |
| `encomendas` | **Sim** | Fotos, modelos 3D e documentos |

As políticas de `storage.objects` verificam apenas `bucket_id`. Qualquer utilizador
autenticado pode inserir, atualizar ou apagar em qualquer caminho dos dois buckets. O
bucket `encomendas` sendo público expõe fotos, modelos e documentos a quem tenha o URL.

## 8. Problemas de integridade e correções

| # | Problema | Impacto | Correção |
| --- | --- | --- | --- |
| D-01 | `pgcrypto` não é criado explicitamente | Defaults com `gen_random_bytes` podem falhar fora do Supabase padrão | `CREATE EXTENSION IF NOT EXISTS pgcrypto;` |
| D-02 | `empresas.utilizador_id` sem UNIQUE | Empresas duplicadas; `.single()` ambíguo | `UNIQUE(utilizador_id)` |
| D-03 | `numero_encomenda` obrigatório e não gerado | Criação de encomendas falha | Trigger/RPC transacional |
| D-04 | Numeração `MAX+1` | Duplicados sob concorrência | Sequência por empresa/ano ou lock |
| D-05 | `recibos.numero_recibo` sem UNIQUE | Documentos duplicados | Constraint única por empresa |
| D-06 | `recibos.encomenda_id` sem UNIQUE | Vários recibos por encomenda sem regra | Definir regra e constraint |
| D-07 | `avaliacoes.encomenda_id` sem UNIQUE | Avaliações duplicadas em corrida | `UNIQUE(encomenda_id)` |
| D-08 | `estado` é texto livre | Estados inválidos e órfãos | FK para configuração ou CHECK |
| D-09 | Sem CHECK em quantidades, preços e percentagens | Dados impossíveis | CHECK `> 0`, `0–100`, `>= 0` |
| D-10 | `configuracao_estados` sem UNIQUE | Nomes/ordens duplicados | `UNIQUE(empresa_id, nome)` e ordem |
| D-11 | `fotos_encomenda.item_id` `SET NULL` | Perda de associação ao eliminar item | Rever política de eliminação |
| D-12 | `seed.sql` inválido | Não cria demonstração | Seed idempotente com utilizador real |
| D-13 | Buckets públicos | Exposição de ficheiros | Bucket privado + URLs assinadas |
| D-14 | Políticas de Storage por bucket | Escrita cruzada entre empresas | Filtrar por empresa e `auth.uid()` |
| D-15 | RPCs sem `SET search_path` | Risco de resolução maliciosa | `SET search_path = public, pg_temp` |
| D-16 | RPC devolve IDs internos e URLs | Exposição desnecessária | Resposta mínima e URLs assinadas |

## 9. Seed

`supabase/seed.sql` tem 637 bytes e tenta criar uma empresa e uma encomenda de exemplo.
Não funciona como documentado: usa um `utilizador_id` inexistente e não fornece
`numero_encomenda`, que é `NOT NULL`. Deve ser substituído por um seed idempotente,
executável duas vezes, com um utilizador de teste real e todos os campos obrigatórios.

## 10. Limites

O esquema foi lido, não executado. Não houve migrações versionadas, testes de RLS,
`EXPLAIN`, medição de desempenho ou validação do linter do Supabase. As observações são
estáticas e devem ser confirmadas num projeto de ensaio antes de qualquer correção.
