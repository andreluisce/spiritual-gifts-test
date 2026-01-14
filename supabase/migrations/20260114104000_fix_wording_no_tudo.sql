-- Adjust wording to remove "tudo/estudo" false positives and keep neutral tone

BEGIN;

-- ID 135 (A_PROPHECY) - replace "estudo" to avoid regex on "tudo"
UPDATE question_pool
SET text = 'Ao preparar uma mensagem, reviso um esboço que combina pesquisa e oração.'
WHERE id = 135;

UPDATE question_translations
SET text = 'Ao preparar uma mensagem, reviso um esboço que combina pesquisa e oração.'
WHERE question_id = 135 AND locale = 'pt';

UPDATE question_translations
SET text = 'When preparing a message, I review an outline that blends research and prayer.'
WHERE question_id = 135 AND locale = 'en';

UPDATE question_translations
SET text = 'Al preparar un mensaje, reviso un esquema que combina investigación y oración.'
WHERE question_id = 135 AND locale = 'es';

-- ID 56 (C_TEACHING) - avoid "estudos" / overly absolute wording
UPDATE question_pool
SET text = 'Incluo exemplos e casos práticos que deixam claro o princípio bíblico.'
WHERE id = 56;

UPDATE question_translations
SET text = 'Incluo exemplos e casos práticos que deixam claro o princípio bíblico.'
WHERE question_id = 56 AND locale = 'pt';

UPDATE question_translations
SET text = 'I include examples and practical cases that make the biblical principle clear.'
WHERE question_id = 56 AND locale = 'en';

UPDATE question_translations
SET text = 'Incluyo ejemplos y casos prácticos que dejan claro el principio bíblico.'
WHERE question_id = 56 AND locale = 'es';

COMMIT;
