const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://vttkurdzstlkybojigry.supabase.co',
  'sb_secret_yZEOQQ5Xa8H7XIriIlak6A_x-cU153n'
);

async function auditQuestions() {
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

  const byGift = {};
  const reverseScored = [];
  const extremeWords = [];
  const dangerMisunderstanding = [];

  const negativeWords = ['nunca', 'jamais', 'sempre', 'todo', 'nenhum', 'impossível', 'incapaz', 'falho', 'erro', 'culpa', 'vergonha', 'mártir', 'superior', 'desmereço', 'ignoro', 'centralizo', 'imponho'];
  const positiveWords = ['sempre', 'perfeito', 'excelente', 'superior', 'melhor', 'maior', 'todo', 'jamais'];

  questions.forEach(q => {
    if (!byGift[q.gift]) {
      byGift[q.gift] = [];
    }
    byGift[q.gift].push(q);

    if (q.reverse_scored) {
      reverseScored.push(q);
    }

    if (q.source === 'DANGER' || q.source === 'MISUNDERSTANDING') {
      dangerMisunderstanding.push(q);
    }

    const text = q.text.toLowerCase();
    const hasNegative = negativeWords.some(word => text.includes(word));
    const hasPositive = positiveWords.some(word => text.includes(word));

    if (hasNegative || hasPositive) {
      extremeWords.push({
        id: q.id,
        gift: q.gift,
        source: q.source,
        pclass: q.pclass,
        reverse: q.reverse_scored,
        text: q.text,
        bias: hasNegative ? 'NEGATIVE' : 'POSITIVE'
      });
    }
  });

  console.log('=== RESUMO DA AUDITORIA ===');
  console.log('Total de perguntas:', questions.length);
  console.log('Perguntas reverse-scored:', reverseScored.length);
  console.log('Perguntas DANGER/MISUNDERSTANDING:', dangerMisunderstanding.length);
  console.log('Perguntas com viés extremo:', extremeWords.length);
  console.log('');

  console.log('=== DISTRIBUIÇÃO POR DOM ===');
  Object.keys(byGift).sort().forEach(gift => {
    const giftQuestions = byGift[gift];
    const reverseCount = giftQuestions.filter(q => q.reverse_scored).length;
    const dangerCount = giftQuestions.filter(q => q.source === 'DANGER').length;
    const misCount = giftQuestions.filter(q => q.source === 'MISUNDERSTANDING').length;
    const qualityCount = giftQuestions.filter(q => q.source === 'QUALITY').length;
    const charCount = giftQuestions.filter(q => q.source === 'CHARACTERISTIC').length;

    console.log(`${gift}: ${giftQuestions.length} perguntas`);
    console.log(`  - QUALITY: ${qualityCount}, CHARACTERISTIC: ${charCount}`);
    console.log(`  - DANGER: ${dangerCount}, MISUNDERSTANDING: ${misCount}`);
    console.log(`  - Reverse-scored: ${reverseCount}`);
  });
  console.log('');

  console.log('=== ANÁLISE DE VIÉS POR CATEGORIA ===');
  const bySource = {};
  extremeWords.forEach(q => {
    if (!bySource[q.source]) {
      bySource[q.source] = { total: 0, negative: 0, positive: 0 };
    }
    bySource[q.source].total++;
    if (q.bias === 'NEGATIVE') bySource[q.source].negative++;
    else bySource[q.source].positive++;
  });

  Object.keys(bySource).forEach(source => {
    const stats = bySource[source];
    console.log(`${source}: ${stats.total} com viés (${stats.negative} negativo, ${stats.positive} positivo)`);
  });
  console.log('');

  console.log('=== PERGUNTAS COM VIÉS EXTREMO (todas) ===');
  extremeWords.forEach(q => {
    console.log('');
    console.log(`ID: ${q.id} | Dom: ${q.gift} | Tipo: ${q.source} | Classe: ${q.pclass} | Reverse: ${q.reverse} | Viés: ${q.bias}`);
    console.log(`Texto: ${q.text}`);
  });

  console.log('');
  console.log(`\n=== CONCLUSÃO ===`);
  console.log(`Total de perguntas analisadas: ${questions.length}`);
  console.log(`Perguntas com viés identificado: ${extremeWords.length} (${Math.round(extremeWords.length/questions.length*100)}%)`);
  console.log(`\nProblemas identificados:`);
  console.log(`1. Perguntas DANGER/MISUNDERSTANDING com reverse scoring podem confundir`);
  console.log(`2. Uso de palavras absolutas (sempre, nunca, todo) cria respostas enviesadas`);
  console.log(`3. Perguntas negativas podem gerar resistência psicológica`);
}

auditQuestions();
