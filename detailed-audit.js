const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://vttkurdzstlkybojigry.supabase.co',
  'sb_secret_yZEOQQ5Xa8H7XIriIlak6A_x-cU153n'
);

async function detailedAudit() {
  const { data: questions, error } = await supabase
    .from('question_pool')
    .select('id, gift, source, pclass, reverse_scored, text')
    .eq('is_active', true)
    .order('gift')
    .order('id');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== ANÁLISE DETALHADA: PERGUNTAS DANGER E MISUNDERSTANDING ===\n');

  const dangerQuestions = questions.filter(q => q.source === 'DANGER' && q.reverse_scored);
  const misQuestions = questions.filter(q => q.source === 'MISUNDERSTANDING' && q.reverse_scored);

  console.log(`\nTotal de perguntas DANGER reverse-scored: ${dangerQuestions.length}`);
  console.log(`Total de perguntas MISUNDERSTANDING reverse-scored: ${misQuestions.length}\n`);

  console.log('=== PERGUNTAS DANGER (reverse-scored) ===');
  console.log('Estas perguntas descrevem comportamentos NEGATIVOS que REDUZEM o score quando a pessoa concorda\n');

  const byGift = {};
  dangerQuestions.forEach(q => {
    if (!byGift[q.gift]) byGift[q.gift] = [];
    byGift[q.gift].push(q);
  });

  Object.keys(byGift).sort().forEach(gift => {
    console.log(`\n--- ${gift} ---`);
    byGift[gift].forEach(q => {
      console.log(`ID ${q.id} [${q.pclass}]: ${q.text}`);
    });
  });

  console.log('\n\n=== PERGUNTAS MISUNDERSTANDING (reverse-scored) ===');
  console.log('Estas perguntas descrevem mal-entendidos que REDUZEM o score quando a pessoa concorda\n');

  const byGiftMis = {};
  misQuestions.forEach(q => {
    if (!byGiftMis[q.gift]) byGiftMis[q.gift] = [];
    byGiftMis[q.gift].push(q);
  });

  Object.keys(byGiftMis).sort().forEach(gift => {
    console.log(`\n--- ${gift} ---`);
    byGiftMis[gift].forEach(q => {
      console.log(`ID ${q.id} [${q.pclass}]: ${q.text}`);
    });
  });

  console.log('\n\n=== PROBLEMAS IDENTIFICADOS ===\n');
  console.log('1. CONFUSÃO NA INTERPRETAÇÃO:');
  console.log('   - Perguntas negativas com reverse scoring são cognitivamente complexas');
  console.log('   - Usuário precisa pensar: "Se eu concordo com isso negativo, meu score diminui"');
  console.log('   - Isso pode gerar respostas defensivas ou socialmente desejáveis');
  console.log('');
  console.log('2. VIÉS DE DESEJABILIDADE SOCIAL:');
  console.log('   - Ninguém quer admitir defeitos como "centralizo decisões" ou "sinto-me superior"');
  console.log('   - Pessoas tendem a subestimar comportamentos negativos (auto-proteção)');
  console.log('   - Resultado: scores inflacionados e menos precisos');
  console.log('');
  console.log('3. FALTA DE CONTEXTO NEUTRO:');
  console.log('   - Não há perguntas neutras/descritivas para balancear');
  console.log('   - Todas as perguntas DANGER são fortemente negativas');
  console.log('   - Todas as perguntas QUALITY são fortemente positivas');
  console.log('');
  console.log('4. PROBLEMAS COM REVERSE SCORING:');
  console.log('   - 42 de 133 perguntas (32%) usam reverse scoring');
  console.log('   - TODAS as perguntas DANGER e MISUNDERSTANDING são reverse-scored');
  console.log('   - Isso pode confundir usuários e distorcer resultados');

  console.log('\n\n=== ANÁLISE POR DOM (DANGER) ===\n');
  Object.keys(byGift).sort().forEach(gift => {
    const dangers = byGift[gift];
    console.log(`${gift}:`);
    dangers.forEach(q => {
      const wordCount = q.text.split(' ').length;
      const hasAbsolute = /sempre|nunca|jamais|todo|nenhum/i.test(q.text);
      const hasNegativeEmotion = /superior|mártir|culpa|vergonha|erro|falho/i.test(q.text);
      console.log(`  ID ${q.id}: ${wordCount} palavras | Absoluto: ${hasAbsolute} | Emocional: ${hasNegativeEmotion}`);
    });
  });
}

detailedAudit();
