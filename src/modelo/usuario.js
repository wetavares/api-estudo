/**
 * Arquivo da configuração do esquema da base de dados MongoDB
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsuarioEsquema = new Schema({
  nome: String,
  login: String,
  senha: String
});

module.exports = mongoose.model("Usuario", UsuarioEsquema);
