-- ================================================
-- ADD MINISTRY TRANSLATIONS (ENGLISH & SPANISH)
-- ================================================

-- ================================================
-- MINISTRY RECOMMENDATIONS TRANSLATIONS
-- ================================================

-- English Ministry Names
INSERT INTO ministry_recommendations (ministry_key, locale, ministry_name, description) VALUES
('youth_ministry', 'en', 'Youth Ministry', 'Specific work with teenagers and young adults'),
('evangelism_missions', 'en', 'Evangelism and Missions', 'Sharing the gospel and expanding the Kingdom'),
('intercessory_prayer', 'en', 'Intercessory Prayer Ministry', 'Intercessory prayer and spiritual warfare'),
('childrens_ministry', 'en', 'Children''s Ministry', 'Education and care of children'),
('worship_music', 'en', 'Worship and Music', 'Music ministry and artistic expression'),
('discipleship', 'en', 'Discipleship', 'Formation and accompaniment of new converts'),
('social_ministry', 'en', 'Social Ministry and Deaconate', 'Practical service and assistance to community needs'),
('teaching_preaching', 'en', 'Teaching and Preaching', 'Ministry focused on teaching the Word and expository preaching'),
('counseling_pastoral', 'en', 'Counseling and Pastoral Care', 'Ministry of care, counseling and restoration'),
('leadership_administration', 'en', 'Leadership and Administration', 'Ministry coordination and organizational leadership');

-- Spanish Ministry Names
INSERT INTO ministry_recommendations (ministry_key, locale, ministry_name, description) VALUES
('youth_ministry', 'es', 'Ministerio Juvenil', 'Trabajo específico con adolescentes y jóvenes adultos'),
('evangelism_missions', 'es', 'Evangelismo y Misiones', 'Compartir el evangelio y expandir el Reino'),
('intercessory_prayer', 'es', 'Ministerio de Intercesión', 'Oración intercesora y guerra espiritual'),
('childrens_ministry', 'es', 'Ministerio Infantil', 'Educación y cuidado de niños'),
('worship_music', 'es', 'Alabanza y Música', 'Ministerio de música y expresión artística'),
('discipleship', 'es', 'Discipulado', 'Formación y acompañamiento de nuevos convertidos'),
('social_ministry', 'es', 'Ministerio Social y Diaconado', 'Servicio práctico y asistencia a las necesidades de la comunidad'),
('teaching_preaching', 'es', 'Enseñanza y Predicación', 'Ministerio enfocado en la enseñanza de la Palabra y predicación expositiva'),
('counseling_pastoral', 'es', 'Consejería y Cuidado Pastoral', 'Ministerio de cuidado, consejería y restauración'),
('leadership_administration', 'es', 'Liderazgo y Administración', 'Coordinación de ministerios y liderazgo organizacional');

-- ================================================
-- MINISTRY RESPONSIBILITIES TRANSLATIONS
-- ================================================

-- YOUTH MINISTRY - English
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('youth_ministry', 'en', 'Lead youth meetings and studies', 1),
('youth_ministry', 'en', 'Organize retreats and camps', 2),
('youth_ministry', 'en', 'Counsel young people in their decisions', 3),
('youth_ministry', 'en', 'Develop integration activities', 4);

-- YOUTH MINISTRY - Spanish
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('youth_ministry', 'es', 'Liderar reuniones y estudios juveniles', 1),
('youth_ministry', 'es', 'Organizar retiros y campamentos', 2),
('youth_ministry', 'es', 'Aconsejar a jóvenes en sus decisiones', 3),
('youth_ministry', 'es', 'Desarrollar actividades de integración', 4);

-- EVANGELISM & MISSIONS - English
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('evangelism_missions', 'en', 'Share the gospel in the community', 1),
('evangelism_missions', 'en', 'Organize evangelistic campaigns', 2),
('evangelism_missions', 'en', 'Support and participate in missionary trips', 3),
('evangelism_missions', 'en', 'Train others in evangelization', 4);

-- EVANGELISM & MISSIONS - Spanish
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('evangelism_missions', 'es', 'Compartir el evangelio en la comunidad', 1),
('evangelism_missions', 'es', 'Organizar campañas evangelísticas', 2),
('evangelism_missions', 'es', 'Apoyar y participar en viajes misioneros', 3),
('evangelism_missions', 'es', 'Entrenar a otros en evangelización', 4);

