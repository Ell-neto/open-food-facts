const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const routes = require('./foods.apps.js');

const app = express();
const port = 3000;

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
app.use('/', routes);

app.listen(port, () => {
console.log(`Server running at http://localhost:${port}`);
});