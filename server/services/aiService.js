const OpenAI = require('openai');

// ✅ Safely load the key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.askChatGPT = async (userMessage) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: userMessage }],
  });

  return completion.choices[0].message.content;
};
