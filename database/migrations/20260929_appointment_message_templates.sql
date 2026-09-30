SET NAMES utf8mb4;

ALTER TABLE settings
  ADD COLUMN appointment_confirmation_message TEXT NULL,
  ADD COLUMN appointment_reminder_message TEXT NULL,
  ADD COLUMN appointment_cancellation_message TEXT NULL;

UPDATE settings
SET appointment_confirmation_message = 'Hi [Customer Name]! 👋 Your appointment at [Salon Name] has been successfully confirmed for [Date] at [Time]. We look forward to seeing you! Thank you for choosing us. 💙

ආයුබෝවන් [Customer Name]! 👋 [Salon Name] වෙත ඔබ වෙන්කරගත් ඒපොයින්ට්මන්ට් එක [Date] දින [Time] ට සාර්ථකව තහවුරු කර ඇත. ඔබව සාදරයෙන් බලාපොරොත්තු වෙමු! අපව තෝරාගැනීම පිළිබඳව ස්තූතියි. 💙',
    appointment_reminder_message = 'Hi [Customer Name]! 👋 Just a friendly reminder that your appointment at [Salon Name] is scheduled for [Time] today, which is in [Minutes] minutes. We look forward to seeing you soon!

ආයුබෝවන් [Customer Name]! 👋 මෙය ඔබගේ ඒපොයින්ට්මන්ට් එක පිළිබඳ සුහද මතක් කිරීමකි. [Salon Name] හි ඔබගේ ඒපොයින්ට්මන්ට් එක අද [Time] ට, එනම් තවත් විනාඩි [Minutes]කින් යෙදී ඇත. ඔබව ඉක්මනින් හමුවීමට අපි බලාපොරොත්තු වෙමු!',
    appointment_cancellation_message = 'Hi [Customer Name], your scheduled appointment time ([Time]) has now passed, so your appointment at [Salon Name] has been automatically cancelled. If you would like to book a new appointment, please visit our website. We look forward to serving you again!

ආයුබෝවන් [Customer Name], ඔබගේ නියමිත ඒපොයින්ට්මන්ට් වේලාව ([Time]) මේ වන විට පසුවී ඇති බැවින්, [Salon Name] හි ඔබගේ ඒපොයින්ට්මන්ට් එක ස්වයංක්‍රීයව අවලංගු කර ඇත. නැවත ඒපොයින්ට්මන්ට් එකක් වෙන්කර ගැනීමට කරුණාකර අපගේ වෙබ් අඩවියට පිවිසෙන්න. ඔබට නැවතත් සේවය කිරීමට අපි බලාපොරොත්තු වෙමු!';

ALTER TABLE settings
  MODIFY COLUMN appointment_confirmation_message TEXT NOT NULL,
  MODIFY COLUMN appointment_reminder_message TEXT NOT NULL,
  MODIFY COLUMN appointment_cancellation_message TEXT NOT NULL;
