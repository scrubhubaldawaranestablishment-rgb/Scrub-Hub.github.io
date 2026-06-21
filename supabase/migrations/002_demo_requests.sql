-- Demo / waitlist requests from landing page

CREATE TABLE IF NOT EXISTS demo_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  business_type TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON demo_requests(created_at DESC);

ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Public landing form: insert only, no public reads
CREATE POLICY "Anyone can submit demo request"
  ON demo_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
