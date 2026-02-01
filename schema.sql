-- 1. Profiles Table (Auth Users 연동)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  height NUMERIC,
  weight NUMERIC,
  age INTEGER,
  activity NUMERIC,
  deficit INTEGER,
  track TEXT CHECK (track IN ('diet', 'workout', 'both')),
  points INTEGER DEFAULT 0,
  bmr NUMERIC,
  tdee NUMERIC,
  target_calories NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Certifications Table (인증 내역)
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('diet', 'workout')),
  image_url TEXT NOT NULL,
  points_awarded INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- 3. Policies (사용자 및 관리자 권한)
-- 프로필: 본인 정보만 조회/수정 가능하도록 설정 (관리자는 전체 조회 가능하게 정책 추가 필요)
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 인증 내역: 본인 내역만 조회/추가 가능
CREATE POLICY "Users can view their own certs" ON certifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own certs" ON certifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 관리자 권한 (임시: 서비스 성격상 admin_emails 체크 등으로 확장 가능)
-- 현재는 실습용이므로 SELECT 전체 허용 정책을 관리자용으로 추가할 수 있음
CREATE POLICY "Admin can view all certs" ON certifications FOR SELECT USING (true); -- 실제 운영시 더 엄격하게 관리 필요
