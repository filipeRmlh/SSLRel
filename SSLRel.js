/*29/05/2018*/
/*Este Arquivo foi criado em conjunto para servir a aplicação de geração
de relatório criada pelo grupo SSL como trabalho da matéria de Fundamentos
da Eng. de Software do Curso de Ciência da Computação da UFRJ*/
var ssl;
var sslToast;
var __SSLURLROOT =window.location.protocol+"//"+window.location.hostname+":8081/sslrel/";
//Carrega Classe Principal
SSLRel = function(){
  this.frame = document.querySelector("frame[name=central]");
  this.frameContent;
  this.SSLui;
}



//Inicializa Configuração e adiciona jquery
SSLRel.prototype["init"]=function(){
  var script = document.createElement("script");
  script.setAttribute("src","https://code.jquery.com/jquery-3.3.1.min.js");
  script.setAttribute("integrity","sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=");
  script.setAttribute("crossorigin","anonymous");
  document.querySelector("head").appendChild(script);
    var _this=this;
    _this.reload();
  this.frame.onload=function(){_this.reload()};

};


//Inicializa Contexto do APP Executa ajax e pega token
SSLRel.prototype["getToken"]=function(callback){
  if(callback!=undefined){
    var urlaction = this.frameContent.location.pathname;
    $.ajax({
      url:location.origin+"/SSLRel/token.php",
      method:'post',
      dataType:"json",
    })
    .done(function(response){
      if(response.msgType=="success"){
        data = {};
        data["_urlaction"] = urlaction.replace(/\B\//,"").replace(/intranet\/(?:\S*\/)*(\S*\.php)/,"$1");
        data["_token"]=response.token;
        callback(data);
      }else{
          sslToast("<strong>Error:</strong>"+response.msg,"error");
      }
    })
    .fail(function(response){
        sslToast("<strong>Error:</strong>"+response,"error");
    });
  }
};

//Faz requisição no java;
SSLRel.prototype["javax"]=function(path,data,success,error,options){
    var _this=this;
    if(this.SSLui)this.SSLui.ui.querySelector(".loader").style.display="flex";
    options = options || {};
    success = success||function(){};
    error=error||function(response){ if(_this.SSLui)_this.SSLui.ui.querySelector(".loader").style.display="";console.log("JAVA-ERROR",response);sslToast("Houve um erro! Consulte o Log","error")};
    var _success=function(response){
        if(_this.SSLui)_this.SSLui.ui.querySelector(".loader").style.display="";
      success(response);
      if(response.msg){
          if(response.type){
              sslToast(response.msg,response.type,2500);
          }else{
              sslToast(response.msg,null,2500);
          }
      }
    };
    this.getToken(function(_data){
        if(options.formData){
            data.append("_urlaction",_data["_urlaction"]);
            data.append("_token",_data["_token"]);
        }else{
            data["_urlaction"] = _data["_urlaction"];
            data["_token"] = _data["_token"];
        }

      setTimeout(function () {
          $.ajax({
              url:__SSLURLROOT+path,
              data:data,
              method:"POST",
              dataType: ( options.dataType || "json" ),
              processData: options.processData,
              contentType: options.contentType
          }).done(_success).fail(error);
      },500);
    });
}

//Recarrega UI toda vez que um iframe é carregado;
SSLRel.prototype["reload"]=function(){
  var _this=this;
  this.frameContent = frames[1];
  var form = _this.frameContent.document.querySelector("#formcadastro");
  var btn_envia = _this.frameContent.document.querySelector("#btn_enviar[onclick^=printReport]");
    if(_this.frameContent.location.href.match("Reports")&&btn_envia){
        form.setAttribute("action",__SSLURLROOT+"generateReport");
        form.setAttribute("target","_blank");
        var inputToken = document.createElement("input");
        var inputURL = document.createElement("input");
        inputToken.setAttribute("name","_token");
        inputToken.setAttribute("type","hidden");
        inputURL.setAttribute("name","_urlaction");
        inputURL.setAttribute("type","hidden");
        form.appendChild(inputToken);
        form.appendChild(inputURL);
        // form.setAttribute("method","get");
        btn_envia.removeAttribute("onclick");
        btn_envia.addEventListener("click",function (e) {
            e.preventDefault();
            e.stopPropagation();
            _this.getReport(this,e,form);
            return false;
        })
    }

  setTimeout(function(){
    _this.startUI();
  },300);

};

//Abre UI e executa Contexto da UI
SSLRel.prototype["startUI"]=function(){
    _this=this;
    var end = _this.frameContent.location;
    if(end.href.match("Reports")){
        _this.javax("config/ui",{action:"openUi"},function(response){
		
            if(end.href.match("Reports") &&(response!=undefined) && (response.match("SSL"))){
                _this.SSLui = new SSLRelUI(_this,response);
            }else if(response.match("{msg:")){
                _this.frameContent.document.querySelector(".menu-icon-open").remove();
                console.error("SSLRel: ",JSON.parse(response).msg);
            }
        },function(response){console.log(response);},{dataType:"html"});
    }else {
        var menuIcon = _this.frameContent.document.querySelector(".menu-icon-open");
        if(menuIcon) menuIcon.remove();
    }

};

//Abre nova pagina usando parametros do relatório;
SSLRel.prototype["getReport"]=function(elm,e,form){
    var _this=this;
   this.getToken(function(data){
       var  inputToken = form.querySelector("[name=_token]");
       var  inputURL = form.querySelector("[name=_urlaction]");
       inputToken.setAttribute("type","hidden");
       inputURL.setAttribute("type","hidden");
       inputToken.value = data["_token"];
       inputURL.value=data["_urlaction"];
       _this.frameContent.printReport();
   });
};

//Contexto da UI
SSLRelUI=function(parent,html){
    _this=this;
    this.parent=parent;
    this.ui;
    this.formElements = this.parent.frameContent.document.querySelectorAll("#formcadastro input:not([type=hidden]):not([type=button]):not([type=submit]), #formcadastro select");
    this.tempMatch={color:0};
    this.init(html);
};

//Inicializa Contexto da UI;
SSLRelUI.prototype["init"]=function(html){
    var _this=this;
    sslToast = function(msg,type,timeup){_this.msgBox(msg,type,timeup)};
    this.ui = document.createElement("div");
    this.ui.setAttribute("id","SSLRelUI");
    this.ui.style.display="none";
    this.parent.frameContent.location.href;
    var menu = document.createElement("div");
    menu.innerHTML = "<i class=\"fas fa-bars\"></i>";
    menu.setAttribute("class","menu-icon-open");
    menu.addEventListener("click",function (){_this.openMenu(_this)});
    this.parent.frameContent.document.querySelectorAll("#tablenum1 .r2c1A")[0].appendChild(menu);
    this.parent.frameContent.document.body.appendChild(this.ui);
    this.ui.innerHTML=html;
    setTimeout(function () {
        _this.ui.style.display="";
    },300);

    this.ui.querySelector("#jobNameEdit").addEventListener("change",function(){
        _this.matchReset();
        _this.mountSectionEditar(this);
    });
    this.ui.querySelector(".menu-icon").addEventListener("click",function (){_this.openMenu(_this)});
    var nav = this.ui.querySelectorAll(".SSLRel .nav a");
    var i;
    for(i=0;i<nav.length;i++){
        nav[i].addEventListener("click",function (evt) {_this.selectSection(this,evt)});
    }
    for(i=0;i<_this.formElements.length;i++){
        _this.formElements[i].addEventListener("click",function () {
            _this.matchFields(this);
        })
    }

    this.ui.querySelector(".section.criar").addEventListener("submit",function (e){e.preventDefault();_this.uploadJobModel(e);return false});

    this.ui.querySelector("#clearJobEdit").addEventListener("click",function(e){
        var elm=this;
        _this.openModal({
            title:"Confirmação - Limpar Job",
            msg:"Tem certeza que gostaria de limpar o Job desta página?",
            buttons:{
                primary:{ text:"Confirmar", action:function(){_this.clearJobEdit(elm,e)}},
                secondary:{text:"Cancelar",  action:"fn_closeModal" }
            }
        });
    });

    this.ui.querySelector("#saveJobEdit").addEventListener("click",function(e){
        var elm=this;
        var opt= {
            title:"Proibido!!",
            msg:"Você não pode salvar um Job Vazio"
        };
        var choicesBtn = _this.ui.querySelectorAll("#choices .html-name");
        for(var i=0;i<choicesBtn.length;i++){
            if((choicesBtn[i].innerText!=null)&&(choicesBtn[i].innerText!=="")){
                opt= {
                    title:"Confirmação - Salvar Job",
                    msg:"Tem certeza que gostaria de Salvar este Job para esta página? Qualquer alteração já existente será substituida.",
                    buttons:{
                        primary:{ text:"Confirmar", action:function(){_this.saveJobEdit(elm,e)}},
                        secondary:{text:"Cancelar",  action:"fn_closeModal" }
                    }
                };
                break;
            }
        }

        _this.openModal(opt);
    });

    this.ui.querySelector(".section.excluir form").addEventListener("submit",function(e){
        e.preventDefault();
        e.stopPropagation();
        var opt= {
            title:"Confirmação - Excluir JobModel",
            msg:"Esta ação irá excluir qualquer arquivo referente a este JobModel e desvinculará todas as páginas que usam esse JobModel como Job. Deseja continuar mesmo assim?",
            buttons:{
                primary:{ text:"Confirmar", action:function(){_this.deleteJobModel()}},
                secondary:{text:"Cancelar",  action:"fn_closeModal" }
            }
        };
        _this.openModal(opt);
        return false;
    });

    _this.mountJobsName();
};

//Exibe mensagens rápidas de texto. ("toast");
SSLRelUI.prototype["msgBox"]=function(msg,type,timeup){
    var msgboxitem = document.createElement("div");
    msgboxitem.classList.add("msgWrapper");
    if(type){
        msgboxitem.classList.add("msg"+type);
    }
    msgboxitem.innerHTML=msg;
    this.ui.appendChild(msgboxitem);

    setTimeout(function(){
        msgboxitem.classList.add("opened");
        setTimeout(function(){
            msgboxitem.classList.remove("opened");
            setTimeout(function () {
                msgboxitem.remove();
            },500);
        },timeup);
    },300);

};

//Exibe Modal (alerta) com avisos e opções
SSLRelUI.prototype["openModal"]=function(options){
    var Fn={};
    Fn["fn_closeModal"]=function(){
        modal.style.display="";
    };
    var modal=this.ui.querySelector("#sslModalWrapper");
    var footer = modal.querySelector("footer");
    if(options.buttons){
        footer.style.display="flex";
        if(options.buttons.primary){
            var btnprimary = footer.querySelector(".btn-primary");
            if(typeof  options.buttons.primary.action === "function"){
                btnprimary.onclick = function(){
                    options.buttons.primary.action();
                    Fn.fn_closeModal();
                };
            }
            else {
                btnprimary.onclick = Fn[options.buttons.primary.action];
            }
            btnprimary.value=options.buttons.primary.text;
        }
        if(options.buttons.secondary){
            var btnsecondary = footer.querySelector(".btn-secondary");
            if(typeof  options.buttons.secondary.action === "function") {
                btnsecondary.onclick = function(){
                    options.buttons.secondary.action();
                    Fn.fn_closeModal();
                };
            }
            else {
                btnsecondary.onclick = Fn[options.buttons.secondary.action];
            }
            btnsecondary.value=options.buttons.secondary.text;
        }
    }else{
        footer.style.display="";
    }
    modal.querySelector(".titleModal").innerHTML=options.title;
    modal.querySelector("section").innerHTML=options.msg;
    modal.style.display="flex";
    modal.querySelector(".closeBtn").onclick = function(){Fn.fn_closeModal()};
};


//Exibe e deixa disponível para o admin todos os inputs ocultos que são importantes para gerar relatório
SSLRelUI.prototype["showHiddenInputs"]= function (){
    var _this=this;
    var form = this.parent.frameContent.document.querySelector("#formcadastro");
    var formTBody = form.querySelector(".tablecadastro tbody");
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    tr.appendChild(td);
    td.setAttribute("colspan","2");
    td.setAttribute("SSLhiddenElements","");
    td.setAttribute("height","20");
    var ref = formTBody.querySelector("tr:nth-child(3)");
    formTBody.insertBefore(tr,ref);
    this.parent.frameContent.document.querySelectorAll("[data-for]").forEach(function (elm,index) {
        var replacer = document.createElement("button");
        var elmFor = form.querySelector("[name="+elm.getAttribute("data-for")+"]");
        var labelFor = elmFor.parentElement.parentElement.parentElement.querySelector("td:first-child span:first-child");
        var elmName = elm.getAttribute("name");

        replacer.setAttribute("type","button");
        replacer.setAttribute("name",elmName);
        replacer.innerText = elmName+"(referente à "+(labelFor?labelFor.innerText:"")+")";
        td.appendChild(replacer);
        replacer.addEventListener("click",function () {
            _this.matchFields(replacer);
        })
    });
};
//Oculta todos os inputs disponibilizados pela Função showHiddenInputs;
SSLRelUI.prototype["hideHiddenInputs"]= function (){
    var tr = this.parent.frameContent.document.querySelector("[SSLhiddenElements]").parentElement;
    tr.remove();
};

//Abre ou fecha UI quando os botões de menu são clicados
SSLRelUI.prototype["openMenu"]=function(_this){
    var body = _this.parent.frameContent.document.body;
    body = $(body);
    body.toggleClass("SSLRelUIopen");
    if(!body.hasClass("SSLRelUIopen")){
        _this.matchReset();
        _this.hideHiddenInputs();
    }else{
        _this.showHiddenInputs();
    }
};

//Seleciona qual Seção (criação, edição ou exclusão) será aberta;
SSLRelUI.prototype["selectSection"]=function(elm,evt){
    var section = this.ui.querySelector("."+elm.getAttribute("data-section"));

    this.ui.querySelectorAll(".section[selected=true], .nav a[selected=true]").forEach(function(elm){
        elm.setAttribute("selected","false");
    });

    elm.setAttribute("selected","true");
    section.setAttribute("selected","true");
};

//Cria Botão de Escolha de Campo;
SSLRelUI.prototype["createChoice"]=function(values){
    var choice = this.ui.querySelector("[data-model=buttonchoice]").cloneNode(true);
    choice.removeAttribute("data-model");
    var _this=this;
    var choicebtn = choice.getElementsByTagName("a")[0];
    var javaname = choicebtn.getElementsByClassName("java-name")[0];
    var htmlname = choicebtn.getElementsByClassName("html-name")[0];
    javaname.innerHTML = values.javaName;
    htmlname.innerHTML = values.htmlName;
    htmlname.setAttribute("data-value",values.htmlName);
    choicebtn.setAttribute("data-color",values.color);
    choicebtn.addEventListener("click",function(){
        _this.matchFields(this);
    });
    return choice;
};




//Pega nome dos jobs no java e cria o seletor dos Jobs
SSLRelUI.prototype["mountJobsName"]=function(){
    var  _this=this;
    var data={action:"getJobs"};

    this.parent.javax("config",data,function(values){
        var job = _this.ui.querySelector("#jobNameEdit");
        var job2 = _this.ui.querySelector("#jobNameExcluir");
        while (job.firstChild) {
            job.removeChild(job.firstChild);
        }
        while (job2.firstChild) {
            job2.removeChild(job2.firstChild);
        }
        var jobsNames = values.jobs;
        if(jobsNames.length>0){
            for(var i=0;i<jobsNames.length;i++){
                var opt = document.createElement("option");
                var opt2 = document.createElement("option");
                opt.setAttribute("value",jobsNames[i]);
                opt2.setAttribute("value",jobsNames[i]);
                if(jobsNames[i]===values.selected){
                    opt.setAttribute("data-chosen","true");
                    opt.innerHTML="✸ "+jobsNames[i];
                }else{
                    opt.setAttribute("data-chosen","false");
                    opt.innerHTML=jobsNames[i];
                }
                opt2.innerHTML=jobsNames[i];
                job.appendChild(opt);
                job2.appendChild(opt2);
            }
            if(values.selected)job.value = job2.value = values.selected;
            _this.mountSectionEditar(job);
            _this.ui.setAttribute("data-content","");
        }else{
            _this.ui.setAttribute("data-content","nocontent");
            var menusectionselected = _this.ui.querySelector("[data-section][selected=true]");
            var sectionselected = _this.ui.querySelector(".section[selected=true]");
            menusectionselected.removeAttribute("selected");
            sectionselected.removeAttribute("selected");
            var menucriar = _this.ui.querySelector("[data-section=criar]");
            var sectioncriar = _this.ui.querySelector(".section.criar");
            menucriar.setAttribute("selected","true");
            sectioncriar.setAttribute("selected","true");
        }
    })
};

//Monta os botões do job Selecionado
SSLRelUI.prototype["mountSectionEditar"]=function(job){
    var  _this=this;
    var jobVal = job.value;
    var choiceContainer = this.ui.querySelector("#choices");
    var data={action:"getJob",job:jobVal};
    this.parent.javax("config",data,function(values){

        if(values.msg==undefined){
            _this.matchReset();
            var color=0;
            var sizeVal = Object.keys(values).length;
            var colorInterval = Math.floor(360/sizeVal);
            choiceContainer.innerHTML="";
            for(var i in values){
                if(values.hasOwnProperty(i)){
                    var elm = _this.createChoice({htmlName:values[i],javaName:i,color:color});
                    color+=colorInterval;
                    choiceContainer.appendChild(elm);
                }
            }
        }else{
            choiceContainer.innerHTML="";
        }
    });
};

//Reseta todas as escolhas de relacionamentos de inputs nos botões
SSLRelUI.prototype["matchReset"]=function(){
  this.formElements.forEach(function(elm){
      if(elm.vinculo!==undefined){
          elm.vinculo.style.backgroundColor="";
          elm.vinculo.vinculo=undefined;
          elm.vinculo=undefined;
      }
      elm.style.backgroundColor="";
  });
  var choices = this.ui.querySelector("#choices")
    var buttonElements =choices.getElementsByClassName("btn");
    for(var i in buttonElements){
        if(buttonElements.hasOwnProperty(i)){
            var elm =buttonElements[i];
            if(elm.vinculo!==undefined){
                elm.vinculo.style.backgroundColor="";
                elm.vinculo.vinculo=undefined;
                elm.vinculo=undefined;
            }
            var htmlBT = elm.getElementsByClassName("html-name")[0];
            htmlBT.innerHTML=(htmlBT.getAttribute("data-value")?htmlBT.getAttribute("data-value"):"");
            elm.style.backgroundColor="";
            elm.style.color="";
        }
    }

  if(this.tempMatch)this.tempMatch.elm = undefined;
};

//Cria relacionamento do input escolhido com botão escolhido
SSLRelUI.prototype["matchFields"]=function(elm){
    var body = this.parent.frameContent.document.body;
    body = $(body);
    if(body.hasClass("SSLRelUIopen")){
        _this=this;
        var getElms = function(elm1,elm2){
            if(elm1.getAttribute("data-match")!=undefined){//elm1 é botão
                if(elm2.getAttribute("data-match")==undefined){//elm2 é input do form
                    return {button:elm1,form:elm2}
                }
            }
            if(elm1.getAttribute("data-match")==undefined){//elm1 é input do form
                if(elm2.getAttribute("data-match")!=undefined){//elm2 é botão
                    return {button:elm2,form:elm1}
                }
            }
            return false;
        };

        var color= (elm.getAttribute("data-color"));

        if(color&&(elm.vinculo==undefined)&&(this.tempMatch.elm==undefined)){//Se elemento clicado nao tem vinculo e tempMatch esta vazio;
            this.tempMatch.elm=elm;
            this.tempMatch.elm.style.backgroundColor="hsl("+(color)+",100%,80%)";
            if(this.tempMatch.elm.getAttribute("data-match")!=undefined){
                this.tempMatch.elm.style.color="hsl("+(color)+",100%,20%)";
            }
        }else{//Se tempmatch não esta vazio ou se elemento clicado tem algum outro vinculado;
            if((this.tempMatch.elm!==undefined) && getElms(this.tempMatch.elm,elm)){ //se elemento clicado é de um tipo diferente do tempMath(Os tipos são Botão ou formElement);

                var elms = getElms(this.tempMatch.elm,elm);
                if((elms.button.vinculo===undefined)&&(elms.form.vinculo===undefined)){//Se os dois tipos não tem vinculo, cria vinculo
                    elms.button.vinculo=elms.form;
                    elms.form.vinculo=elms.button;
                    elms.button.getElementsByClassName("html-name")[0].innerHTML=elms.form.name;
                    elm.style.backgroundColor = "hsl("+this.tempMatch.elm.getAttribute("data-color")+",100%,80%)";
                    this.tempMatch.elm=undefined;
                }
            }else if(elm && (elm.vinculo) && (elm.vinculo.vinculo===elm)){//Se o elemento clicado ja tiver vinculo ele desfaz o vinculo
                var elms = getElms(elm,elm.vinculo);
                elms.button.style.backgroundColor="";
                elms.button.style.color="";
                elms.form.style.backgroundColor="";
                var htmlBT = elms.button.getElementsByClassName("html-name")[0];
                htmlBT.innerHTML=(htmlBT.getAttribute("data-value")?htmlBT.getAttribute("data-value"):"");
                elms.form.vinculo=undefined;
                elms.button.vinculo=undefined;
            }else if(elm===this.tempMatch.elm){//Se o elemento clicado for o mesmo de tempMatch, significa que ele não foi usado e o usuario está desistindo de fazer a operação;
                elm.style.backgroundColor="";
                elm.vinculo=undefined;
                if(elm.getAttribute("data-match")!==undefined){//Se ele for Botão
                    elm.style.color="";
                    var htmlBT = elm.getElementsByClassName("html-name")[0];
                    htmlBT.innerHTML=(htmlBT.getAttribute("data-value")?htmlBT.getAttribute("data-value"):"");
                }
                this.tempMatch.elm=undefined;
            }
        }
    }
};

//Salva alterações do job no java
SSLRelUI.prototype["saveJobEdit"]=function(elm,e){
    var _this=this;
    var form = elm.parentElement.parentElement;
    var nameJob = form.querySelector("#jobNameEdit").value;
    var choices = form.querySelectorAll(".btn-choice");
    var relations = {};
    for(var choice in choices){
        if(choices.hasOwnProperty(choice)){
            relations[choices[choice].querySelector(".java-name").innerHTML] = choices[choice].querySelector(".html-name").innerHTML;
        }   
    }
    this.parent.javax("config",{action:"saveJob",params:JSON.stringify(relations),job:nameJob},function(values){
        _this.matchReset();
        for(var choice in choices){
            if(choices.hasOwnProperty(choice)){
                var btnChoice =choices[choice].querySelector(".html-name");
                btnChoice.setAttribute("data-value",btnChoice.innerHTML);
            }
        }
        _this.mountJobsName();
    });
};


//Desvincula job no java;
SSLRelUI.prototype["clearJobEdit"]=function(elm, e){
    var form = elm.parentElement.parentElement;
    var selectJob = form.querySelector("#jobNameEdit");
    var opt = selectJob.querySelector("[data-chosen=true]");
    if(opt!=null){
        var _this=this;
        this.parent.javax("config",{action:"clearJob"},function (values) {
            opt.innerHTML=opt.value;
            _this.mountSectionEditar(selectJob);
        });
    }else{
        sslToast("nada a fazer",null,1500);
    }
};

//Faz upload de Arquivos de JobModel

SSLRelUI.prototype["uploadJobModel"]=function(e,data){
    var jobnameField = this.ui.querySelector("#JobNameCreate").parentElement;
    var _this=this;
    if(data===undefined){data = new FormData(e.target);}

    if((data.get("jobModelName")!==null)&&(data.get("jobModelName")!=="")) {
        data.append("action", "uploadJob");
        var opt = {contentType: false, processData: false, formData: true};
        this.parent.javax("config", data, function (values) {
            if (values.action === "replace") {
                _this.openModal({
                    title: "JobModel Existente",
                    msg: "O JobModel "+data.get("jobModelName")+" já existe. Deseja substituir seu conteúdo?",
                    buttons: {
                        primary: {
                            text: "Sim", action: function () {
                                data.append("replaceJob", "true");
                                data.delete("_token");
                                data.delete("_urlaction");
                                _this.uploadJobModel(e, data);
                            }
                        },
                        secondary: {text: "Não", action: "fn_closeModal"}
                    }
                });
            } else {
                _this.mountJobsName();
            }
        }, undefined, opt);
        jobnameField.classList.remove("error");
    }else{
        jobnameField.classList.add("error");
        sslToast("O nome do JobModel tem que ser preenchido","error",2000);
    }
};


//Apaga arquivos do jobmodel e desvincula todas as páginas.
SSLRelUI.prototype["deleteJobModel"]=function(){
    var _this=this;
    var selectJob = this.ui.querySelector("#jobNameExcluir");
    this.parent.javax("config",{action:"deleteJob",jobModel:selectJob.value},function (values) {
        _this.mountJobsName();
    });
};


//Carrega classe Principal na variável "ssl" quando a página é carregada;
window.onload=function(){
  ssl = new SSLRel();
  ssl.init();
};
