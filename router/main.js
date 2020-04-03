module.exports = (app, fs) => {

	app.get('/', (req,res) => {
		let sess = req.session;

		res.render('index', {
			title: "Test Page",
			length: 5,
			name: sess.name,
			username: sess.username
		});
	}); // end app.get

	app.get('/list', function (req, res) {
		fs.readFile(__dirname + "/../data/" + "user.json", 'utf8', (err, data) => {
			console.log(data);
			res.end(data);
		});
	}); // end app.get

	app.get('/getUser/:username', (req, res) => {
		fs.readFile(__dirname + "/../data/user.json", 'utf8', (err, data) => {
			let users = JSON.parse(data);
			res.json(users[req.params.username]);
		});
	}); // end app.get

	app.get('/login/:username/:password', (req, res) => {
		let sess;
		sess = req.session;

		fs.readFile(__dirname + "/../data/user.json", "utf8", (err, data) => {
			let users = JSON.parse(data);
			let username = req.params.username;
			let password = req.params.password;
			let result = { };
			if (!users[username]) {
				// USERNAME NOT FOUND
				result["success"] = 0;
				result["error"] = "not found";
				res.json(result);
				return;
			}

			if (users[username]["password"] == password) {
				result["success"] = 1;
				sess.username = username;
				sess.name = users[username]["name"];
				res.json(result);
			} else {
				result["success"] = 0;
				result["error"] = "incorrect";
				res.json(result);
			}
		});
	}); // end app.get

	app.get('/logout', (req,res) => {
		sess = req.session;
		if(sess.username) {
			req.session.destroy((err) => {
				if (err)
					console.log(err);
				else
					res.redirect('/');
			})
		} else
			res.redirect('/');
	}); // end app.get

	app.post('/addUser/:username', (req, res) => {
		let result = { };
		let username = req.params.username;

		// CHECK REQ VALIDITY
		if(!req.body["password"] || !req.body["name"]) {
			result["success"] = 0;
			result["error"] = "invalid request";
			res.json(result);
			return;
		}

		// LOAD DATA & CHECK DUPLICATION
		fs.readFile(__dirname + "/../data/user.json", 'utf8', (err, data) => {
			let users = JSON.parse(data);
			if (users[username]) {
				// DUPLICATION FOUND
				result["success"] = 0;
				result["error"] = "duplicate";
				res.json(result);
				return;
			}
			// ADD TO DATA
			users[username] = req.body;

			// SAVE DATA
			fs.writeFile(__dirname + "/../data/user.json",
						JSON.stringify(users, null, '\t'), "utf8", (err, data) => {
				result = {"success": 1};
				res.json(result);
			})
		});
	}); // end app.post

	app.delete('/deleteUser/:username', (req, res) => {
		let result = { };
		// LOAD DATA
		fs.readFile(__dirname + "/../data/user.json", "utf-8", (err, data) => {
			let users = JSON.parse(data);

			// IF NOT FOUND
			if(!users[req.params.username]) {
				result["success"] = 0;
				result["error"] = "not found";
				res.json(result);
				return;
			}

			delete users[req.params.username];
			fs.writeFile(__dirname + "/../data/user.json",
						JSON.stringify(users, null, '\t'), "utf8", (err, data) => {
				result["success"] = 1;
				res.json(result);
				return;
			});
		});
	}); // end app.delete

}