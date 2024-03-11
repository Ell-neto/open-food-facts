# Open Foods Facts com Web Scraping

## Passo a passo

Arquivos e seus componentes:

    Objetivo: A organização dos arquivos é para manusear com melhor facilidade algumas das estruturas internas para fazer o arquivo principal rodar e ter uma legibilidade mais adequada de compreendé-lo. Os arquivos foram separados em 4, são eles: main, foods.apps, foods.controller e foods.service. 
    O arquivo main deixei responsável apenas o Puppeteer, que vai iniciar um navegador headless com as configurações especificadas e retornando uma instância desse navegador para uso, o responsável pela funcionalidade de todo código de acordo com o que gostaria. No foods.apps deixei as rotas da pesquisa de acordo com o que o usuario tenha interesse, um Get para pesquisar tudo por aquele produto, um Get para pesquisar por um valor de nutrition e/ou score, e outro Get para pesquisar por um id do produto. O foods.controller.js foi feito para deixar as configurações do Swagger, que sabemos que ele permite documentar, testar e consumir APIs de forma mais eficiente, ou seja, o intuito do código será melhorá-lo mais ainda futuramente e o Swagger sempre será essencial pois com ele temos uma interface interativa que descreve os endpoints, ele junto com o foods.apps é o "andar da carruagem".  E no foods.service temos as principais funções que faz todo o "controle da carruagem", e sobre essas funções irei descrevé-las melhor mais a frente.
    

