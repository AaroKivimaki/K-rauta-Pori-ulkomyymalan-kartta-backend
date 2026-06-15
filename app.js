const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require("mysql2")
const port = 3000
const jwt = require("jsonwebtoken")
app.use(express.json())
app.use(cors())
require("dotenv").config()

// const users = [
// 	{
// 		id: 1,
// 		username: "muokkaaja",
// 		password: "muokkaaja123",
// 		isAdmin: true
// 	}
// ]

const secretKey = process.env.SECRET_KEY
const secretRefreshKey = process.env.REFRESH_KEY

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'node_kayttaja',
	password: '2314Juustokakku!',
	database: 'rautakauppa'
})

const generateAccessToken = (user) => {
	return jwt.sign({
		id: user.id,
		isAdmin: user.isAdmin
	}, secretKey,
		{ expiresIn: "15m" })
}

const generateRefreshToken = (user) => {
	return jwt.sign({
		id: user.id,
		isAdmin: user.isAdmin
	}, secretRefreshKey)
}


const verify = (req, res, next) => {
	const authHeader = req.headers.authorization
	if (authHeader) {
		const token = authHeader.split(" ")[1]

		jwt.verify(token, secretKey, (err, user) => {
			if (err) {
				return res.status(403).json("Token is not valid")
			}

			req.user = user
			next()
		})
	} else {
		res.status(401).json("You are not authenticated!")
	}
}

connection.connect((err) => {
	if (err) {
		console.log("Connection to database unsuccesful", err)
	} else {
		console.log("Connection to database succesful")
	}

})

app.post("/logout", verify, (req, res) => {
	const refreshToken = req.body.token;
	refreshTokens = refreshTokens.filter((token) => token !== refreshToken)
	res.status(200).json("You logged out succesfully.")
})

let refreshTokens = []

app.post("/refresh", (req, res) => {
	const refreshToken = req.body.token

	if (!refreshToken) {
		return res.status(401).json("You are not authenticated!")
	}

	if (!refreshTokens.includes(refreshToken)) {
		return res.status(403).json("Refresh token is not valid")
	}

	jwt.verify(refreshToken, secretRefreshKey, (err, user) => {
		err && console.log(err)
		refreshTokens = refreshTokens.filter((token) => token !== refreshToken)

		const newAccessToken = generateAccessToken(user)
		const newRefreshToken = generateRefreshToken(user)

		refreshTokens.push(newRefreshToken)

		res.status(200).json({
			accessToken: newAccessToken,
			refreshToken: newRefreshToken
		})
	})

})

app.put("/update/:id", (req, res) => {
	const id = req.params.id
	const amount = req.body.changeInventoryAmountTo

	connection.query('UPDATE raaka_puut SET saldo=? WHERE id=?', [amount, id], (err, results) => {
		if (err) {
			console.log(err)
		} else {
			res.send("Updated")
			console.log(results)
		}
	})
})

app.post("/login", (req, res) => {
	const { username, password } = req.body

	connection.query('SELECT * FROM kayttajat', (err, results) => {

		const user = results.find((u) => {
			return u.NIMI === username && u.SALASANA === password
		})

		if (user) {
			const accessToken = generateAccessToken(user)
			const refreshToken = generateRefreshToken(user)

			refreshTokens.push(refreshToken)

			res.json({
				username: user.username,
				isAdmin: user.isAdmin,
				accessToken,
				refreshToken,
			})
			console.log(results)
		} else {
			res.status(400).json("Username or password incorrect")
		}
	})


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
