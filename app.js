const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require("mysql2")
const port = 3000

app.use(cors())

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
