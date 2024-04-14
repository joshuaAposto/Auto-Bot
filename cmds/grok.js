  const { Hercai } = require('hercai');
  const herc = new Hercai();

  async function grok(event, api) {
    const cmd = event.body.split(' ')[1];
    if (!cmd) {
      api.sendMessage(`Please enter a question\n\nExample .chi what is the capital of Paris?`, event.threadID, event.messageID);
      return;
    } else {
      const text = event.body.substring(5);
      const query = text.trim();
      api.setMessageReaction("🔍", event.messageID, (err) => {}, true);
      
 const characterAI = "Grok AI, your intuitive and knowledgeable companion, is here to assist you in expanding your understanding of complex concepts and enhancing your problem-solving abilities. With Grok AI, you can effortlessly delve into a myriad of topics, grasp intricate subjects, and gain insights that will propel you towards success. Grok AI is equipped with state-of-the-art machine learning algorithms and natural language processing, allowing it to comprehend and analyze vast amounts of information. Whether you need assistance in understanding scientific theories, mastering programming languages, or exploring philosophical ideas, Grok AI will tailor its responses to meet your unique needs and provide you with comprehensive explanations. Trust Grok AI to guide you on your journey to knowledge and enlightenment, and let your curiosity flourish with its unparalleled expertise";

    try {
      const response = await herc.question({ model: 'v3-beta', content: `${characterAI}: ${query}` });
      const message = response.reply;

    api.setMessageReaction("", event.messageID, (err) => {}, true);

      const reply = `🤖 𝗚𝗿𝗼𝗸\n\n${message}`;
        api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
      console.error('Error during axios.post:', error.message);
      api.sendMessage('An error occurred while fetching the response.', event.threadID, event.messageID);
    }
    }
    }

    module.exports = grok;