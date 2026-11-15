const productImageByTitle = {
  "PEPTIDE-132 Ultra Perfect Hair Bonding Shampoo 200ml": "PEPTIDE-132 Ultra Perfect Hair Bonding Shampoo 200ml.webp",
  "Poreless Clarifying Charcoal Mask": "Poreless Clarifying Charcoal Mask.jpg",
  "Advanced Snail Mucin Gel Cleanser 150 mL": "Advanced Snail Mucin Gel Cleanser 150 mL.webp",
  "Low pH Good Morning Gel Cleanser 150ml": "Low pH Good Morning Gel Cleanser.webp",
  "Salicylic Acid Daily Gentle Cleanser 150ml": "Salicylic Acid Daily Gentle Cleanser 150ml.webp",
  "PEPTIDE-132 Ultra Perfect Hair Bonding Treatment 120ml": "PEPTIDE-132 Ultra Perfect Hair Bonding Treatment 120ml.webp",
  "Acne Pimple Master 24 patches": "Acne Pimple Master 24 patches.webp",
  "Clear Fit Master Patch(Somadermspot-S)": "Clear Fit Master Patch(Somadermspot-S).webp",
  "[COSRX] Advanced Snail 96 Mucin Power Essence 100ml": "[COSRX] Advanced Snail 96 Mucin Power Essence 100ml.webp",
  "Advanced Snail Radiance Dual Essence 80ml": "Advanced Snail Radiance Dual Essence 80ml.webp",
  "AHA/BHA CLARIFYING TREATMENT TONER 150ml": "AHA BHA CLARIFYING TREATMENT TONER 150ml.webp",
  "Hyaluronic Hydra intensive cream 100ml": "Hyaluronic Hydra intensive cream 100ml.webp",
  "The 6 Peptide Skin Booster Serum 150mL": "The 6 Peptide Skin Booster Serum 150mL.webp",
  "Refresh AHA BHA Vitamin C Booster Serum 30ml": "Refresh AHA BHA Vitamin C Booster Serum 30ml.webp",
  "All About Snail Kit": "All About Snail Kit.webp",
  "[Cosrx] Advanced Snail 92 All In One Cream 100g": "[Cosrx] Advanced Snail 92 All In One Cream 100g.jpg",
  "Oil-Free Ultra-Moisturizing Lotion 100ml": "Oil-Free Ultra-Moisturizing Lotion 100ml.webp"
};

function getProductImage(title) {
  const filename = productImageByTitle[title];
  return filename ? `assets/products/COSRX/${encodeURIComponent(filename).replace(/%2F/gi, "/")}` : "";
}
