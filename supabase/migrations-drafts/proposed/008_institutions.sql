-- ====================================================================
-- PROPOSED — NOT APPLIED. Do not run until the preflight output has been
-- reviewed, names are reconciled with the live schema, it has run cleanly on
-- staging, and a named owner has approved it. See 000_README.md.
-- ====================================================================
-- 008 Institutions. Roles live in institution_members (not in has_role).
-- Institutions are created via create_institution() so the creator becomes owner atomically.
-- ALTERs public.opportunities with a NULLABLE column only (additive). Institution-created
-- opportunities must still pass the 001 publication gate.

begin;

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  kind text not null check (kind in ('university','company','ngo','foundation','research_institution','incubator','training_provider')),
  country text,
  website text check (website is null or website ~* '^https?://'),
  status text not null default 'pending' check (status in ('pending','verified','suspended')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.institution_members (
  institution_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (institution_id, user_id)
);

alter table public.opportunities
  add column if not exists institution_id uuid references public.institutions(id) on delete set null;

create trigger institutions_updated_at before update on public.institutions
  for each row execute function public.find_set_updated_at();

create or replace function public.is_institution_member(p_institution_id uuid, p_roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.institution_members m
    where m.institution_id = p_institution_id and m.user_id = auth.uid() and m.role = any (p_roles)
  )
$$;

alter table public.institutions enable row level security;
alter table public.institution_members enable row level security;
revoke all on public.institution_members from anon;

create policy "institutions read" on public.institutions for select to anon, authenticated
  using (status = 'verified'
    or public.is_institution_member(id, array['owner','admin','editor','viewer'])
    or public.has_role('admin'));
create policy "institutions member update" on public.institutions for update to authenticated
  using (public.is_institution_member(id, array['owner','admin']))
  with check (public.is_institution_member(id, array['owner','admin']));
revoke insert, update, delete on public.institutions from authenticated;
grant update (name, kind, country, website) on public.institutions to authenticated;

create policy "institution members read" on public.institution_members for select to authenticated
  using (user_id = (select auth.uid())
    or public.is_institution_member(institution_id, array['owner','admin','editor','viewer'])
    or public.has_role('admin'));
create policy "institution members add" on public.institution_members for insert to authenticated
  with check (
    public.is_institution_member(institution_id, array['owner'])
    or (public.is_institution_member(institution_id, array['admin']) and role in ('editor','viewer'))
  );
create policy "institution members remove" on public.institution_members for delete to authenticated
  using (public.is_institution_member(institution_id, array['owner']) or user_id = (select auth.uid()));

create or replace function public.create_institution(p_name text, p_kind text, p_country text, p_website text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  insert into public.institutions (name, kind, country, website, created_by)
  values (p_name, p_kind, p_country, p_website, auth.uid())
  returning id into v_id;

  insert into public.institution_members (institution_id, user_id, role)
  values (v_id, auth.uid(), 'owner');

  return v_id;
end $$;
revoke all on function public.create_institution(text, text, text, text) from public;
grant execute on function public.create_institution(text, text, text, text) to authenticated;

create or replace function public.set_institution_status(p_institution_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('admin') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_status not in ('pending','verified','suspended') then
    raise exception 'invalid status';
  end if;

  update public.institutions set status = p_status where id = p_institution_id;

  -- Requires 001 (admin_audit_log).
  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), 'institution.status', 'institution', p_institution_id::text,
          jsonb_build_object('to', p_status));
end $$;
revoke all on function public.set_institution_status(uuid, text) from public;
grant execute on function public.set_institution_status(uuid, text) to authenticated;

commit;

-- ROLLBACK: alter table public.opportunities drop column if exists institution_id; drop functions set_institution_status, create_institution, is_institution_member; drop tables institution_members, institutions.
