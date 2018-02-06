var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");

var types = {
	"css": "text/css",
	"gif": "image/gif",
	"html": "text/html",
	"ico": "image/x-icon",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"js": "text/javascript",
	"json": "application/json",
	"pdf": "application/pdf",
	"png": "image/png",
	"svg": "image/svg+xml",
	"swf": "application/x-shockwave-flash",
	"tiff": "image/tiff",
	"txt": "text/plain",
	"mp3": "audio/mp3",
	"wav": "audio/x-wav",
	"wma": "audio/x-ms-wma",
	"wmv": "video/x-ms-wmv",
	"xml": "text/xml"
};

var server = http.createServer(function (req, res) {
	var pathname = url.parse(req.url).pathname;
	if (pathname.length == 1) pathname += "index.html";

	pathname = decodeURI(pathname);

	var realPath = path.join("BlackLeo", pathname);
	var extname = path.extname(realPath);
	extname = extname ? extname.slice(1) : "no";

	fs.exists(realPath, function (exists) {
		if (!exists) {
			res.writeHead(404, {"Content-Type": "text/plain"});
			res.write("This request URL " + pathname + " was not found on this server");
			res.end();
			return;
		}

		fs.readFile(realPath, "binary", function (err, file) {
			if (err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.end(err);
				return;
			}

			var type = types[extname] || "text/plain";
			var options = {
				"Content-Type": type,
				"Accept-Ranges": "bytes",
				"Content-Length": file.length
			};
			res.writeHead(200, options);
			res.write(file, "binary");
			res.end();
		});
	});
});

server.listen(8080);
console.log("listening port " + 8080);

function WriteMusicList() {
	var dirPath = "./BlackLeo/music";
	if (!fs.existsSync(dirPath)) return;

	var state = fs.statSync(dirPath);
	if (!state.isDirectory()) return;

	var fileDataList = [];
	var files = fs.readdirSync(dirPath);
	files.forEach(function (file) {
		if (file.match(/\.mp3/)) fileDataList.push({src: file, title: (file.split("."))[0]});
	});

	var data = "function GetMusicList() {\n";
	data += "    var musicList = [\n";
	fileDataList.forEach(function (fileData) {
		data += "        " + JSON.stringify(fileData) + ",\n";
	});
	data += "    ];\n\n"
	data += "    return musicList;\n" + "}";
	
	var filePath = "./BlackLeo/js/musicList.js";
	fs.writeFileSync(filePath, data);
}

WriteMusicList();
var updateMusicInterval = setInterval(WriteMusicList, 60000);