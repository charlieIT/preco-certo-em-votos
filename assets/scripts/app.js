
var info = {2005:{},2009:{},2011:{},2015:{}};

$.ajax({
  type: "GET",
  url: "https://raw.githubusercontent.com/centraldedados/resultados_eleicoes_simples/master/data/dados_deputados.csv",
  dataType: "text",
  success: function(data) {
    // primeiro colocamos os deputados (só nos interessam os que partidos que tiveram deputados)
    addDeputados(data);
    console.log(info);
    $.ajax({
      type: "GET",
      url: "https://raw.githubusercontent.com/charlieIT/eleicoes-legislativas_orcamentos/master/data/eleicoes-legislativas_orcamentos.csv",
      dataType: "text",
      success: function(data) {
        addOrcamento(data);
        // now that we have the information all settled down lets add to html
        addInfoToHTML();
      }
    });
  }
});

function numberSeparator(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

var addOrcamento = function(orcamentos){
  var csv = orcamentos.split("\n");
  for(i in csv){
    if(i == 0){
      continue;
    }
    var campos = csv[i].split(",");
    var ano = campos[0];
    var partido = campos[1];
    if(partido && partido in info[ano]){
      var total_orcamento_receitas = campos[4];
      var total_real_receitas = campos[2];
      var total_real_despesas = campos[3];
      info[ano][partido]["total_orcamento_receitas"] = Math.round(total_orcamento_receitas);info[ano][partido]["total_orcamento_receitas"] = Math.round(total_orcamento_receitas);
      info[ano][partido]["total_real_receitas"] = Math.round(total_real_receitas);
      info[ano][partido]["total_real_despesas"] = Math.round(total_real_despesas);
    }
    //data[partido] = {"total_receitas": Math.round(total_receitas)};
  }
};

var addDeputados = function(deputados){
  var csv = deputados.split("\n");
  for(i in csv){
    if(i == 0){
      continue;
    }
    var campos = csv[i].split(",");
    var ano = campos[0];
    var partido = campos[1];
    if(partido){
      var num_deputados = campos[2];
      info[ano][partido] = {"num_deputados": Math.round(num_deputados)};
    }
  }
};

var addInfoToHTML = function(){
  // first lets score the maximum cash per deputado over every year and use that as a baseline
  var maximumRadius = 300; //in pixels
  var maximumCashPerDeputado = 0;
  for(anoName in info){
    var anoValue = info[anoName];
    for(partidoName in anoValue){
      var partidoValue = anoValue[partidoName];
      var pricePerDeputado = partidoValue["total_real_despesas"]/partidoValue["num_deputados"];
      if(pricePerDeputado > maximumCashPerDeputado){
        maximumCashPerDeputado = pricePerDeputado;
      }
    }
  }

  // lets draw!
  var keys = Object.keys(info);
  var anosSorted = keys.sort().reverse();
  for(i in anosSorted){
    var anoName = anosSorted[i];
    var anoValue = info[anoName];
    var subtitle = "";
    if (anoName == "2015") {
      subtitle = " * previsão";  
    }
      $("#main").append(
        "<div class='ano " + anoName + "'><h1 style='text-align: left;'><strong>" + anoName + "</strong><sub>"+ subtitle +"</sub></h1>"
        + "<div class='info'></div>"
        + "</div>"
        + "<hr/>"
      );
    /*$("."+anoName+" .info").append(
      "<hr>"
    );*/

    var sortingF = function getSortedKeys(obj) {
      var keys = []; for(var key in obj) keys.push(key);
      return keys.sort(function(a,b){return obj[b]["num_deputados"]-obj[a]["num_deputados"]});
    }

    var partidosSorted = sortingF(anoValue);
    console.log(partidosSorted);
    for(i in partidosSorted){
      var partidoName = partidosSorted[i];
      var partidoValue = anoValue[partidoName];
      if(anoName!="2015"){
        receitas = partidoValue["total_real_despesas"];
      }
      else{
        receitas = partidoValue["total_orcamento_receitas"];
      }
      var pricePerDeputado = Math.round(receitas/partidoValue["num_deputados"]);
      var partidoHeight = Math.sqrt(pricePerDeputado/maximumCashPerDeputado*Math.pow(maximumRadius,2));
      var partidoWidth = partidoHeight;
      pricePerDeputado = parseInt( pricePerDeputado ).toLocaleString('de-DE');
      var treatedPartidoName = partidoName.replace("/","").replace("-","");

      $("."+anoName+" .info").append(
        "<div class='partido '>"
        + "<div>"
        //+ "<div style='height:"+partidoHeight+"px; width:"+partidoWidth+"px;' class='ball " + treatedPartidoName + "'>"
        + "<div style='height:"+partidoHeight+"px; width:"+partidoWidth+"px;' class='ball " + treatedPartidoName + "'>"
        + "<span><small class='euro'>€</small>" + numberSeparator(Number(pricePerDeputado)) + "<small> por deputado</small></span></div>"
        + "</div>"        
        + "<div class='header'><h3><span class='" + treatedPartidoName + "'></span>" + partidoName + "</h3>" + "<p>" + partidoValue["num_deputados"] + " deputados eleitos" + "</p>"
        //+ "</br>" + parseInt( partidoValue["total_receitas"] ).toLocaleString() + " €"
        + "</div>"
        + "</div>"
      );
    }
  }
  $("body").removeClass("hidden");
};



