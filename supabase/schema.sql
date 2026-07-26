-- Employees
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  name text not null,
  email text not null unique,
  role text not null default 'Counselor' check (role in ('Admin', 'Manager', 'Counselor')),
  phone text default '',
  created_at timestamptz default now()
);

-- Students
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text default '',
  email text default '',
  telegram text default '',
  instagram text default '',
  country text default 'Uzbekistan',
  city text default '',
  age integer default 18,
  school text default '',
  gpa numeric(3,2) default 0,
  ielts numeric(3,1) default 0,
  duolingo integer,
  sat integer,
  english_waiver boolean default false,
  major text default '',
  preferred_universities text[] default '{}',
  preferred_country text default 'USA',
  intake text default 'Fall' check (intake in ('Fall', 'Spring')),
  budget numeric default 0,
  parent_name text default '',
  parent_phone text default '',
  sponsor_name text,
  passport_status text default 'Not Started' check (passport_status in ('Valid', 'Expired', 'In Process', 'Not Started')),
  notes text default '',
  counselor_id uuid references employees(id),
  counselor_name text default '',
  stage text not null default 'New Lead',
  lead_score text default 'Cold' check (lead_score in ('Hot', 'Warm', 'Cold')),
  enrollment_probability integer default 0,
  next_action text default '',
  last_contact date,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Documents (one row per student+doc_type, upsert on conflict)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  doc_type text not null,
  status text not null default 'missing' check (status in ('uploaded', 'pending', 'missing')),
  filename text,
  file_path text,
  file_url text,
  uploaded_at timestamptz,
  created_at timestamptz default now(),
  unique(student_id, doc_type)
);

-- Payments (feeds Revenue)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  amount numeric not null default 0,
  currency text default 'USD',
  date date default current_date,
  note text default '',
  created_at timestamptz default now()
);

-- Activity log
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  employee_id uuid references employees(id),
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- App settings (API keys, etc)
create table if not exists app_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  student_name text not null,
  type text default 'missing_docs',
  missing_docs text[] default '{}',
  telegram_text text default '',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table employees enable row level security;
alter table students enable row level security;
alter table documents enable row level security;
alter table payments enable row level security;
alter table activity_log enable row level security;
alter table notifications enable row level security;

-- RLS Policies (permissive for now — tighten after setup)
create policy "employees_read" on employees for select using (auth.role() = 'authenticated');
create policy "employees_insert" on employees for insert with check (auth.role() = 'authenticated');
create policy "employees_update" on employees for update using (auth.role() = 'authenticated');
create policy "employees_delete" on employees for delete using (auth.role() = 'authenticated');

create policy "students_all" on students for all using (auth.role() = 'authenticated');
create policy "documents_all" on documents for all using (auth.role() = 'authenticated');
create policy "payments_all" on payments for all using (auth.role() = 'authenticated');
create policy "activity_all" on activity_log for all using (auth.role() = 'authenticated');
create policy "notifications_all" on notifications for all using (auth.role() = 'authenticated');

alter table app_settings enable row level security;
create policy "settings_all" on app_settings for all using (auth.role() = 'authenticated');

-- Storage bucket for documents
insert into storage.buckets (id, name, public) values ('student-documents', 'student-documents', false) on conflict do nothing;
create policy "storage_all" on storage.objects for all using (auth.role() = 'authenticated');
