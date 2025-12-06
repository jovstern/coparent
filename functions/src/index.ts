import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// Export new Gemini-powered analysis function
export { analyzeAgreement } from './analyzeAgreement';

/**
 * Cloud Function to parse uploaded PDF/DOCX agreement
 * Triggered when a document is uploaded to Firebase Storage
 */
export const parseAgreement = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const userId = object.metadata?.userId;

  if (!filePath || !userId) {
    console.log('Missing required metadata');
    return;
  }

  // Only process files in the agreements folder
  if (!filePath.startsWith('agreements/')) {
    return;
  }

  console.log(`Parsing agreement: ${filePath} for user: ${userId}`);

  try {
    // TODO: Implement Gemini API integration
    // 1. Download file from Storage
    // 2. Convert to text (PDF/DOCX parsing)
    // 3. Call Gemini API for extraction
    // 4. Parse response and structure data

    // Mock parsed data for now
    const parsedData = {
      childSupport: {
        amount: 2000,
        currency: 'ILS',
        frequency: 'monthly',
        isCPILinked: true,
      },
      expenseSplit: {
        ratio: 0.5,
        parent1Percentage: 50,
        parent2Percentage: 50,
      },
      custodySchedule: {
        type: 'weekly',
        cycleDuration: 7,
      },
      holidays: [
        { name: 'Passover', isRecurring: true },
        { name: 'Rosh Hashanah', isRecurring: true },
        { name: 'Hanukkah', isRecurring: true },
      ],
    };

    // Save parsed data to Firestore
    await db.collection('agreements').doc(userId).set({
      parsedData,
      originalDocumentUrl: filePath,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('Agreement parsed successfully');
  } catch (error) {
    console.error('Error parsing agreement:', error);
    throw error;
  }
});

/**
 * Send notification email when expense is added
 */
export const notifyExpenseAdded = functions.firestore
  .document('agreements/{agreementId}/expenses/{expenseId}')
  .onCreate(async (snap, context) => {
    const expense = snap.data();
    const { agreementId } = context.params;

    console.log(`New expense added to agreement ${agreementId}`);

    try {
      // Get agreement and parent emails
      const agreementDoc = await db.collection('agreements').doc(agreementId).get();
      const agreement = agreementDoc.data();

      if (!agreement) {
        console.log('Agreement not found');
        return;
      }

      // TODO: Send email notification
      // Use SendGrid, AWS SES, or Firebase Extensions for email
      console.log(`Would notify parents about expense: ${expense.description}`);

      // Create notification in Firestore
      await db.collection('notifications').add({
        agreementId,
        type: 'expense_added',
        title: 'New Expense Added',
        message: `${expense.addedBy} added a ${expense.category} expense: ${expense.description} ($${expense.amount})`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isRead: false,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  });

/**
 * Notify when split ratio is changed
 */
export const notifySplitRatioChanged = functions.firestore
  .document('agreements/{agreementId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const { agreementId } = context.params;

    // Check if split ratio changed
    const beforeRatio = before.parsedData?.financialTerms?.expenseSplit?.ratio;
    const afterRatio = after.parsedData?.financialTerms?.expenseSplit?.ratio;

    if (beforeRatio !== afterRatio) {
      console.log(`Split ratio changed from ${beforeRatio} to ${afterRatio}`);

      try {
        // TODO: Send email notification
        console.log('Would notify co-parent about split ratio change');

        // Create notification
        await db.collection('notifications').add({
          agreementId,
          type: 'split_ratio_changed',
          title: 'Expense Split Updated',
          message: `The expense split ratio has been updated to ${Math.round(afterRatio * 100)}/${Math.round((1 - afterRatio) * 100)}`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isRead: false,
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  });

/**
 * Handle schedule swap requests
 */
export const notifySwapRequest = functions.firestore
  .document('agreements/{agreementId}/scheduleSwaps/{swapId}')
  .onCreate(async (snap, context) => {
    const swap = snap.data();
    const { agreementId } = context.params;

    console.log(`New swap request for agreement ${agreementId}`);

    try {
      // TODO: Send email/push notification to the other parent

      // Create notification
      await db.collection('notifications').add({
        agreementId,
        type: 'swap_request',
        title: 'Schedule Swap Request',
        message: `${swap.requestedBy} wants to swap custody on ${swap.date}`,
        data: {
          swapId: snap.id,
          date: swap.date,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isRead: false,
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  });

/**
 * Update CPI-linked child support amounts
 * Scheduled function to run monthly
 */
export const updateCPILinkedPayments = functions.pubsub
  .schedule('0 0 1 * *') // First day of each month at midnight
  .timeZone('America/New_York')
  .onRun(async () => {
    console.log('Running CPI update check');

    try {
      // TODO: Fetch current CPI data from external API
      const cpiChange = 0.02; // Mock 2% increase

      // Get all agreements with CPI-linked payments
      const agreementsSnapshot = await db
        .collection('agreements')
        .where('parsedData.financialTerms.childSupport.isCPILinked', '==', true)
        .get();

      console.log(`Found ${agreementsSnapshot.size} agreements with CPI-linked payments`);

      // Update each agreement
      const updatePromises = agreementsSnapshot.docs.map(async (doc) => {
        const agreement = doc.data();
        const currentAmount = agreement.parsedData?.financialTerms?.childSupport?.amount;

        if (currentAmount) {
          const newAmount = currentAmount * (1 + cpiChange);

          await doc.ref.update({
            'parsedData.financialTerms.childSupport.amount': newAmount,
            'parsedData.financialTerms.childSupport.lastCPIUpdate': admin.firestore.FieldValue.serverTimestamp(),
          });

          // Create notification
          await db.collection('notifications').add({
            agreementId: doc.id,
            type: 'cpi_update',
            title: 'Child Support Amount Updated',
            message: `Child support has been adjusted for CPI: $${currentAmount.toFixed(2)} → $${newAmount.toFixed(2)}`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isRead: false,
          });

          console.log(`Updated agreement ${doc.id}: ${currentAmount} → ${newAmount}`);
        }
      });

      await Promise.all(updatePromises);
      console.log('CPI update completed');
    } catch (error) {
      console.error('Error updating CPI:', error);
    }
  });
