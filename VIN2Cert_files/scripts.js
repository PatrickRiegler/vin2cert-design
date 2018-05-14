// Empty JS for your own code to be here

var connection = new WebSocket('ws://'+WSURL+':'+WSPORT);
var hash = "";

connection.onopen = function () {
  
};

// Log errors
connection.onerror = function (error) {
  console.error('WebSocket Error ' + error);
};

$.fn.removeClassRegex = function(regex) {
  return $(this).removeClass(function(index, classes) {
    return classes.split(/\s+/).filter(function(c) {
      return regex.test(c);
    }).join(' ');
  });
};

$(document).ready(function () {
    $('.code-box-copy').codeBoxCopy();
});

function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// Log messages from the server
connection.onmessage = function (e) {
    //console.log('message from server: ', e.data);
    console.log(e.data);
    var json = JSON.parse(e.data);
    // console.log(json.id);
    // console.log(hash);
    if(json.id!=hash) return true;
    var rid=json.id+'-'+json.step+'-'+json.stepDetail;
    $(".template").clone().attr('id',rid).addClass('clone').insertBefore('.template');
    $(".clone").removeClass("template").removeClass("d-none");

    // update progress on statusbar
    if(json.step=="vindecode") $("#statusbar").animate({'width':'25%'},200).removeClassRegex(/^bg-/).addClass("bg-warning");
    //if(json.step=="vindecode") $("#statusbar").animate({'width':'100%'},200).removeClassRegex(/^bg-/).addClass("bg-success");

    //console.log($(".template"));
    //console.log($(".clone"));
    //console.log(rid);
    $("#"+rid).children('div').last().attr('id','ce'+rid);
    $("#"+rid).find('a').attr('href','#ce'+rid);
    $("#"+rid).find('.tbody div').each(function(i,v) {
      var val = "";
      switch(i) {
          case 0: val = json.step; break;
          case 1: val = json.stepDetail; break;
          case 2: val = json.result; break;
          case 3: val = Math.round(eval(json.responseTime*1000))+" ms"; break;
          default: val = "not found";
      }
      $(this).html(val); 
    });
    $("#"+rid).find('.result-left').html(syntaxHighlight(json));
    //$("#"+rid).find('.result-right').html('will show more details later');
    $("#"+rid).find('.result-right').html('<button class="code-box-copy__btn" data-clipboard-target="#'+json.id+'-right-json" title="Copy"></button><pre><code class="language-javascript" id="'+json.id+'-right-json">'+JSON.stringify(json, undefined, 2)+'</code></pre>');
};


function startVIN(vin) {
  $('#vin').val(vin);

  hash = md5(vin+Date.now());

  var vehObj = {};
  vehObj["id"] = hash;
  vehObj["vin"] = vin;

  var json = JSON.stringify(vehObj);

  //connection.send(json);

  callApi(vin,hash);
  
  $(".cdiv").removeClass("d-none");
  $(".cbox-right").removeClass("d-none");
  $(".cbox-right #crid").html("ID: "+hash);
  $(".cbox-right #crvin").html("VIN: "+vin);
  $(".clone").remove();
  $(".progress").removeClass("d-none");

  // clear everything

  // start to build the 
}

function callApi(vin,hash) {
    var url = APIURL+'?VIN='+vin+'&ID='+hash;
    // console.log(url);
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        // console.log(this.responseText);
        var response = JSON.parse(this.responseText);
        // console.log(response);
      }
    };
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();

}



