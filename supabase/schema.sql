-- LEIF database schema for Supabase.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run: it drops and recreates LEIF's own objects only.
--
-- Privacy model (PRD FR-09), enforced by Row Level Security:
--   • Parents see and edit only their own children.
--   • Co-guardians listed on a child can view it (when visibility = family).
--   • Teachers see learners in their own classes at their own school.
--   • Learners sign in with code + PIN through checked functions, never directly.

create extension if not exists pgcrypto with schema extensions;

-- ── Clean slate (LEIF objects only) ────────────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
drop table if exists public.events cascade;
drop table if exists public.score_uploads cascade;
drop table if exists public.support_actions cascade;
drop table if exists public.notifications cascade;
drop table if exists public.announcements cascade;
drop table if exists public.learner_pins cascade;
drop table if exists public.students cascade;
drop table if exists public.profiles cascade;

-- ── Tables ─────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          text not null check (role in ('parent', 'teacher')),
  first_name    text not null default '',
  last_name     text not null default '',
  email         text not null default '',
  phone         text not null default '',
  language      text not null default 'English',
  prefs         jsonb not null default '{"scores":true,"announcements":true,"weekly":true,"attendance":true}',
  -- teacher-only fields
  teacher_code  text unique,
  title         text not null default '',
  school        text not null default '',
  school_id     text not null default '',
  subjects      text[] not null default '{}',
  classes       text[] not null default '{}',
  -- consent: when the user accepted the Terms and Privacy Policy at sign-up
  terms_accepted_at timestamptz,
  created_at    timestamptz not null default now()
);

create table public.students (
  id            text primary key default ('STU-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  name          text not null,
  class         text not null,
  gender        text,
  age           int check (age between 2 and 19),
  school        text not null default '',
  scores        jsonb not null default '[]',
  history       jsonb not null default '[]',
  attendance    jsonb not null default '[]',
  weaknesses    text[] not null default '{}',
  strengths     text[] not null default '{}',
  teacher_note  text not null default '',
  last_updated  date not null default current_date,
  status        text not null default 'average',
  assignments   jsonb not null default '[]',
  parent_name   text not null default '',
  parent_phone  text not null default '',
  parent_id     uuid references public.profiles (id) on delete cascade,
  privacy       jsonb not null default '{"visibility":"private","shareActivityWithTeacher":false,"guardians":[]}',
  sample_data   boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Kept apart from students so teachers (who can read student rows) never see PINs.
create table public.learner_pins (
  student_id    text primary key references public.students (id) on delete cascade,
  pin           text not null check (pin ~ '^[0-9]{4}$')
);

create table public.announcements (
  id            text primary key default ('ANN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  teacher_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  teacher_code  text not null,
  title         text not null,
  body          text not null,
  class_target  text not null,
  date          date not null default current_date
);

-- user_id is the app-level id: a parent's uuid, or a teacher's code (e.g. TCH-0042).
create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
  kind          text not null,
  title         text not null,
  body          text not null,
  link          text,
  read          boolean not null default false,
  date          timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, date desc);

create table public.support_actions (
  id              text primary key,
  student_id      text not null references public.students (id) on delete cascade,
  parent_id       uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  subject         text not null,
  title           text not null,
  started_at      date not null default current_date,
  baseline_score  int not null default 0,
  status          text not null default 'trying' check (status in ('trying', 'done')),
  completed_at    date
);

-- Every score upload is kept: who published what, when (the student row only holds the latest).
create table public.score_uploads (
  id            uuid primary key default gen_random_uuid(),
  student_id    text not null references public.students (id) on delete cascade,
  uploaded_by   uuid default auth.uid() references public.profiles (id) on delete set null,
  source        text not null check (source in ('teacher', 'parent')),
  term          text not null,
  scores        jsonb not null,
  weaknesses    text[] not null default '{}',
  strengths     text[] not null default '{}',
  note          text not null default '',
  created_at    timestamptz not null default now()
);
create index score_uploads_student_idx on public.score_uploads (student_id, created_at desc);

-- Product analytics for the PRD success metrics (§16). Write-only for the app;
-- read them in the SQL Editor (see the queries in README.md).
create table public.events (
  id            bigint generated always as identity primary key,
  user_id       uuid default auth.uid(),
  role          text,
  name          text not null,
  props         jsonb not null default '{}',
  created_at    timestamptz not null default now()
);
create index events_name_idx on public.events (name, created_at);

-- ── Helper functions (security definer so policies don't recurse) ──────────
create or replace function public.my_app_id() returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select teacher_code from profiles where id = auth.uid() and role = 'teacher'),
    auth.uid()::text)
$$;

create or replace function public.teaches(p_class text, p_school text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'teacher'
      and p_class = any (p.classes)
      and coalesce(trim(p_school), '') <> ''
      and lower(trim(p.school)) = lower(trim(p_school)))
$$;

create or replace function public.is_guardian(p_privacy jsonb) returns boolean
language sql stable as $$
  select p_privacy->>'visibility' = 'family'
     and (p_privacy->'guardians') ? lower(coalesce(auth.jwt()->>'email', ''))
$$;

create or replace function public.owns_student(p_student text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from students where id = p_student and parent_id = auth.uid())
$$;

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.students        enable row level security;
alter table public.learner_pins    enable row level security;
alter table public.announcements   enable row level security;
alter table public.notifications   enable row level security;
alter table public.support_actions enable row level security;
alter table public.score_uploads   enable row level security;
alter table public.events          enable row level security;

create policy "own profile: read"   on public.profiles for select using (id = auth.uid());
create policy "own profile: update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "students: read"   on public.students for select
  using (parent_id = auth.uid() or public.teaches(class, school) or public.is_guardian(privacy));
create policy "students: parent adds"   on public.students for insert with check (parent_id = auth.uid());
create policy "students: parent or teacher updates" on public.students for update
  using (parent_id = auth.uid() or public.teaches(class, school));
create policy "students: parent removes" on public.students for delete using (parent_id = auth.uid());

create policy "pins: parent only" on public.learner_pins for all
  using (public.owns_student(student_id)) with check (public.owns_student(student_id));

create policy "announcements: own" on public.announcements for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "notifications: own read"   on public.notifications for select using (user_id = public.my_app_id());
create policy "notifications: own update" on public.notifications for update using (user_id = public.my_app_id());
create policy "notifications: own insert" on public.notifications for insert with check (user_id = public.my_app_id());

create policy "actions: parent manages" on public.support_actions for all
  using (parent_id = auth.uid()) with check (parent_id = auth.uid() and public.owns_student(student_id));
create policy "actions: shared with teacher" on public.support_actions for select
  using (exists (
    select 1 from public.students s
    where s.id = student_id
      and (s.privacy->>'shareActivityWithTeacher')::boolean
      and public.teaches(s.class, s.school)));

create policy "uploads: read with the student" on public.score_uploads for select
  using (exists (select 1 from public.students s where s.id = student_id
    and (s.parent_id = auth.uid() or public.teaches(s.class, s.school) or public.is_guardian(s.privacy))));
create policy "uploads: teacher or parent adds" on public.score_uploads for insert
  with check (uploaded_by = auth.uid() and exists (select 1 from public.students s where s.id = student_id
    and ((source = 'teacher' and public.teaches(s.class, s.school)) or (source = 'parent' and s.parent_id = auth.uid()))));

create policy "events: anyone records their own" on public.events for insert
  with check (user_id is null or user_id = auth.uid());

-- ── New accounts: create the profile (and first child) from sign-up data ───
-- Runs server-side, so it works even when email confirmation is switched on.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}');
  child jsonb := meta->'child';
  new_student text;
