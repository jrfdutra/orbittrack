# Segurança e privacidade

## 1. Resumo executivo

O desenho de segurança assenta em três ideias: autenticação Supabase, RLS por empresa e
RPCs públicas para o comprador. Nenhuma das três foi validada em execução. A leitura do
código revela problemas confirmados que impedem considerar o produto seguro para dados
reais:

- As páginas públicas consultam tabelas protegidas como `anon` e falham por RLS.
- Os dois buckets de Storage são públicos e as políticas só verificam `bucket_id`.
- Qualquer utilizador autenticado pode escrever ou apagar ficheiros de outra empresa.
- Não há validação de tipo, tamanho ou conteúdo nos uploads.
- Não há testes de isolamento, rate limiting, MFA, política de palavras-passe ou registo
  de auditoria de negócio.
- Não existe documentação de conformidade RGPD, política de privacidade ou termos.

**Classificação:** não apto para produção nem para dados pessoais reais.

## 2. Modelo de ameaças (resumo)

| Ator | Objetivo | Superfície |
| --- | --- | --- |
| Visitante com link | Ver dados de uma encomenda ou peça | `/acompanhar/:token`, `/peca/:tokenPeca` |
| Atacante com URL de ficheiro | Obter fotos, modelos 3D ou documentos | Buckets públicos |
| Vendedor autenticado malicioso | Ler/alterar dados de outra empresa | PostgREST, RPCs, Storage |
| Atacante de força bruta | Adivinhar palavras-passe ou códigos | Auth, `verificar_certificado` |
| Scraper | Enumerar certificados ou encomendas | RPCs públicas sem rate limit |
| Insider | Alterar registos sem rasto | Falta de auditoria |

O token público de encomenda tem 18 bytes aleatórios em hexadecimal (36 caracteres), o
que é adequado contra adivinhação. O token de peça tem 12 bytes (24 caracteres). O
problema não é a entropia do token: é a ausência de autorização no servidor e a exposição
de ficheiros por URL pública.

## 3. Autenticação

| Controlo | Estado | Evidência |
| --- | --- | --- |
| Login email/palavra-passe | Implementado, não validado | `Login.tsx`, `AuthContext.signIn` |
| Registo | Implementado, não validado | `Registar.tsx`, `signUp` |
| Confirmação de email | Depende da configuração do projeto | Não verificável |
| Recuperação de palavra-passe | **Bloqueada** | Redireciona para rota inexistente |
| Política de palavra-passe | Fraca | Apenas 6 caracteres no cliente |
| MFA | Não existe | — |
| Bloqueio por tentativas | Não existe | — |
| Sessão expirada | Não testada | `RotaProtegida` só cliente |
| Terminar sessão | Implementado | `signOut` |

A mensagem de erro do login é genérica (“Email ou palavra-passe incorretos.”), o que
reduz enumeração de contas, mas também impede diagnóstico. Não há verificação de
palavras-passe comprometidas, complexidade, história ou expiração.

## 4. RLS nas tabelas

As nove tabelas têm RLS ativa. As políticas existentes são apenas para `authenticated` e
seguem o padrão “empresa do utilizador”:

```sql
empresa_id IN (SELECT id FROM empresas WHERE utilizador_id = auth.uid())
```

Pontos positivos:

- Todas as tabelas de negócio têm RLS ativa.
- As políticas de `encomendas`, `itens`, `histórico`, `fotos`, `recibos` e `certificados`
  encadeiam a propriedade até `empresas`.
- `avaliacoes` só tem SELECT para o vendedor, o que é coerente com a submissão via RPC.

Pontos críticos:

- **Não existem políticas para `anon`.** As páginas públicas consultam tabelas
  diretamente, pelo que recebem zero linhas ou erro. As RPCs `SECURITY DEFINER` existem,
  mas não são usadas.
- Não há testes com dois utilizadores. Não é possível afirmar isolamento.
- `empresas.utilizador_id` não é UNIQUE; a subconsulta pode devolver várias empresas.
- As políticas `FOR ALL` não distinguem INSERT, UPDATE e DELETE; a lógica de `WITH CHECK`
  fica implícita no `USING`.
- Não há política de `service_role` documentada nem separação de ambientes.

## 5. RPCs públicas

As quatro RPCs são `SECURITY DEFINER`, o que lhes permite ler tabelas sujeitas a RLS. Isso
é necessário para o portal, mas aumenta a responsabilidade de as endurecer.

| Risco | Detalhe | Correção |
| --- | --- | --- |
| `search_path` não fixo | Resolução de objetos pode ser manipulada | `SET search_path = public, pg_temp` |
| Resposta excessiva | `obter_encomenda_publica` devolve IDs internos, `token_peca`, `ficheiro_3d_url` e notas | Devolver apenas campos necessários e URLs assinados |
| Sem rate limiting | `verificar_certificado` é enumerável; `submeter_avaliacao` é abusável | Limitar por IP/token no edge e monitorizar |
| Validação fraca | `submeter_avaliacao` não valida estado da encomenda nem normaliza comentário | Validar no servidor e limitar tamanho |
| Sem auditoria | Não há registo de acessos ou emissões | Tabela de eventos com ator, ação e timestamp |
| Código de certificado | `RANDOM()` não é CSPRNG; sem retry de colisão | `gen_random_bytes` e tentativa repetida |
| Sem revogação | Não existe estado de certificado revogado | Campo `revogado_em` e verificação |

A função `verificar_certificado` normaliza hífenes e maiúsculas e devolve
`{"valido": false}` quando não encontra. É um bom ponto de partida, mas não chega: falta
limitar tentativas, distinguir “não existe” de “revogado” e não expor dados em excesso.

