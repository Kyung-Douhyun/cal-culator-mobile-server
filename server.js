const express = require('express');
const session = require('express-session');
const { graphqlHTTP } = require('express-graphql');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const schema = require('./schema/schema');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const { graphql } = require('graphql');
dotenv.config();

const app = express();

mongoose
	.connect(process.env.DB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.catch(err => console.log(err.reason));
mongoose.connection.on('open', () => console.log('connected to database'));

app.disable('x-powered-by');
app.use(cors());
app.use(
	session({
		name: 'user_id',
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
		},
	}),
);
app.use(
	'/graphql',
	bodyParser.json(),
	(req, res, next) => {
		console.log(req.session);
		return next();
	},
	graphqlHTTP((req, res, next) => {
		return {
			schema,
			graphiql: true,
			context: {
				req,
				res,
			},
		};
	}),
);

app.listen(4001, () => console.log('running on port 4001'));
