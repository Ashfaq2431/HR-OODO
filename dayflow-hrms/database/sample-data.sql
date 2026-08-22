-- ==========================================================
-- DAYFLOW HRMS - SAMPLE SEED DATA
-- ==========================================================

USE dayflow_hrms;

-- Passwords below are BCrypt hashes for 'Admin@123' and 'Emp@123'
-- 1. SEED USERS
INSERT INTO users (id, employee_id, email, password_hash, role, email_verified) VALUES
(1, 'EMP-ADMIN-001', 'admin@dayflow.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ROLE_HR_ADMIN', TRUE),
(2, 'EMP-2026-001', 'alex.morgan@dayflow.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ROLE_EMPLOYEE', TRUE),
(3, 'EMP-2026-002', 'sarah.connor@dayflow.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ROLE_EMPLOYEE', TRUE),
(4, 'EMP-2026-003', 'david.miller@dayflow.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ROLE_EMPLOYEE', TRUE),
(5, 'EMP-2026-004', 'emily.watson@dayflow.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ROLE_EMPLOYEE', TRUE),
(6, 'EMP-2026-005', 'michael.chen@dayflow.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ROLE_EMPLOYEE', TRUE)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 2. SEED ADMIN USER REGISTRY
INSERT INTO admin_users (id, admin_id, email, admin_role, password_hash) VALUES
(1, 'ADM-001', 'admin@dayflow.com', 'ROLE_HR_ADMIN', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 3. SEED EMPLOYEE PROFILES
INSERT INTO employee_profiles (id, user_id, first_name, last_name, email, phone_number, home_address, date_of_birth, profile_picture_url, department, designation, joining_date, employment_type, reporting_manager, basic_pay, allowances, gross_pay, tax_deduction, pf_deduction) VALUES
(1, 1, 'Eleanor', 'Vance', 'admin@dayflow.com', '+1 (555) 019-2834', '100 Silicon Ave, Suite 500, San Francisco, CA', '1988-04-12', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Human Resources', 'HR Director', '2021-01-15', 'FULL_TIME', 'Executive Board', 95000.00, 15000.00, 110000.00, 16500.00, 5500.00),
(2, 2, 'Alex', 'Morgan', 'alex.morgan@dayflow.com', '+1 (555) 234-5678', '452 Pine Valley Road, Austin, TX', '1992-08-24', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Engineering', 'Senior Backend Engineer', '2022-03-01', 'FULL_TIME', 'Eleanor Vance', 75000.00, 10000.00, 85000.00, 10200.00, 4250.00),
(3, 3, 'Sarah', 'Connor', 'sarah.connor@dayflow.com', '+1 (555) 345-6789', '789 Cyber Way, Seattle, WA', '1994-11-15', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'Engineering', 'Frontend Tech Lead', '2022-06-15', 'FULL_TIME', 'Eleanor Vance', 78000.00, 11000.00, 89000.00, 11125.00, 4450.00),
(4, 4, 'David', 'Miller', 'david.miller@dayflow.com', '+1 (555) 456-7890', '321 Oak Ridge Ln, Boston, MA', '1990-02-18', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Product Design', 'Lead UI/UX Designer', '2023-01-10', 'FULL_TIME', 'Eleanor Vance', 70000.00, 8000.00, 78000.00, 9360.00, 3900.00),
(5, 5, 'Emily', 'Watson', 'emily.watson@dayflow.com', '+1 (555) 567-8901', '654 Maple Street, Denver, CO', '1995-07-30', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'Quality Assurance', 'QA Automation Engineer', '2023-04-01', 'FULL_TIME', 'Alex Morgan', 62000.00, 7000.00, 69000.00, 8280.00, 3450.00),
(6, 6, 'Michael', 'Chen', 'michael.chen@dayflow.com', '+1 (555) 678-9012', '987 Cedar Park, Chicago, IL', '1993-09-05', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Engineering', 'DevOps & Cloud Engineer', '2023-08-15', 'FULL_TIME', 'Alex Morgan', 72000.00, 9500.00, 81500.00, 9780.00, 4075.00)
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);

-- 4. SEED ATTENDANCE RECORDS
INSERT INTO attendance_records (user_id, date, check_in_time, check_out_time, total_worked_hours, status, remarks, manually_overridden) VALUES
(2, '2026-08-18', '09:02:15', '17:34:10', 8.53, 'PRESENT', 'Normal check-in', FALSE),
(2, '2026-08-19', '08:58:30', '17:45:00', 8.78, 'PRESENT', 'Normal check-in', FALSE),
(2, '2026-08-20', '09:15:00', '13:15:00', 4.00, 'HALF_DAY', 'Left early for doctor appointment', FALSE),
(2, '2026-08-21', '09:00:00', '17:30:00', 8.50, 'PRESENT', 'Normal check-in', FALSE),
(3, '2026-08-18', '09:10:00', '17:40:00', 8.50, 'PRESENT', 'Normal check-in', FALSE),
(3, '2026-08-19', '09:05:00', '17:35:00', 8.50, 'PRESENT', 'Normal check-in', FALSE),
(3, '2026-08-20', '08:50:00', '17:50:00', 9.00, 'PRESENT', 'Normal check-in', FALSE),
(3, '2026-08-21', '09:00:00', '17:30:00', 8.50, 'PRESENT', 'Normal check-in', FALSE),
(4, '2026-08-20', '09:30:00', '18:00:00', 8.50, 'PRESENT', 'Client sprint workshop', FALSE),
(4, '2026-08-21', NULL, NULL, 0.00, 'ABSENT', 'Unplanned absence', FALSE),
(5, '2026-08-21', '09:00:00', '17:30:00', 8.50, 'PRESENT', 'Normal check-in', FALSE)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 5. SEED LEAVE REQUESTS
INSERT INTO leave_requests (id, user_id, leave_type, start_date, end_date, total_days, reason, status, hr_comments, approved_at) VALUES
(1, 2, 'PAID', '2026-08-10', '2026-08-12', 3, 'Annual family summer vacation', 'APPROVED', 'Approved by Eleanor Vance. Enjoy!', '2026-08-01 10:00:00'),
(2, 2, 'UNPAID', '2026-08-25', '2026-08-26', 2, 'Personal home renovation work', 'PENDING', NULL, NULL),
(3, 3, 'SICK', '2026-08-14', '2026-08-14', 1, 'Severe flu and high temperature', 'APPROVED', 'Approved medical leave', '2026-08-14 08:30:00'),
(4, 4, 'PAID', '2026-08-28', '2026-08-29', 2, 'Sister wedding ceremony', 'PENDING', NULL, NULL)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 6. SEED PAYROLL LEDGER
INSERT INTO payroll_ledgers (user_id, billing_month, basic_pay, allowances, gross_pay, tax_deductions, provident_fund, unpaid_leave_count, unpaid_leave_deductions, total_final_salary, payment_status) VALUES
(2, '2026-07', 75000.00, 10000.00, 85000.00, 10200.00, 4250.00, 0, 0.00, 70550.00, 'PAID'),
(3, '2026-07', 78000.00, 11000.00, 89000.00, 11125.00, 4450.00, 0, 0.00, 73425.00, 'PAID'),
(4, '2026-07', 70000.00, 8000.00, 78000.00, 9360.00, 3900.00, 1, 2516.13, 62223.87, 'PAID'),
(5, '2026-07', 62000.00, 7000.00, 69000.00, 8280.00, 3450.00, 0, 0.00, 57270.00, 'PAID'),
(6, '2026-07', 72000.00, 9500.00, 81500.00, 9780.00, 4075.00, 0, 0.00, 67645.00, 'PAID')
ON DUPLICATE KEY UPDATE total_final_salary=VALUES(total_final_salary);

-- 7. SEED NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(2, 'Leave Request Approved', 'Your paid leave request for 2026-08-10 to 2026-08-12 has been approved.', 'LEAVE', TRUE),
(2, 'July Payslip Available', 'Your payslip for July 2026 is now available for download.', 'PAYROLL', TRUE),
(3, 'Welcome to Dayflow', 'Welcome to Dayflow HRMS! Please ensure your profile is up to date.', 'SYSTEM', FALSE),
(1, 'New Leave Application', 'Alex Morgan submitted an unpaid leave request for 2026-08-25 to 2026-08-26.', 'LEAVE', FALSE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 8. SEED DOCUMENTS
INSERT INTO documents (user_id, document_name, document_type, document_url) VALUES
(2, 'Employment_Offer_Letter.pdf', 'PDF', '/documents/emp-2026-001/offer_letter.pdf'),
(2, 'Identity_Verification_Passport.pdf', 'PDF', '/documents/emp-2026-001/passport.pdf'),
(3, 'Employment_Contract_Signed.pdf', 'PDF', '/documents/emp-2026-002/contract.pdf')
ON DUPLICATE KEY UPDATE document_name=VALUES(document_name);
