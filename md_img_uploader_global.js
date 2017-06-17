

var pluginPath = objApp.GetPluginPathByScriptFileName("md_img_uploader_global.js");

var successCallBack = function(result){
	WizAlert(result);
};
var errorCallBack = function(result){
	WizAlert(result.responseText);
}


function onMdImgUploadButtonClicked() {
	var objWizDocument = objWindow.CurrentDocument;
	
	if (!objWindow.IsDocumentEditing(objWizDocument.GUID)) {
		WizAlert("请在编辑状态下使用本功能");
		return;
	}
	
	//var objHtmlDocument = objWindow.CurrentDocumentHtmlDocument;
	var objBrowser = objWindow.CurrentDocumentBrowserObject;
	if (!objBrowser) {
		WizAlert("获取当前Browser句柄失败");
		return;
	}
	


	scriptFile = pluginPath + "get_img_src.js"
	objBrowser.ExecuteScriptFile(scriptFile, function (text) {
		var srcs = JSON.parse(text);
		var cos = new CosCloud("10049763");
		for (var i =0 ; i<srcs.length; i++) {
			var src = srcs[i];
			WizAlert(src);
			
			var xhr = new XMLHttpRequest();    
			xhr.open("get", src, true);
			xhr.responseType = "blob";
			xhr.onload = function() {
				// if local requets, status will be 0
				if (this.status == 200 || this.status==0) {
					var blob = this.response;  // this.response也就是请求的返回就是Blob对象
					cos.uploadFile(successCallBack, errorCallBack, "blog", "/wiznote/"+ src, blob);
				}
			}
			xhr.send();	
		}
	});
	
}


function dataUrlToBlob(dataUrl) {
    // data:image/jpeg;base64,xxxxxx
    var datas = dataUrl.split(',', 2);
    var blob = binaryToBlob(atob(datas[1]));
    blob.fileType = datas[0].split(';')[0].split(':')[1];
    blob.name = blob.fileName = 'pic.' + blob.fileType.split('/')[1];
    return blob;
};

function onDocumentBeforeEdit(objHtmlDocument, objWizDocument) {

    if (!objHtmlDocument)
        return;
    WizAlert("before edit");
	/*
    eventsHtmlDocumentComplete.add(function(doc){
        doc.addEventListener("paste", function(e){
			WizAlert("888");
		});	
    });
	var a= 1/0; */
	//objWindow.AddToolButton("document", "mdImgUploadButton", "img upload", "", "onMdImgUploadButtonClicked");
	
	//SetToolButtonState("document","mdImgUploadButton", "checked");
};


function onHtmlDocumentComplete(objHtmlDocument) {

	if (!objHtmlDocument)
		return;
	
	
    WizAlert("complete");
	/*
	objHtmlDocument.body.addEventListener("paste", function(e){
		WizAlert("888");
	});
	*/
	//objWindow.RemoveToolButton("document", "mdImgUploadButton");
	//SetToolButtonState("document","mdImgUploadButton", "disabled");
}


/*
if (eventsDocumentBeforeEdit) {
	eventsDocumentBeforeEdit.add(onDocumentBeforeEdit);
}


if (eventsHtmlDocumentComplete) {
	eventsHtmlDocumentComplete.add(onHtmlDocumentComplete);
}



if (eventsTabCreate) {
	eventsTabCreate.add(onHtmlDocumentComplete);
}
*/

function InitMdImgUploadButton() {
	WizAlert("InitMdImgUploadButton");
    objWindow.AddToolButton("document", "mdImgUploadButton", "img upload", "", "onMdImgUploadButtonClicked");
	objApp.AddGlobalScript(pluginPath + "lib/cos/jquery1x.min.js");
	//objApp.RunScriptFile(objApp.CurPluginAppPath + "lib/cos/jquery1x.min.js", "javascript");
}

InitMdImgUploadButton();


function insertElem(doc, part, elem_type, callbackfunc) {
	var oPart = doc.getElementsByTagName(part).item(0);
	var oElem = doc.createElement(elem_type);
	callbackfunc(oElem);
	oPart.insertBefore(oElem, null);
	return oElem;
}

function appendScriptSrc(doc, part, script_type, str) {
	return insertElem(doc, part, "script", function(oScript) {
		oScript.type = script_type;
		//oScript.src = ("" + str).replace(/\\/g, '/');
		oScript.src = str;
		}
	);
}



function CosCloud(appid, signUrl){
	this.appid = appid;
	this.sign_url = "http://txcdb.org/Sign.php";
}

CosCloud.prototype.cosapi_cgi_url = "http://web.file.myqcloud.com/files/v1/";
CosCloud.prototype.slice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
CosCloud.prototype.sliceSize = 3 * 1024 * 1024;
CosCloud.prototype.getExpired = function(second){
	return Date.parse(new Date()) / 1000 + (second || 60);
}


