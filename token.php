<?php
require_once __DIR__."/../intranet/include/clsBanco.inc.php";
$db = new clsBanco();
$token = md5(uniqid(rand(), true))."";
session_start();
$user_id = $_SESSION["id_pessoa"];
session_write_close();
if(isset($user_id)){
  try{
    $db->Consulta(//cria tabela de tokens se ela já não existir
    "CREATE TABLE IF NOT EXISTS acesso.sslrel_tokens (
      user_id integer NOT NULL REFERENCES portal.funcionario (ref_cod_pessoa_fj) ON DELETE CASCADE,
      token varchar(450) NOT NULL UNIQUE PRIMARY KEY,
      created_at timestamp DEFAULT current_timestamp)");
    if(!$db->bErro_no){
      $db->Consulta("INSERT INTO acesso.sslrel_tokens (user_id, token) VALUES ('$user_id','$token')");
      if(!$db->bErro_no){
        echo json_encode(["msg"=>"Sucesso ao criar token","msgType"=>"success","token"=>$token]);
      }else{
        echo json_encode(["msg"=>"Houve um erro ao salvar no banco","msgType"=>"error"]);
      }
    }else{
      echo json_encode(["msg"=>"Houve um erro na Tabela","msgType"=>"error"]);
    }
  }catch(Exception $e){
    echo json_encode(["msg"=>"Houve um erro no Banco:".$e,"msgType"=>"error"]);
  }
}else{
  echo json_encode(["msg"=>"Nenhum Usuário Logado","msgType"=>"error"]);
}
