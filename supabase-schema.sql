-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.gifts (
  key text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  CONSTRAINT gifts_pkey PRIMARY KEY (key)
);
CREATE TABLE public.quiz_answers (
  user_id uuid NOT NULL,
  question_id integer NOT NULL,
  gift_key text NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 5),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quiz_answers_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.quiz_questions (
  question text NOT NULL,
  gift_key text NOT NULL,
  id integer NOT NULL DEFAULT nextval('quiz_questions_id_seq'::regclass),
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_questions_gift_key_fkey FOREIGN KEY (gift_key) REFERENCES public.gifts(key)
);
CREATE TABLE public.quiz_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid NOT NULL,
  total_score jsonb NOT NULL,
  top_gifts jsonb NOT NULL,
  CONSTRAINT quiz_results_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);