CosCloud.prototype.getAppSign = function(success, error, bucketName){
	var expired = this.getExpired();
	var url = this.sign_url + "?sign_type=appSign&expired=" + expired + "&bucketName=" + bucketName;
	$.ajax({
		url : url,
		type : "GET",
		success : success,
		error : error
	});
}

CosCloud.prototype.getAppSignOnce = function(success, error, path, bucketName){
	var url = this.sign_url + "?sign_type=appSign_once&path=" + encodeURIComponent(path) + "&bucketName=" + bucketName;	
	$.ajax({
		url : url,
		type : "GET",
		success : success,
		error : error
	});
}

CosCloud.prototype.updateFolder = function(success, error, bucketName, remotePath, bizAttribute){
	this.updateFile(success, error, bucketName, remotePath, bizAttribute);
}

CosCloud.prototype.updateFile = function(success, error, bucketName, remotePath, bizAttribute){
	var that = this;
	this.getAppSignOnce(function(json){		
		var jsonResult = $.parseJSON(json);
		var sign = jsonResult.data.sign;
		var url = that.cosapi_cgi_url + that.appid + "/" + bucketName + encodeURI(remotePath) + "?sign=" + encodeURIComponent(sign);
		var formData = new FormData();
		formData.append('op', 'update');
		formData.append('biz_attr', bizAttribute);
		$.ajax({
            type : 'POST',
            url : url,
            data : formData,
            processData : false, 
            contentType : false,
            success : success,
            error : error
		});
	}, error, remotePath, bucketName);
}

CosCloud.prototype.deleteFolder = function(success, error, bucketName, remotePath){
	this.deleteFile(success, error, bucketName, remotePath);
}

CosCloud.prototype.deleteFile = function(success, error, bucketName, remotePath){
	if(remotePath == "/"){
		error({"responseText" : '{"code":10003,"message":"不能删除Bucket"}'});
		return;
	}
	var that = this;
	this.getAppSignOnce(function(json){
		var jsonResult = $.parseJSON(json);
		var sign = jsonResult.data.sign;
		var url = that.cosapi_cgi_url + that.appid + "/" + bucketName + encodeURI(remotePath) + "?sign=" + encodeURIComponent(sign);
		var formData = new FormData();
		formData.append('op', 'delete');
		$.ajax({
            type : 'POST',
            url : url,
            data : formData,
            processData : false, 
            contentType : false,
            success : success,
            error : error
		});
	}, error, remotePath, bucketName);
}

CosCloud.prototype.getFolderStat = function(success, error, bucketName, remotePath){
	this.getFileStat(success, error, bucketName, remotePath);
}

CosCloud.prototype.getFileStat = function(success, error, bucketName, remotePath){
	var that = this;
	this.getAppSign(function(json){
		var jsonResult = $.parseJSON(json);
		var sign = jsonResult.data.sign;
		var url = that.cosapi_cgi_url + that.appid + "/" + bucketName + encodeURI(remotePath);
		var data = {
			op : "stat",
			sign : sign
		};
		$.ajax({
			url : url,
			type : "GET",
			data : data,
			success : success,
			error : error
		});
	}, error, bucketName);

}

CosCloud.prototype.createFolder = function(success, error, bucketName, remotePath){
	var that = this;
	this.getAppSign(function(json){
		var jsonResult = $.parseJSON(json);
		var sign = jsonResult.data.sign;
		var url = that.cosapi_cgi_url + that.appid + "/" + bucketName + encodeURI(remotePath) + "?sign=" + encodeURIComponent(sign);
		var formData = new FormData();
		formData.append('op', 'create');
		$.ajax({
            type : 'POST',
            url : url,
            data : formData,
            processData : false, 
            contentType : false,
            success : success,
            error : error
		});
	}, error, bucketName);
}

CosCloud.prototype.getFolderList = function(success, error, bucketName, remotePath, num, context, order, pattern, prefix){
	var that = this;
	this.getAppSign(function(json){
		var jsonResult = $.parseJSON(json);
		var sign = jsonResult.data.sign;
		var url = that.cosapi_cgi_url + that.appid + "/" + bucketName + encodeURI(remotePath) + (prefix ? encodeURIComponent(prefix) : "");
		var data = {
			op : "list",
			num : num,
			context : context,
			order : order,
			pattern : pattern || "eListBoth",
			sign : sign
		};
		$.ajax({
			url : url,
			type : "GET",
			data : data,
			success : success,
			error : error
		});
	}, error, bucketName);
}

