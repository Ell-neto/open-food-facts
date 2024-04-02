const browserPupp = require('./main.js');
  
async function accessingOpenFoodFacts(page, productName) {
    await page.goto('https://br.openfoodfacts.org/', { waitUntil: 'networkidle2' });
    await page.type('.postfix-round > div:nth-child(1) > input:nth-child(1)', productName);
    await page.keyboard.press('Enter');
    await page.waitForSelector('div.row:nth-child(8)', { timeout: 50000 });
}

async function findFoods(browser, productName) {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(50000);
  
    try {

      await accessingOpenFoodFacts(page, productName);

      const results = await page.evaluate(() => {

        const products = document.querySelectorAll('#products_match_all li');
        const data = [];
  
        products.forEach((product, index) => {

          const anchorElement = product.querySelector(`li:nth-child(${index + 1}) > a:nth-child(1)`);
  
          const idHref = anchorElement?.getAttribute('href') || 'N/A';
          const idMatch = idHref.match(/produto\/(\d+)\//);
          const id = idMatch ? idMatch[1] : 'N/A';
  
          const name = product.querySelector(`#products_match_all > li:nth-child(${index + 1}) > a:nth-child(1) > div:nth-child(1) > div:nth-child(2)`)?.innerText.trim() || 'N/A';
  
          const novaImage = anchorElement?.querySelector('div:nth-child(1) > div:nth-child(3) > img:nth-child(2)');
          const novaScoreTitle = novaImage?.getAttribute('title') || 'N/A';
          const novaScoreMatch = novaScoreTitle.match(/NOVA (\d+)/);
          const novaScore = novaScoreMatch ? parseInt(novaScoreMatch[1]) : 'unknown';
          const titleMatch = novaScoreTitle.match(/- (.*)/);
          const novaTitle = titleMatch ? titleMatch[1] : 'unknown';
  
          const nutritionImage = anchorElement?.querySelector('div:nth-child(1) > div:nth-child(3) > img:nth-child(1)');
          const nutritionScoreTitle = nutritionImage?.getAttribute('title') || 'N/A';
          const nutritionScoreMatch = nutritionScoreTitle.match(/Nutri-Score (\w)/);
          const nutritionScore = nutritionScoreMatch ? nutritionScoreMatch[1].toUpperCase() : 'unknown';
          const titleMatchNutri = nutritionScoreTitle.match(/- (.*)/);
          const nutritionTitle = titleMatchNutri ? titleMatchNutri[1] : 'unknown';
  
          data.push({
            id,
            name,
            nutrition: {
              score: nutritionScore,
              title: nutritionTitle
            },
            nova: {
              score: novaScore,
              title: novaTitle
            },
          });
        });

        return data;
      });
  
    console.log('Saída de resultados:', results);
        return results;

    } catch (error) {

      console.error('Erro durante a execução da pesquisa:', error);
        throw new Error('Erro durante a execução da pesquisa.');

    } finally {

         await browser.close();
    }
}

async function foodsScores(browser, nutritionScore, novaScore) {

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  try {

    await page.goto('https://br.openfoodfacts.org/', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#products_all li', { timeout: 60000 });

    const productElements = await page.$$('#products_all li');

    const results = productElements.map(async (product) => {
      const id = await product.$eval('a.list_product_a', (link) => {
        const idHref = link.getAttribute('href');
        const idMatch = idHref.match(/produto\/(\d+)\//);
        return idMatch ? idMatch[1] : 'N/A';
      });
  
      const name = await product.$eval('a.list_product_a', (link) => link.textContent.trim());
  
      const nutritionScoreTitle = await product.$eval('img[title^="Nutri-Score"]', (score) => {
        const title = score.getAttribute('title');
        const match = title.match(/Nutri-Score (\w)/);
        const nutritionScore = match ? match[1].toUpperCase() : 'unknown';
        const titleMatchNutri = title.match(/- (.*)/);
        const nutritionTitle = titleMatchNutri ? titleMatchNutri[1] : 'unknown';
        return [nutritionScore, nutritionTitle]
      });
  
      const novaScoreTitle = await product.$eval('img[title^="NOVA"]', (score) => {
        const title = score.getAttribute('title');
        const novaScoreMatch = title.match(/NOVA (\d+)/);
        const novaScore = novaScoreMatch ? parseInt(novaScoreMatch[1]) : 'unknown';
        const titleMatch = title.match(/- (.*)/);
        const novaTitle = titleMatch ? titleMatch[1] : 'unknown';
        return [novaScore, novaTitle]
      });
  
      console.log(id)
      console.log(name)
      console.log(nutritionScoreTitle)
      console.log(novaScoreTitle)
  
      return {
        id,
        name,
        nutrition: {
            score: nutritionScoreTitle[0],
            title: nutritionScoreTitle[1]
        },
        nova: {
          score: novaScoreTitle[0],
          title: novaScoreTitle[1]
        }
      };
    });
  
    const filteredResults = await Promise.all(results)
      .then((results) => results.filter((product) => {
        const nutritionMatches = nutritionScore === 'unknown' || product.nutrition.score === nutritionScore;
        const novaMatches = novaScore  === 'unknown' || product.nova.score === novaScore;
        return nutritionMatches || novaMatches;
      }));
  
    return filteredResults.length > 0 ? filteredResults : 'unknown';
  
  } catch (error) {
    console.error('Erro durante a execução da pesquisa:', error);
    throw new Error('Erro durante a execução da pesquisa');
  } finally {
    await page.close();
    }
}

async function detailsFoods({ searchTerm }) {

  const browser = await browserPupp.launchBrowser();
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(50000);

  try{

    await page.goto(`https://br.openfoodfacts.org/produto/${encodeURIComponent(searchTerm)}`);
    await page.waitForSelector('.title-1, #barcode, #field_quantity_value', { timeout: 50000 });

    const id = await page.$eval('#barcode', (element) => element.innerText.trim());
    console.log('id:', id); 

    const title = await page.$eval('.title-1', (element) => element.innerText.trim());
    console.log('title:', title);

    const quantitySelectors = [
      '#field_quantity_value'
    ];
    
    let quantity;
    
    for (const selector of quantitySelectors) {
      const element = await page.$(selector);
      if (element) {
        quantity = await element.evaluate((el) => el.innerText.trim());
        break;
      }
    }
    console.log('quantity:', quantity);
   

    const ingredientsPartial = await page.$eval('#panel_ingredients_content > div:nth-child(1) > div:nth-child(1)', (element) => element.innerText.trim());

    const ingredientsOilSelectors = [
      '#panel_ingredients_analysis_en-palm-oil-free > li:nth-child(1)',
      '#panel_ingredients_analysis_en-palm-oil > li:nth-child(1) > a:nth-child(1)'
    ];
    
    let hasPalmOil = false;

    for (const selector of ingredientsOilSelectors) {
      const element = await page.$(selector);
      if (element) {
        const result = await element.evaluate((el) => el.innerText.trim());
        hasPalmOil = result.toLowerCase() !== 'unknown' && result.toLowerCase() !== 'sem óleo de palma';
        break;
      }
    }
    console.log('hasPalmOil: ', hasPalmOil);


    const ingredientsVeganSelectors = [
      '#panel_ingredients_analysis_en-vegan-status-unknown > li:nth-child(1) > a:nth-child(1) > h4:nth-child(2)',
      '#panel_ingredients_analysis_en-non-vegan > li:nth-child(1) > a:nth-child(1) > h4:nth-child(2)',
      '#panel_ingredients_analysis_en-vegan > li:nth-child(1) > a:nth-child(1)'
    ];
    
    let isVegan = false;

    for (const selector of ingredientsVeganSelectors) {
      const element = await page.$(selector);
      if (element) {
        const result = await element.evaluate((el) => el.innerText.trim());
        isVegan = result.toLowerCase() !== 'unknown' && result.toLowerCase() !== 'desconhece-se se é vegano' && result.toLowerCase() !== 'não vegano';
        break;  
      }
    }
    console.log('isVegan: ', isVegan);


    const ingredientsVegetarianSelectors = [
      '#panel_ingredients_analysis_en-vegetarian-status-unknown > li:nth-child(1) > a:nth-child(1) > h4:nth-child(2)',
      '#panel_ingredients_analysis_en-vegetarian > li:nth-child(1) > a:nth-child(1)',
      '#panel_ingredients_analysis_en-non-vegetarian > li:nth-child(1) > a:nth-child(1) > h4:nth-child(2)'
    ];
    
    let isVegetarian = false;

    for (const selector of ingredientsVegetarianSelectors) {
      const element = await page.$(selector);
      if (element) {
        const result = await element.evaluate((el) => el.innerText.trim());
        isVegetarian = result.toLowerCase() !== 'unknown' && result.toLowerCase() !== 'estado vegetariano desconhecido' && result.toLowerCase() !== 'não vegetariano';
        break;
      }
    }
    console.log('isVegetarian: ', isVegetarian);

    const ingredients = {
      hasPalmOil,
      isVegan,
      isVegetarian,
      list: ingredientsPartial.split(',').map((ingredient) => ingredient.trim()),
    };


    const scoreSelectors = [
      'h4.grade_c_title:nth-child(1)',
      '#panel_nutriscore > li:nth-child(1) > a:nth-child(1)',
      '#attributes_grid > li:nth-child(1) > a:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > h4:nth-child(1)'
    ];
    
    let score;

    for (const selector of scoreSelectors) {
      const element = await page.$(selector);
      if (element) {
        const fullScore = await element.evaluate((el) => el.innerText.trim());
        const match = fullScore.match(/[A-D]/);
        score = match ? match[0] : 'unknown'; 
        break;  
      }
    }
    console.log('score:', score);  

    const servingSizeSelectors = [
      '#panel_serving_size_content'
    ];
    
    
    let servingSize;
   
    for (const selector of servingSizeSelectors) {
      const element = await page.$(selector, { timeout: 20000 });
      if (element) {
        servingSize = await element.evaluate((el) => el.innerText.trim());
        break;  
      }
    }
    
    if (servingSize && servingSize.includes(':')) {
      servingSize = servingSize.split(':')[1].trim();
    }
    console.log('servingSize:', servingSize); 


    const dataSelectors = ['#panel_nutrition_facts_table_content'];

    let newData;  
    let data = {}  

    for (const selector of dataSelectors) {
      const element = await page.$(selector, { timeout: 20000 });
      if (element) {
        newData = await element.evaluate((el) => el.innerText.trim());
        break;
      }
    }

    if (!newData) {
      console.log('data: ', data); 
    } else {

      const regexMatch = newData.match(/Energia[\s\S]+/);
      const matchedData = regexMatch ? regexMatch[0] : '';


      const nutrientRegex = /(Energia|Gorduras\/lípidos|Carboidratos|Fibra alimentar|Proteínas|Sal)\s+([\d.,]+ [a-zA-Z]+(?:\([^)]+\))?)\s*([\d.,]+ [a-zA-Z]+(?:\([^)]+\))?)?/g;
      
      let match;
      while ((match = nutrientRegex.exec(matchedData)) !== null) {
        const [, nutrient, per100g, perServing] = match;
        data[nutrient] = { 
          per100g: per100g || '?',
          perServing: perServing || '?',
        };
      }
      console.log('data:', data); 
    }


    const valuesNovaSelectors = [
      '.grade_e_title',
      '#attributes_grid > li:nth-child(2) > a:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > h4:nth-child(1)',
    ];
    
    let novaPartialOne;

    for (const selector of valuesNovaSelectors) {
      const element = await page.$(selector);
      if (element) {
        novaPartialOne = await element.evaluate((el) => el.innerText.trim());
        break;  
      }
    }
    console.log('Nova Score:', novaPartialOne)

    const novaPartialTwo = await page.$eval('#panel_nova > li:nth-child(1) > a:nth-child(1) > h4:nth-child(2)', (element) => element.innerText.trim());
    console.log('Nova title:', novaPartialTwo); 

    const novaScore = novaPartialOne.match(/\d+/);

    const nova = {
      score: novaScore ? parseInt(novaScore[0]) : 'unknown',
      title: novaPartialTwo.trim() || 'unknown',
    };

    console.log('nova:', nova);


    const valuesSelectors = ['#panel_nutrient_levels > li:nth-child(1)'];

    let valuesFullSelectors;
    let nutrition
    
    for (const selector of valuesSelectors) {
      const element = await page.$(selector);
      if (element) {
        valuesFullSelectors = await element.evaluate((el) => el.innerText.trim());
        break;
      }
    }
    
    if (valuesFullSelectors) {
      const patternMapping = [
        { pattern: /baixa/i, category: 'low' },
        { pattern: /moderada/i, category: 'moderate' },
        { pattern: /elevada/i, category: 'high' },
      ];
      
      const values = valuesFullSelectors
      .split('\n')
      .reduce((result, line) => {
        for (const { pattern, category } of patternMapping) {
          if (pattern.test(line)) {
            const existingCategory = result.find((item) => item[0] === category);
            if (existingCategory) {
              existingCategory.push(line);
            } else {
              result.push([category, line]);
            }
            break;
          }
        }
        return result;
      }, []);
    
      console.log('values:', values);

      nutrition = {
        score,
        values,
        servingSize,
        data,
      }
    }

    return { title, quantity, ingredients, nutrition, nova };
    
  } catch (error) {
    console.error('Erro durante a execução do web scraping:', error);
    return { error: 'Erro durante a execução do web scraping' };
      
  } finally {
    
    await browser.close();
  }
}

module.exports = { findFoods, foodsScores, detailsFoods };