begin
  insert into profiles (id, role, first_name, last_name, email, teacher_code, school, school_id, subjects, classes, terms_accepted_at)
  values (
    new.id,
    coalesce(meta->>'role', 'parent'),
    coalesce(meta->>'first_name', ''),
    coalesce(meta->>'last_name', ''),
    coalesce(new.email, ''),
    nullif(upper(trim(meta->>'teacher_code')), ''),
    coalesce(meta->>'school', ''),
    coalesce(meta->>'school_id', ''),
    coalesce(array(select jsonb_array_elements_text(meta->'subjects')), '{}'),
    coalesce(array(select jsonb_array_elements_text(meta->'classes')), '{}'),
    case when (meta->>'accepted_terms')::boolean then now() end);

  if coalesce(meta->>'role', 'parent') = 'parent' and child is not null then
    insert into students (name, class, age, school, parent_id, parent_name)
    values (
      trim(child->>'name'), child->>'class', nullif(child->>'age', '')::int,
      coalesce(trim(child->>'school'), ''), new.id,
      trim(coalesce(meta->>'first_name', '') || ' ' || coalesce(meta->>'last_name', '')))
    returning id into new_student;

    insert into learner_pins (student_id, pin) values (new_student, lpad((floor(random() * 9000) + 1000)::int::text, 4, '0'));

    insert into notifications (user_id, kind, title, body, link)
    values (new.id::text, 'info', 'Welcome to LEIF, ' || coalesce(meta->>'first_name', '') || '!',
            trim(child->>'name') || '''s profile is ready. Add a recent result or wait for their teacher to upload scores.',
            '/app/dashboard');
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the parent contact details teachers see in sync with the parent's profile.
create or replace function public.sync_parent_contact() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role = 'parent' and (new.first_name, new.last_name, new.phone) is distinct from (old.first_name, old.last_name, old.phone) then
    update students set parent_name = trim(new.first_name || ' ' || new.last_name), parent_phone = new.phone
    where parent_id = new.id;
  end if;
  return new;
end $$;

create trigger on_profile_updated after update on public.profiles
  for each row execute function public.sync_parent_contact();

-- ── Functions the app calls (checked server-side) ──────────────────────────

-- Teacher sign-in uses school + teacher ID; this resolves the login email.
create or replace function public.teacher_login_email(p_code text, p_school text) returns text
language sql stable security definer set search_path = public as $$
  select email from profiles
  where role = 'teacher' and upper(teacher_code) = upper(trim(p_code))
    and (lower(school) like '%' || lower(trim(p_school)) || '%' or lower(trim(p_school)) like '%' || lower(school) || '%')
  limit 1
$$;

create or replace function public.teacher_code_taken(p_code text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where upper(teacher_code) = upper(trim(p_code)))
$$;

-- Teacher → parents of one learner, respecting each parent's notification preference.
create or replace function public.notify_parents(p_student text, p_pref text, p_kind text, p_title text, p_body text, p_link text)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not exists (select 1 from students s where s.id = p_student and teaches(s.class, s.school)) then
    raise exception 'not allowed';
  end if;
  insert into notifications (user_id, kind, title, body, link)
  select p.id::text, p_kind, p_title, p_body, p_link
  from students s join profiles p on p.id = s.parent_id
  where s.id = p_student and (p_pref is null or coalesce((p.prefs->>p_pref)::boolean, true));
  get diagnostics n = row_count;
  return n;
end $$;

-- Teacher → every parent in the given classes (announcements).
create or replace function public.notify_class_parents(p_classes text[], p_title text, p_body text, p_link text)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into notifications (user_id, kind, title, body, link)
  select distinct p.id::text, 'announcement', p_title, p_body, p_link
  from students s join profiles p on p.id = s.parent_id
  where s.class = any (p_classes) and teaches(s.class, s.school)
    and coalesce((p.prefs->>'announcements')::boolean, true);
  get diagnostics n = row_count;
  return n;
end $$;

-- Parent → the teachers of their child (only used when they choose to share).
create or replace function public.notify_teachers(p_student text, p_kind text, p_title text, p_body text, p_link text)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not owns_student(p_student) then raise exception 'not allowed'; end if;
  insert into notifications (user_id, kind, title, body, link)
  select t.teacher_code, p_kind, p_title, p_body, p_link
  from students s join profiles t
    on t.role = 'teacher' and s.class = any (t.classes) and s.school <> '' and lower(trim(t.school)) = lower(trim(s.school))
  where s.id = p_student;
  get diagnostics n = row_count;
  return n;
end $$;

-- Learner sign-in: returns the learner's record (never the PIN) if code + PIN match.
create or replace function public.learner_get(p_code text, p_pin text) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(s) from students s join learner_pins lp on lp.student_id = s.id
  where upper(s.id) = upper(trim(p_code)) and lp.pin = trim(p_pin)
$$;

-- Learner marks a task done; parent and teachers are notified.
create or replace function public.learner_submit(p_code text, p_pin text, p_assignment text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s students; a jsonb; child text;
begin
  select st.* into s from students st join learner_pins lp on lp.student_id = st.id
  where upper(st.id) = upper(trim(p_code)) and lp.pin = trim(p_pin);
  if not found then raise exception 'invalid learner code or PIN'; end if;

  select x into a from jsonb_array_elements(s.assignments) x where x->>'id' = p_assignment;
  if a is null or coalesce((a->>'submitted')::boolean, false) then return to_jsonb(s); end if;

  update students set assignments = (
    select jsonb_agg(case when x->>'id' = p_assignment
      then x || jsonb_build_object('submitted', true, 'submittedAt', to_jsonb(now())) else x end)
    from jsonb_array_elements(s.assignments) x)
  where id = s.id returning * into s;

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

-- ── Permissions ────────────────────────────────────────────────────────────
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
-- The audit log and analytics are append-only.
revoke update, delete on public.score_uploads, public.events from authenticated;
revoke select on public.events from authenticated;
grant insert on public.events to anon;

revoke execute on all functions in schema public from public;
grant execute on function public.my_app_id(), public.teaches(text, text), public.is_guardian(jsonb), public.owns_student(text) to authenticated;
grant execute on function public.notify_parents(text, text, text, text, text, text), public.notify_class_parents(text[], text, text, text), public.notify_teachers(text, text, text, text, text) to authenticated;
grant execute on function public.teacher_login_email(text, text), public.teacher_code_taken(text), public.learner_get(text, text), public.learner_submit(text, text, text) to anon, authenticated;

-- ── Live updates ───────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.students, public.notifications, public.support_actions, public.announcements;