-- INTERCESSORY PRAYER - English
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('intercessory_prayer', 'en', 'Lead prayer groups', 1),
('intercessory_prayer', 'en', 'Intercede for church needs', 2),
('intercessory_prayer', 'en', 'Organize vigils and prayer campaigns', 3),
('intercessory_prayer', 'en', 'Teach about prayer life', 4);

-- INTERCESSORY PRAYER - Spanish
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('intercessory_prayer', 'es', 'Liderar grupos de oración', 1),
('intercessory_prayer', 'es', 'Interceder por las necesidades de la iglesia', 2),
('intercessory_prayer', 'es', 'Organizar vigilias y campañas de oración', 3),
('intercessory_prayer', 'es', 'Enseñar sobre vida de oración', 4);

-- CHILDREN'S MINISTRY - English
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('childrens_ministry', 'en', 'Teach Bible stories to children', 1),
('childrens_ministry', 'en', 'Organize children''s programs and events', 2),
('childrens_ministry', 'en', 'Care for children''s safety and well-being', 3),
('childrens_ministry', 'en', 'Develop appropriate teaching materials', 4);

-- CHILDREN'S MINISTRY - Spanish
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('childrens_ministry', 'es', 'Enseñar historias bíblicas a los niños', 1),
('childrens_ministry', 'es', 'Organizar programas y eventos infantiles', 2),
('childrens_ministry', 'es', 'Cuidar la seguridad y bienestar de los niños', 3),
('childrens_ministry', 'es', 'Desarrollar material didáctico apropiado', 4);

-- WORSHIP & MUSIC - English
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('worship_music', 'en', 'Lead worship and praise moments', 1),
('worship_music', 'en', 'Select and prepare appropriate songs', 2),
('worship_music', 'en', 'Rehearse with the music team', 3),
('worship_music', 'en', 'Create genuine worship atmosphere', 4);

-- WORSHIP & MUSIC - Spanish
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('worship_music', 'es', 'Liderar momentos de alabanza y adoración', 1),
('worship_music', 'es', 'Seleccionar y preparar canciones apropiadas', 2),
('worship_music', 'es', 'Ensayar con el equipo de música', 3),
('worship_music', 'es', 'Crear ambiente de adoración genuina', 4);

-- DISCIPLESHIP - English
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('discipleship', 'en', 'Accompany new converts', 1),
('discipleship', 'en', 'Teach fundamentals of Christian faith', 2),
('discipleship', 'en', 'Develop mentoring relationships', 3),
('discipleship', 'en', 'Prepare discipleship materials', 4);

-- DISCIPLESHIP - Spanish
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('discipleship', 'es', 'Acompañar nuevos convertidos', 1),
('discipleship', 'es', 'Enseñar fundamentos de la fe cristiana', 2),
('discipleship', 'es', 'Desarrollar relaciones de mentoría', 3),
('discipleship', 'es', 'Preparar materiales de discipulado', 4);

-- SOCIAL MINISTRY - English
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('social_ministry', 'en', 'Organize social projects', 1),
('social_ministry', 'en', 'Distribute food and resources', 2),
('social_ministry', 'en', 'Church maintenance', 3),
('social_ministry', 'en', 'Support needy families', 4);

-- SOCIAL MINISTRY - Spanish
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('social_ministry', 'es', 'Organizar proyectos sociales', 1),
('social_ministry', 'es', 'Distribuir alimentos y recursos', 2),
('social_ministry', 'es', 'Mantenimiento de la iglesia', 3),
('social_ministry', 'es', 'Apoyar familias necesitadas', 4);

-- TEACHING & PREACHING - English
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('teaching_preaching', 'en', 'Prepare and deliver Bible studies', 1),
('teaching_preaching', 'en', 'Preach expository sermons', 2),
('teaching_preaching', 'en', 'Develop teaching materials', 3),
('teaching_preaching', 'en', 'Train other teachers', 4);

-- TEACHING & PREACHING - Spanish
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('teaching_preaching', 'es', 'Preparar y ministrar estudios bíblicos', 1),
('teaching_preaching', 'es', 'Predicar sermones expositivos', 2),
('teaching_preaching', 'es', 'Desarrollar materiales didácticos', 3),
('teaching_preaching', 'es', 'Entrenar a otros maestros', 4);

-- COUNSELING & PASTORAL CARE - English
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('counseling_pastoral', 'en', 'Offer biblical counseling', 1),
('counseling_pastoral', 'en', 'Hospital and home visitation', 2),
('counseling_pastoral', 'en', 'Care for people in crisis', 3),
('counseling_pastoral', 'en', 'Provide emotional support', 4);

