-- Tasks Board table for agent volunteering
create table if not exists tasks_board (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'TODO' check (status in ('TODO','IN_PROGRESS','DONE')),
  owner text not null default 'begu',
  priority text not null default 'MEDIUM' check (priority in ('LOW','MEDIUM','HIGH','CRITICAL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_board_status_idx on tasks_board(status);
create index if not exists tasks_board_owner_idx on tasks_board(owner);

create or replace function update_tasks_board_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tasks_board_updated_at on tasks_board;
create trigger set_tasks_board_updated_at
before update on tasks_board
for each row execute function update_tasks_board_updated_at();
