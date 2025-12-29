-- =====================================================
-- MIDWIFECARE - Supabase Database Schema
-- =====================================================
-- Ce fichier contient tout le schéma pour l'application MidwifeCare
-- À exécuter dans le SQL Editor de Supabase

-- =====================================================
-- 1. ENABLE EXTENSIONS
-- =====================================================
create extension if not exists "uuid-ossp";

-- =====================================================
-- 2. CREATE ENUMS
-- =====================================================
create type patient_status as enum ('Prénatal', 'Postnatal', 'Gynécologie', 'Urgent');
create type appointment_type as enum ('Gynécologie', 'Obstétrique', 'Échographie', 'Urgent');

-- =====================================================
-- 3. CREATE TABLES
-- =====================================================

-- Table: patients
create table patients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  phone text not null,
  email text not null,
  status patient_status not null default 'Prénatal',
  last_visit date,
  next_appointment date,
  next_consultation_reminders text,
  last_smear_date date,

  -- Pregnancy Info (JSONB for nested structure)
  pregnancy_ddr date,
  pregnancy_dpa date,
  pregnancy_gravidity integer,
  pregnancy_parity integer,
  pregnancy_blood_type text,

  -- Medical History (text fields)
  medical_history_medical text default '',
  medical_history_surgical text default '',
  medical_history_family text default '',
  medical_history_obstetrical text default '',
  medical_history_allergies text default '',
  medical_history_treatments text default '',

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: visits (historique des consultations)
create table visits (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references patients(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  visit_date date not null,
  visit_type text not null,
  notes text not null,

  -- Measurements (JSONB for flexibility)
  weight numeric(5,2),
  blood_pressure text,
  heart_rate integer,
  fetal_heart_rate integer,
  glucose numeric(5,2),
  triglycerides numeric(5,2),
  uterine_height numeric(5,2),
  smoking boolean,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: appointments (rendez-vous)
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  patient_id uuid references patients(id) on delete cascade not null,
  appointment_date date not null,
  appointment_time time not null,
  appointment_type appointment_type not null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: tasks (widget de tâches)
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  completed boolean default false,
  color text not null default 'bg-blue-100',

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: documents (protocoles PDF uploadés)
create table documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  file_type text not null,
  original_filename text not null,
  content_text text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: document_chunks (pour embeddings futurs)
create table document_chunks (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents(id) on delete cascade not null,
  chunk_index integer not null,
  content text not null,
  embedding vector(1536), -- Pour OpenAI embeddings futurs

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- 4. CREATE INDEXES
-- =====================================================
create index patients_user_id_idx on patients(user_id);
create index visits_patient_id_idx on visits(patient_id);
create index visits_user_id_idx on visits(user_id);
create index appointments_user_id_idx on appointments(user_id);
create index appointments_patient_id_idx on appointments(patient_id);
create index appointments_date_idx on appointments(appointment_date);
create index tasks_user_id_idx on tasks(user_id);
create index documents_user_id_idx on documents(user_id);
create index document_chunks_document_id_idx on document_chunks(document_id);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Enable RLS on all tables
alter table patients enable row level security;
alter table visits enable row level security;
alter table appointments enable row level security;
alter table tasks enable row level security;
alter table documents enable row level security;
alter table document_chunks enable row level security;

-- Policies pour patients
create policy "Users can view their own patients"
  on patients for select
  using (auth.uid() = user_id);

create policy "Users can insert their own patients"
  on patients for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own patients"
  on patients for update
  using (auth.uid() = user_id);

create policy "Users can delete their own patients"
  on patients for delete
  using (auth.uid() = user_id);

-- Policies pour visits
create policy "Users can view visits for their patients"
  on visits for select
  using (auth.uid() = user_id);

create policy "Users can insert visits for their patients"
  on visits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their visits"
  on visits for update
  using (auth.uid() = user_id);

create policy "Users can delete their visits"
  on visits for delete
  using (auth.uid() = user_id);

-- Policies pour appointments
create policy "Users can view their own appointments"
  on appointments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own appointments"
  on appointments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own appointments"
  on appointments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own appointments"
  on appointments for delete
  using (auth.uid() = user_id);

-- Policies pour tasks
create policy "Users can view their own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- Policies pour documents
create policy "Users can view their own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on documents for delete
  using (auth.uid() = user_id);

-- Policies pour document_chunks (héritées via documents)
create policy "Users can view chunks of their documents"
  on document_chunks for select
  using (
    exists (
      select 1 from documents
      where documents.id = document_chunks.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can insert chunks for their documents"
  on document_chunks for insert
  with check (
    exists (
      select 1 from documents
      where documents.id = document_chunks.document_id
      and documents.user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. FUNCTIONS & TRIGGERS
-- =====================================================
-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_patients_updated_at before update on patients
  for each row execute procedure update_updated_at_column();

create trigger update_appointments_updated_at before update on appointments
  for each row execute procedure update_updated_at_column();

create trigger update_tasks_updated_at before update on tasks
  for each row execute procedure update_updated_at_column();

create trigger update_documents_updated_at before update on documents
  for each row execute procedure update_updated_at_column();

-- =====================================================
-- 7. INITIAL DATA (OPTIONAL)
-- =====================================================
-- Vous pouvez insérer des données de test ici après avoir créé un utilisateur
