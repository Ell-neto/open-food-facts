const express = require('express');
const foodsServ = require('./foods.service.js');
const router = express.Router();
const browserPupp = require('./main.js');

router.get('/products/:productName', async (req, res) => {

    const { productName } = req.params;
    const browser = await browserPupp.launchBrowser();
  
    try {

      const results = await foodsServ.findFoods(browser, productName);
      res.json(results);

    } catch (error) {

      console.error('Erro durante a execução da pesquisa:', error);
      res.status(500).json({ error: 'Erro durante a execução da pesquisa' });

    } finally {

      await browser.close();

    }
});

router.get('/products', async (req, res) => {
    {
      const { searchTerm } = req.query;
      const browser = await browserPupp.launchBrowser();
    
      try {
        const products = await foodsServ.detailsFoods({ searchTerm, browser });
        res.json(products);
      } catch (error) {

        console.error('Erro durante a execução do web scraping:', error);
        res.status(500).json({ error: 'Erro durante a execução do web scraping.' });

      } finally {

        await browser.close();
      }
    }
    });


module.exports = router;