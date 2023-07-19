const { Configuration, OpenAIApi } = require('openai')

exports.handler = async function (context, event, callback) {
  const apiKey = context.OPEN_AI_KEY
  const configuration = new Configuration({ apiKey })
  const openai = new OpenAIApi(configuration)

  const { message, systemContent } = event

  const executeAI = async () => {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-16k',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: message }
      ],
      temperature: 1,
      max_tokens: 256
    })

    return completion.data.choices[0].message.content
  }

  try {
    const content = await executeAI()

    return callback(null, { content })
  } catch (error) {
    console.log(error)
    return callback(error)
  }
}
