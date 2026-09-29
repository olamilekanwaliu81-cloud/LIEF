-- LEIF add-on 003: protect who owns a learner, and what teachers publish.
-- Run once in the Supabase SQL Editor (after 002). Additive; changes no data.
--
-- Row Level Security decides WHO may update a learner row, not WHICH columns.
-- This guard closes two gaps found in the audit:
--   1. A teacher could change parent_id / link_code / privacy (e.g. detach the
--      real parent, or hand the learner to an account they control).
--   2. A parent could overwrite teacher-published scores, notes, attendance or
--      assignments by calling the database directly.

create or replace function public.guard_student_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Server functions (claiming with a code, learner task submission) run as the
  -- table owner and are trusted; only guard edits made by signed-in users.
  if auth.uid() is null or current_setting('leif.trusted', true) = 'on' then
    return new;
  end if;

  if old.parent_id is distinct from auth.uid() then
    -- Not the child's own parent (i.e. a teacher): ownership and privacy are off-limits.
    new.parent_id := old.parent_id;
    new.link_code := old.link_code;
    new.added_by  := old.added_by;
    new.privacy   := old.privacy;
  elsif not old.sample_data then
    -- The parent, on a record the school manages: school data is read-only.
    new.scores       := old.scores;
    new.history      := old.history;
    new.status       := old.status;
    new.last_updated := old.last_updated;
    new.teacher_note := old.teacher_note;
    new.weaknesses   := old.weaknesses;
    new.strengths    := old.strengths;
    new.attendance   := old.attendance;
    new.assignments  := old.assignments;
    new.sample_data  := old.sample_data;
    new.link_code    := old.link_code;
    new.added_by     := old.added_by;
  else
    -- The parent, on a record they manage themselves: they can't fake school status.
    new.sample_data := true;
    new.link_code   := old.link_code;
    new.added_by    := old.added_by;
  end if;
  return new;
end $$;

drop trigger if exists on_student_update_guard on public.students;
create trigger on_student_update_guard before update on public.students
  for each row execute function public.guard_student_update();

-- claim_learner changes ownership on purpose: mark it as trusted for its transaction.
create or replace function public.claim_learner(p_code text, p_link text) returns text
language plpgsql security definer set search_path = public as $$
declare me profiles; s students;
begin
  select * into me from profiles where id = auth.uid() and role = 'parent';
  if not found then raise exception 'Only parent accounts can connect a child.'; end if;

  select * into s from students
  where upper(id) = upper(trim(p_code)) and parent_id is null
    and link_code is not null and link_code = upper(trim(p_link));
  if not found then raise exception 'Those codes don’t match a learner waiting to be connected. Check them with your child’s teacher.'; end if;

  perform set_config('leif.trusted', 'on', true);
  update students set parent_id = me.id, link_code = null,
         parent_name = trim(me.first_name || ' ' || me.last_name), parent_phone = me.phone
  where id = s.id;
  perform set_config('leif.trusted', 'off', true);

  insert into learner_pins (student_id, pin)
  values (s.id, lpad((floor(random() * 9000) + 1000)::int::text, 4, '0'))
  on conflict (student_id) do nothing;

  insert into notifications (user_id, kind, title, body, link)
  select t.teacher_code, 'info', trim(me.first_name || ' ' || me.last_name) || ' connected to ' || s.name,
         'The parent can now see ' || split_part(s.name, ' ', 1) || '''s progress on LEIF.', '/teacher/students/' || s.id
  from profiles t
  where t.role = 'teacher' and s.class = any (t.classes) and lower(trim(t.school)) = lower(trim(s.school));

  insert into notifications (user_id, kind, title, body, link)
  values (me.id::text, 'info', split_part(s.name, ' ', 1) || ' is connected',
          'You can now see everything ' || split_part(s.name, ' ', 1) || '''s teacher has recorded.', '/app/dashboard');
  return s.id;
end $$;

-- Learners submit tasks through learner_submit; it edits assignments on purpose.
create or replace function public.learner_submit(p_code text, p_pin text, p_assignment text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s students; a jsonb; child text;
begin
  select st.* into s from students st join learner_pins lp on lp.student_id = st.id
  where upper(st.id) = upper(trim(p_code)) and lp.pin = trim(p_pin);
  if not found then raise exception 'invalid learner code or PIN'; end if;

  select x into a from jsonb_array_elements(s.assignments) x where x->>'id' = p_assignment;
  if a is null or coalesce((a->>'submitted')::boolean, false) then return to_jsonb(s); end if;

  perform set_config('leif.trusted', 'on', true);
  update students set assignments = (
    select jsonb_agg(case when x->>'id' = p_assignment
      then x || jsonb_build_object('submitted', true, 'submittedAt', to_jsonb(now())) else x end)
    from jsonb_array_elements(s.assignments) x)
  where id = s.id returning * into s;
  perform set_config('leif.trusted', 'off', true);

  child := split_part(s.name, ' ', 1);
  insert into notifications (user_id, kind, title, body, link)
  select s.parent_id::text, 'learner', child || ' completed a task',
         child || ' marked “' || (a->>'title') || '” (' || (a->>'subject') || ') as done.', '/app/dashboard'
  where s.parent_id is not null;
  insert into notifications (user_id, kind, title, body, link)
  select t.teacher_code, 'learner', child || ' submitted work', '“' || (a->>'title') || '” is ready to mark.', '/teacher/assignments'
  from profiles t
  where t.role = 'teacher' and s.class = any (t.classes) and s.school <> '' and lower(trim(t.school)) = lower(trim(s.school));
  return to_jsonb(s);
end $$;

-- Learners have no account, so learner_submit runs with auth.uid() = null and
-- would pass the guard anyway; the trusted flag keeps that explicit.
grant execute on function public.claim_learner(text, text) to authenticated;
grant execute on function public.learner_submit(text, text, text) to anon, authenticated;
