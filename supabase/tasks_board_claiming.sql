-- Add claiming fields to tasks_board
alter table tasks_board add column if not exists assigned_to text;
alter table tasks_board add column if not exists claimed_at timestamptz;
alter table tasks_board add column if not exists labels text[] default '{}';

create index if not exists tasks_board_assigned_idx on tasks_board(assigned_to);
