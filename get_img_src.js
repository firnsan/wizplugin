/*
function _getImgSrc() {	

	var srcs = [];
	var imgs = document.body.getElementsByTagName("img");
	//return imgs.length;
	for (var i =0 ; i<imgs.length; i++) {
		var src = imgs[i].getAttribute("src").replace(/(^s*)|(s*$)/g, "");
		
		if (src.length ==0) {
			continue;
		}
		src = document.URL + "/../" + src;
		srcs.push(src);
		//return src;
	}

	return JSON.stringify(srcs);
}


_getImgSrc();
*/

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


function _addPasteHook() {

			document.body.addEventListener("paste", function(e){
				
                e.preventDefault();
                var t = e.originalEvent || e,n = t.clipboardData.getData("text/plain");
alert(t.clipboardData.items.length);
                for(var i, r = 0; r < t.clipboardData.items.length; r++) {
					i = t.clipboardData.items[r]; 
					alert(i.type);
					if (i.type.match(/^image\//i)) {
						break;
					}
				}
				// 只上传第一个一个图片
                if(r != t.clipboardData.items.length) {
						alert("yyy");
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
        });
}
_addPasteHook();



