import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { OpenAI } from "https://esm.sh/openai@4.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

async function getStoryFromDB(battleId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("story")
      .select("story")
      .eq("id", battleId)
      .single();

    if (error) {
      console.error("Supabase story query error:", error);
      return null;
    }

    if (!data || !data.story || data.story === "") {
      console.log(`No story found for battle ${battleId}`);
      return null;
    }

    console.log(`Found existing story for battle ${battleId}`);
    return data.story;
  } catch (error) {
    console.error("Error retrieving story from database:", error);
    return null;
  }
}

async function getImageUrlFromDB(battleId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("story")
      .select("story_image_url")
      .eq("id", battleId)
      .single();

    if (error) {
      console.error("Supabase image query error:", error);
      return null;
    }

    if (!data || !data.story_image_url || data.story_image_url === "") {
      console.log(`No image found for battle ${battleId}`);
      return null;
    }

    console.log(`Found existing image for battle ${battleId}`);
    return data.story_image_url;
  } catch (error) {
    console.error("Error retrieving image URL from database:", error);
    return null;
  }
}

async function saveStoryToDB(
  battleId: string,
  story: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("story")
      .select("id")
      .eq("id", battleId)
      .single();

    if (data) {
      const { error } = await supabase
        .from("story")
        .update({ story })
        .eq("id", battleId);

      if (error) {
        console.error("Supabase story update error:", error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from("story")
        .insert({ id: battleId, story });

      if (error) {
        console.error("Supabase story insert error:", error);
        return false;
      }
    }

    console.log(`Successfully saved story for battle ${battleId}`);
    return true;
  } catch (error) {
    console.error("Error saving story to database:", error);
    return false;
  }
}

async function saveImageUrlToDB(
  battleId: string,
  imageUrl: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("story")
      .select("id")
      .eq("id", battleId)
      .single();

    if (data) {
      const { error } = await supabase
        .from("story")
        .update({ story_image_url: imageUrl })
        .eq("id", battleId);

      if (error) {
        console.error("Supabase image update error:", error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from("story")
        .insert({ id: battleId, story_image_url: imageUrl });

      if (error) {
        console.error("Supabase image insert error:", error);
        return false;
      }
    }

    console.log(`Successfully saved image URL for battle ${battleId}`);
    return true;
  } catch (error) {
    console.error("Error saving image URL to database:", error);
    return false;
  }
}

async function generateNewStory(storyText: string): Promise<string> {
  const scenarios = [
    "an ancient battlefield shrouded in mist, where the echoes of past warriors linger",
    "a temple deep within a forgotten jungle, filled with glowing runes and traps",
    "a sky temple floating among the clouds, with lightning crackling in the distance",
    "a desolate wasteland under a crimson moon, where shadows move eerily",
    "a grand coliseum surrounded by roaring spectators, eager for a legendary duel",
    "a dark enchanted forest where mythical creatures and monsters roam freely",
    "a crystal cave illuminated by glowing gemstones, hiding ancient secrets and dangers",
    "a volcanic mountain with rivers of lava and fire-breathing beasts guarding its peak",
    "an underwater city protected by magical barriers, inhabited by merfolk and sea creatures",
    "a frozen tundra under an eternal aurora, where ice dragons soar through the skies",
  ];

  const randomScenario =
    scenarios[Math.floor(Math.random() * scenarios.length)];

  const prompt = `Craft a concise, creative fantasy battle story inspired by a fictional battle log between two unnamed warriors. 
    Use evocative titles like "The Shadowed Avenger" or "The Flame-bound Sentinel" to give them identity. 
    Set the scene in ${randomScenario}, describing the atmosphere and environment briefly to enhance the drama. 
    Focus on the flow of the duel, each warrior's strategy, emotional tension, and the outcome — whether it's victory, defeat, or a mysterious disappearance. 
    Keep it vivid and magical, but avoid graphic or excessively violent descriptions. 
    Ensure the story is strictly between 500 and 600 characters in length.
    
    Battle log:
    ${storyText}
    `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 1.0,
    max_tokens: 600,
  });

  const story =
    response.choices[0]?.message?.content || "No story was generated.";
  console.log("Story generated successfully");
  return story;
}

