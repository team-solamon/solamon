'use server'

import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OpenAI API key')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateStoryWithImage(
  storyText: string
): Promise<{ story: string; imageUrl: string }> {
  try {
    console.log(
      'Generating story for log:',
      storyText.substring(0, 100) + '...'
    )

    const prompt = `You are a master fantasy storyteller. Given a battle log between two unnamed warriors, write an epic and dramatic fantasy battle story in English. Do not mention "Player 1" or "Player 2" — instead, refer to the fighters as legendary unnamed warriors or use poetic descriptions (e.g., "the silent blade", "the cursed one"). Describe the attacks as magical, mythical, or martial arts-based abilities within a rich fantasy world. Set the scene (e.g., ancient ruins, cursed battlefield, sky temple, etc.). Emphasize the emotions, momentum shifts, and ultimate triumph or defeat.

    Use this sample battle log:
    
    ${storyText}
    
    Your output should be a fully immersive and vivid fantasy story that sounds like a tale told by bards or scribes. It should not feel like game commentary or a log explanation.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const story =
      response.choices[0]?.message?.content || 'No story was generated.'

    console.log('Story generated successfully')

    const themeWords = ['battle', 'fantasy', 'warrior', 'duel', 'epic']
    const imageTheme = themeWords[Math.floor(Math.random() * themeWords.length)]
    const imageUrl = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(
      imageTheme
    )}`

    return {
      story,
      imageUrl,
    }
  } catch (error: any) {
    console.error('Error generating story:', error)
    throw new Error(
      `Failed to generate story: ${error.message || 'Unknown error'}`
    )
  }
}
