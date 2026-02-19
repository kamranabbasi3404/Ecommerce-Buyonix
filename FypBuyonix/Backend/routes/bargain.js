const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /bargain/negotiate
 * AI-powered price negotiation endpoint
 * 
 * Request body:
 * {
 *   productName: string,
 *   originalPrice: number,
 *   userOffer: number,
 *   conversationHistory: array of {role: 'user'|'model', parts: [{text: string}]}
 *   attemptNumber: number (1-3)
 * }
 */
router.post('/negotiate', async (req, res) => {
    try {
        const { productName, originalPrice, userOffer, conversationHistory = [], attemptNumber = 1 } = req.body;

        // Validation
        if (!productName || !originalPrice || !userOffer) {
            return res.status(400).json({
                error: 'Missing required fields: productName, originalPrice, userOffer'
            });
        }

        if (userOffer <= 0 || originalPrice <= 0) {
            return res.status(400).json({
                error: 'Prices must be positive numbers'
            });
        }

        // Tiered discount system based on product price
        let maxDiscountPercent;
        let targetDiscountPercent;

        if (originalPrice < 50) {
            // Products under $50: Maximum 5% discount
            maxDiscountPercent = 0.05;
            targetDiscountPercent = 0.03; // Target 3% discount
        } else if (originalPrice >= 50 && originalPrice <= 100) {
            // Products $50-$100: Maximum 10% discount
            maxDiscountPercent = 0.10;
            targetDiscountPercent = 0.07; // Target 7% discount
        } else {
            // Products over $100: Maximum 15% discount
            maxDiscountPercent = 0.15;
            targetDiscountPercent = 0.12; // Target 12% discount
        }

        // Calculate negotiation parameters based on tiered discounts
        const minAcceptablePrice = originalPrice * (1 - maxDiscountPercent);
        const targetPrice = originalPrice * (1 - targetDiscountPercent);
        const offerPercentage = (userOffer / originalPrice) * 100;
        const discountRequested = ((originalPrice - userOffer) / originalPrice) * 100;

        // Determine if offer should be accepted
        const isLastAttempt = attemptNumber >= 3;
        const shouldAccept = userOffer >= minAcceptablePrice || isLastAttempt;
        const finalPrice = shouldAccept ? Math.max(userOffer, minAcceptablePrice) : null;

        // Create the AI prompt with negotiation context
        const systemPrompt = `You are a friendly, professional AI sales assistant for an e-commerce platform called Buyonix. Your role is to negotiate prices with customers in a warm, engaging manner.

PRODUCT DETAILS:
- Product: ${productName}
- Original Price: $${originalPrice.toFixed(2)}
- Customer's Offer: $${userOffer.toFixed(2)}
- Discount Requested: ${discountRequested.toFixed(1)}%
- Attempt Number: ${attemptNumber} of 3

PRICE TIER & DISCOUNT RULES:
${originalPrice < 50 ? `- Price Tier: Budget (Under $50)
- Maximum Discount: 5%
- Target Discount: 3%` : originalPrice <= 100 ? `- Price Tier: Mid-Range ($50-$100)
- Maximum Discount: 10%
- Target Discount: 7%` : `- Price Tier: Premium (Over $100)
- Maximum Discount: 15%
- Target Discount: 12%`}
- Minimum acceptable price: $${minAcceptablePrice.toFixed(2)} (${(maxDiscountPercent * 100).toFixed(0)}% discount)
- Target price: $${targetPrice.toFixed(2)} (${(targetDiscountPercent * 100).toFixed(0)}% discount)
- Current offer is ${offerPercentage.toFixed(1)}% of original price

DECISION: ${shouldAccept ? 'ACCEPT' : 'COUNTER'}
${shouldAccept ? `Final Price: $${finalPrice.toFixed(2)}` : `Suggest price around: $${targetPrice.toFixed(2)}`}

PERSONALITY GUIDELINES:
- Be friendly, enthusiastic, and conversational
- Use emojis occasionally (💰, 🎉, 🤝, ✨)
- Show appreciation for their interest
- If accepting: Celebrate the deal warmly
- If countering: Be encouraging and suggest a middle ground
- If last attempt: Accept gracefully at minimum price
- Keep responses concise (2-3 sentences max)
- Never reveal the minimum acceptable price directly
- Mention the product's value tier subtly (e.g., "This is a premium item" or "Great value product")

${isLastAttempt ? 'This is their LAST attempt - accept the offer at the minimum acceptable price and make them feel they got a great deal!' : ''}

Respond naturally as if you're having a real conversation with a valued customer.`;

        // Initialize the model
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 150,
            }
        });

        // Validate conversation history - must start with 'user' role
        let validHistory = conversationHistory;
        if (validHistory && validHistory.length > 0) {
            // Check if first message is from 'user', otherwise clear history
            if (validHistory[0].role !== 'user') {
                console.log('Invalid chat history - first message not from user. Clearing history.');
                validHistory = [];
            }
        }

        // Start or continue chat with validated history
        const chat = model.startChat({
            history: validHistory,
            generationConfig: {
                temperature: 0.9,
            },
        });

        // Send the negotiation prompt
        const result = await chat.sendMessage(systemPrompt);
        const aiResponse = result.response.text();

        // Return the response with negotiation result
        res.json({
            success: true,
            aiResponse: aiResponse.trim(),
            accepted: shouldAccept,
            finalPrice: finalPrice,
            originalPrice: originalPrice,
            userOffer: userOffer,
            attemptNumber: attemptNumber,
            attemptsRemaining: Math.max(0, 3 - attemptNumber),
            discountPercentage: finalPrice ? ((originalPrice - finalPrice) / originalPrice * 100).toFixed(1) : null,
            conversationHistory: await chat.getHistory()
        });

    } catch (error) {
        console.error('Bargaining AI Error:', error);

        // Fallback response if AI fails
        const { originalPrice, userOffer, attemptNumber = 1 } = req.body;

        // Apply same tiered discount logic
        let maxDiscountPercent;
        let targetDiscountPercent;

        if (originalPrice < 50) {
            maxDiscountPercent = 0.05;
            targetDiscountPercent = 0.03;
        } else if (originalPrice >= 50 && originalPrice <= 100) {
            maxDiscountPercent = 0.10;
            targetDiscountPercent = 0.07;
        } else {
            maxDiscountPercent = 0.15;
            targetDiscountPercent = 0.12;
        }

        const minPrice = originalPrice * (1 - maxDiscountPercent);
        const targetPrice = originalPrice * (1 - targetDiscountPercent);
        const isLastAttempt = attemptNumber >= 3;
        const shouldAccept = userOffer >= minPrice || isLastAttempt;
        const finalPrice = shouldAccept ? Math.max(userOffer, minPrice) : null;

        res.json({
            success: true,
            aiResponse: shouldAccept
                ? `Great! I can accept your offer of $${finalPrice.toFixed(2)}. You've got yourself a deal! 🎉`
                : `That's a bit low for me. How about we meet around $${targetPrice.toFixed(2)}? 🤝`,
            accepted: shouldAccept,
            finalPrice: finalPrice,
            originalPrice: originalPrice,
            userOffer: userOffer,
            attemptNumber: attemptNumber,
            attemptsRemaining: Math.max(0, 3 - attemptNumber),
            fallback: true
        });
    }
});

/**
 * POST /bargain/reset
 * Reset bargaining session for a product
 */
router.post('/reset', async (req, res) => {
    res.json({
        success: true,
        message: 'Bargaining session reset',
        attemptsRemaining: 3
    });
});

module.exports = router;