async function uploadImageToStorage(
  imageUrl: string,
  battleId: string
): Promise<string> {
  try {
    console.log("Attempting to fetch image from URL:", imageUrl);

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Deno) Solamon/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
    }

    console.log(
      "Image fetched successfully, content-type:",
      response.headers.get("content-type")
    );

    const arrayBuffer = await response.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const timestamp = Date.now();
    const filename = `battle_${battleId}_${timestamp}.png`;

    console.log("Uploading to Supabase Storage:", filename);

    const { data, error } = await supabase.storage
      .from("images")
      .upload(filename, buffer, {
        contentType: "image/png",
        cacheControl: "3600",
      });

    if (error) {
      console.error("Error uploading to Supabase Storage:", error);
      return imageUrl;
    }

    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(filename);

    console.log(
      "Image successfully uploaded to Supabase Storage:",
      publicUrlData.publicUrl
    );
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error in image upload process:", error);
    return imageUrl;
  }
}

async function sanitizeImagePrompt(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates safe image descriptions.",
        },
        {
          role: "user",
          content: `Create a safe, non-violent fantasy scene description based on this battle story. Focus only on the environment, characters' appearance, and magical elements. Avoid any violence, blood, weapons, or disturbing imagery: "${text.substring(
            0,
            300
          )}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return (
      response.choices[0]?.message?.content ||
      "A mystical fantasy battle arena with magical energy flows"
    );
  } catch (error) {
    console.error("Error sanitizing image prompt:", error);
    return "A mystical fantasy battle arena with magical energy flows";
  }
}

async function generateNewImage(
  storyText: string,
  battleId: string
): Promise<string> {
  const MAX_PROMPT_LENGTH = 800;
  const STYLE_SUFFIX =
    "Style: digital art, high fantasy, magical atmosphere, vibrant colors.";

  try {
    const sanitizedPrompt = await sanitizeImagePrompt(storyText);

    const truncatedPrompt =
      sanitizedPrompt.length > MAX_PROMPT_LENGTH
        ? sanitizedPrompt.substring(0, MAX_PROMPT_LENGTH) + "..."
        : sanitizedPrompt;

    const enhancedImagePrompt = `Create a highly detailed fantasy artwork showing: ${truncatedPrompt}. ${STYLE_SUFFIX}`;

    console.log(`Prompt length: ${enhancedImagePrompt.length} characters`);

    console.log("Generating image");

    const imageResponse = await openai.images.generate({
      prompt: enhancedImagePrompt,
      n: 1,
      size: "256x256",
    });

    const tempImageUrl = imageResponse.data[0]?.url;

    if (!tempImageUrl) {
      console.log("Image generation failed: No image URL returned");
      return "";
    }

    const permanentImageUrl = await uploadImageToStorage(
      tempImageUrl,
      battleId
    );
    console.log("Image generated and uploaded to Storage successfully");
    return permanentImageUrl;
  } catch (error) {
    console.error("Error in image generation process:", error);
    return "";
  }
}

async function generateStoryWithImage(
  battleId: string,
  battleLog: string
): Promise<{ story: string; imageUrl: string }> {
  try {
    console.log("Processing story and image for battle:", battleId);

    let story = await getStoryFromDB(battleId);
    let imageUrl = await getImageUrlFromDB(battleId);

    if (!story) {
      console.log("No existing story found, generating new story");
      story = await generateNewStory(battleLog);
      await saveStoryToDB(battleId, story);
    } else {
      console.log("Using cached story from database");
    }

    if (!imageUrl) {
      console.log("No existing image found, generating new image");
      imageUrl = await generateNewImage(story, battleId);
      await saveImageUrlToDB(battleId, imageUrl);
    } else {
      console.log("Using cached image from database");
    }

    return { story, imageUrl };
  } catch (error: any) {
    console.error("Error in story/image processing:", error);
    throw new Error(
      `Failed to process story/image: ${error.message || "Unknown error"}`
    );
  }
}

serve(async (req) => {
  try {
    // CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    // Handle OPTIONS request (CORS preflight)
    if (req.method === "OPTIONS") {
      return new Response(null, { headers, status: 204 });
    }

    // Handle actual request
    if (req.method === "POST") {
      const { battleId, battleLog } = await req.json();

      if (!battleId || !battleLog) {
        return new Response(
          JSON.stringify({ error: "battleId and battleLog are required" }),
          { status: 400, headers }
        );
      }

      const result = await generateStoryWithImage(battleId, battleLog);
      return new Response(JSON.stringify(result), { headers });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
