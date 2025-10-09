-- Trigger y función para normalizar nombres y apellidos en la tabla persona
-- Ejecutar este SQL en Supabase (SQL editor) o con la CLI

create or replace function public.to_title_case_es(text)
returns text
language plpgsql
as $$
declare
  input alias for $1;
  words text[];
  result text := '';
  w text;
  i int := 1;
  lower_words text[] := array['de','del','la','las','el','los','y','o','u','a','e','da','do','das','dos','san','santa'];
begin
  if input is null then
    return null;
  end if;

  input := regexp_replace(lower(input), '\s+', ' ', 'g');
  input := btrim(input);
  if input = '' then
    return input;
  end if;

  words := string_to_array(input, ' ');
  foreach w in array words loop
    if i > 1 and w = any(lower_words) then
      result := result || w;
    else
      result := result || initcap(w);
    end if;
    if i < array_length(words, 1) then
      result := result || ' ';
    end if;
    i := i + 1;
  end loop;
  return result;
end;
$$;

create or replace function public.persona_titlecase_before_write()
returns trigger
language plpgsql
as $$
begin
  if new.nombres is not null then
    new.nombres := public.to_title_case_es(new.nombres);
  end if;
  if new.primer_apellido is not null then
    new.primer_apellido := public.to_title_case_es(new.primer_apellido);
  end if;
  if new.segundo_apellido is not null then
    new.segundo_apellido := public.to_title_case_es(new.segundo_apellido);
  end if;
  return new;
end;
$$;

drop trigger if exists tr_persona_titlecase_before_write on public.persona;
create trigger tr_persona_titlecase_before_write
before insert or update on public.persona
for each row execute function public.persona_titlecase_before_write();


