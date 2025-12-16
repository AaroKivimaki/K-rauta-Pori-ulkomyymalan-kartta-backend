const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require("mysql2")
const port = 3000
const jwt = require("jsonwebtoken")
app.use(express.json())
app.use(cors())
require("dotenv").config()

const users = [
	{
		id: 1,
		username: "muokkaaja",
		password: "muokkaaja123",
		isAdmin: true
	}
]

const secretKey = process.env.SECRET_KEY

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'node_kayttaja',
	password: '2314Juustokakku!',
	database: 'Tuotteet'
})

connection.connect((err) => {
	if (err) {
		console.log("Connection to database unsuccesful", err)
	} else {
		console.log("Connection to database succesful")
	}

})

app.post("/login", (req, res) => {
	const { username, password } = req.body

	const user = users.find(u => {
		return u.username === username && u.password === password
	})

	if (user) {
		const accessToken = jwt.sign({ id: user.id, isAdmin: user.isAdmin })
	} else {
		res.status(400).json("Username or password incorrect")
	}
})

app.get('/', (req, res) => {
	connection.query('SELECT * FROM raaka_puut', (err, results) => {

		if (err) {
			console.log("Database query failed", err)
		} else {
			console.log(results)
		}
		res.json(results)
	})
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
