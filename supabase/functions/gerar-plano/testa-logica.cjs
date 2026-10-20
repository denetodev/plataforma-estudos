// Teste de fumaça da lógica pura da Edge Function gerar-plano (sem Deno): extrai e executa
// lerPedido / extrairJson / validarPlano com entradas boas e hostis.
const fs = require('fs');
const assert = require('assert');
const esbuild = require('esbuild');

let src = fs.readFileSync(
  require('path').join(__dirname, 'index.ts'),
  'utf8',
);
src = src.replace(/^import .*$/gm, '');
src = src.slice(0, src.indexOf('Deno.serve('));
src += '\nmodule.exports = { lerPedido, extrairJson, validarPlano, ErroIA };';
const js = esbuild.transformSync(src, { loader: 'ts', format: 'cjs' }).code;
const m = { exports: {} };
new Function('module', 'exports', 'Deno', js)(m, m.exports, { env: { get: () => undefined } });
const { lerPedido, extrairJson, validarPlano, ErroIA } = m.exports;

// --- lerPedido
const ok = lerPedido({ pedido: 'Quero estudar português e matemática', semanas: 3, horasPorDia: 2.5, diasEstudo: ['qua', 'seg', 'xyz', 'seg'] });
assert.deepStrictEqual(ok.diasEstudo, ['seg', 'qua'], 'dedup, filtra inválidos e ordena');
assert.strictEqual(ok.semanas, 3);
assert.throws(() => lerPedido({ pedido: 'curto' }), ErroIA);
assert.throws(() => lerPedido({ pedido: 'x'.repeat(10), semanas: 9 }), ErroIA);
assert.throws(() => lerPedido({ pedido: 'x'.repeat(10), horasPorDia: 0 }), ErroIA);
assert.throws(() => lerPedido({ pedido: 'x'.repeat(10), diasEstudo: ['abc'] }), ErroIA);
assert.throws(() => lerPedido({ pedido: 'x'.repeat(10), material: 'm'.repeat(12001) }), ErroIA);
const padrao = lerPedido({ pedido: 'x'.repeat(10) });
assert.deepStrictEqual([padrao.semanas, padrao.horasPorDia, padrao.diasEstudo.length], [4, 2, 5]);

// --- extrairJson
assert.deepStrictEqual(extrairJson('{"a":1}'), { a: 1 });
assert.deepStrictEqual(extrairJson('```json\n{"a":1}\n```'), { a: 1 });
assert.deepStrictEqual(extrairJson('Aqui está: {"a":1} fim'), { a: 1 });
assert.strictEqual(extrairJson('sem json'), null);
assert.strictEqual(extrairJson('{quebrado'), null);

// --- validarPlano
const pedido = lerPedido({ pedido: 'x'.repeat(10), semanas: 2 });
const bom = {
  semanas: [
    {
      label: 'Semana 1 · Base',
      dias: [
        {
          label: 'Segunda',
          dia_semana: 'seg',
          itens: [
            { descricao: '  Ler   cap. 1 ', materia: 'Português', tipo: 'leitura', duracao_min: 50.4, fonte: null, paginas: '3-15', tags: ['Pomodoro', 'pomodoro', ''] },
            { descricao: 'Questões', materia: null, tipo: 'tipo-inventado', duracao_min: 99999, fonte: 'APCON', paginas: null, tags: 'não-é-array' },
            { descricao: '', materia: 'Vazio' },
            { materia: 'sem descricao' },
          ],
        },
        { label: 'Terça', dia_semana: 'xxx', itens: [] },
      ],
    },
    { label: 'Semana vazia', dias: [] },
    { label: 'Semana 3 extra', dias: [{ label: 'Quarta', dia_semana: 'qua', itens: [{ descricao: 'Item' }] }] },
  ],
};
const r = validarPlano(bom, pedido);
assert.strictEqual(r.semanas.length, 2, 'descarta semana vazia e respeita o limite pedido (2)');
const itens = r.semanas[0].dias[0].itens;
assert.strictEqual(itens.length, 2, 'descarta itens sem descrição');
assert.strictEqual(itens[0].descricao, 'Ler cap. 1');
assert.strictEqual(itens[0].duracao_min, 50);
assert.deepStrictEqual(itens[0].tags, ['pomodoro']);
assert.strictEqual(itens[1].tipo, null, 'tipo inventado vira null');
assert.strictEqual(itens[1].duracao_min, null, 'duração absurda vira null');
assert.strictEqual(itens[1].tags, null);
assert.strictEqual(r.semanas[0].dias.length, 1, 'dia sem itens é descartado');
assert.strictEqual(r.semanas[1].dias[0].dia_semana, 'qua');
assert.strictEqual(validarPlano({ semanas: [] }, pedido), null);
assert.strictEqual(validarPlano({ semanas: 'x' }, pedido), null);
assert.strictEqual(validarPlano(null, pedido), null);
assert.strictEqual(validarPlano('texto', pedido), null);

// campos hostis: HTML/strings enormes são apenas truncados (o app renderiza com escape do Angular)
const hostil = validarPlano(
  { semanas: [{ label: 'x'.repeat(500), dias: [{ label: '<img onerror=alert(1)>', dia_semana: 'seg', itens: [{ descricao: 'y'.repeat(1000) }] }] }] },
  pedido,
);
assert.strictEqual(hostil.semanas[0].label.length, 100);
assert.strictEqual(hostil.semanas[0].dias[0].itens[0].descricao.length, 300);

console.log('gerar-plano: todos os testes de lógica passaram');
