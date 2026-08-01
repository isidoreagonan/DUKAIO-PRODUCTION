-- INSERT SCRIPT FOR AUTH.USERS
-- This script preserves the exact original IDs from Lovable.

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '6cd0f81d-57db-49bb-beaf-55d2e5e7f13e',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'landrypixel237@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocIdxNGYX_MQGTXwXg2wwfPNffmjNd81xVJS7E8E6gOiOvvlCg=s96-c","email":"landrypixel237@gmail.com","email_verified":true,"full_name":"Landry Guy","iss":"https://accounts.google.com","name":"Landry Guy","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocIdxNGYX_MQGTXwXg2wwfPNffmjNd81xVJS7E8E6gOiOvvlCg=s96-c","provider_id":"114067053873694303194","sub":"114067053873694303194"}',
  '2026-05-07T22:38:25.885146+00:00',
  '2026-05-15T13:59:58.405951+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '6cd0f81d-57db-49bb-beaf-55d2e5e7f13e',
  '{"sub":"6cd0f81d-57db-49bb-beaf-55d2e5e7f13e","email":"landrypixel237@gmail.com"}',
  'email',
  '6cd0f81d-57db-49bb-beaf-55d2e5e7f13e',
  now(),
  '2026-05-07T22:38:25.885146+00:00',
  '2026-05-15T13:59:58.405951+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '5f900f1d-474e-4168-9cbb-9b66ef4b82b0',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aurelejouvenciohongbete@gmail.com',
  '$2a$10$2RMisdGSJ5y3XSMN8kL6.uh1xcisuu6DRPTPg6q./X1tMlMcm2KF6',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BJ","email":"aurelejouvenciohongbete@gmail.com","email_verified":false,"first_name":"Aurele","full_name":"Aurele HONGBETE","last_name":"HONGBETE","phone":"+2290156312205","phone_verified":false,"sub":"5f900f1d-474e-4168-9cbb-9b66ef4b82b0"}',
  '2026-07-03T08:54:50.185967+00:00',
  '2026-07-03T08:56:35.076308+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '5f900f1d-474e-4168-9cbb-9b66ef4b82b0',
  '{"sub":"5f900f1d-474e-4168-9cbb-9b66ef4b82b0","email":"aurelejouvenciohongbete@gmail.com"}',
  'email',
  '5f900f1d-474e-4168-9cbb-9b66ef4b82b0',
  now(),
  '2026-07-03T08:54:50.185967+00:00',
  '2026-07-03T08:56:35.076308+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '9c29ad5c-2cb8-48f4-a9ce-d97e888c5a76',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'shimunadieudonne44@gmail.com',
  '$2a$10$Brz9A4nnE5cd9ep3ZY8fs.mIfBcxBr80lQpyQrwvA3BCHqGlWKtf.',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CD","email":"shimunadieudonne44@gmail.com","email_verified":true,"first_name":"Dieudonné","full_name":"Dieudonné Shimuna","last_name":"Shimuna","phone":"+243991737312","phone_verified":false,"sub":"9c29ad5c-2cb8-48f4-a9ce-d97e888c5a76"}',
  '2026-05-06T08:06:30.07856+00:00',
  '2026-05-06T10:12:00.247941+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '9c29ad5c-2cb8-48f4-a9ce-d97e888c5a76',
  '{"sub":"9c29ad5c-2cb8-48f4-a9ce-d97e888c5a76","email":"shimunadieudonne44@gmail.com"}',
  'email',
  '9c29ad5c-2cb8-48f4-a9ce-d97e888c5a76',
  now(),
  '2026-05-06T08:06:30.07856+00:00',
  '2026-05-06T10:12:00.247941+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '57ec2bc4-cab6-4e74-ae2b-a8e545847f85',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'kalombo696@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocK0j4fzyfk9MbAdrtTd0xrGBgSlml0oqIhHKWLMhWR6klMPYQ=s96-c","email":"kalombo696@gmail.com","email_verified":true,"full_name":"Israël Kalombo","iss":"https://accounts.google.com","name":"Israël Kalombo","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocK0j4fzyfk9MbAdrtTd0xrGBgSlml0oqIhHKWLMhWR6klMPYQ=s96-c","provider_id":"113071965909642983722","sub":"113071965909642983722"}',
  '2026-05-07T11:15:26.527433+00:00',
  '2026-05-11T12:54:42.053242+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '57ec2bc4-cab6-4e74-ae2b-a8e545847f85',
  '{"sub":"57ec2bc4-cab6-4e74-ae2b-a8e545847f85","email":"kalombo696@gmail.com"}',
  'email',
  '57ec2bc4-cab6-4e74-ae2b-a8e545847f85',
  now(),
  '2026-05-07T11:15:26.527433+00:00',
  '2026-05-11T12:54:42.053242+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '02f7301e-c70a-4b87-a160-000fd303136d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'duoskingeelysee130@gmail.com',
  '$2a$10$rfhDL4GsoimnaOvXpv/Sg.NLeJVndyW7puJqZ/b1DIv2uk3d8RxlS',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CF","email":"duoskingeelysee130@gmail.com","email_verified":false,"first_name":"Elysée","full_name":"Elysée KOLENGUE","last_name":"KOLENGUE","phone":"+23623674243390","phone_verified":false,"sub":"02f7301e-c70a-4b87-a160-000fd303136d"}',
  '2026-06-21T09:33:05.592622+00:00',
  '2026-06-21T09:33:05.914794+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '02f7301e-c70a-4b87-a160-000fd303136d',
  '{"sub":"02f7301e-c70a-4b87-a160-000fd303136d","email":"duoskingeelysee130@gmail.com"}',
  'email',
  '02f7301e-c70a-4b87-a160-000fd303136d',
  now(),
  '2026-06-21T09:33:05.592622+00:00',
  '2026-06-21T09:33:05.914794+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '3da33948-1b1f-4600-b35b-6ff42f4ccdc5',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dolapoecom1@gmail.com',
  '$2a$10$vAJKEKqMEkVnHJ5vbUbzc.0z3EkYUF9rPZ8ZtiF5CzSqa2ofMRUJ6',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"email":"dolapoecom1@gmail.com","email_verified":true,"is_buyer":true,"phone_verified":false,"sub":"3da33948-1b1f-4600-b35b-6ff42f4ccdc5"}',
  '2026-03-03T13:50:16.22909+00:00',
  '2026-03-13T06:17:12.877585+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '3da33948-1b1f-4600-b35b-6ff42f4ccdc5',
  '{"sub":"3da33948-1b1f-4600-b35b-6ff42f4ccdc5","email":"dolapoecom1@gmail.com"}',
  'email',
  '3da33948-1b1f-4600-b35b-6ff42f4ccdc5',
  now(),
  '2026-03-03T13:50:16.22909+00:00',
  '2026-03-13T06:17:12.877585+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '16f659d7-2e50-4330-b752-62ce203c6396',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'nelsonsarive26@gmail.com',
  '$2a$10$ZLOUr1loymSNyOICmIC10eq55ilB0tqm9gqtFHA7JWoVfY7TJXtHq',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"AF","email":"nelsonsarive26@gmail.com","email_verified":false,"first_name":"Sarive","full_name":"Sarive Nelson","last_name":"Nelson","phone":"+9324399371613","phone_verified":false,"sub":"16f659d7-2e50-4330-b752-62ce203c6396"}',
  '2026-07-26T03:39:56.625891+00:00',
  '2026-07-26T04:09:14.925626+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '16f659d7-2e50-4330-b752-62ce203c6396',
  '{"sub":"16f659d7-2e50-4330-b752-62ce203c6396","email":"nelsonsarive26@gmail.com"}',
  'email',
  '16f659d7-2e50-4330-b752-62ce203c6396',
  now(),
  '2026-07-26T03:39:56.625891+00:00',
  '2026-07-26T04:09:14.925626+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '13f4f659-d670-4d40-851d-0f8bd437ac92',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'isidoreagonan@gmail.com',
  '$2a$10$DEEPAj3fWO.F658xyaGT7eIPzj0rXiLBvTobOa09JbTHyCMD4UM4W',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocIpJPvXuyLuHpAwD0YZvu2IjBajl27UoTkSBkPqW_T0zd0n2kd2=s96-c","email":"isidoreagonan@gmail.com","email_verified":true,"full_name":"AGONAN ISIDORE","iss":"https://accounts.google.com","name":"AGONAN ISIDORE","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocIpJPvXuyLuHpAwD0YZvu2IjBajl27UoTkSBkPqW_T0zd0n2kd2=s96-c","provider_id":"112429181567900006109","sub":"112429181567900006109"}',
  '2026-03-02T12:08:27.380173+00:00',
  '2026-07-31T16:07:35.744873+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '13f4f659-d670-4d40-851d-0f8bd437ac92',
  '{"sub":"13f4f659-d670-4d40-851d-0f8bd437ac92","email":"isidoreagonan@gmail.com"}',
  'email',
  '13f4f659-d670-4d40-851d-0f8bd437ac92',
  now(),
  '2026-03-02T12:08:27.380173+00:00',
  '2026-07-31T16:07:35.744873+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '936a1980-64d0-481e-b940-9a8d74f13f74',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'nsanadivin@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocLZAJAzgjbneaKTqcXivoIbWrlxhu7CB_4JuufEUsbnIw441YUz=s96-c","email":"nsanadivin@gmail.com","email_verified":true,"full_name":"Logan","iss":"https://accounts.google.com","name":"Logan","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocLZAJAzgjbneaKTqcXivoIbWrlxhu7CB_4JuufEUsbnIw441YUz=s96-c","provider_id":"109884377796120234418","sub":"109884377796120234418"}',
  '2026-03-08T21:46:22.20156+00:00',
  '2026-03-08T23:22:27.353355+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '936a1980-64d0-481e-b940-9a8d74f13f74',
  '{"sub":"936a1980-64d0-481e-b940-9a8d74f13f74","email":"nsanadivin@gmail.com"}',
  'email',
  '936a1980-64d0-481e-b940-9a8d74f13f74',
  now(),
  '2026-03-08T21:46:22.20156+00:00',
  '2026-03-08T23:22:27.353355+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '0a73d673-1a54-4515-89fa-9e5fdad6bec3',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'officiel.damaris@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJaEOPRn1bkIgi8WwnePFbfHoWNwmMu9ucvM7WKUnJ8WufwgQ=s96-c","email":"officiel.damaris@gmail.com","email_verified":true,"full_name":"Damaris","iss":"https://accounts.google.com","name":"Damaris","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJaEOPRn1bkIgi8WwnePFbfHoWNwmMu9ucvM7WKUnJ8WufwgQ=s96-c","provider_id":"110033787508391003072","sub":"110033787508391003072"}',
  '2026-05-17T17:56:40.894823+00:00',
  '2026-05-17T17:56:41.028532+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '0a73d673-1a54-4515-89fa-9e5fdad6bec3',
  '{"sub":"0a73d673-1a54-4515-89fa-9e5fdad6bec3","email":"officiel.damaris@gmail.com"}',
  'email',
  '0a73d673-1a54-4515-89fa-9e5fdad6bec3',
  now(),
  '2026-05-17T17:56:40.894823+00:00',
  '2026-05-17T17:56:41.028532+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'ffef7888-00c3-4deb-b75d-67b7468c44a9',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'espoirh05@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocIZkEzWBUHJBje7AxZ25wzTaiHYeM2cT_90DCuhoj3rtCdvSQ=s96-c","email":"espoirh05@gmail.com","email_verified":true,"full_name":"Espoir HOUNSOU","iss":"https://accounts.google.com","name":"Espoir HOUNSOU","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocIZkEzWBUHJBje7AxZ25wzTaiHYeM2cT_90DCuhoj3rtCdvSQ=s96-c","provider_id":"112889346676824552982","sub":"112889346676824552982"}',
  '2026-03-08T20:38:59.215306+00:00',
  '2026-03-09T11:26:23.482221+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ffef7888-00c3-4deb-b75d-67b7468c44a9',
  '{"sub":"ffef7888-00c3-4deb-b75d-67b7468c44a9","email":"espoirh05@gmail.com"}',
  'email',
  'ffef7888-00c3-4deb-b75d-67b7468c44a9',
  now(),
  '2026-03-08T20:38:59.215306+00:00',
  '2026-03-09T11:26:23.482221+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'fec4ba28-552b-4f7b-ae7d-283ce1bb47d8',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'tonoualiou27@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocIITlfShlvPNOmmLvtAdcE4pWWbVZrnvQxJ-CMtwBe2EY4VBg=s96-c","email":"tonoualiou27@gmail.com","email_verified":true,"full_name":"Aliou TONOU","iss":"https://accounts.google.com","name":"Aliou TONOU","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocIITlfShlvPNOmmLvtAdcE4pWWbVZrnvQxJ-CMtwBe2EY4VBg=s96-c","provider_id":"110352234794193662041","sub":"110352234794193662041"}',
  '2026-03-08T07:36:30.240052+00:00',
  '2026-03-23T09:46:19.901737+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'fec4ba28-552b-4f7b-ae7d-283ce1bb47d8',
  '{"sub":"fec4ba28-552b-4f7b-ae7d-283ce1bb47d8","email":"tonoualiou27@gmail.com"}',
  'email',
  'fec4ba28-552b-4f7b-ae7d-283ce1bb47d8',
  now(),
  '2026-03-08T07:36:30.240052+00:00',
  '2026-03-23T09:46:19.901737+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'e5471d95-0370-4546-8459-e56dafec8f66',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ahissoumedard66@gmail.com',
  '$2a$10$tnSrmmKQmhH6jAFT5iClLudE4R6QdCXMerzDHUM.ekCBm2l/Acr8y',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BJ","email":"ahissoumedard66@gmail.com","email_verified":false,"first_name":"Jesuwamè Médard","full_name":"Jesuwamè Médard AHISSOU","last_name":"AHISSOU","phone":"+2290197742989","phone_verified":false,"sub":"e5471d95-0370-4546-8459-e56dafec8f66"}',
  '2026-03-10T19:10:49.92743+00:00',
  '2026-03-10T19:10:50.189188+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'e5471d95-0370-4546-8459-e56dafec8f66',
  '{"sub":"e5471d95-0370-4546-8459-e56dafec8f66","email":"ahissoumedard66@gmail.com"}',
  'email',
  'e5471d95-0370-4546-8459-e56dafec8f66',
  now(),
  '2026-03-10T19:10:49.92743+00:00',
  '2026-03-10T19:10:50.189188+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '3750f2dd-1144-4a18-a11d-8383d538dda1',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mamadoubagayogo640@gmail.com',
  '$2a$10$v1YMzEdviFyEZZ42.DmfB.WchPZ9MmhgK.1/rXKdpRWHb03ScWT8q',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"ML","email":"mamadoubagayogo640@gmail.com","email_verified":false,"first_name":"Mamadou","full_name":"Mamadou Bagayogo","last_name":"Bagayogo","phone":"+22322371629968","phone_verified":false,"sub":"3750f2dd-1144-4a18-a11d-8383d538dda1"}',
  '2026-06-23T00:46:35.394706+00:00',
  '2026-06-23T00:48:25.605038+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '3750f2dd-1144-4a18-a11d-8383d538dda1',
  '{"sub":"3750f2dd-1144-4a18-a11d-8383d538dda1","email":"mamadoubagayogo640@gmail.com"}',
  'email',
  '3750f2dd-1144-4a18-a11d-8383d538dda1',
  now(),
  '2026-06-23T00:46:35.394706+00:00',
  '2026-06-23T00:48:25.605038+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '30402d01-fc3e-438a-b07e-6cb4fce005cb',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ienoverse@gmail.com',
  '$2a$10$Za8w4uDid1sDme.Sb.pnZejN1wAgLbZSRUfKpjmf3NLKj44ycjO.K',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BJ","email":"ienoverse@gmail.com","email_verified":true,"first_name":"Agnac","full_name":"Agnac Dupont","last_name":"Dupont","phone":"+2290190210790","phone_verified":false,"sub":"30402d01-fc3e-438a-b07e-6cb4fce005cb"}',
  '2026-03-09T16:46:38.819783+00:00',
  '2026-03-09T17:46:21.323791+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '30402d01-fc3e-438a-b07e-6cb4fce005cb',
  '{"sub":"30402d01-fc3e-438a-b07e-6cb4fce005cb","email":"ienoverse@gmail.com"}',
  'email',
  '30402d01-fc3e-438a-b07e-6cb4fce005cb',
  now(),
  '2026-03-09T16:46:38.819783+00:00',
  '2026-03-09T17:46:21.323791+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '8261d526-c5b9-4b81-996e-c32d3b9eda5d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mchladjai@gmail.com',
  '$2a$10$ja/NuawcuERwM.KvHZW1DOuy4yqi82I9bMwE2tauwGf6y.RAQpw0q',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BJ","email":"mchladjai@gmail.com","email_verified":false,"first_name":"Michel","full_name":"Michel ADJAÏ","last_name":"ADJAÏ","phone":"+2290","phone_verified":false,"sub":"8261d526-c5b9-4b81-996e-c32d3b9eda5d"}',
  '2026-03-11T09:14:00.306678+00:00',
  '2026-03-11T09:14:00.728786+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '8261d526-c5b9-4b81-996e-c32d3b9eda5d',
  '{"sub":"8261d526-c5b9-4b81-996e-c32d3b9eda5d","email":"mchladjai@gmail.com"}',
  'email',
  '8261d526-c5b9-4b81-996e-c32d3b9eda5d',
  now(),
  '2026-03-11T09:14:00.306678+00:00',
  '2026-03-11T09:14:00.728786+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'c7f070a7-3353-4d2e-9416-973ca4fc36ae',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'lesmeilleurslivres3@gmail.com',
  '$2a$10$OmQEPdcM0kXk61CpsMPwl.2WP8MCDr2t03K7IBhR4IVKsBuqJeUay',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CD","email":"lesmeilleurslivres3@gmail.com","email_verified":true,"first_name":"Livres","full_name":"Livres Les meilleurs","last_name":"Les meilleurs","phone":"+243801039922","phone_verified":false,"sub":"c7f070a7-3353-4d2e-9416-973ca4fc36ae"}',
  '2026-07-04T13:53:38.030423+00:00',
  '2026-07-04T13:54:16.811696+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'c7f070a7-3353-4d2e-9416-973ca4fc36ae',
  '{"sub":"c7f070a7-3353-4d2e-9416-973ca4fc36ae","email":"lesmeilleurslivres3@gmail.com"}',
  'email',
  'c7f070a7-3353-4d2e-9416-973ca4fc36ae',
  now(),
  '2026-07-04T13:53:38.030423+00:00',
  '2026-07-04T13:54:16.811696+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '7fc86377-52b7-447f-85a3-6c9c3fbf8a83',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'benedicteadjai58@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocIFfmr3s7b3_tz9H1QwDGCbbw9vQT8rRalfFum0xxv4FugHww=s96-c","email":"benedicteadjai58@gmail.com","email_verified":true,"full_name":"bénédicte adjai","iss":"https://accounts.google.com","name":"bénédicte adjai","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocIFfmr3s7b3_tz9H1QwDGCbbw9vQT8rRalfFum0xxv4FugHww=s96-c","provider_id":"103913079591848914057","sub":"103913079591848914057"}',
  '2026-03-11T09:24:33.875942+00:00',
  '2026-03-11T11:00:38.732021+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '7fc86377-52b7-447f-85a3-6c9c3fbf8a83',
  '{"sub":"7fc86377-52b7-447f-85a3-6c9c3fbf8a83","email":"benedicteadjai58@gmail.com"}',
  'email',
  '7fc86377-52b7-447f-85a3-6c9c3fbf8a83',
  now(),
  '2026-03-11T09:24:33.875942+00:00',
  '2026-03-11T11:00:38.732021+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '7c606fec-b82e-4866-a1fc-53b41e432801',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dolapoagonan@gmail.com',
  '$2a$10$licLf0qSp1Ucc/9novQFl.s7TLL.FfMTNc3GgNE9pluiAHIanDtCy',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email","google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocL3i7s-nkXKj_i7_3_UMOW1FhCTMQSMqou_GzK-VM_wA0Qb7g=s96-c","email":"dolapoagonan@gmail.com","email_verified":true,"full_name":"Dolapo AGONAN","iss":"https://accounts.google.com","name":"Dolapo AGONAN","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocL3i7s-nkXKj_i7_3_UMOW1FhCTMQSMqou_GzK-VM_wA0Qb7g=s96-c","provider_id":"106774709025489763719","sub":"106774709025489763719"}',
  '2026-03-02T12:11:53.373775+00:00',
  '2026-07-31T15:52:09.596018+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '7c606fec-b82e-4866-a1fc-53b41e432801',
  '{"sub":"7c606fec-b82e-4866-a1fc-53b41e432801","email":"dolapoagonan@gmail.com"}',
  'email',
  '7c606fec-b82e-4866-a1fc-53b41e432801',
  now(),
  '2026-03-02T12:11:53.373775+00:00',
  '2026-07-31T15:52:09.596018+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'ee13f555-74ac-4063-8c7c-871eb7801441',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'djakouwahabou@mail.com',
  '$2a$10$0owt6psGgsLkN7fvs/BLkejUW1JoMS0aCkX4it19GGb5KbpTOKhCy',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BJ","email":"djakouwahabou@mail.com","email_verified":false,"first_name":"Wahab","full_name":"Wahab Djakou","last_name":"Djakou","phone":"+22994165548","phone_verified":false,"sub":"ee13f555-74ac-4063-8c7c-871eb7801441"}',
  '2026-03-11T18:47:13.994154+00:00',
  '2026-03-11T18:47:14.34242+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ee13f555-74ac-4063-8c7c-871eb7801441',
  '{"sub":"ee13f555-74ac-4063-8c7c-871eb7801441","email":"djakouwahabou@mail.com"}',
  'email',
  'ee13f555-74ac-4063-8c7c-871eb7801441',
  now(),
  '2026-03-11T18:47:13.994154+00:00',
  '2026-03-11T18:47:14.34242+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '1082332d-5909-4dcc-97a8-3f3032e5732e',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'tresorgosse3@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocLAq1pb2j6IB04p7E7J6E8lEIXNCiYEDL8ogLb9E7GKPBR3Ug=s96-c","email":"tresorgosse3@gmail.com","email_verified":true,"full_name":"Tresor Gosse","iss":"https://accounts.google.com","name":"Tresor Gosse","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocLAq1pb2j6IB04p7E7J6E8lEIXNCiYEDL8ogLb9E7GKPBR3Ug=s96-c","provider_id":"107538569874792676307","sub":"107538569874792676307"}',
  '2026-04-30T22:51:13.73448+00:00',
  '2026-05-02T04:03:04.812714+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '1082332d-5909-4dcc-97a8-3f3032e5732e',
  '{"sub":"1082332d-5909-4dcc-97a8-3f3032e5732e","email":"tresorgosse3@gmail.com"}',
  'email',
  '1082332d-5909-4dcc-97a8-3f3032e5732e',
  now(),
  '2026-04-30T22:51:13.73448+00:00',
  '2026-05-02T04:03:04.812714+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '8a91a046-b5ee-4343-b0c6-c85b6eaefe1f',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'inoussabikienga42@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocL8Y79COXSYH-5-zqgvvSvLi9FyhJo1zdtd6Sfqs_7F1lxKtHk=s96-c","email":"inoussabikienga42@gmail.com","email_verified":true,"full_name":"Inoussa Bikienga","iss":"https://accounts.google.com","name":"Inoussa Bikienga","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocL8Y79COXSYH-5-zqgvvSvLi9FyhJo1zdtd6Sfqs_7F1lxKtHk=s96-c","provider_id":"102366812288290662234","sub":"102366812288290662234"}',
  '2026-05-06T22:37:55.071361+00:00',
  '2026-05-10T02:10:35.768476+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '8a91a046-b5ee-4343-b0c6-c85b6eaefe1f',
  '{"sub":"8a91a046-b5ee-4343-b0c6-c85b6eaefe1f","email":"inoussabikienga42@gmail.com"}',
  'email',
  '8a91a046-b5ee-4343-b0c6-c85b6eaefe1f',
  now(),
  '2026-05-06T22:37:55.071361+00:00',
  '2026-05-10T02:10:35.768476+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '135d8a4a-48a5-4720-9a84-0e7beb638535',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'cowm942@gmail.com',
  '$2a$10$FfVBRa0Hsuuz6lDrd/4Dz.097A.WVpA5ByJlmAsptRf4Ob9lb1wIu',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CD","email":"cowm942@gmail.com","email_verified":true,"first_name":"Shop","full_name":"Shop MARIUS","last_name":"MARIUS","phone":"+243989973798","phone_verified":false,"sub":"135d8a4a-48a5-4720-9a84-0e7beb638535"}',
  '2026-05-01T16:35:20.146537+00:00',
  '2026-05-01T17:39:16.644152+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '135d8a4a-48a5-4720-9a84-0e7beb638535',
  '{"sub":"135d8a4a-48a5-4720-9a84-0e7beb638535","email":"cowm942@gmail.com"}',
  'email',
  '135d8a4a-48a5-4720-9a84-0e7beb638535',
  now(),
  '2026-05-01T16:35:20.146537+00:00',
  '2026-05-01T17:39:16.644152+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '61db50c8-c800-4103-9092-00b40f1f82d0',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'apersonne23@gmail.com',
  '$2a$10$xRm2miO6vV8wCK1W6bepruUbiSuQxNjK2fRCkMLbrTxjWb1aNSSpG',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CG","email":"apersonne23@gmail.com","email_verified":false,"first_name":"François","full_name":"François Charme","last_name":"Charme","phone":"+242066040500","phone_verified":false,"sub":"61db50c8-c800-4103-9092-00b40f1f82d0"}',
  '2026-07-27T10:11:15.053089+00:00',
  '2026-07-27T10:11:15.379743+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '61db50c8-c800-4103-9092-00b40f1f82d0',
  '{"sub":"61db50c8-c800-4103-9092-00b40f1f82d0","email":"apersonne23@gmail.com"}',
  'email',
  '61db50c8-c800-4103-9092-00b40f1f82d0',
  now(),
  '2026-07-27T10:11:15.053089+00:00',
  '2026-07-27T10:11:15.379743+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'd8dd6ae2-1eb8-4a22-9304-55d36955ee90',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'fcdragon040@gmail.com',
  '$2a$10$yKegvf9arsjJeemmZDAa9eGynzcfmBCm6dwAFtNwzS4ti26FQ2Q5G',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BJ","email":"fcdragon040@gmail.com","email_verified":false,"first_name":"VIATONOU","full_name":"VIATONOU Richnel","last_name":"Richnel","phone":"+22991656977","phone_verified":false,"sub":"d8dd6ae2-1eb8-4a22-9304-55d36955ee90"}',
  '2026-06-24T01:33:42.645821+00:00',
  '2026-06-24T01:36:22.388262+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'd8dd6ae2-1eb8-4a22-9304-55d36955ee90',
  '{"sub":"d8dd6ae2-1eb8-4a22-9304-55d36955ee90","email":"fcdragon040@gmail.com"}',
  'email',
  'd8dd6ae2-1eb8-4a22-9304-55d36955ee90',
  now(),
  '2026-06-24T01:33:42.645821+00:00',
  '2026-06-24T01:36:22.388262+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '96bc9b68-83e2-4e10-b0bc-ae73955e619c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pethuelsiomibin@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocLqIQNVz1ZhQeFDw2qgeWs4xp4qglnnlspeWdFUDQISAiLEuw=s96-c","email":"pethuelsiomibin@gmail.com","email_verified":true,"full_name":"PETHUEL SIOMIBIN","iss":"https://accounts.google.com","name":"PETHUEL SIOMIBIN","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocLqIQNVz1ZhQeFDw2qgeWs4xp4qglnnlspeWdFUDQISAiLEuw=s96-c","provider_id":"112591615783415095960","sub":"112591615783415095960"}',
  '2026-05-01T23:55:46.747951+00:00',
  '2026-05-02T16:17:59.411372+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '96bc9b68-83e2-4e10-b0bc-ae73955e619c',
  '{"sub":"96bc9b68-83e2-4e10-b0bc-ae73955e619c","email":"pethuelsiomibin@gmail.com"}',
  'email',
  '96bc9b68-83e2-4e10-b0bc-ae73955e619c',
  now(),
  '2026-05-01T23:55:46.747951+00:00',
  '2026-05-02T16:17:59.411372+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '4de5e8e7-c48c-4f6f-99a6-0f369c6ee92e',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dorianegbehha@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocIk2BSVGvgMtCrTz7-egVH2lhfCYw6VDOaTA_tAvbqc-do_caaR=s96-c","email":"dorianegbehha@gmail.com","email_verified":true,"full_name":"Doriane Gbehha","iss":"https://accounts.google.com","name":"Doriane Gbehha","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocIk2BSVGvgMtCrTz7-egVH2lhfCYw6VDOaTA_tAvbqc-do_caaR=s96-c","provider_id":"107530870129058488615","sub":"107530870129058488615"}',
  '2026-05-03T17:53:51.75072+00:00',
  '2026-05-18T19:30:28.707056+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '4de5e8e7-c48c-4f6f-99a6-0f369c6ee92e',
  '{"sub":"4de5e8e7-c48c-4f6f-99a6-0f369c6ee92e","email":"dorianegbehha@gmail.com"}',
  'email',
  '4de5e8e7-c48c-4f6f-99a6-0f369c6ee92e',
  now(),
  '2026-05-03T17:53:51.75072+00:00',
  '2026-05-18T19:30:28.707056+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '2e0d4ac1-7347-46f9-989b-07a812cf4440',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dolapoecomllc@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJXv1WXUGbcYuisdcjXyHGnOFLBD4COYkU-6YCPS5PzA6TEyA=s96-c","email":"dolapoecomllc@gmail.com","email_verified":true,"full_name":"Dolapo Ecom","iss":"https://accounts.google.com","name":"Dolapo Ecom","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJXv1WXUGbcYuisdcjXyHGnOFLBD4COYkU-6YCPS5PzA6TEyA=s96-c","provider_id":"101265414092395010823","sub":"101265414092395010823"}',
  '2026-03-02T15:42:25.197328+00:00',
  '2026-05-07T00:01:33.145314+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '2e0d4ac1-7347-46f9-989b-07a812cf4440',
  '{"sub":"2e0d4ac1-7347-46f9-989b-07a812cf4440","email":"dolapoecomllc@gmail.com"}',
  'email',
  '2e0d4ac1-7347-46f9-989b-07a812cf4440',
  now(),
  '2026-03-02T15:42:25.197328+00:00',
  '2026-05-07T00:01:33.145314+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'ab898c7d-13b3-423a-aa2c-d35d2c7c1022',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'agbalefrancis90@gmail.com',
  '$2a$10$rRg53.TvXaDsfLRvl7k02esAvpK2rO.RLKnx00vr2xrwKBvx4GhSO',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BJ","email":"agbalefrancis90@gmail.com","email_verified":true,"first_name":"Francis","full_name":"Francis Agbale","last_name":"Agbale","phone":"+22990825577","phone_verified":false,"sub":"ab898c7d-13b3-423a-aa2c-d35d2c7c1022"}',
  '2026-05-04T09:10:35.120259+00:00',
  '2026-05-04T09:11:39.189271+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ab898c7d-13b3-423a-aa2c-d35d2c7c1022',
  '{"sub":"ab898c7d-13b3-423a-aa2c-d35d2c7c1022","email":"agbalefrancis90@gmail.com"}',
  'email',
  'ab898c7d-13b3-423a-aa2c-d35d2c7c1022',
  now(),
  '2026-05-04T09:10:35.120259+00:00',
  '2026-05-04T09:11:39.189271+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '9d86c1fc-4295-4145-988f-ba0839816e96',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'achouodilonseka87@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocKVWFOA8zdaWOwxAUpVE7R4EZKNhZsHxCf1jvf77lpwcmWi=s96-c","email":"achouodilonseka87@gmail.com","email_verified":true,"full_name":"Seka Achou odilon","iss":"https://accounts.google.com","name":"Seka Achou odilon","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocKVWFOA8zdaWOwxAUpVE7R4EZKNhZsHxCf1jvf77lpwcmWi=s96-c","provider_id":"106542481329695244690","sub":"106542481329695244690"}',
  '2026-05-25T00:24:26.248274+00:00',
  '2026-05-25T13:32:13.957995+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '9d86c1fc-4295-4145-988f-ba0839816e96',
  '{"sub":"9d86c1fc-4295-4145-988f-ba0839816e96","email":"achouodilonseka87@gmail.com"}',
  'email',
  '9d86c1fc-4295-4145-988f-ba0839816e96',
  now(),
  '2026-05-25T00:24:26.248274+00:00',
  '2026-05-25T13:32:13.957995+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '4a8d30cb-2a5d-441e-be0a-432da1d60cb8',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'awowofally@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocISstXvfOh3R1GbZXqtnxgDk8Mo6PvfZsf4bB1i0J94ds86CA=s96-c","email":"awowofally@gmail.com","email_verified":true,"full_name":"Fally Awowo","iss":"https://accounts.google.com","name":"Fally Awowo","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocISstXvfOh3R1GbZXqtnxgDk8Mo6PvfZsf4bB1i0J94ds86CA=s96-c","provider_id":"106157478632735386340","sub":"106157478632735386340"}',
  '2026-05-17T18:50:00.626024+00:00',
  '2026-07-13T08:49:29.990338+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '4a8d30cb-2a5d-441e-be0a-432da1d60cb8',
  '{"sub":"4a8d30cb-2a5d-441e-be0a-432da1d60cb8","email":"awowofally@gmail.com"}',
  'email',
  '4a8d30cb-2a5d-441e-be0a-432da1d60cb8',
  now(),
  '2026-05-17T18:50:00.626024+00:00',
  '2026-07-13T08:49:29.990338+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'f4261571-3bee-404b-909a-8340e0e22a76',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'annjolias@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJ9NURAGgnXiQvuMkogl5nr800Zrdu79vtlD6FDVGAPIT74tw=s96-c","email":"annjolias@gmail.com","email_verified":true,"full_name":"Jolias Ann","iss":"https://accounts.google.com","name":"Jolias Ann","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJ9NURAGgnXiQvuMkogl5nr800Zrdu79vtlD6FDVGAPIT74tw=s96-c","provider_id":"114526883349065422510","sub":"114526883349065422510"}',
  '2026-05-01T17:38:47.839235+00:00',
  '2026-05-28T07:34:19.224769+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'f4261571-3bee-404b-909a-8340e0e22a76',
  '{"sub":"f4261571-3bee-404b-909a-8340e0e22a76","email":"annjolias@gmail.com"}',
  'email',
  'f4261571-3bee-404b-909a-8340e0e22a76',
  now(),
  '2026-05-01T17:38:47.839235+00:00',
  '2026-05-28T07:34:19.224769+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '7d5f8bca-257a-4b8d-bc45-9cc008338a43',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'empirerichnel@gmail.com',
  '$2a$10$N5Dcnt0u31TTo3uF/4qm5OfP4etAkVpD/oNblcGsbIMw5oyeB3fye',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BJ","email":"empirerichnel@gmail.com","email_verified":false,"first_name":"VIATONOU","full_name":"VIATONOU Richnel","last_name":"Richnel","phone":"+22991656977","phone_verified":false,"sub":"7d5f8bca-257a-4b8d-bc45-9cc008338a43"}',
  '2026-06-24T01:38:46.916917+00:00',
  '2026-06-24T01:38:47.144231+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '7d5f8bca-257a-4b8d-bc45-9cc008338a43',
  '{"sub":"7d5f8bca-257a-4b8d-bc45-9cc008338a43","email":"empirerichnel@gmail.com"}',
  'email',
  '7d5f8bca-257a-4b8d-bc45-9cc008338a43',
  now(),
  '2026-06-24T01:38:46.916917+00:00',
  '2026-06-24T01:38:47.144231+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'd96c3894-75ab-4d54-be43-23a1b15a7d25',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'tobisomakpo@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJ0Mf4-qqBtymOWTFIA3qjnf-vb9Q3oJGjbOh3c-o2IMwpuZQ=s96-c","email":"tobisomakpo@gmail.com","email_verified":true,"full_name":"Tobi SOMAKPO","iss":"https://accounts.google.com","name":"Tobi SOMAKPO","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJ0Mf4-qqBtymOWTFIA3qjnf-vb9Q3oJGjbOh3c-o2IMwpuZQ=s96-c","provider_id":"104895843082728433212","sub":"104895843082728433212"}',
  '2026-05-05T01:31:59.540181+00:00',
  '2026-05-05T01:31:59.667008+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'd96c3894-75ab-4d54-be43-23a1b15a7d25',
  '{"sub":"d96c3894-75ab-4d54-be43-23a1b15a7d25","email":"tobisomakpo@gmail.com"}',
  'email',
  'd96c3894-75ab-4d54-be43-23a1b15a7d25',
  now(),
  '2026-05-05T01:31:59.540181+00:00',
  '2026-05-05T01:31:59.667008+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '58e96df5-2c65-4cbe-b9cd-b732ac3d2562',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'simolviematondele04@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJWGhATYb2k1Ze0ax0zvqHSwyiAMgyA-wcN6wyKzijtGwwx0w=s96-c","email":"simolviematondele04@gmail.com","email_verified":true,"full_name":"Simolvie Matondele","iss":"https://accounts.google.com","name":"Simolvie Matondele","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJWGhATYb2k1Ze0ax0zvqHSwyiAMgyA-wcN6wyKzijtGwwx0w=s96-c","provider_id":"117846142125832579271","sub":"117846142125832579271"}',
  '2026-05-06T23:06:06.082032+00:00',
  '2026-05-06T23:06:31.355262+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '58e96df5-2c65-4cbe-b9cd-b732ac3d2562',
  '{"sub":"58e96df5-2c65-4cbe-b9cd-b732ac3d2562","email":"simolviematondele04@gmail.com"}',
  'email',
  '58e96df5-2c65-4cbe-b9cd-b732ac3d2562',
  now(),
  '2026-05-06T23:06:06.082032+00:00',
  '2026-05-06T23:06:31.355262+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '05871f59-00f0-4f90-af69-97ac5ea5642a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'williamsanato16@gmail.com',
  '$2a$10$RGdrcAnYIzrkPaUzW.TWTeVjFetUi241INkuEHbmWph0BTNpecjyO',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email","google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocLCAzICBZOIINCrLyRm--EUx1L0BIonepfSR2vi3FENNQqzPw=s96-c","country_code":"BJ","email":"williamsanato16@gmail.com","email_verified":true,"first_name":"wisdom","full_name":"Williams Anato","iss":"https://accounts.google.com","last_name":"ANATO","name":"Williams Anato","phone":"+22966541794","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocLCAzICBZOIINCrLyRm--EUx1L0BIonepfSR2vi3FENNQqzPw=s96-c","provider_id":"108183509198958134616","sub":"108183509198958134616"}',
  '2026-05-08T10:34:06.910548+00:00',
  '2026-05-14T01:10:26.445848+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '05871f59-00f0-4f90-af69-97ac5ea5642a',
  '{"sub":"05871f59-00f0-4f90-af69-97ac5ea5642a","email":"williamsanato16@gmail.com"}',
  'email',
  '05871f59-00f0-4f90-af69-97ac5ea5642a',
  now(),
  '2026-05-08T10:34:06.910548+00:00',
  '2026-05-14T01:10:26.445848+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '680d84a0-5fbb-4f6f-9a10-233d510aae9d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'majestibamigbowu231@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocKDxmq2x9PmiE1Ar7Z_qpIvXVNqYCc3ED5wNHt9M4WXQu7Cnw=s96-c","email":"majestibamigbowu231@gmail.com","email_verified":true,"full_name":"ESAIE BAMIGBOWU","iss":"https://accounts.google.com","name":"ESAIE BAMIGBOWU","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocKDxmq2x9PmiE1Ar7Z_qpIvXVNqYCc3ED5wNHt9M4WXQu7Cnw=s96-c","provider_id":"101999677067543454508","sub":"101999677067543454508"}',
  '2026-05-05T19:32:35.920094+00:00',
  '2026-05-05T19:32:35.96944+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '680d84a0-5fbb-4f6f-9a10-233d510aae9d',
  '{"sub":"680d84a0-5fbb-4f6f-9a10-233d510aae9d","email":"majestibamigbowu231@gmail.com"}',
  'email',
  '680d84a0-5fbb-4f6f-9a10-233d510aae9d',
  now(),
  '2026-05-05T19:32:35.920094+00:00',
  '2026-05-05T19:32:35.96944+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '1c92e272-e87c-41ce-a523-8fa7bb2aca5a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mauricesong696@gmail.com',
  '$2a$10$7qv0WG6CYfD8O.RC63ciruaXTBjVwa3o7AJkgOWOesKS8WfWNUGoG',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CM","email":"mauricesong696@gmail.com","email_verified":true,"first_name":"Maurice mirabeau","full_name":"Maurice mirabeau Song","last_name":"Song","phone":"+237670009037","phone_verified":false,"sub":"1c92e272-e87c-41ce-a523-8fa7bb2aca5a"}',
  '2026-05-28T08:54:06.245622+00:00',
  '2026-05-28T08:56:51.392195+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '1c92e272-e87c-41ce-a523-8fa7bb2aca5a',
  '{"sub":"1c92e272-e87c-41ce-a523-8fa7bb2aca5a","email":"mauricesong696@gmail.com"}',
  'email',
  '1c92e272-e87c-41ce-a523-8fa7bb2aca5a',
  now(),
  '2026-05-28T08:54:06.245622+00:00',
  '2026-05-28T08:56:51.392195+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'f599b8ac-8f86-49bd-af68-e6824578b2fb',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'emmamsmillards018@gmail.com',
  '$2a$10$m3oyJ55wWjnv4DCMykx.le/UTPIyVbY4j7Qny1zhBYKWTvRkpj3Qe',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CD","email":"emmamsmillards018@gmail.com","email_verified":false,"first_name":"Emmam’s","full_name":"Emmam’s Milliards","last_name":"Milliards","phone":"+243982067837","phone_verified":false,"sub":"f599b8ac-8f86-49bd-af68-e6824578b2fb"}',
  '2026-06-08T17:54:17.064665+00:00',
  '2026-06-08T17:54:17.414924+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'f599b8ac-8f86-49bd-af68-e6824578b2fb',
  '{"sub":"f599b8ac-8f86-49bd-af68-e6824578b2fb","email":"emmamsmillards018@gmail.com"}',
  'email',
  'f599b8ac-8f86-49bd-af68-e6824578b2fb',
  now(),
  '2026-06-08T17:54:17.064665+00:00',
  '2026-06-08T17:54:17.414924+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '97a51b32-37a7-4b07-b5e9-b427e02593b1',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'emmamsbusinesses@gmail.com',
  '$2a$10$ZiYbTUFn3dYlmN4SyFZ8regy7lme1T4KZGsQde0KI7vgY2jBxn1mu',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CD","email":"emmamsbusinesses@gmail.com","email_verified":true,"first_name":"emmam''s","full_name":"emmam''s milliards","last_name":"milliards","phone":"+243982067837","phone_verified":false,"sub":"97a51b32-37a7-4b07-b5e9-b427e02593b1"}',
  '2026-06-08T17:55:52.515822+00:00',
  '2026-06-08T17:56:42.651199+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '97a51b32-37a7-4b07-b5e9-b427e02593b1',
  '{"sub":"97a51b32-37a7-4b07-b5e9-b427e02593b1","email":"emmamsbusinesses@gmail.com"}',
  'email',
  '97a51b32-37a7-4b07-b5e9-b427e02593b1',
  now(),
  '2026-06-08T17:55:52.515822+00:00',
  '2026-06-08T17:56:42.651199+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'ca57333c-fc26-4276-9b3c-ddfe5f8c9ffd',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ramajohnne@gmail.com',
  '$2a$10$S6IdhSqig.CwQRRMuMl5QOWiLFWJE3p2xF.BaIcFvTBPESDxSeVQK',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CD","email":"ramajohnne@gmail.com","email_verified":false,"first_name":"Rama","full_name":"Rama Johnne","last_name":"Johnne","phone":"+243971998150","phone_verified":false,"sub":"ca57333c-fc26-4276-9b3c-ddfe5f8c9ffd"}',
  '2026-06-26T15:10:57.69669+00:00',
  '2026-06-26T15:10:58.011586+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ca57333c-fc26-4276-9b3c-ddfe5f8c9ffd',
  '{"sub":"ca57333c-fc26-4276-9b3c-ddfe5f8c9ffd","email":"ramajohnne@gmail.com"}',
  'email',
  'ca57333c-fc26-4276-9b3c-ddfe5f8c9ffd',
  now(),
  '2026-06-26T15:10:57.69669+00:00',
  '2026-06-26T15:10:58.011586+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '522f2148-5a9d-4df0-9dc5-587ce781f24e',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rolfo100@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocL9PuYLP2yGJWR35hztqbIs3opT-XkOc-rGe9VvD3l0bipDEZeS=s96-c","email":"rolfo100@gmail.com","email_verified":true,"full_name":"ESSOH Rodolphe","iss":"https://accounts.google.com","name":"ESSOH Rodolphe","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocL9PuYLP2yGJWR35hztqbIs3opT-XkOc-rGe9VvD3l0bipDEZeS=s96-c","provider_id":"105553437665199127029","sub":"105553437665199127029"}',
  '2026-05-08T10:44:50.20106+00:00',
  '2026-05-08T10:44:50.379749+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '522f2148-5a9d-4df0-9dc5-587ce781f24e',
  '{"sub":"522f2148-5a9d-4df0-9dc5-587ce781f24e","email":"rolfo100@gmail.com"}',
  'email',
  '522f2148-5a9d-4df0-9dc5-587ce781f24e',
  now(),
  '2026-05-08T10:44:50.20106+00:00',
  '2026-05-08T10:44:50.379749+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '1771a055-5bad-455d-81f1-4dabc21ebb6e',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'silencieuxlefantome@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJJIng2B70gRzsLOf6Ax7-Tj4gyN5bsbKtEcmOguvBYQgoIUw=s96-c","email":"silencieuxlefantome@gmail.com","email_verified":true,"full_name":"Lefantome Silencieux","iss":"https://accounts.google.com","name":"Lefantome Silencieux","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJJIng2B70gRzsLOf6Ax7-Tj4gyN5bsbKtEcmOguvBYQgoIUw=s96-c","provider_id":"112950013650770396678","sub":"112950013650770396678"}',
  '2026-05-19T01:35:47.783369+00:00',
  '2026-05-19T01:36:30.50262+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '1771a055-5bad-455d-81f1-4dabc21ebb6e',
  '{"sub":"1771a055-5bad-455d-81f1-4dabc21ebb6e","email":"silencieuxlefantome@gmail.com"}',
  'email',
  '1771a055-5bad-455d-81f1-4dabc21ebb6e',
  now(),
  '2026-05-19T01:35:47.783369+00:00',
  '2026-05-19T01:36:30.50262+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '8748478b-df0c-47ac-a0a8-4fbede28e6eb',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'miranirinamarius@gmail.com',
  '$2a$10$LcjVeP5aHiI1Jj011PK/9.ouKylc3zQnORGNrfMhIdEgsx1qHin5G',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"MG","email":"miranirinamarius@gmail.com","email_verified":true,"first_name":"Marius Claude","full_name":"Marius Claude MIRANIRINA","last_name":"MIRANIRINA","phone":"+261383719003","phone_verified":false,"sub":"8748478b-df0c-47ac-a0a8-4fbede28e6eb"}',
  '2026-07-05T11:07:11.567045+00:00',
  '2026-07-17T17:34:43.142496+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '8748478b-df0c-47ac-a0a8-4fbede28e6eb',
  '{"sub":"8748478b-df0c-47ac-a0a8-4fbede28e6eb","email":"miranirinamarius@gmail.com"}',
  'email',
  '8748478b-df0c-47ac-a0a8-4fbede28e6eb',
  now(),
  '2026-07-05T11:07:11.567045+00:00',
  '2026-07-17T17:34:43.142496+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '5dc5038b-698e-4138-b7eb-70507c7e94d2',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'agonandolapo@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocLiyoKwaaSDrSt3xYllBVQruHy8rGC0_zKHcWysUa8D5YmyMA=s96-c","email":"agonandolapo@gmail.com","email_verified":true,"full_name":"Dolapo AGONAN","iss":"https://accounts.google.com","name":"Dolapo AGONAN","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocLiyoKwaaSDrSt3xYllBVQruHy8rGC0_zKHcWysUa8D5YmyMA=s96-c","provider_id":"104838757913865627747","sub":"104838757913865627747"}',
  '2026-05-10T10:37:28.513243+00:00',
  '2026-05-10T12:38:21.356416+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '5dc5038b-698e-4138-b7eb-70507c7e94d2',
  '{"sub":"5dc5038b-698e-4138-b7eb-70507c7e94d2","email":"agonandolapo@gmail.com"}',
  'email',
  '5dc5038b-698e-4138-b7eb-70507c7e94d2',
  now(),
  '2026-05-10T10:37:28.513243+00:00',
  '2026-05-10T12:38:21.356416+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'a9266817-f1ec-49ab-911a-27c855a26a51',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'karelleesther6@gmail.com',
  '$2a$10$r77MlFI64tMrgO0EcY/93.bpiauZXCaTwo3jBlRXm1nZ4FLXrCrt.',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CD","email":"karelleesther6@gmail.com","email_verified":false,"first_name":"Karelle","full_name":"Karelle Lau","last_name":"Lau","phone":"+243856340851","phone_verified":false,"sub":"a9266817-f1ec-49ab-911a-27c855a26a51"}',
  '2026-06-09T08:14:07.256008+00:00',
  '2026-06-09T08:14:07.623396+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'a9266817-f1ec-49ab-911a-27c855a26a51',
  '{"sub":"a9266817-f1ec-49ab-911a-27c855a26a51","email":"karelleesther6@gmail.com"}',
  'email',
  'a9266817-f1ec-49ab-911a-27c855a26a51',
  now(),
  '2026-06-09T08:14:07.256008+00:00',
  '2026-06-09T08:14:07.623396+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '733ef252-3cd6-4734-9051-11892243cd4b',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'raksjoshuayoan@gmail.com',
  '$2a$10$mXVAHMNfDGeHNNd2G9s90OPxx2ewJuPe9vd5wk9Y/aqHj60/hIpm.',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"MG","email":"raksjoshuayoan@gmail.com","email_verified":true,"first_name":"Yoan","full_name":"Yoan Joshua","last_name":"Joshua","phone":"+261381722284","phone_verified":false,"sub":"733ef252-3cd6-4734-9051-11892243cd4b"}',
  '2026-06-26T15:11:32.157892+00:00',
  '2026-06-26T15:14:15.032504+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '733ef252-3cd6-4734-9051-11892243cd4b',
  '{"sub":"733ef252-3cd6-4734-9051-11892243cd4b","email":"raksjoshuayoan@gmail.com"}',
  'email',
  '733ef252-3cd6-4734-9051-11892243cd4b',
  now(),
  '2026-06-26T15:11:32.157892+00:00',
  '2026-06-26T15:14:15.032504+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '77924e88-6c34-4ca0-8e90-f1fb8620f2b0',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'akobacliff4@gmail.com',
  '$2a$10$ZgiQAhEK61s4efATtBy10.SJKUBD0RCe3UOvXlIfpXrPeEe.BaF6e',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CG","email":"akobacliff4@gmail.com","email_verified":false,"first_name":"Cliff","full_name":"Cliff Akoba","last_name":"Akoba","phone":"+242242064991038","phone_verified":false,"sub":"77924e88-6c34-4ca0-8e90-f1fb8620f2b0"}',
  '2026-07-29T19:37:30.994638+00:00',
  '2026-07-29T19:37:31.349045+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '77924e88-6c34-4ca0-8e90-f1fb8620f2b0',
  '{"sub":"77924e88-6c34-4ca0-8e90-f1fb8620f2b0","email":"akobacliff4@gmail.com"}',
  'email',
  '77924e88-6c34-4ca0-8e90-f1fb8620f2b0',
  now(),
  '2026-07-29T19:37:30.994638+00:00',
  '2026-07-29T19:37:31.349045+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'a7624930-80ee-4f83-808f-13d2309d73f3',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'abdulked@gmail.com',
  '$2a$10$SEhpObSv/e5c6jaAOf0j8ei6.e8NAJI1/iEzv1yUHsuMUUam4JqO.',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BJ","email":"abdulked@gmail.com","email_verified":true,"first_name":"Abdul","full_name":"Abdul Keitchion","last_name":"Keitchion","phone":"+2290167541944","phone_verified":false,"sub":"a7624930-80ee-4f83-808f-13d2309d73f3"}',
  '2026-05-28T09:50:26.125637+00:00',
  '2026-05-29T09:30:40.99953+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'a7624930-80ee-4f83-808f-13d2309d73f3',
  '{"sub":"a7624930-80ee-4f83-808f-13d2309d73f3","email":"abdulked@gmail.com"}',
  'email',
  'a7624930-80ee-4f83-808f-13d2309d73f3',
  now(),
  '2026-05-28T09:50:26.125637+00:00',
  '2026-05-29T09:30:40.99953+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'a3dd991a-d762-4d33-9f9b-8a786f7c3373',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'xmenedit625@gmail.com',
  '$2a$10$DhXmeY9kdrDUJt5XTAAcve5ESV2cuAP5B6Y7Ze/aqYgyFy.u.ZMbO',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"TD","email":"xmenedit625@gmail.com","email_verified":false,"first_name":"Hassan","full_name":"Hassan Ali","last_name":"Ali","phone":"+23523561936272","phone_verified":false,"sub":"a3dd991a-d762-4d33-9f9b-8a786f7c3373"}',
  '2026-07-30T10:40:29.441552+00:00',
  '2026-07-30T10:40:29.758551+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'a3dd991a-d762-4d33-9f9b-8a786f7c3373',
  '{"sub":"a3dd991a-d762-4d33-9f9b-8a786f7c3373","email":"xmenedit625@gmail.com"}',
  'email',
  'a3dd991a-d762-4d33-9f9b-8a786f7c3373',
  now(),
  '2026-07-30T10:40:29.441552+00:00',
  '2026-07-30T10:40:29.758551+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '0792839f-1188-45ae-97f5-f0983c9d5df9',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'assoumanoufarida6@gmail.com',
  '$2a$10$mh3ZMq2JVv.wNRDuuzEWV.Gm0fE.v6AtmZ7IGJ1b469cs6q98qOX2',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"TG","email":"assoumanoufarida6@gmail.com","email_verified":false,"first_name":"Farida","full_name":"Farida ASSOUMANOU","last_name":"ASSOUMANOU","phone":"+22872038496","phone_verified":false,"sub":"0792839f-1188-45ae-97f5-f0983c9d5df9"}',
  '2026-06-10T17:33:57.884834+00:00',
  '2026-06-10T17:35:53.545543+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '0792839f-1188-45ae-97f5-f0983c9d5df9',
  '{"sub":"0792839f-1188-45ae-97f5-f0983c9d5df9","email":"assoumanoufarida6@gmail.com"}',
  'email',
  '0792839f-1188-45ae-97f5-f0983c9d5df9',
  now(),
  '2026-06-10T17:33:57.884834+00:00',
  '2026-06-10T17:35:53.545543+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'f437e368-ae59-435f-ae97-ec0babf8fcfb',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'zoleguecoulibaly0@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJunKqSmOZFdrJw9yv-jj1a01YQapd3-BqRvZ4yVJLg5t8ANw=s96-c","email":"zoleguecoulibaly0@gmail.com","email_verified":true,"full_name":"Zolegue Coulibaly","iss":"https://accounts.google.com","name":"Zolegue Coulibaly","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJunKqSmOZFdrJw9yv-jj1a01YQapd3-BqRvZ4yVJLg5t8ANw=s96-c","provider_id":"108509693939909062294","sub":"108509693939909062294"}',
  '2026-05-09T02:05:17.825228+00:00',
  '2026-05-09T09:13:38.565404+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'f437e368-ae59-435f-ae97-ec0babf8fcfb',
  '{"sub":"f437e368-ae59-435f-ae97-ec0babf8fcfb","email":"zoleguecoulibaly0@gmail.com"}',
  'email',
  'f437e368-ae59-435f-ae97-ec0babf8fcfb',
  now(),
  '2026-05-09T02:05:17.825228+00:00',
  '2026-05-09T09:13:38.565404+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'e209dc46-fc05-4a39-9113-5a0522746a53',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'worasamseny@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocKrvevDwBFxb-lbst2iSjtyLgkyfMgu8d4bqyYA0JHc9aRU19zc=s96-c","email":"worasamseny@gmail.com","email_verified":true,"full_name":"Evrad Noé NM","iss":"https://accounts.google.com","name":"Evrad Noé NM","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocKrvevDwBFxb-lbst2iSjtyLgkyfMgu8d4bqyYA0JHc9aRU19zc=s96-c","provider_id":"110036124055274677830","sub":"110036124055274677830"}',
  '2026-05-20T21:44:52.035012+00:00',
  '2026-05-21T22:52:11.679916+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'e209dc46-fc05-4a39-9113-5a0522746a53',
  '{"sub":"e209dc46-fc05-4a39-9113-5a0522746a53","email":"worasamseny@gmail.com"}',
  'email',
  'e209dc46-fc05-4a39-9113-5a0522746a53',
  now(),
  '2026-05-20T21:44:52.035012+00:00',
  '2026-05-21T22:52:11.679916+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '56e5424b-9ae5-402b-a08b-e0f13cd9ee6c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'yuno7.collab@gmail.com',
  '$2a$10$lq3655Y0d8kfnQc.NBF1uOKpYEyG2G2jl1PCdZE9M35GF7Vu0e.nW',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"TD","email":"yuno7.collab@gmail.com","email_verified":true,"first_name":"Sougui","full_name":"Sougui Moussa","last_name":"Moussa","phone":"+23569247463","phone_verified":false,"sub":"56e5424b-9ae5-402b-a08b-e0f13cd9ee6c"}',
  '2026-05-10T11:34:03.203104+00:00',
  '2026-05-10T11:34:56.212058+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '56e5424b-9ae5-402b-a08b-e0f13cd9ee6c',
  '{"sub":"56e5424b-9ae5-402b-a08b-e0f13cd9ee6c","email":"yuno7.collab@gmail.com"}',
  'email',
  '56e5424b-9ae5-402b-a08b-e0f13cd9ee6c',
  now(),
  '2026-05-10T11:34:03.203104+00:00',
  '2026-05-10T11:34:56.212058+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'dd17306f-d84b-4153-a14b-73e5ce3f40a4',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'yohansamuelkouassi12@gmail.com',
  '$2a$10$AHiDhMbfO7S3dEM90M.OVe9Ahpro0w.yoW6kkU4R/XRTuUqVpoAAS',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CI","email":"yohansamuelkouassi12@gmail.com","email_verified":false,"first_name":"yohan","full_name":"yohan KOUASSI","last_name":"KOUASSI","phone":"+2250594354516","phone_verified":false,"sub":"dd17306f-d84b-4153-a14b-73e5ce3f40a4"}',
  '2026-07-06T10:56:18.139921+00:00',
  '2026-07-06T10:56:18.475548+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'dd17306f-d84b-4153-a14b-73e5ce3f40a4',
  '{"sub":"dd17306f-d84b-4153-a14b-73e5ce3f40a4","email":"yohansamuelkouassi12@gmail.com"}',
  'email',
  'dd17306f-d84b-4153-a14b-73e5ce3f40a4',
  now(),
  '2026-07-06T10:56:18.139921+00:00',
  '2026-07-06T10:56:18.475548+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'c0fb1f0f-86ed-4247-bf70-d185251dfc62',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ramajohnny@gmail.com',
  '$2a$10$4An9h2/yNX.I3mI.WVOgeund79xaCAAfBhVWDQZY.YTKJnh19S6Pe',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CD","email":"ramajohnny@gmail.com","email_verified":false,"first_name":"Rama","full_name":"Rama Johnny","last_name":"Johnny","phone":"+243971998150","phone_verified":false,"sub":"c0fb1f0f-86ed-4247-bf70-d185251dfc62"}',
  '2026-06-26T15:16:07.322413+00:00',
  '2026-06-26T15:16:07.688253+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'c0fb1f0f-86ed-4247-bf70-d185251dfc62',
  '{"sub":"c0fb1f0f-86ed-4247-bf70-d185251dfc62","email":"ramajohnny@gmail.com"}',
  'email',
  'c0fb1f0f-86ed-4247-bf70-d185251dfc62',
  now(),
  '2026-06-26T15:16:07.322413+00:00',
  '2026-06-26T15:16:07.688253+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'd73eb97e-6751-4b3e-9e75-977c74c8c174',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'abbasyassine23@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJ15kWCTRkj25mbhWPRqtKkRVuEEns3EYMLSK0cp6N88MBoHH8=s96-c","email":"abbasyassine23@gmail.com","email_verified":true,"full_name":"Yassine Abbas","iss":"https://accounts.google.com","name":"Yassine Abbas","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJ15kWCTRkj25mbhWPRqtKkRVuEEns3EYMLSK0cp6N88MBoHH8=s96-c","provider_id":"109931095417014410794","sub":"109931095417014410794"}',
  '2026-05-21T15:56:51.202516+00:00',
  '2026-05-25T21:44:07.880705+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'd73eb97e-6751-4b3e-9e75-977c74c8c174',
  '{"sub":"d73eb97e-6751-4b3e-9e75-977c74c8c174","email":"abbasyassine23@gmail.com"}',
  'email',
  'd73eb97e-6751-4b3e-9e75-977c74c8c174',
  now(),
  '2026-05-21T15:56:51.202516+00:00',
  '2026-05-25T21:44:07.880705+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'abd802d6-cc65-4d06-be77-d976d1d10ee9',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'alijr458@gmail.com',
  '$2a$10$0n28l5wAGkorwR9S98ls7Ofwp.i0euVcN1VsYzHQvEhF/GmtEnozq',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"TD","email":"alijr458@gmail.com","email_verified":false,"first_name":"Ali","full_name":"Ali Hassan","last_name":"Hassan","phone":"+23596237789","phone_verified":false,"sub":"abd802d6-cc65-4d06-be77-d976d1d10ee9"}',
  '2026-07-30T10:44:11.040817+00:00',
  '2026-07-30T10:44:11.391308+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'abd802d6-cc65-4d06-be77-d976d1d10ee9',
  '{"sub":"abd802d6-cc65-4d06-be77-d976d1d10ee9","email":"alijr458@gmail.com"}',
  'email',
  'abd802d6-cc65-4d06-be77-d976d1d10ee9',
  now(),
  '2026-07-30T10:44:11.040817+00:00',
  '2026-07-30T10:44:11.391308+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '1391d92e-b472-42c4-9d5b-3aa64fe6fdb8',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'yorisdanon@gmail.col',
  '$2a$10$wQoXTj7QtGYAVXS4I9jSDOkZsYnJVCn5t3fviqJ2OIGr3eZuEMwTO',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CI","email":"yorisdanon@gmail.col","email_verified":false,"first_name":"Maxwell","full_name":"Maxwell Danon","last_name":"Danon","phone":"+2250778904044","phone_verified":false,"sub":"1391d92e-b472-42c4-9d5b-3aa64fe6fdb8"}',
  '2026-05-10T15:51:09.943252+00:00',
  '2026-05-10T15:51:10.302705+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '1391d92e-b472-42c4-9d5b-3aa64fe6fdb8',
  '{"sub":"1391d92e-b472-42c4-9d5b-3aa64fe6fdb8","email":"yorisdanon@gmail.col"}',
  'email',
  '1391d92e-b472-42c4-9d5b-3aa64fe6fdb8',
  now(),
  '2026-05-10T15:51:09.943252+00:00',
  '2026-05-10T15:51:10.302705+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'c3ed873a-86ab-4465-98d4-0696cd9e587a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'jokerlarosa76@gmail.com',
  '$2a$10$VGYfL2ni/eCo29cMRKnYuOOqZx1yMzloqfNSh3KjoyM2.WYu2RAgu',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"GA","email":"jokerlarosa76@gmail.com","email_verified":true,"first_name":"BIYOGO","full_name":"BIYOGO Landry","last_name":"Landry","phone":"+24176310494","phone_verified":false,"sub":"c3ed873a-86ab-4465-98d4-0696cd9e587a"}',
  '2026-06-15T08:07:49.308693+00:00',
  '2026-06-15T19:12:35.899836+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'c3ed873a-86ab-4465-98d4-0696cd9e587a',
  '{"sub":"c3ed873a-86ab-4465-98d4-0696cd9e587a","email":"jokerlarosa76@gmail.com"}',
  'email',
  'c3ed873a-86ab-4465-98d4-0696cd9e587a',
  now(),
  '2026-06-15T08:07:49.308693+00:00',
  '2026-06-15T19:12:35.899836+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '999a50a2-4e5a-4f52-b919-2a9bea2e1192',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'urielyvangad@gmail.com',
  '$2a$10$H.5O3V4SI4rjw14BlfEUVuBGxsyjbW1WjJsBY/KIqTyg8taIo722.',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CI","email":"urielyvangad@gmail.com","email_verified":false,"first_name":"Christ Alex","full_name":"Christ Alex Gadou","last_name":"Gadou","phone":"+2250160646111","phone_verified":false,"sub":"999a50a2-4e5a-4f52-b919-2a9bea2e1192"}',
  '2026-07-06T19:43:52.71231+00:00',
  '2026-07-06T19:43:53.12904+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '999a50a2-4e5a-4f52-b919-2a9bea2e1192',
  '{"sub":"999a50a2-4e5a-4f52-b919-2a9bea2e1192","email":"urielyvangad@gmail.com"}',
  'email',
  '999a50a2-4e5a-4f52-b919-2a9bea2e1192',
  now(),
  '2026-07-06T19:43:52.71231+00:00',
  '2026-07-06T19:43:53.12904+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '5431f6b2-a48d-4129-8635-cd0aead00f4a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'tontonbruno500@gmail.com',
  '$2a$10$ILdXxvbEIQwK7UQq1xyAJOsLn3ajHFa5VIlK44kLG.F4GGxBKkITS',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BJ","email":"tontonbruno500@gmail.com","email_verified":true,"first_name":"Bruno","full_name":"Bruno DEGUENON","last_name":"DEGUENON","phone":"+22969884988","phone_verified":false,"sub":"5431f6b2-a48d-4129-8635-cd0aead00f4a"}',
  '2026-05-09T17:35:54.950705+00:00',
  '2026-07-01T18:09:10.464185+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '5431f6b2-a48d-4129-8635-cd0aead00f4a',
  '{"sub":"5431f6b2-a48d-4129-8635-cd0aead00f4a","email":"tontonbruno500@gmail.com"}',
  'email',
  '5431f6b2-a48d-4129-8635-cd0aead00f4a',
  now(),
  '2026-05-09T17:35:54.950705+00:00',
  '2026-07-01T18:09:10.464185+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'a0479089-251c-4b28-a084-eb6661271874',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'gkwilliam668@gmail.com',
  '$2a$10$FozXLw4wr/6m1bLkMt8BQO0riArLEp597yQ2cPfF5VbZCQhLH4z3W',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CM","email":"gkwilliam668@gmail.com","email_verified":false,"first_name":"Hub","full_name":"Hub Digital Success","last_name":"Digital Success","phone":"+237689860262","phone_verified":false,"sub":"a0479089-251c-4b28-a084-eb6661271874"}',
  '2026-07-02T13:15:59.235238+00:00',
  '2026-07-02T13:15:59.638535+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'a0479089-251c-4b28-a084-eb6661271874',
  '{"sub":"a0479089-251c-4b28-a084-eb6661271874","email":"gkwilliam668@gmail.com"}',
  'email',
  'a0479089-251c-4b28-a084-eb6661271874',
  now(),
  '2026-07-02T13:15:59.235238+00:00',
  '2026-07-02T13:15:59.638535+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '93715001-9d54-41e8-b91f-a3f92acf1309',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'guindonani4@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocIkNHeJrSN1eP2lMsUJMSA3n465HDI1yale9mMGjBA5xl2UxA=s96-c","email":"guindonani4@gmail.com","email_verified":true,"full_name":"Nani Guindo","iss":"https://accounts.google.com","name":"Nani Guindo","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocIkNHeJrSN1eP2lMsUJMSA3n465HDI1yale9mMGjBA5xl2UxA=s96-c","provider_id":"117113365546685734238","sub":"117113365546685734238"}',
  '2026-05-10T00:05:18.337849+00:00',
  '2026-05-10T08:10:08.775214+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '93715001-9d54-41e8-b91f-a3f92acf1309',
  '{"sub":"93715001-9d54-41e8-b91f-a3f92acf1309","email":"guindonani4@gmail.com"}',
  'email',
  '93715001-9d54-41e8-b91f-a3f92acf1309',
  now(),
  '2026-05-10T00:05:18.337849+00:00',
  '2026-05-10T08:10:08.775214+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '449f7025-0da0-43c2-aa19-ce2f8ccf0382',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'zidouemba930@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJsrzH75wsr2TgGY_SN20uXI9rBiuEEXNGxUb5XlnZZhFd8PQ=s96-c","email":"zidouemba930@gmail.com","email_verified":true,"full_name":"Abdoulaye Zidouemba","iss":"https://accounts.google.com","name":"Abdoulaye Zidouemba","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJsrzH75wsr2TgGY_SN20uXI9rBiuEEXNGxUb5XlnZZhFd8PQ=s96-c","provider_id":"116460240048863935507","sub":"116460240048863935507"}',
  '2026-05-09T15:10:44.135605+00:00',
  '2026-05-09T16:08:57.672627+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '449f7025-0da0-43c2-aa19-ce2f8ccf0382',
  '{"sub":"449f7025-0da0-43c2-aa19-ce2f8ccf0382","email":"zidouemba930@gmail.com"}',
  'email',
  '449f7025-0da0-43c2-aa19-ce2f8ccf0382',
  now(),
  '2026-05-09T15:10:44.135605+00:00',
  '2026-05-09T16:08:57.672627+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '67b07f39-c18d-406a-aa9e-4f60105393e0',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'creatorirungjr@gmail.com',
  '$2a$10$NiDxc7Si292/dNZmXO4gHeK5tlx8Fwy8OPgfe7ple1Y0H/.DxT50q',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CD","email":"creatorirungjr@gmail.com","email_verified":true,"first_name":"JR","full_name":"JR CREATOR","last_name":"CREATOR","phone":"+243999525725","phone_verified":false,"sub":"67b07f39-c18d-406a-aa9e-4f60105393e0"}',
  '2026-07-02T22:55:49.971759+00:00',
  '2026-07-06T21:10:17.253348+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '67b07f39-c18d-406a-aa9e-4f60105393e0',
  '{"sub":"67b07f39-c18d-406a-aa9e-4f60105393e0","email":"creatorirungjr@gmail.com"}',
  'email',
  '67b07f39-c18d-406a-aa9e-4f60105393e0',
  now(),
  '2026-07-02T22:55:49.971759+00:00',
  '2026-07-06T21:10:17.253348+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '5e7bf2ed-b96e-4aeb-b638-b5c6111cb690',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'portailsup@gmail.com',
  '$2a$10$DrJxmj2AhEe88TDu/JMReevy2Hd0RRXTXbI47ewzaH301RB3Et8cK',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"FR","email":"portailsup@gmail.com","email_verified":true,"first_name":"Ali","full_name":"Ali SOMBIE","last_name":"SOMBIE","phone":"+33744112555","phone_verified":false,"sub":"5e7bf2ed-b96e-4aeb-b638-b5c6111cb690"}',
  '2026-05-13T20:44:45.495304+00:00',
  '2026-05-13T20:45:12.701665+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '5e7bf2ed-b96e-4aeb-b638-b5c6111cb690',
  '{"sub":"5e7bf2ed-b96e-4aeb-b638-b5c6111cb690","email":"portailsup@gmail.com"}',
  'email',
  '5e7bf2ed-b96e-4aeb-b638-b5c6111cb690',
  now(),
  '2026-05-13T20:44:45.495304+00:00',
  '2026-05-13T20:45:12.701665+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '245929f7-de69-4ab4-abe0-dae35f9e8cba',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'gnamsoupierre@gmail.com',
  '$2a$10$ia0vmF1GzJevjcjhY48zTucCGZJScIW8gJztob/k3xUmNdupc5XPG',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"TG","email":"gnamsoupierre@gmail.com","email_verified":true,"first_name":"Pierre","full_name":"Pierre GNAMSOU","last_name":"GNAMSOU","phone":"+22893540784","phone_verified":false,"sub":"245929f7-de69-4ab4-abe0-dae35f9e8cba"}',
  '2026-05-24T16:27:33.639711+00:00',
  '2026-05-25T12:12:43.870483+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '245929f7-de69-4ab4-abe0-dae35f9e8cba',
  '{"sub":"245929f7-de69-4ab4-abe0-dae35f9e8cba","email":"gnamsoupierre@gmail.com"}',
  'email',
  '245929f7-de69-4ab4-abe0-dae35f9e8cba',
  now(),
  '2026-05-24T16:27:33.639711+00:00',
  '2026-05-25T12:12:43.870483+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'c0b0baff-f6bf-4c88-9dfb-ca1fff48e2b3',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'saadtuhh@gmail.com',
  '$2a$10$9LV7rIdjSZcZNnssvsKVKOR9HnQTbV5FLsa5cptKePrh3YNo5sDvS',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"MR","email":"saadtuhh@gmail.com","email_verified":true,"first_name":"Saad","full_name":"Saad Cheikh Mohamed Vadel","last_name":"Cheikh Mohamed Vadel","phone":"+22236242053","phone_verified":false,"sub":"c0b0baff-f6bf-4c88-9dfb-ca1fff48e2b3"}',
  '2026-07-30T20:51:44.515438+00:00',
  '2026-07-30T20:54:09.434232+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'c0b0baff-f6bf-4c88-9dfb-ca1fff48e2b3',
  '{"sub":"c0b0baff-f6bf-4c88-9dfb-ca1fff48e2b3","email":"saadtuhh@gmail.com"}',
  'email',
  'c0b0baff-f6bf-4c88-9dfb-ca1fff48e2b3',
  now(),
  '2026-07-30T20:51:44.515438+00:00',
  '2026-07-30T20:54:09.434232+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'c46a09c4-a20c-495e-9ad6-5b43bb7857be',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'seniserge05@gmail.com',
  '$2a$10$lADPvmfIubs9KThgRFSJqe6ch7mUvUUPGWuZpBgGYJviflU78.Os.',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BF","email":"seniserge05@gmail.com","email_verified":true,"first_name":"Serge","full_name":"Serge SENI","last_name":"SENI","phone":"+22656876662","phone_verified":false,"sub":"c46a09c4-a20c-495e-9ad6-5b43bb7857be"}',
  '2026-07-06T20:39:16.019304+00:00',
  '2026-07-26T13:59:45.27276+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'c46a09c4-a20c-495e-9ad6-5b43bb7857be',
  '{"sub":"c46a09c4-a20c-495e-9ad6-5b43bb7857be","email":"seniserge05@gmail.com"}',
  'email',
  'c46a09c4-a20c-495e-9ad6-5b43bb7857be',
  now(),
  '2026-07-06T20:39:16.019304+00:00',
  '2026-07-26T13:59:45.27276+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'bb4951d9-0250-4acc-8c27-9cefa20aba78',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'kkrf100@yahoo.com',
  '$2a$10$Yww5SiNZsNJnnrk/bjB5feCnRq1.8.FOGrvuQMJOeKB4iP4Vqs4kS',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CI","email":"kkrf100@yahoo.com","email_verified":true,"first_name":"KOUASSI ROGER FRANCIS","full_name":"KOUASSI ROGER FRANCIS KOUAME","last_name":"KOUAME","phone":"+2250707546113","phone_verified":false,"sub":"bb4951d9-0250-4acc-8c27-9cefa20aba78"}',
  '2026-06-18T23:09:00.62131+00:00',
  '2026-07-17T00:10:39.22873+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'bb4951d9-0250-4acc-8c27-9cefa20aba78',
  '{"sub":"bb4951d9-0250-4acc-8c27-9cefa20aba78","email":"kkrf100@yahoo.com"}',
  'email',
  'bb4951d9-0250-4acc-8c27-9cefa20aba78',
  now(),
  '2026-06-18T23:09:00.62131+00:00',
  '2026-07-17T00:10:39.22873+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '2c0fd2c4-b638-4a45-aa8d-df0adb6412b0',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'yveskakou68@gmail.com',
  '$2a$10$not_a_real_password_just_placeholder_12345678901234567',
  now(),
  now(),
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocIjh7slht7rbMrezyzmb4_G-nBpn-dm5_Glp7SoMEHGMxbv5Yk=s96-c","email":"yveskakou68@gmail.com","email_verified":true,"full_name":"Yves Landry Kakou","iss":"https://accounts.google.com","name":"Yves Landry Kakou","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocIjh7slht7rbMrezyzmb4_G-nBpn-dm5_Glp7SoMEHGMxbv5Yk=s96-c","provider_id":"114667567585475818156","sub":"114667567585475818156"}',
  '2026-05-24T22:26:13.523405+00:00',
  '2026-05-24T22:26:13.646953+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '2c0fd2c4-b638-4a45-aa8d-df0adb6412b0',
  '{"sub":"2c0fd2c4-b638-4a45-aa8d-df0adb6412b0","email":"yveskakou68@gmail.com"}',
  'email',
  '2c0fd2c4-b638-4a45-aa8d-df0adb6412b0',
  now(),
  '2026-05-24T22:26:13.523405+00:00',
  '2026-05-24T22:26:13.646953+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'c3492d3a-e0fa-4069-b004-36bf67c39a46',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'delcredit86@gmail.com',
  '$2a$10$RnCdc1hEedlKWdKHXYIkXuz0GOUtbe0Gsd6sORxjPfGO9qsKSPS5q',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BJ","email":"delcredit86@gmail.com","email_verified":true,"first_name":"Crate","full_name":"Crate Del","last_name":"Del","phone":"+22964946812","phone_verified":false,"sub":"c3492d3a-e0fa-4069-b004-36bf67c39a46"}',
  '2026-05-16T19:14:23.021694+00:00',
  '2026-05-18T14:54:48.478801+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'c3492d3a-e0fa-4069-b004-36bf67c39a46',
  '{"sub":"c3492d3a-e0fa-4069-b004-36bf67c39a46","email":"delcredit86@gmail.com"}',
  'email',
  'c3492d3a-e0fa-4069-b004-36bf67c39a46',
  now(),
  '2026-05-16T19:14:23.021694+00:00',
  '2026-05-18T14:54:48.478801+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  'aceb9d7b-9ec3-4502-b134-ed882bcc64a5',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'kolengueelysee130@gmail.com',
  '$2a$10$rGVMqy6xHt7N3Nn2tHacAeP8z5Px8/wZUuJvJ0YAVqfDJ8131i2Ky',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"CF","email":"kolengueelysee130@gmail.com","email_verified":false,"first_name":"Elysée","full_name":"Elysée KOLENGUE","last_name":"KOLENGUE","phone":"+23623674243390","phone_verified":false,"sub":"aceb9d7b-9ec3-4502-b134-ed882bcc64a5"}',
  '2026-06-21T09:29:05.809988+00:00',
  '2026-06-21T09:31:54.630994+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'aceb9d7b-9ec3-4502-b134-ed882bcc64a5',
  '{"sub":"aceb9d7b-9ec3-4502-b134-ed882bcc64a5","email":"kolengueelysee130@gmail.com"}',
  'email',
  'aceb9d7b-9ec3-4502-b134-ed882bcc64a5',
  now(),
  '2026-06-21T09:29:05.809988+00:00',
  '2026-06-21T09:31:54.630994+00:00'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES (
  '54589aca-0339-4b3a-b4e1-9449be3e8812',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'diatagayonli@gmail.com',
  '$2a$10$wDT2JhQFfPEFQjWLRPXNTOiHhODYgRAWlkVGmgP4pqMJPZHkNklXG',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"country_code":"BF","email":"diatagayonli@gmail.com","email_verified":false,"first_name":"Diataga","full_name":"Diataga Yonli","last_name":"Yonli","phone":"+22674673260","phone_verified":false,"sub":"54589aca-0339-4b3a-b4e1-9449be3e8812"}',
  '2026-07-12T07:24:58.775472+00:00',
  '2026-07-12T07:24:59.216249+00:00',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '54589aca-0339-4b3a-b4e1-9449be3e8812',
  '{"sub":"54589aca-0339-4b3a-b4e1-9449be3e8812","email":"diatagayonli@gmail.com"}',
  'email',
  '54589aca-0339-4b3a-b4e1-9449be3e8812',
  now(),
  '2026-07-12T07:24:58.775472+00:00',
  '2026-07-12T07:24:59.216249+00:00'
) ON CONFLICT DO NOTHING;

