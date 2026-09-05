export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    res.status(500).json({ error: "Stripe is not configured yet." });
    return;
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }

  const origin = process.env.APP_URL || "https://emotionaldamage.fyi";
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", origin + "/thanks?paid=1");
  params.set("cancel_url", origin + "/?canceled=1");
  params.set("billing_address_collection", "required");
  params.set("phone_number_collection[enabled]", "true");
  params.set("customer_creation", "always");
  params.set("submit_type", "pay");

  const countries = ["US", "CA", "GB", "AU", "DE", "FR", "ES", "IT", "NL", "IE", "MX", "PR"];
  countries.forEach((code, i) => {
    params.set("shipping_address_collection[allowed_countries][" + i + "]", code);
  });

  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", "2000");
  params.set("line_items[0][price_data][product_data][name]", "Emotional Damage — signed copy");
  params.set(
    "line_items[0][price_data][product_data][description]",
    "Signed paperback shipped by Josias Andujar Jr. $20 includes the book and shipping. Allow 2–4 weeks in the US."
  );
  params.set(
    "line_items[0][price_data][product_data][images][0]",
    "https://rulerofwisdom.com/book/emotional-damage.jpg"
  );

  params.set("custom_text[submit][message]", "Josias signs and ships the book after this $20 payment clears. US delivery 2–4 weeks.");
  params.set("metadata[source]", "emotionaldamage.fyi");
  if (body.name) params.set("metadata[name]", String(body.name).slice(0, 200));
  if (body.note) params.set("metadata[note]", String(body.note).slice(0, 400));
  if (body.email) params.set("customer_email", String(body.email).slice(0, 200));

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await stripeRes.json();
  if (!stripeRes.ok || !data.url) {
    res.status(500).json({ error: (data.error && data.error.message) || "Could not start checkout." });
    return;
  }

  res.status(200).json({ url: data.url });
}