-- COUNSELING & PASTORAL CARE - Spanish
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('counseling_pastoral', 'es', 'Ofrecer consejería bíblica', 1),
('counseling_pastoral', 'es', 'Visitación hospitalaria y domiciliar', 2),
('counseling_pastoral', 'es', 'Cuidar de personas en crisis', 3),
('counseling_pastoral', 'es', 'Proporcionar apoyo emocional', 4);

-- LEADERSHIP & ADMINISTRATION - English
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('leadership_administration', 'en', 'Coordinate ministry teams', 1),
('leadership_administration', 'en', 'Plan growth strategies', 2),
('leadership_administration', 'en', 'Develop leaders', 3),
('leadership_administration', 'en', 'Manage church resources', 4);

-- LEADERSHIP & ADMINISTRATION - Spanish
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('leadership_administration', 'es', 'Coordinar equipos ministeriales', 1),
('leadership_administration', 'es', 'Planificar estrategias de crecimiento', 2),
('leadership_administration', 'es', 'Desarrollar líderes', 3),
('leadership_administration', 'es', 'Gestionar recursos de la iglesia', 4);

-- ================================================
-- MINISTRY GROWTH AREAS TRANSLATIONS
-- ================================================

-- YOUTH MINISTRY - English
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('youth_ministry', 'en', 'Understand contemporary youth culture', 'Books on youth and culture', 1),
('youth_ministry', 'en', 'Develop mentoring skills', 'Mentoring and discipleship courses', 2),
('youth_ministry', 'en', 'Learn dynamics and cooperative games', 'Practical workshops', 3);

-- YOUTH MINISTRY - Spanish
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('youth_ministry', 'es', 'Entender la cultura juvenil contemporánea', 'Libros sobre juventud y cultura', 1),
('youth_ministry', 'es', 'Desarrollar habilidades de mentoría', 'Cursos de mentoría y discipulado', 2),
('youth_ministry', 'es', 'Aprender dinámicas y juegos cooperativos', 'Talleres prácticos', 3);

-- EVANGELISM & MISSIONS - English
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('evangelism_missions', 'en', 'Learn evangelization methods', 'Personal evangelism courses', 1),
('evangelism_missions', 'en', 'Study cultures and religions', 'Missiology books', 2),
('evangelism_missions', 'en', 'Develop cultural sensitivity', 'Intercultural experiences', 3);

-- EVANGELISM & MISSIONS - Spanish
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('evangelism_missions', 'es', 'Aprender métodos de evangelización', 'Cursos de evangelismo personal', 1),
('evangelism_missions', 'es', 'Estudiar culturas y religiones', 'Libros de misiología', 2),
('evangelism_missions', 'es', 'Desarrollar sensibilidad cultural', 'Experiencias interculturales', 3);

-- INTERCESSORY PRAYER - English
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('intercessory_prayer', 'en', 'Deepen personal prayer life', 'Books on prayer and intercession', 1),
('intercessory_prayer', 'en', 'Study spiritual warfare', 'Studies on spiritual battle', 2),
('intercessory_prayer', 'en', 'Develop sensitivity to the Spirit', 'Prayer and fasting retreats', 3);

-- INTERCESSORY PRAYER - Spanish
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('intercessory_prayer', 'es', 'Profundizar vida de oración personal', 'Libros sobre oración e intercesión', 1),
('intercessory_prayer', 'es', 'Estudiar guerra espiritual', 'Estudios sobre batalla espiritual', 2),
('intercessory_prayer', 'es', 'Desarrollar sensibilidad al Espíritu', 'Retiros de oración y ayuno', 3);

-- CHILDREN'S MINISTRY - English
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('childrens_ministry', 'en', 'Study child pedagogy', 'Children''s Christian education courses', 1),
('childrens_ministry', 'en', 'Learn storytelling techniques', 'Children''s communication workshops', 2),
('childrens_ministry', 'en', 'Develop creativity in activities', 'Arts and recreation resources', 3);

-- CHILDREN'S MINISTRY - Spanish
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('childrens_ministry', 'es', 'Estudiar pedagogía infantil', 'Cursos de educación cristiana infantil', 1),
('childrens_ministry', 'es', 'Aprender técnicas de narración de historias', 'Talleres de comunicación infantil', 2),
('childrens_ministry', 'es', 'Desarrollar creatividad en actividades', 'Recursos de artes y recreación', 3);

