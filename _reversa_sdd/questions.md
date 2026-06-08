# Perguntas para Validação — Pizza Lopez

> Gerado pelo Revisor em 2026-06-08
> Preencha o campo **Resposta** de cada pergunta e me avise (digite `reversa`).

---

## Q-01 — Acesso à rota /admin (SEGURANÇA CRÍTICA)

**Unit:** `admin/`
**Severidade:** 🔴 Crítica — bloqueia reimplementação segura

**Contexto:** A rota `/admin` atualmente permite acesso a qualquer usuário autenticado. Não existe campo `role` em `profiles` nem nenhum mecanismo de autorização. O painel expõe gestão completa de pedidos, produtos, cupons e avaliações.

**Pergunta:** Como deve funcionar o controle de acesso ao admin?

- [ ] a) Adicionar campo `role` em `profiles` (`user` | `admin`) e proteger via middleware
- [ ] b) Manter sem RBAC — acesso por "security through obscurity" (URL não divulgada)
- [ ] c) Autenticação separada (senha fixa de admin, sem conta Supabase)
- [ ] d) Outro: _______________

**Resposta:** _(preencher)_

---

## Q-02 — Integração de pagamento

**Unit:** `checkout/`, `pedido/`
**Severidade:** 🔴 Crítica — `payment_status` nunca muda de "pending"

**Contexto:** O sistema aceita os métodos Pix, Dinheiro e Cartão, mas **nenhuma integração real de pagamento foi implementada**. O campo `payment_status` é inserido como `"pending"` e nunca atualizado. O commit `e677cc0` menciona os métodos mas não há gateway configurado.

**Pergunta:** A integração de pagamento é necessária agora ou o modelo atual (pagar na entrega / confirmar manualmente) é intencional?

- [ ] a) Intencional — pagamento confirmado manualmente pelo entregador (dinheiro/pix confirmado na entrega)
- [ ] b) Precisa de integração de gateway (qual? Pagar.me / Stripe / MercadoPago / outro)
- [ ] c) Pix automático via API do Banco Central (PIX API)
- [ ] d) Outro: _______________

**Resposta:** _(preencher)_

---

## Q-03 — Feature "meio a meio" (mencionada no Git)

**Unit:** `cardapio/`, `checkout/`
**Severidade:** 🟡 Média — feature mencionada mas ausente no código atual

**Contexto:** O commit `e677cc0` lista "meio a meio" entre as features entregues, mas nenhum código para essa funcionalidade foi encontrado no estado atual do repositório. Pode ter sido removida, nunca terminada ou estar em outro branch.

**Pergunta:** A feature "meio a meio" deve existir no sistema?

- [ ] a) Sim — deve ser implementada (pizza com dois sabores diferentes)
- [ ] b) Não — foi descartada
- [ ] c) Estava em outro branch e será reintegrada depois
- [ ] d) Não sei

**Resposta:** _(preencher)_

---

## Q-04 — Taxa de entrega variável

**Unit:** `checkout/`
**Severidade:** 🟡 Média — taxa hardcoded pode ser limitação operacional

**Contexto:** `DELIVERY_FEE = 6.99` é uma constante definida diretamente no componente `routes/checkout.tsx`. Não há lógica de variação por zona, distância ou valor de pedido.

**Pergunta:** A taxa de entrega deve ser configurável?

- [ ] a) Não — R$ 6,99 fixo é suficiente
- [ ] b) Sim — deve vir de uma tabela de configurações no banco
- [ ] c) Sim — deve variar por região/distância (requer integração de CEP ou mapa)
- [ ] d) Frete grátis acima de determinado valor

**Resposta:** _(preencher)_

---

## Q-05 — Notificação de status ao cliente

**Unit:** `pedido/`
**Severidade:** 🟡 Média — cliente não é notificado quando status muda

**Contexto:** O sistema implementa notificação em tempo real **apenas para o admin** (canal `admin-orders` via Realtime). O cliente que está em `/pedido/:id` não recebe atualização automática de status — precisa recarregar a página manualmente.

**Pergunta:** O cliente deve receber atualizações em tempo real do status do pedido?

- [ ] a) Sim — implementar Supabase Realtime na página `/pedido/:id`
- [ ] b) Sim — enviar notificação push (requer PWA/service worker)
- [ ] c) Sim — enviar SMS ou WhatsApp (requer integração externa)
- [ ] d) Não — atualização manual é suficiente

**Resposta:** _(preencher)_
