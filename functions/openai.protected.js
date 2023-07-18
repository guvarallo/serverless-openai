const { Configuration, OpenAIApi } = require('openai')

exports.handler = async function (context, event, callback) {
  const apiKey = context.OPEN_AI_KEY
  const client = context.getTwilioClient()
  const twilioNumber = context.TWILIO_WHATSAPP_NUMBER

  const configuration = new Configuration({ apiKey })
  const openai = new OpenAIApi(configuration)

  const { message, sentiment, customerNumber } = event

  const isSentiment = sentiment === 'true' ? true : false

  const executeAI = async () => {
    const sentimentMessage =
      'You will be provided with a message, and your task is to classify its sentiment as positive, neutral, or negative:'

    const normalMessage = 'Resuma em um único parágrafo:'

    const contentMessage = isSentiment ? sentimentMessage : normalMessage

    if (!isSentiment) {
      await client.messages.create({
        from: twilioNumber,
        body: 'Aguarde um momento enquanto pesquiso sua resposta...',
        to: customerNumber
      })
    }

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: contentMessage },
        { role: 'user', content: message }
      ],
      temperature: 1,
      max_tokens: 256
    })

    return completion.data.choices[0].message.content
  }

  try {
    const content = await executeAI()

    if (!isSentiment) {
      await client.messages.create({
        from: twilioNumber,
        body: content,
        to: customerNumber
      })
    }

    return callback(null, { content })
  } catch (error) {
    console.log(error)
    return callback(error)
  }
}
