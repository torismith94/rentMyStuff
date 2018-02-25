const express = require("express");
const router = express.Router();
const db = require('../app/db');
const path = require('path');
const sequelize = require('sequelize');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const axios=require('axios');


router.get('/categoriescount', (req, res) => {
	console.log('Route hit');
	db.Item.findAndCountAll({
		attributes: ['category'],
		group: ['category'],
		include: [{
			model: db.Category,
			attributes: ['imageURL']
		}]
	}).then((data) => {
		res.json(data);
	});
});

router.get('/categories', (req, res) => {
	db.Category.findAll().then((data) => {
		res.json(data);
	})
});

router.get('/items/:category', (req, res) => {
	db.Item.findAll({
		where: {
			category: req.params.category
		},
		include: [{
			model: db.User,
			attributes: ['id', 'displayName', 'imageURL']
		},
		{
			model: db.Category,
			attributes: ['imageURL']
		}]
	}).then((data) => {
		res.json(data);
	})
});

router.get('/items', (req, res) => {
	console.log('Hitting general items')
	db.Item.findAll({}).then((data) => {
		res.json(data);
	})
});

router.post('/additem', (req, res) => {
	console.log('Hitting api');
	db.Item.create(req.body, (err, response) => {
		if (!err) {
			res.send('Success');
		} else {
			res.send(err);
		}

	});


});

router.get('/item/:search', (req, res) => {
	console.log('hitting search');
	db.Item.findAll({
		where: {
			itemName: {
				$like: '%' + req.params.search + '%'
			}
		},
		include: [{
			model: db.User,
			attributes: ['id', 'displayName', 'imageURL']
		}]
	}).then(data => {
		res.json(data);
	}).catch((error) => {
		console.log(error);
	});
});

router.get('/item/user/:userid', (req, res) => {
	db.Item.findAll({
		where: {
			UserId: req.params.userid
		}
	}).then(data => {
		res.json(data);
	});
});

router.get('/singleitem/:itemid', (req, res) => {
	console.log('Hitting it');
	db.Item.findOne({
		where: {
			id: req.params.itemid
		},
		include: [{
			model: db.User,
			attributes: ['id', 'displayName', 'imageURL','email']
		}]
	}).then(data => {
		res.json(data);
	});
});

router.get('/middleware', (req,res) => {
	return axios.get('/auth/success');
});

router.delete('/item/:itemid', (req, res) => {
	//Make sure user is authenticated
	if (req.isAuthenticated()) {
		db.Item.findOne({
			where: {
				id: req.params.itemid
			}
		}).then((data) => {

			//Make sure authenticated user "owns" product
			if (req.user.id === data.UserId) {

				db.Item.destroy({
					where: {
						id: req.params.itemid
					}
				}).then(data => {
					res.json(data);
				});

			}
			else {
				res.error('Authenticated User doesn\'t own product');
			}

		});
	}
	else {
		res.error('No authenticated user, can\'t destroy product');
	}

});

router.post('/sendmail', (req,res) => {
	let transporter = nodemailer.createTransport(config.email);

	console.log(req.body);
	let mailOptions = {
		from: 'recre.entals@gmail.com',
		to: req.body.toEmail,
		subject: 'Rental request from somebody at Recre-Entals',
		text: 'Someone has sent you a message about ' + req.body.product +
			'\n\nMessage From: ' + req.body.name + 
			'\n\nPhone: ' + req.body.phone + 
			'\n\nEmail: ' + req.body.email + 
			'\n\nMessage: ' + req.body.message
	  };

	  transporter.sendMail(mailOptions, function(error, info){
		if (error) {
		  console.log(error);
		} else {
		  res.send(info.response);
		}
	  });

	  
});

router.post('/message/', (req, res) => {

	console.log(req.body);
	db.Message.create(req.body)
	.then((error, response) => {
		if(error) {
			res.send(error)
		}
		else {
			res.send('Success');
		}
	});

})

router.get('/conversation/:conversationid', (req, res) => {

	
	db.Conversation.findOne({
		where: {
			id: req.params.conversationid	
		},
		include: [{
			model: db.Message,
			as: "Messages"
		},
		{
			model: db.User,
			as: 'user1',
			attributes: ['displayName']
		},
		{
			model: db.User,
			as: 'user2',
			attributes: ['displayName']
		}]
	})
	.then(data => {
		res.json(data)
	});
})

module.exports = router;