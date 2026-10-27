-- Inserir Empresa de Teste
INSERT INTO empresas (nome, email, utilizador_id) 
VALUES ('Orbit3D Prints', 'demo@orbit3d.pt', '00000000-0000-0000-0000-000000000000');

-- Inserir Encomenda de Teste
INSERT INTO encomendas (empresa_id, nome_comprador, token_publico, estado, previsao_entrega)
VALUES ((SELECT id FROM empresas WHERE email='demo@orbit3d.pt'), 'João Silva', 'xyz1234567890abcdefghijklm', 'A imprimir', '2026-11-15');

-- Inserir Peça
INSERT INTO itens_encomenda (encomenda_id, nome_peca, material, cor)
VALUES ((SELECT id FROM encomendas WHERE token_publico='xyz1234567890abcdefghijklm'), 'Suporte Monitor', 'PLA', 'Preto');
