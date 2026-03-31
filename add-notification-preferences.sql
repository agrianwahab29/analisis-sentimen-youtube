-- Add notification preferences columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS analysis_complete_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS security_alert_notifications BOOLEAN DEFAULT true;

-- Add comment to explain the columns
COMMENT ON COLUMN users.email_notifications IS 'User preference for receiving email notifications';
COMMENT ON COLUMN users.analysis_complete_notifications IS 'User preference for receiving analysis completion notifications';
COMMENT ON COLUMN users.security_alert_notifications IS 'User preference for receiving security alert notifications';
