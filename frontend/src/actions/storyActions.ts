'use server'

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OpenAI API key')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function getBattleStoryFromDB(
  battleId: string
): Promise<{ story: string; imageUrl: string } | null> {
  try {
    const { data, error } = await supabase
      .from('story')
      .select('story, story_image_url')
      .eq('id', battleId)
      .single()

    if (error) {
      console.error('Supabase query error:', error)
      return null
    }

    if (!data) {
      console.log(`No story found for battle ${battleId}`)
      return null
    }

    console.log(`Found existing story for battle ${battleId}`)
    return {
      story: data.story,
      imageUrl: data.story_image_url,
    }
  } catch (error) {
    console.error('Error retrieving story from database:', error)
    return null
  }
}

async function saveBattleStoryToDB(
  battleId: string,
  story: string,
  imageUrl: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('story').insert({
      id: battleId,
      story: story,
      story_image_url: imageUrl,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return false
    }

    console.log(`Successfully saved story for battle ${battleId} to database`)
    return true
  } catch (error) {
    console.error('Error saving story to database:', error)
    return false
  }
}

async function generateNewStoryWithImage(
  storyText: string
): Promise<{ story: string; imageUrl: string }> {
  const scenarios = [
    'an ancient battlefield shrouded in mist, where the echoes of past warriors linger',
    'a temple deep within a forgotten jungle, filled with glowing runes and traps',
    'a sky temple floating among the clouds, with lightning crackling in the distance',
    'a desolate wasteland under a crimson moon, where shadows move eerily',
    'a grand coliseum surrounded by roaring spectators, eager for a legendary duel',
    'a dark enchanted forest where mythical creatures and monsters roam freely',
    'a crystal cave illuminated by glowing gemstones, hiding ancient secrets and dangers',
    'a volcanic mountain with rivers of lava and fire-breathing beasts guarding its peak',
    'an underwater city protected by magical barriers, inhabited by merfolk and sea creatures',
    'a frozen tundra under an eternal aurora, where ice dragons soar through the skies',
  ]

  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)]
  const sanitizedStoryText = storyText
    .replace(/[^a-zA-Z0-9 .,!?'"-]/g, '')
    .substring(0, 1000)
  const prompt = `Craft a concise and creative fantasy battle story inspired by a battle log between two unnamed warriors. Use evocative titles like "the shadowed avenger" or "the flame-bound sentinel." Set the scene in ${randomScenario}, describing the environment briefly to enhance the drama. Focus on emotions, the flow of the fight, and the ultimate outcome, keeping the story short and impactful.

  Battle log:
  
  ${sanitizedStoryText}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 1.0,
    max_tokens: 1000,
  })

  const story =
    response.choices[0]?.message?.content || 'No story was generated.'
  console.log('Story generated successfully')

  const imagePrompt = story.substring(0, 500)
  const enhancedImagePrompt = `Create a highly detailed and visually stunning fantasy artwork based on the following description: ${imagePrompt}. The artwork should capture the essence of an epic fantasy battle scene with vibrant colors, intricate details, and a dramatic atmosphere. Focus on the environment, characters, and magical elements to make it visually captivating.`

  const imageResponse = await openai.images.generate({
    prompt: enhancedImagePrompt,
    n: 1,
    size: '512x512',
  })

  const imageUrl = imageResponse.data[0]?.url || 'No image was generated.'
  return { story, imageUrl }
}

export async function generateStoryWithImage(
  battleId: string,
  storyText: string
): Promise<{ story: string; imageUrl: string }> {
  try {
    console.log('Processing story for battle:', battleId)

    const existingStory = await getBattleStoryFromDB(battleId)

    if (existingStory) {
      console.log('Found existing story in database, returning it')
      return existingStory
    }

    console.log('No existing story found, generating new story')
    console.log(
      'Generating story for log:',
      storyText.substring(0, 100) + '...'
    )

    const { story, imageUrl } = await generateNewStoryWithImage(storyText)

    await saveBattleStoryToDB(battleId, story, imageUrl)

    return { story, imageUrl }
  } catch (error: any) {
    console.error('Error generating story:', error)
    throw new Error(
      `Failed to generate story: ${error.message || 'Unknown error'}`
    )
  }
}
