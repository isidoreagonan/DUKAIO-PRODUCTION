create table if not exists public.page_views (
    id uuid default gen_random_uuid() primary key,
    path text not null,
    referrer text,
    device_type text,
    browser text,
    country text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.page_views enable row level security;

-- Only service role can insert and select (since tracking is done via edge function and admin dashboard reads via edge function)
-- No public policies needed, but we'll add a select policy just in case.
create policy "Admins can view page views"
    on public.page_views for select
    using ( auth.email() = 'isidoreagonan@gmail.com' );