-- WORSHIP & MUSIC - English
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('worship_music', 'en', 'Develop musical skills', 'Music and singing lessons', 1),
('worship_music', 'en', 'Study worship theology', 'Books on praise and worship', 2),
('worship_music', 'en', 'Learn team leadership', 'Ministry leadership workshops', 3);

-- WORSHIP & MUSIC - Spanish
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('worship_music', 'es', 'Desarrollar habilidades musicales', 'Clases de música y canto', 1),
('worship_music', 'es', 'Estudiar teología de la adoración', 'Libros sobre alabanza y adoración', 2),
('worship_music', 'es', 'Aprender liderazgo de equipo', 'Talleres de liderazgo ministerial', 3);

-- DISCIPLESHIP - English
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('discipleship', 'en', 'Deepen biblical knowledge', 'Basic theology courses', 1),
('discipleship', 'en', 'Develop mentoring skills', 'Counseling training', 2),
('discipleship', 'en', 'Learn discipleship methods', 'Effective discipleship materials', 3);

-- DISCIPLESHIP - Spanish
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('discipleship', 'es', 'Profundizar conocimiento bíblico', 'Cursos de teología básica', 1),
('discipleship', 'es', 'Desarrollar habilidades de mentoría', 'Entrenamiento en consejería', 2),
('discipleship', 'es', 'Aprender métodos de discipulado', 'Materiales de discipulado eficaz', 3);

-- SOCIAL MINISTRY - English
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('social_ministry', 'en', 'Develop practical skills', 'Technical courses and workshops', 1),
('social_ministry', 'en', 'Study Christian social responsibility', 'Books on integral mission', 2),
('social_ministry', 'en', 'Learn resource management', 'Project management courses', 3);

-- SOCIAL MINISTRY - Spanish
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('social_ministry', 'es', 'Desarrollar habilidades prácticas', 'Cursos técnicos y talleres', 1),
('social_ministry', 'es', 'Estudiar responsabilidad social cristiana', 'Libros sobre misión integral', 2),
('social_ministry', 'es', 'Aprender gestión de recursos', 'Cursos de administración de proyectos', 3);

-- TEACHING & PREACHING - English
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('teaching_preaching', 'en', 'Deepen biblical knowledge', 'Advanced biblical studies', 1),
('teaching_preaching', 'en', 'Develop communication skills', 'Public speaking courses', 2),
('teaching_preaching', 'en', 'Practice hermeneutics', 'Biblical interpretation workshops', 3);

-- TEACHING & PREACHING - Spanish
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('teaching_preaching', 'es', 'Profundizar conocimiento bíblico', 'Estudios bíblicos avanzados', 1),
('teaching_preaching', 'es', 'Desarrollar habilidades de comunicación', 'Cursos de oratoria', 2),
('teaching_preaching', 'es', 'Practicar hermenéutica', 'Talleres de interpretación bíblica', 3);

-- COUNSELING & PASTORAL CARE - English
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('counseling_pastoral', 'en', 'Learn about biblical psychology', 'Christian counseling books', 1),
('counseling_pastoral', 'en', 'Develop active listening skills', 'Communication workshops', 2),
('counseling_pastoral', 'en', 'Study biblical counseling principles', 'Specialized counseling courses', 3);

-- COUNSELING & PASTORAL CARE - Spanish
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('counseling_pastoral', 'es', 'Aprender sobre psicología bíblica', 'Libros de consejería cristiana', 1),
('counseling_pastoral', 'es', 'Desarrollar habilidades de escucha activa', 'Talleres de comunicación', 2),
('counseling_pastoral', 'es', 'Estudiar principios de consejería bíblica', 'Cursos especializados en consejería', 3);

-- LEADERSHIP & ADMINISTRATION - English
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('leadership_administration', 'en', 'Develop management skills', 'Business administration courses', 1),
('leadership_administration', 'en', 'Study biblical leadership principles', 'Christian leadership books', 2),
('leadership_administration', 'en', 'Practice effective delegation', 'Leadership workshops', 3);

-- LEADERSHIP & ADMINISTRATION - Spanish
INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('leadership_administration', 'es', 'Desarrollar habilidades de gestión', 'Cursos de administración de empresas', 1),
('leadership_administration', 'es', 'Estudiar principios de liderazgo bíblico', 'Libros de liderazgo cristiano', 2),
('leadership_administration', 'es', 'Practicar delegación efectiva', 'Talleres de liderazgo', 3);