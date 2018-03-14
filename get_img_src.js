

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
  document.execCommand("insertHtml", !1, 'bbbb');
	//return imgs.length;
	for (var i =0 ; i<imgs.length; i++) {
		var src = imgs[i].getAttribute("src").replace(/(^s*)|(s*$)/g, "");
		 document.execCommand("insertHtml", !1, 'cccccc');
		if (src.length ==0) {
			continue;
		}
		//var src = document.URL + "/../" + src;
	
    urlToDataUrl(src, function(result){
      document.execCommand("insertHtml", !1, src);
      document.execCommand("insertHtml", !1, result);
      pluginBrowser.ExecuteFunction2("uploadFile", src, result, function (ret){});
    });

  }
}





/*
function _getDataUrl() {
	var selection = document.getSelection();

	if (null == selection)
        return null;
    if (selection.rangeCount == 0)
        return null;
	var range = selection.getRangeAt(0);
	if (null == range)
        return null;
	return range.toString();
}
_getDataUrl();
*/

/*
function _addPasteHook() {

var ret = [1,2]
//return JSON.stringify(ret);

			document.addEventListener("paste", function(e){
        e.preventDefault();
         document.execCommand("insertHtml", !1, 'cccccc');
         document.execCommand('insertHtml', !1, 'dddddd');

                e.preventDefault();
                var t = e.originalEvent || e,n = t.clipboardData.getData("text/plain");
//alert(t.clipboardData.items.length);
//WizAlert(t.clipboardData.items.length);
                for(var i, r = 0; r < t.clipboardData.items.length; r++) {
					i = t.clipboardData.items[r]; 
					//alert(i.type);
					if (i.type.match(/^image\//i)) {
						break;
					}
				}
				// 只上传第一个一个图片
                if(r != t.clipboardData.items.length) {
						//alert("yyy");
                        var blob = i.getAsFile();
                        var form = new FormData();
                        var name = Date.parse(new Date) + ".png";
                        form.append("async-upload", blob, name);  
                        var xhr = new XMLHttpRequest();
                        xhr.open("post",'http://txcdb.org/wp-admin/async-upload.php?action=upload-attachment' , true);
                        xhr.onload = function () {
                                if (xhr.readyState == 4){
                                        var d = JSON.parse(xhr.responseText);
                                        if (!d.success) console.log("upload file failed");
                                        document.execCommand("insertHtml", !1, d.data.url);
                                }
                        };
                        xhr.send(form);
                }
        },false);
        return JSON.stringify(ret);
        
}
_addPasteHook();
*/