## 6. Storage

| Aspeto | Estado | Risco |
| --- | --- | --- |
| Bucket `empresas` | Público | Logótipos e capas acessíveis por URL |
| Bucket `encomendas` | Público | Fotos, modelos 3D e documentos acessíveis por URL |
| Política INSERT | `bucket_id = 'empresas'` / `'encomendas'` | Qualquer autenticado escreve em qualquer pasta |
| Política UPDATE | idem | Qualquer autenticado altera ficheiros de outra empresa |
| Política DELETE | idem | Qualquer autenticado apaga ficheiros de outra empresa |
| Política SELECT | `TO public` | Leitura anónima de todos os objetos |
| Validação MIME/tamanho | Ausente | Upload de executáveis, ficheiros enormes ou conteúdo malicioso |
| URLs assinadas | Não usadas | Não há expiração nem controlo de acesso |

**Correção mínima:** tornar `encomendas` privado; organizar caminhos por
`empresa_id/encomenda_id/...`; validar `auth.uid()` e a empresa na política; aplicar
limites de tamanho e tipos permitidos; usar `createSignedUrl` com expiração curta;
separar `empresas` (marca pública) de documentos privados.

## 7. Validação de uploads

`src/lib/utils.ts` define `validarImagem` e `validarFicheiro3D` com limites, mas nenhuma
página as chama. `EmpresaPerfil.tsx` aceita `image/*` no seletor e envia o ficheiro sem
verificar dimensões, peso ou tipo real. Não existe validação no servidor.

Consequências:

- Upload de ficheiros fora do âmbito (PDF, executável, SVG com scripts).
- Consumo de quota e custos.
- Conteúdo malicioso servido a partir do domínio da aplicação.
- Impossibilidade de provar que uma foto pertence a uma encomenda.

## 8. Segredos e configuração

- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são variáveis de build. A chave `anon` é
  pública por desenho; **nunca** deve ser usada a `service_role` no browser.
- `.env.example` está versionado com placeholders; não há indício de chaves reais no
  repositório.
- Não existe validação de ambiente no arranque; se as variáveis faltarem, o cliente falha
  de forma pouco clara.
- Não há `vercel.json`, cabeçalhos de segurança, CSP, HSTS ou política de referrer.
- O `README.md` da raiz tem problemas de codificação e não é fonte fiável.

## 9. Privacidade e RGPD

O produto trata dados de compradores (`nome`, `email`, `telefone`, morada da empresa,
fotografias de peças). Não existem:

- política de privacidade, termos de utilização ou contrato de subcontratação;
- base legal documentada, registo de tratamentos ou avaliação de impacto;
- prazos de retenção, exportação ou eliminação a pedido;
- gestão de consentimentos ou cookies;
- procedimento de resposta a incidentes;
- nomeação de responsável de proteção de dados.

O link público permite partilha sem autenticação; qualquer pessoa com o URL vê os dados
que a RPC devolver. É necessário minimizar esses dados e definir uma política de
revogação de tokens.

## 10. Riscos de segurança prioritários

| ID | Risco | Prioridade | Critério de conclusão |
| --- | --- | --- | --- |
| R-02 | Páginas públicas bloqueadas por RLS | P0 | Link público abre com dados mínimos via RPC; token inválido tem erro controlado |
| R-04 | Buckets públicos expõem ficheiros | P0 | Acesso anónimo a ficheiro de encomenda devolve 400/403 |
| R-05 | Políticas de Storage permissivas | P0 | Dois utilizadores não se sobrepõem em pastas |
| R-07 | Sem testes de isolamento RLS | P0 | Suite com dois utilizadores e operações cruzadas, verde |
| R-08 | RPCs sem `search_path` | P1 | Linter sem alertas e funções testadas |
| R-13 | Uploads sem validação | P1 | `.exe` e ficheiro acima do limite rejeitados |
| R-14 | Sem rate limiting | P2 | Limite documentado e testado |
| R-17 | Sem conformidade RGPD | P1 | Documentação jurídica publicada |
| R-18 | Sem auditoria de negócio | P2 | Eventos críticos registados e consultáveis |
| R-06 | Recuperação de palavra-passe bloqueada | P1 | Fluxo completo testado |

## 11. Recomendações por ordem

1. **Parar utilização com dados reais** até R-02, R-04, R-05 e R-07 estarem corrigidos.
2. Ligar o portal e a verificação às RPCs, com respostas mínimas.
3. Tornar o bucket `encomendas` privado e reescrever as políticas por empresa.
4. Adicionar validação de tipo/tamanho no cliente e limites no Storage.
5. Fixar `search_path` nas RPCs e adicionar rate limiting.
6. Implementar testes RLS com dois utilizadores e integrá-los em CI.
7. Corrigir recuperação de palavra-passe, política de palavras-passe e MFA opcional.
8. Criar política de privacidade, termos, retenção e procedimento de incidentes.
9. Adicionar cabeçalhos de segurança e CSP na Vercel.
10. Registar eventos críticos (emissão, alteração de estado, acesso público).

## 12. Limites

Esta análise é estática. Não foram feitos testes de penetração, fuzzing, análise de
dependências em runtime, revisão de configuração do Supabase, testes de RLS ou auditoria
de infraestrutura. `npm audit` reporta uma vulnerabilidade alta em `image-size` via
`pptxgenjs`, dependência usada apenas na geração de materiais e não no runtime da
aplicação. A ausência de evidência não deve ser lida como ausência de risco.
