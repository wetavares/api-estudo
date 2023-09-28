/**
 * Arquivo de configuração para inicialização da aplicação.
 */

//Importação de pacotes/módulos para uso da aplicação
var express = require("express"); //Importação do pacote express
var app = express(); //Inicialização da aplicação 'app' pelo pacote express
var bodyParser = require("body-parser"); //Importação do pacote body-parser

/**
 * Configuração da aplicação para utilizar o pacote body-parser para retornar os dados da requisição.
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Importação do pacote cors
const cors = require("cors");

//Importação do pacote mongoose
var mongoose = require("mongoose");

//Configuração da conexão com o MongoDB no serviço cloud MongoDB Atlas
const uri =
  "mongodb+srv://tavares:tav12345@cluster0.mkbltwf.mongodb.net/?retryWrites=true&w=majority";

//Validação da configuração da conexão com o MongoDB
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("A conexão com o MongoDB foi realizada com sucesso!");
  })
  .catch((err) => {
    console.log(err);
  });

//Importação do arquivo de modelo que irá representar a coleção 'usuario'
var Usuario = require("./src/modelo/usuario");
const { error } = require("console");

//Definição da porta do servidor da aplicação
var porta = 4000;

//Definição da varíavel router para utilizar as instâncias das rotas do pacote express
var router = express.Router();

//Configuração do pacote cors para autorizar requisições de todas as origens
app.use(cors());

//Definição do middleware para acessar as solicitações enviadas à API
router.use(function (req, res, next) {
  console.log("Acesso à primeira camada do middleware...");
  //Definição do site de origem que tem permissão de realizar a conexão com a API
  //O "*" indicado que qualquer site pode fazer a conexão
  res.header("Access-Control-Allow-Origin", "*");
  //Definição dos métodos permitidos pela conexão durante o acesso à API
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  app.use(cors());
  next();
});

//Rota para exibir uma mensagem ao usuário
app.get("/", async (req, res) => {
  await res.send("Olá mundo! Esta é a página inicial da nossa aplicação.");
});

/**
 * Rota padrão para verificação do funcionamento da aplicação
 * Acesso: GET https://djcpyg-4000.csb.app/api
 */
router.get("/", async (req, res) => {
  try {
    await res.json({
      message: "Olá mundo! Está é a nossa API desenvolvida em Node.js.",
    });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ message: "error data was not created" });
  }
});

//Rotas terminadas em '/usuarios' (rotas para os verbos GET e POST)
router
  .route("/usuarios")

  /**
   * Método POST: cadastrar um usuário
   * Acesso: POST https://djcpyg-4000.csb.app/api/usuarios
   */
  .post(async (req, res) => {
    try {
      const usuario = new Usuario();
      // Definição dos campos que fazem parte da solicitação
      usuario.nome = req.body.nome;
      usuario.login = req.body.login;
      usuario.senha = req.body.senha;
      await usuario.validate();
      usuario.save();
      res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    } catch (erro) {
      console.log(erro);
      res.status(500).json({ message: "error usuario não cadastrado..." });
    }
  })

  /**
   * Método GET: retornar a listagem de todos os usuários
   * Acesso: GET https://djcpyg-4000.csb.app/api/usuarios
   */
  .get(async (req, res) => {
    try {
      const usuario = await Usuario.find();
      res.status(201).json(usuario);
    } catch (error) {
      res.status(500).json({
        message: "{error: Não foi possível buscar a listagem...." + error,
      });
    }
  });

//Rotas terminadas em '/usuarios/:usuario_id' (rotas para os verbos GET, PUT e DELETE)
router
  .route("/usuarios/:usuario_id")

  /**
   * Método GET: listar as informações de um usuário específico
   * Acesso: GET https://djcpyg-4000.csb.app/api/usuarios/:usuario_id
   */
  .get(async (req, res) => {
    const id = req.params.usuario_id;
    try {
      const usuario = await Usuario.findOne({ _id: id });
      if (!usuario) {
        res.status(422).json({ message: "Usuario não encontrado!" });
        return;
      }
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ erro: "Usuario não encontrado!" + error });
    }
  })

  /**
   * Método PUT: atualizar as informações de um usuário específico
   * Acesso: PUT https://djcpyg-4000.csb.app/api/usuarios/:usuario_id
   */
  .put(async (req, res) => {
    const id = req.params.usuario_id;
    const { nome, login, senha } = req.body;
    try {
      const usuario = await Usuario.findByIdAndUpdate(
        id,
        { nome, login, senha },
        { new: true },
      );
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar o usuario!" + error });
    }
  })

  /**
   * Método DELETE: deletar um usuário específico
   * Acesso: DELETE https://djcpyg-4000.csb.app/api/usuarios/:usuario_id
   */
  .delete(async (req, res) => {
    const id = req.params.usuario_id;
    const usuario = await Usuario.findOne({ _id: id });
    if (!usuario) {
      res.status(422).json({ message: "Usuário não encontrado!" });
      return;
    }

    try {
      await Usuario.deleteOne({ _id: id });
      res.status(200).json({ message: "Usuário removido com sucesso!" });
    } catch (error) {
      res.status(500).json({ erro: "Deu errado!" + error });
    }
  });

//Inicialização do servidor da aplicação
app.listen(porta);
console.log("Iniciando a aplicação na porta " + porta);

//Definição de uma rota com prefixo '/api' para todas as rotas
app.use("/api", router);