Função findFoods:

    Objetivo: A função busca por alimentos no site Open Food Facts com base em um nome de produto fornecido. Ele retorna um array de objetos, e no formato que os dados mais importantes sejam detectados logo assim que bater os olhos.

    Como usar: Rodar o node e acessar a url 'http://localhost:3000/products/produtoqueprocura', assim, os dados vão surgir na tela.

    Estrutura Principal:
        Express: Configuração de um servidor express na porta 3000.
        Swagger: Documentação Swagger para a API.
        Puppeteer: Navegação automatizada no site Open Food Facts.
        Express GET Endpoint (/products/:productName):
            Usa Puppeteer para buscar produtos no Open Food Facts com base no nome fornecido.
            Retorna dados dos produtos encontrados.
    Imagens:
        Temos o retorno dos dados via url (localhost): 
  ![func1a](https://github.com/Ell-neto/open-food-facts/blob/master/src/findfoods/others/imgs/primeiro_leite.png)
  
        Temos o retorno dos dados via terminal:
  ![func1b](https://github.com/Ell-neto/open-food-facts/blob/master/src/findfoods/others/imgs/primeiro_leiteb.png)


Função foodsScore:

    Objetivo: A função busca por alimentos no site Open Food Facts com base em um score fornecido, sendo o nutritionscore e/ou o novaScore, retornando um array de objetos.

    Como usar: Rodar o node e acessar a url 'http://localhost:3000/products?nutrition=A&nova=1' (por exemplo, e lembrando que o nutrition varia de 1 até 4 e o nova de A até D), assim, os dados vão surgir na tela.

    Estrutura Principal:
        Express: Configuração de um servidor express na porta 3000.
        Swagger: Documentação Swagger para a API.
        Puppeteer: Navegação automatizada no site Open Food Facts.
        Express GET Endpoint (/products/:productName):
            Usa Puppeteer para buscar produtos no Open Food Facts com base no nome fornecido.
            Retorna dados dos produtos encontrados.
    Imagens:
        Temos o retorno dos dados via url (localhost): 
  ![func1anovo](https://github.com/Ell-neto/open-food-facts/blob/master/src/findfoods/others/imgs/scores_host.png)
  
        Temos o retorno dos dados via terminal, reforçando que aqui ele mostra todos os dados obtidos mas apenas o que é desejado pelo usuário sai como retorno esperado na url:
  ![func1bnovo](https://github.com/Ell-neto/open-food-facts/blob/master/src/findfoods/others/imgs/scores_termin.png)


Função detailsFoods:

    Objetivo: A função extrai detalhes específicos de um produto no site Open Food Facts com base no código de barras. Desde nome do produto (o título cadastrado), até mesmo os ingredientes que nele contém, além de diversas outras informações podendo ser conferida nas imagens a seguir.

    Como usar: Rodar o node e acessar a url 'http://localhost:3000/products?searchTerm=7891095028344', assim, os dados vão surgir na tela.

    Estrutura Principal:
        Puppeteer: Navegação automatizada no site Open Food Facts.
        Express GET Endpoint (/details/:searchTerm):
            Usa Puppeteer para extrair detalhes específicos de um produto no Open Food Facts com base no código de barras (que registramos como id, pois o valor é único).
            Retorna informações como ID, título, quantidade, ingredientes, dados nutricionais, pontuação, entre outros.
        Imagens:
        Temos o retorno dos dados via url (localhost): 
  ![func2a](https://github.com/Ell-neto/open-food-facts/blob/master/src/findfoods/others/imgs/segundo_aveia.png)
  
        Temos o retorno dos dados via terminal:
  ![func2b](https://github.com/Ell-neto/open-food-facts/blob/master/src/findfoods/others/imgs/segundo_aveiab.png)


Observações:

    Ambos os códigos incluem tratamento de erros, modularização e uso de funções auxiliares para promover a reutilização e a legibilidade do código.
    Cada função foca em um aspecto específico: busca de produtos (findFoods), busca de produtos através do nutrition e/ou score (foodsScore) e detalhes de produtos (detailsFoods). 
    A utilização de Puppeteer permite a automação da interação com o site, facilitando a extração de dados desejados.
    As rotas Express definidas nos respectivos códigos são acionadas por meio de requisições HTTP, fornecendo uma API para interação externa.


## O que foi realizado?

Posso citar os seguintes pontos.
Desenvolvimento de Web Scraping:

    Implementação de scripts em Node.js utilizando Puppeteer para realizar web scraping no site Open Food Facts.
    As funções findFoods e detailsFoods foram criadas para buscar e extrair informações específicas sobre alimentos, respectivamente.

Configuração de API:

    Utilização do framework Express para criar uma API REST.
    Definição de endpoints que acionam as funções de web scraping.

Documentação Swagger:

    Integração do Swagger para documentar a API, proporcionando informações claras sobre os endpoints e seus parâmetros.

Código Limpo:

    Utilização de funções auxiliares para modular o código.
    Lógica estruturada para extrair dados específicos do produto.

Tratamento de Erros:

    Implementação de tratamento de erros para lidar com possíveis problemas durante a execução do web scraping, proporcionando uma experiência mais robusta.
    Tratamento de erros durante a execução da pesquisa.

Execução via API:

    Disponibilização de endpoints que podem ser acessados através de requisições HTTP, permitindo a interação com as funcionalidades de busca e detalhamento de alimentos.

## Desafios

Principais desafios foram na estruturação do código para analisar os dados "variados" do site Open Foods Facts (OFF), sabendo que nem todos tem todas as informações e nem todas necessariamente sejam verídicas (pois alguns produtos já alteraram seu ingrediente e consequentemente, o site não está tão atualizado assim).
E também para implementar um código que também não varie muito, pois pelo fato mencionado acima, as vezes temos que procurar (na força bruta) se não tem outros itens com mesmo "seletor" (aqui vamos só mencionar isso sobre o html) e o que acaba dificultando na hora de pesquisar um item.
A abordagem tentei fazer a mais suscinta, contudo, nem sempre o código pequeno e reduzido vale a pena, o motivo? Abaixo eu comento sobre e também mostro o porquê.
Contudo, adorei muito os desafios e tenho muito interesse em melhorar este código, aliás, fazer vários endpoints e de forma que um possa até fazer parte do outro.
O maior desafio agora é implementar códigos de automação e também de testagem.

## Arquivos adicionais, o que são?

Bem, você percebeu que tem uma pasta chamada "others", e carrega consigo mais 2 pastas, uma de imgs (que o nome já descreve do que se trata) e a outra que se chama alternative_code.
Enquanto fazia o processo de codificação, me deparei com erros mas também acertos, acerto neste sentido que menciono aqui é poder ter construído outro código mais enxuto que o que deixei disponível, mas porque não optei por ele para deixar no arquivo principal?
Já respondo, este código por simples que seja, tem uma dificuldade enorme em rodar a aplicação, tudo se deve ao fato do seletor (aqui menciono coisas do html) ser responsavel por uma lista gigantesca e até algumas com dificuldades na hora de usar regex para pegar os dados corretos.
Seria ótimo se o código em questão funcionasse para uma pesquisa que viessem vários dados mas ele tem uma limitação, e por isso no ![código](https://github.com/Ell-neto/open-food-facts/blob/master/src/findfoods/others/alternative-code/alternative_findfoods.js) (dá uma olhadinha, vai, por favor), ele tem a limitação de itens pesquisados.
Contudo, achei bem curioso o fato do código ser até mais legivél. 

        Temos o retorno dos dados via url (localhost): 
  ![funcalta](https://github.com/Ell-neto/open-food-facts/blob/master/src/findfoods/others/imgs/alternative_1a.png)
  
        Temos o retorno dos dados via terminal:
  ![funcaltb](https://github.com/Ell-neto/open-food-facts/blob/master/src/findfoods/others/imgs/alternativa_1b.png)

De forma prazerosa concluo este projeto com várias ideias de melhoria, obrigado pela leitura até aqui! Abraços!!   

    Tecnologias Utilizadas: Node.js, Puppeteer, Express, Swagger. e será que vem mais?
