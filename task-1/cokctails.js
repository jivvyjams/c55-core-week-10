// API documentation: https://www.thecocktaildb.com/api.php

import fs from "fs/promises";
import path from "path";

const BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1";

// Add helper functions as needed here
function checkAlcohol(alcoholic) {
  return alcoholic === "Alcoholic" ? "Yes" : "No";
}

function getIngredients(drink) {
  const ingredients = [];

  for (let index = 1; index <= 15; index += 1) {
    const ingredient = drink[`strIngredient${index}`]?.trim();

    if (!ingredient) {
      continue;
    }

    const measure = drink[`strMeasure${index}`]?.trim();
    ingredients.push(
      measure ? `- ${measure} ${ingredient}` : `- ${ingredient}`,
    );
  }

  return ingredients.join("\n");
}

function createMarkdown(drink) {
  return [
    `## ${drink.strDrink}`,
    "",
    `![${drink.strDrink}](${drink.strDrinkThumb}/medium)`,
    "",
    `**Category**: ${drink.strCategory}`,
    "",
    `**Alcoholic**: ${checkAlcohol(drink.strAlcoholic)}`,
    "",
    "### Ingredients",
    "",
    getIngredients(drink),
    "",
    "### Instructions",
    "",
    drink.strInstructions,
    "",
    `Serve in: ${drink.strGlass}`,
  ].join("\n");
}

function formatMarkdown(drinks) {
  const drinksMarkdown = drinks.map(createMarkdown).join("\n\n");
  return `# Cocktail Recipes\n\n${drinksMarkdown}\n`;
}

export async function main() {
  if (process.argv.length < 3) {
    console.error("Please provide cocktail name as command line argument.");
    return;
  }

  const cocktailName = process.argv[2];
  const url = `${BASE_URL}/search.php?s=${cocktailName}`;

  const __dirname = import.meta.dirname;
  const outPath = path.join(__dirname, `./output/${cocktailName}.md`);

  try {
    // 1. Fetch data from the API at the given URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch cocktails (status: ${response.status})`);
    }

    const data = await response.json();

    if (!data.drinks) {
      throw new Error("No cocktails found.");
    }

    // 2. Generate markdown content to match the examples
    const markdown = formatMarkdown(data.drinks);

    // 3. Write the generated content to a markdown file as given by outPath
    await fs.writeFile(outPath, markdown, "utf-8");
  } catch (error) {
    // 4. Handle errors
    console.error(`Error: ${error.message}`);
  }
}

// Do not change the code below
if (!process.env.VITEST) {
  main();
}
