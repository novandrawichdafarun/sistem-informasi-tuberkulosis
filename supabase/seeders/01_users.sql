CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id_user, email, password_hash, role, created_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111', 
    'dr.budi@faskes.go.id', 
    crypt('password123', gen_salt('bf', 10)), 
    'super_admin', 
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'budi.pasien@gmail.com', 
    crypt('password123', gen_salt('bf', 10)), 
    'pasien', 
    NOW()
  )
ON CONFLICT (id_user) DO NOTHING;