// LookLab AI hairstyle try-on.
// POST { image: dataURL, hairstyle: string, vibe: string }
// Returns { imageUrl } (data URL) or { error } with a non-200 status.
// Set OPENAI_API_KEY in Netlify site environment variables.
// Optional: OPENAI_IMAGE_MODEL (defaults to gpt-image-1).

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AI previews are not set up yet" },
      { status: 503 }
    );
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { image, hairstyle, vibe } = payload || {};
  if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
    return Response.json({ error: "A photo is required" }, { status: 400 });
  }

  const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) {
    return Response.json(
      { error: "Photo must be JPG, PNG or WebP" },
      { status: 400 }
    );
  }

  let imageBytes;
  try {
    imageBytes = Buffer.from(match[2], "base64");
  } catch {
    return Response.json({ error: "Could not read the photo" }, { status: 400 });
  }
  if (imageBytes.length > 8 * 1024 * 1024) {
    return Response.json({ error: "Photo is too large" }, { status: 400 });
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
    return Response.json(
      { error: "Could not reach the image service" },
      { status: 502 }
    );
  }

  if (!apiResponse.ok) {
    return Response.json(
      { error: "The image service could not create a preview right now" },
      { status: 502 }
    );
  }

  let result;
  try {
    result = await apiResponse.json();
  } catch {
    return Response.json(
      { error: "Unexpected response from the image service" },
      { status: 502 }
    );
  }

  const b64 = result?.data?.[0]?.b64_json;
  if (b64) {
    return Response.json({ imageUrl: `data:image/png;base64,${b64}` });
  }
  const url = result?.data?.[0]?.url;
  if (url) {
    return Response.json({ imageUrl: url });
  }
  return Response.json(
    { error: "The image service returned no preview" },
    { status: 502 }
  );
};
