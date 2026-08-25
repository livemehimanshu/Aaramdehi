import '../config/db.js';
import { sendAbandonedCartReminders } from '../controllers/abandonedCart.controller.js';

sendAbandonedCartReminders()
  .then((result) => console.log(`Abandoned cart reminders complete: ${result.sent}/${result.checked} sent.`))
  .catch((error) => {
    console.error('Abandoned cart reminder failed:', error);
    process.exitCode = 1;
  });
