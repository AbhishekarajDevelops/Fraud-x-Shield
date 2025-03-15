-- Seed data for ml_model_stats
INSERT INTO public.ml_model_stats (accuracy, precision, recall, f1_score, last_trained, total_samples, fraud_samples)
VALUES (0.9876, 0.9532, 0.8721, 0.9109, NOW(), 284807, 492)
ON CONFLICT DO NOTHING;

-- Create a test user (only for development)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Create user profile
INSERT INTO public.users (id, name, email, avatar_url, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Test User',
  'test@example.com',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=test@example.com',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Sample transactions
INSERT INTO public.transactions (user_id, amount, merchant, date, time, location, card_type, card_last_four, category, is_fraudulent, risk_score, created_at)
VALUES
('00000000-0000-0000-0000-000000000000', 125.99, 'Amazon', '2023-06-15', '14:30', 'Online', 'Visa', '4321', 'Retail', false, 15, NOW() - INTERVAL '5 days'),
('00000000-0000-0000-0000-000000000000', 75.50, 'Starbucks', '2023-06-14', '09:45', 'New York, NY', 'Mastercard', '8765', 'Food', false, 5, NOW() - INTERVAL '6 days'),
('00000000-0000-0000-0000-000000000000', 899.99, 'Unknown Electronics Store', '2023-06-13', '22:15', 'Miami, FL', 'Amex', '3456', 'Electronics', true, 85, NOW() - INTERVAL '7 days'),
('00000000-0000-0000-0000-000000000000', 42.75, 'Gas Station', '2023-06-12', '16:20', 'Chicago, IL', 'Visa', '4321', 'Automotive', false, 10, NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0000-000000000000', 1250.00, 'Unknown International Vendor', '2023-06-11', '13:10', 'International', 'Mastercard', '8765', 'Other', true, 95, NOW() - INTERVAL '9 days')
ON CONFLICT DO NOTHING;