CosCloud.prototype.uploadFile = function(success, error, bucketName, remotePath, file){
	var that = this;
	this.getAppSign(function(json){
		var jsonResult = $.parseJSON(json);
		var sign = jsonResult.data.sign;
		var url = that.cosapi_cgi_url + that.appid + "/" + bucketName + encodeURI(remotePath) + "?sign=" + encodeURIComponent(sign);
		var formData = new FormData();
		formData.append('op', 'upload');
		formData.append('fileContent', file);
		$.ajax({
            type : 'POST',
            url : url,
            data : formData,
            processData : false, 
            contentType : false,
            success : success,
            error : error
		});
	}, error, bucketName);
}

CosCloud.prototype.sliceUploadFile = function(success, error, bucketName, remotePath, file){
	var that = this;
	var reader = new FileReader();
	blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
	reader.onload = function(e){
        if(e.target.result != null) {
            g_totalSize += e.target.result.length;
            if (e.target.result.length != 0) {
                Qh.ftn_sign_update_dataurl(e.target.result);
            }
        }
        g_currentChunk += 1;
        if (g_currentChunk <= g_chunks ) {
            if (g_iDelayReadData > 0) clearTimeout(g_iDelayReadData);
            if (g_LoadFileDelayTime > 0){
                g_iDelayReadData = setTimeout(nextSlice, g_LoadFileDelayTime);
            }else{
                g_iDelayReadData = 0;
                nextSlice();
            }
        }
        else {
            g_running = false;
            var sha1 = Qh.ftn_sha1_result();
            console.log("sha1=%s", sha1);
            //getSession
            that.getAppSign(function(json){
            	var jsonResult = $.parseJSON(json);
				var sign = jsonResult.data.sign;
            	var session = '';
            	var sliceSize = 0;
            	var offset = 0;

				var url = that.cosapi_cgi_url + that.appid + "/" + bucketName + encodeURI(remotePath) + "?sign=" + encodeURIComponent(sign);
				var formData = new FormData();
				formData.append('op', 'upload_slice');
				formData.append('sha', sha1);
				formData.append('filesize', file.size);
				formData.append("slice_size", that.sliceSize);
				var getSessionSuccess = function(result){
					var jsonResult = $.parseJSON(result);
					if(jsonResult.data.access_url){
						success(result);
						return;
					}
					session = jsonResult.data.session;
					sliceSize = jsonResult.data.slice_size;
					offset = jsonResult.data.offset
					sliceUpload();
				};
				var sliceUpload = function(){
					that.getAppSign(function(json){
						var jsonResult = $.parseJSON(json);
						var sign = jsonResult.data.sign;
						var url = that.cosapi_cgi_url + that.appid + "/" + bucketName + encodeURI(remotePath);// + "?sign=" + encodeURIComponent(sign);
						var formData = new FormData();
						formData.append('op', 'upload_slice');
						formData.append('session', session);
						formData.append('offset', offset);
						formData.append('fileContent', that.slice.call(file, offset, offset + sliceSize));
						$.ajax({
				            type : 'POST',
				            url : url,
				            data : formData,
				            processData : false, 
				            contentType : false,
				            success : sliceUploadSuccess,
				            error : error
						});
					}, error, bucketName);
				};
				var sliceUploadSuccess = function(result){
					console.log(result);
					var jsonResult = $.parseJSON(result);
					if(jsonResult.data.offset != undefined){
						offset = jsonResult.data.offset + sliceSize;
						sliceUpload();
					}
					else{
						success(result);
						return;
					}
				};
				$.ajax({
		            type : 'POST',
		            url : url,
		            data : formData,
		            processData : false, 
		            contentType : false,
		            success : getSessionSuccess,
		            error : error
				});
			}, error, bucketName);
        }
	};
	reader.onerror = error;
	var Qh = swfobject.getObjectById("qs");
    var g_LoadFileBlockSize = 2 * 1024 * 1024;
    var g_LoadFileDelayTime = 0;
    var g_chunkId = null;
    var g_totalSize = 0;
    var g_uniqueId = "chunk_" + (new Date().getTime());
    var g_chunks = Math.ceil(file.size / g_LoadFileBlockSize);
    var g_currentChunk = 0;
    var g_running = true;
    var g_startTime = new Date().getTime();
    var g_iDelayReadData = 0;

  	var nextSlice = function(i, sliceCount){
	    var start = 0;
	    var end = 0;
	    start = g_currentChunk * g_LoadFileBlockSize;
	    if(file != null) {
	        end = ((start + g_LoadFileBlockSize) >= file.size) ? file.size : start + g_LoadFileBlockSize;
	        reader.readAsDataURL(that.slice.call(file, start, end));
	    }
    };
    nextSlice();
}
