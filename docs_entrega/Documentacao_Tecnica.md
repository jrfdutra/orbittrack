# Documentação Técnica - OrbitTrack

## 1. Introdução
O OrbitTrack é uma plataforma SaaS para oficinas de impressão 3D.

## 2. Base de Dados (Esquema)
- Tabela `empresas`: Dados do vendedor (Multi-tenant).
- Tabela `encomendas`: Rastreabilidade e estados.
- Tabela `itens_encomenda`: Especificações 3D.

## 3. Segurança (RLS)
- O acesso a qualquer encomenda é validado via `empresa_id` na base de dados.
- O portal público utiliza `token_publico` com entropia elevada.

## 4. Regras de Negócio
- Cálculos de totais realizados via `NUMERIC(10,2)`.
- O histórico de estados é imutável após criação.
