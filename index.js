const express = require('express');
const admin = require('firebase-admin');
const TelegramBot = require('node-telegram-bot-api');

// Telegram Bot initialization (Aapka token configure kar diya gaya hai)
const token = '8854129662:AAFI3VABbsHI_RgGQ7mr0IuVs7mvfMYkt7w';
const bot = new TelegramBot(token, { polling: true });

// Firebase Admin initialization (agar zaroorat ho)
// admin.initializeApp({
//   credential: admin.credential.applicationDefault()
// });

const app = express();
app.use(express.json());

// 1. Root Test Route
app.get('/', (req, res) => {
    res.send('Lokesh Esports Backend is Live with Telegram Bot!');
});

// ================= TELEGRAM BOT LISTENERS =================
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'Player';
    bot.sendMessage(chatId, `🔥 Welcome to Lokesh Esports, ${userName}!\n\nAap yahan tournament updates aur wallet alerts pa sakte hain.`);
});

bot.onText(/\/balance/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `💰 Aapka Lokesh Esports Wallet balance check karne ke liye app open karein.`);
});

// 2. Razorpay Webhook Endpoint
app.post('/api/webhook/razorpay', async (req, res) => {
    try {
        const event = req.body.event;
        if (event === 'payment.captured' || event === 'order.paid') {
            const paymentEntity = req.body.payload.payment.entity;
            const amountPaid = paymentEntity.amount / 100; // Paise to INR
            const userEmail = paymentEntity.email;

            console.log(`Razorpay Payment Success: ₹${amountPaid} for ${userEmail}`);

            // Firebase Firestore wallet update logic
            // const db = admin.firestore();
            // const usersRef = db.collection('Users');
            // const snapshot = await usersRef.where('email', '==', userEmail).get();
            // if (!snapshot.empty) {
            //     const userDoc = snapshot.docs[0];
            //     const currentDeposited = userDoc.data().depositedCoins || 0;
            //     await userDoc.ref.update({ depositedCoins: currentDeposited + amountPaid });
            // }
        }
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// 3. Cashfree Webhook Endpoint
app.post('/api/webhook/cashfree', async (req, res) => {
    try {
        const eventData = req.body;
        if (eventData && eventData.type === 'PAYMENT_SUCCESS_WEBOGRAPH' || (eventData && eventData.type === 'PAYMENT_SUCCESS_WEBHOOK')) {
            const amountPaid = eventData.data.payment.payment_amount;
            const userEmail = eventData.data.customer.customer_email;

            console.log(`Cashfree Payment Success: ₹${amountPaid} for ${userEmail}`);

            // Firebase Firestore wallet update logic
            // const db = admin.firestore();
            // const usersRef = db.collection('Users');
            // const snapshot = await usersRef.where('email', '==', userEmail).get();
            // if (!snapshot.empty) {
            //     const userDoc = snapshot.docs[0];
            //     const currentDeposited = userDoc.data().depositedCoins || 0;
            //     await userDoc.ref.update({ depositedCoins: currentDeposited + amountPaid });
            // }
        }
        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Cashfree Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
