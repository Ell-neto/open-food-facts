const express = require('express');
const puppeteer = require('puppeteer');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3030;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Open Food API',
      version: '1.0.0',
      description: 'API para busca de produtos no Open Food Facts',
    },
  },
  apis: ['app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

async function findFoods(browser, productName) {

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    try {
    await page.goto('https://br.openfoodfacts.org/', { waitUntil: 'networkidle2' });
    await page.type('.postfix-round > div:nth-child(1) > input:nth-child(1)', productName);
    await page.keyboard.press('Enter');

    await page.waitForSelector('#products_match_all li', { timeout: 60000 });

    const productElements = await page.$$('#products_match_all li');
    const numProductsToProcess = 6;
    const results = [];
    const data = [];

    for (let i = 0; i < Math.min(numProductsToProcess, productElements.length); i++) {
        const product = productElements[i];

        const link = await product.$('a.list_product_a');
        const idHref = await (await link.getProperty('href')).jsonValue();
        const idMatch = idHref.match(/produto\/(\d+)\//);
        const id = idMatch ? idMatch[1] : 'N/A';

        const name = await (await link.getProperty('title')).jsonValue();

        const nutritionScoreTitle = await product.$eval('img[title^="Nutri-Score"]', img => img.getAttribute('title'));
        const nutritionScoreMatch = nutritionScoreTitle.match(/Nutri-Score (\w)/);
        const nutritionScore = nutritionScoreMatch ? nutritionScoreMatch[1].toUpperCase() : 'unknown';
        const titleMatchNutri = nutritionScoreTitle.match(/- (.*)/);
        const nutritionTitle = titleMatchNutri ? titleMatchNutri[1] : 'unknown';

        const novaScoreTitle = await product.$eval('img[title^="NOVA"]', img => img.getAttribute('title'));
        const novaScoreMatch = novaScoreTitle.match(/NOVA (\d+)/);
        const novaScore = novaScoreMatch ? parseInt(novaScoreMatch[1]) : 'unknown';
        const titleMatch = novaScoreTitle.match(/- (.*)/);
        const novaTitle = titleMatch ? titleMatch[1] : 'unknown';

        console.log('ID:', id);
        console.log('Name:', name);
        console.log('Nutrition Score:', nutritionScore);
        console.log('NOVA Score:', novaScoreTitle);
        console.log('---');

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
    }

    return data;

    } catch (error) {

    console.error('Erro durante a execução da pesquisa:', error);
    throw new Error('Erro durante a execução da pesquisa');

  } finally {

    await browser.close();

  }
}

/**
* @swagger
* /products:
*   get:
*     summary: Retorna produtos com base nos critérios Nutri-Score e NOVA.
*     parameters:
*       - in: query
*         name: searchTerm
*         schema:
*           type: string
*         description: Critério Nutri-Score (A, B, C, D, E).
*       - in: query
*         name: nova
*         schema:
*           type: integer
*         description: Critério NOVA (1, 2, 3, 4).
*     responses:
*       200:
*         description: Lista de produtos que atendem aos critérios.
*/

app.get('/products/:productName', async (req, res) => {

  const { productName } = req.params;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  }); 

  try {
    console.log('Calling findFoods');
    const results = await findFoods(browser, productName);
    res.json(results);
  } catch (error) {
    console.error('Erro durante a execução da pesquisa:', error);
    res.status(500).json({ error: 'Erro durante a execução da pesquisa' });
  } finally {
    console.log('Closing browser');
    await browser.close();
  }
});

app.listen(port, () => {
console.log(`Server running at http://localhost:${port}`);
});