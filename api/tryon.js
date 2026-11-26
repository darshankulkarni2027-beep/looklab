// LookLab AI hairstyle try-on (Vercel serverless).
// POST { image: dataURL, hairstyle: string, vibe: string }
// Returns { imageUrl } (data URL) or { error } with a non-200 status.
// Set OPENAI_API_KEY in the Vercel project environment variables.
// Optional: OPENAI_IMAGE_MODEL (defaults to gpt-image-1).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI previews are not set up yet" });
    return;
  }

  const payload = req.body || {};
  const { image, hairstyle, vibe } = payload;
  if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
    res.status(400).json({ error: "A photo is required" });
    return;
  }

  const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) {
    res.status(400).json({ error: "Photo must be JPG, PNG or WebP" });
    return;
  }

  let imageBytes;
  try {
    imageBytes = Buffer.from(match[2], "base64");
  } catch {
    res.status(400).json({ error: "Could not read the photo" });
    return;
  }
  if (imageBytes.length > 8 * 1024 * 1024) {
    res.status(400).json({ error: "Photo is too large" });
    return;
  }

  const style = String(hairstyle || "a flattering modern men's haircut").slice(0, 120);
  const vibeText = String(vibe || "").slice(0, 60);
  const prompt =
    `Edit this photo so the person has the hairstyle "${style}"` +
    (vibeText ? `, matching a ${vibeText} look` : "") +
    ". Keep the same person, face, skin tone, expression, clothing, background and lighting. " +
    "Change only the hair. Make it photorealistic.";

  const form = new FormData();
  form.append(
    "image",
    new Blob([imageBytes], { type: match[1] }),
    `photo.${match[1].split("/")[1] === "jpeg" ? "jpg" : match[1].split("/")[1]}`
  );
  form.append("prompt", prompt);
  form.append("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-1");
  form.append("size", "1024x1024");

  let apiResponse;
  try {
    apiResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
  } catch {
    res.status(502).json({ error: "Could not reach the image service" });
    return;
  }

  if (!apiResponse.ok) {
    res.status(502).json({ error: "The image service could not create a preview right now" });
    return;
  }

  let result;
  try {
    result = await apiResponse.json();
  } catch {
    res.status(502).json({ error: "Unexpected response from the image service" });
    return;
  }

  const b64 = result?.data?.[0]?.b64_json;
  if (b64) {
    res.status(200).json({ imageUrl: `data:image/png;base64,${b64}` });
    return;
  }
  const url = result?.data?.[0]?.url;
  if (url) {
    res.status(200).json({ imageUrl: url });
    return;
  }
  res.status(502).json({ error: "The image service returned no preview" });
}
