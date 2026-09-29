-- LEIF add-on 002: teachers can add students manually; parents connect with codes.
-- Run once in the Supabase SQL Editor on a database that already has schema.sql.
-- Additive and safe: it changes no existing data. (Fresh setups get this from schema.sql.)

-- A learner added by a teacher has no parent yet. The parent connects using the
-- learner code plus this one-time link code, so a guessed learner code isn't enough.
alter table public.students add column if not exists link_code text;
alter table public.students add column if not exists added_by  uuid references public.profiles (id) on delete set null;

-- Learners already in the database without a parent get a link code too.
update public.students
set link_code = (select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
                 from generate_series(1, 6) where students.id is not null)
where parent_id is null and link_code is null;

-- Teachers may add learners to their own classes at their own school (unlinked only).
drop policy if exists "students: teacher adds" on public.students;
create policy "students: teacher adds" on public.students for insert
  with check (parent_id is null and added_by = auth.uid() and public.teaches(class, school));

-- New-learner alerts: skip the teacher who added the learner, and word it by who added them.
create or replace function public.notify_learner_linked() returns trigger
language plpgsql security definer set search_path = public as $$
declare teachers int;
begin
  if tg_op = 'UPDATE' and (new.class, new.school) is not distinct from (old.class, old.school) then return new; end if;
  if coalesce(trim(new.school), '') = '' then return new; end if;

  insert into notifications (user_id, kind, title, body, link)
  select t.teacher_code, 'info',
         'New learner in ' || new.class || ': ' || new.name,
         'Learner code ' || new.id || '. '
           || case when new.parent_id is null
                then 'Added by a colleague at your school, so you can now upload their scores and attendance.'
                else coalesce(nullif(new.parent_name, ''), 'Their parent') || ' added them on LEIF, so you can now upload their scores and attendance.'
              end,
         '/teacher/students/' || new.id
  from profiles t
  where t.role = 'teacher' and new.class = any (t.classes) and lower(trim(t.school)) = lower(trim(new.school))
    and t.id is distinct from auth.uid();
  get diagnostics teachers = row_count;

  if new.parent_id is not null then
    select count(*) into teachers from profiles t
    where t.role = 'teacher' and new.class = any (t.classes) and lower(trim(t.school)) = lower(trim(new.school));
  end if;
  if teachers > 0 and new.parent_id is not null then
    insert into notifications (user_id, kind, title, body, link)
    values (new.parent_id::text, 'info',
            split_part(new.name, ' ', 1) || ' is linked to their class teacher',
            teachers || ' teacher' || case when teachers = 1 then '' else 's' end || ' at ' || new.school
              || ' can now see ' || split_part(new.name, ' ', 1) || '''s progress and upload results. You control what else is shared under Profile → Privacy.',
            '/app/profile');
  end if;
  return new;
end $$;

-- Parent connects to a learner their child's teacher already added.
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

  update students set parent_id = me.id, link_code = null,
         parent_name = trim(me.first_name || ' ' || me.last_name), parent_phone = me.phone
  where id = s.id;

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

revoke execute on function public.claim_learner(text, text) from public;
grant execute on function public.claim_learner(text, text) to authenticated;
