const fs = require("fs");
const express = require("express");

let app = express();

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use("/node_modules", express.static("./node_modules"));
app.use("/css", express.static("./css"));
app.use("/js", express.static("./js"));
app.route("/system-production.js").get((request, response) => {
	fs.createReadStream("./system-production.js").pipe(response);
});
app.route("/dist.js").get((request, response) => {
	fs.createReadStream("./dist.js").pipe(response);
});
app.route("/dist.js.map").get((request, response) => {
	fs.createReadStream("./dist.js.map").pipe(response);
});
app.route("/").get((request, response) => {
	fs.createReadStream("./index.html").pipe(response);
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
