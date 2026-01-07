const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://vttkurdzstlkybojigry.supabase.co',
  'sb_secret_yZEOQQ5Xa8H7XIriIlak6A_x-cU153n'
);

async function generateQuestionsTable() {
  console.log('Buscando perguntas do banco de dados...\n');

  const { data: questions, error } = await supabase
    .from('question_pool')
    .select('*')
    .order('gift')
    .order('id');

  if (error) {
    console.error('Erro:', error);
    return;
  }

  console.log(`Total de perguntas encontradas: ${questions.length}\n`);

  // Criar documento Markdown
  let markdown = `# Tabela Completa de Perguntas do Quiz de Dons Espirituais

**Data de Geração**: ${new Date().toLocaleString('pt-BR')}
**Total de Perguntas**: ${questions.length}

---

## Índice
- [Resumo por Dom](#resumo-por-dom)
- [Tabela Completa](#tabela-completa)
- [Perguntas por Dom](#perguntas-por-dom)
- [Análise de Scoring](#análise-de-scoring)

---

## Resumo por Dom

`;

  // Agrupar por dom
  const byGift = {};
  questions.forEach(q => {
    if (!byGift[q.gift]) {
      byGift[q.gift] = [];
    }
    byGift[q.gift].push(q);
  });

  // Criar resumo
  markdown += '| Dom | Total | QUALITY | CHARACTERISTIC | DANGER | MISUNDERSTANDING | OTHER | Reverse-Scored |\n';
  markdown += '|-----|-------|---------|----------------|--------|------------------|-------|----------------|\n';

  Object.keys(byGift).sort().forEach(gift => {
    const giftQuestions = byGift[gift];
    const quality = giftQuestions.filter(q => q.source === 'QUALITY').length;
    const char = giftQuestions.filter(q => q.source === 'CHARACTERISTIC').length;
    const danger = giftQuestions.filter(q => q.source === 'DANGER').length;
    const mis = giftQuestions.filter(q => q.source === 'MISUNDERSTANDING').length;
    const other = giftQuestions.filter(q => q.source === 'OTHER').length;
    const reverse = giftQuestions.filter(q => q.reverse_scored).length;

    markdown += `| ${gift} | ${giftQuestions.length} | ${quality} | ${char} | ${danger} | ${mis} | ${other} | ${reverse} |\n`;
  });

  markdown += '\n---\n\n## Tabela Completa\n\n';
  markdown += '| ID | Dom | Categoria | Classe | Reverse | Peso | Ativa | Texto |\n';
  markdown += '|----|-----|-----------|--------|---------|------|-------|-------|\n';

  questions.forEach(q => {
    const reverseIcon = q.reverse_scored ? '🔄' : '→';
    const activeIcon = q.is_active ? '✅' : '❌';
    markdown += `| ${q.id} | ${q.gift} | ${q.source} | ${q.pclass} | ${reverseIcon} | ${q.default_weight} | ${activeIcon} | ${q.text} |\n`;
  });

  markdown += '\n---\n\n## Perguntas por Dom\n\n';

  Object.keys(byGift).sort().forEach(gift => {
    markdown += `### ${gift}\n\n`;

    const giftQuestions = byGift[gift];

    // Agrupar por categoria
    const categories = ['QUALITY', 'CHARACTERISTIC', 'DANGER', 'MISUNDERSTANDING', 'OTHER'];

    categories.forEach(category => {
      const categoryQuestions = giftQuestions.filter(q => q.source === category);

      if (categoryQuestions.length > 0) {
        markdown += `#### ${category} (${categoryQuestions.length} perguntas)\n\n`;

        categoryQuestions.forEach(q => {
          const reverseText = q.reverse_scored ? ' **[REVERSE SCORING]**' : '';
          markdown += `**${q.id}.** [${q.pclass}] ${q.text}${reverseText}\n`;
          markdown += `   - Peso: ${q.default_weight}\n`;
          markdown += `   - Ativa: ${q.is_active ? 'Sim' : 'Não'}\n\n`;
        });
      }
    });

    markdown += '\n---\n\n';
  });

  // Análise de Scoring
  markdown += '## Análise de Scoring\n\n';

  markdown += '### Distribuição de Reverse Scoring\n\n';
  markdown += '| Categoria | Total | Reverse-Scored | % Reverse |\n';
  markdown += '|-----------|-------|----------------|----------|\n';

  const categories = ['QUALITY', 'CHARACTERISTIC', 'DANGER', 'MISUNDERSTANDING', 'OTHER'];
  categories.forEach(category => {
    const catQuestions = questions.filter(q => q.source === category);
    const reverseCount = catQuestions.filter(q => q.reverse_scored).length;
    const percentage = catQuestions.length > 0 ? ((reverseCount / catQuestions.length) * 100).toFixed(1) : 0;

    markdown += `| ${category} | ${catQuestions.length} | ${reverseCount} | ${percentage}% |\n`;
  });

  markdown += '\n### Distribuição de Pesos (Weight Class)\n\n';
  markdown += '| Classe | Total | % do Total |\n';
  markdown += '|--------|-------|------------|\n';

  const p1 = questions.filter(q => q.pclass === 'P1').length;
  const p2 = questions.filter(q => q.pclass === 'P2').length;
  const p3 = questions.filter(q => q.pclass === 'P3').length;
  const total = questions.length;

  markdown += `| P1 | ${p1} | ${((p1/total)*100).toFixed(1)}% |\n`;
  markdown += `| P2 | ${p2} | ${((p2/total)*100).toFixed(1)}% |\n`;
  markdown += `| P3 | ${p3} | ${((p3/total)*100).toFixed(1)}% |\n`;

  markdown += '\n### Como Funciona o Scoring\n\n';
  markdown += `#### Scoring Normal (→)\n`;
  markdown += `- **Não me identifico**: 0 pontos\n`;
  markdown += `- **Identifico-me pouco**: 1 ponto\n`;
  markdown += `- **Identifico-me bem**: 2 pontos\n`;
  markdown += `- **Identifico-me muito**: 3 pontos\n\n`;

  markdown += `#### Reverse Scoring (🔄)\n`;
  markdown += `- **Não me identifico**: 3 pontos\n`;
  markdown += `- **Identifico-me pouco**: 2 pontos\n`;
  markdown += `- **Identifico-me bem**: 1 ponto\n`;
  markdown += `- **Identifico-me muito**: 0 pontos\n\n`;

  markdown += `#### Pesos por Classe\n`;
  markdown += `- **P1**: Peso 1.0 (padrão)\n`;
  markdown += `- **P2**: Peso 1.0 (padrão)\n`;
  markdown += `- **P3**: Peso 1.0 (padrão)\n\n`;

  markdown += `*Nota: Atualmente todos os pesos são 1.0, mas o sistema suporta pesos diferentes por pergunta.*\n\n`;

  // Criar também CSV
  let csv = 'ID,Dom,Categoria,Classe,Reverse_Scored,Peso,Ativa,Texto\n';
  questions.forEach(q => {
    const text = q.text.replace(/"/g, '""'); // Escape quotes
    csv += `${q.id},${q.gift},${q.source},${q.pclass},${q.reverse_scored},${q.default_weight},${q.is_active},"${text}"\n`;
  });

  // Salvar arquivos
  fs.writeFileSync('QUESTIONS_TABLE.md', markdown);
  fs.writeFileSync('QUESTIONS_TABLE.csv', csv);

  console.log('✅ Arquivos gerados com sucesso:');
  console.log('   - QUESTIONS_TABLE.md (Markdown com tabelas formatadas)');
  console.log('   - QUESTIONS_TABLE.csv (CSV para importar no Excel)');
  console.log('\n📊 Estatísticas:');
  console.log(`   - Total de perguntas: ${questions.length}`);
  console.log(`   - Perguntas ativas: ${questions.filter(q => q.is_active).length}`);
  console.log(`   - Perguntas reverse-scored: ${questions.filter(q => q.reverse_scored).length}`);
  console.log(`   - Dons únicos: ${Object.keys(byGift).length}`);
}

generateQuestionsTable();
