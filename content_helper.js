

function urlToDataUrl(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';  //设定返回数据类型为Blob
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);    //FileReader读取后的回调
    }
    reader.readAsDataURL(xhr.response);   //xhr.response就是一个Blob，用FileReader读取
  };
  xhr.open('GET', url);
  xhr.send();
}

function getImgDataUrl(pluginBrowser) {	
	var imgs = document.body.getElementsByTagName("img");
	for (var i =0 ; i<imgs.length; i++) {
		let src = imgs[i].getAttribute("src").replace(/(^s*)|(s*$)/g, "");
		if (src.length ==0) {
			continue;
		}
		//src = document.URL + "/../" + src;
		urlToDataUrl(src, function(result){
			src = src.substr(src.lastIndexOf('/')+1);
			//document.execCommand("insertHtml", !1, '![alt]('+src+')');
			pluginBrowser.ExecuteFunction2("uploadFile", src, result, function (){});
		});

	}
}


function replaceImgTag(path, url) {
	var imgs = document.body.getElementsByTagName("img");
	for (var i =0 ; i<imgs.length; i++) {
		var src = imgs[i].getAttribute("src").replace(/(^s*)|(s*$)/g, "");
		if (src.length ==0) {
			continue;
		}
		src = src.substr(src.lastIndexOf('/')+1);
		if (src != path ) {
			continue;
		}
		var textNode=document.createTextNode('![alt]('+url+')');
		imgs[i].parentNode.replaceChild(textNode,imgs[i]);
    };

}




