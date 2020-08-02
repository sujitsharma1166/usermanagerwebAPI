const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { v4 : uuid } = require('uuid');
const { Op } = require('sequelize');


const User = require('../models/user');
const Member = require('../models/member');
const Address = require('../models/address');



exports.postSignup = (req, res, next ) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;

}
    const _id = uuid();
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    bcrypt
        .hash(password, 16)
        .then( hashedPasswd => {
            return User.create({id: _id, username: username, email: email, password: hashedPasswd });
        }) 
        .then(createdUser => {
            res.status(201).json({ message: 'User created', userId: createdUser.id})
        })
        .catch(err => {
            if (!err.statusCode ) {
                err.statusCode = 500;
            }
            next(err);
        });

}

exports.postLogin = (req, res, next ) => {

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
        where: { 
            username: username            
        }
    })
    .then(validuser => {
        if(!validuser) {
            const error = new Error('User does not exist');
            error.statusCode = 401;
            throw error;
        }
        return bcrypt.compare(password, validuser.password);

    })
    .then(isEqual => {
        if (! isEqual) {
            const error = new Error('Wrong username or password');
            error.statusCode = 401;
            throw error;
        }
        res.status(201).json({ message: 'Login Sucess'})

    })
    .catch(err => {
        if (!err.statusCode ) {
            err.statusCode = 500;

        }
        next(err);
    });


}

exports.getUserDetail = (req, res, next ) => {

    const userId = req.params.userId;

    User.findOne({
        where: {
            id: userId
        }
    })
    .then(userdetail => {
        if (!userdetail) {
            const error = new Error('User does not exist');
            error.statusCode = 400;
            throw error;
        }
        res.status(200).json({ message: 'User detail received' , userId : userdetail.id,
                                username: userdetail.username, password : userdetail.password,
                                email: userdetail.email
                            })
    })
    .catch(err =>{
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })


}
exports.putUserUpdate = (req, res, next ) => {
    const userId = req.params.userId;
    const errors = validationResult(req);
    if( !errors.isEmpty ()) {
        const error = new Error('Validation failed , enter correct data');
        error.statusCode =422;
        throw error;
    }

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
        where: {
            id: userId
        }
    })
    .then(user => {
        if(!user ) {
            const error = new Error('Could not find user');
            error.statusCode = 404;
            throw err;
        }
        bcrypt.hash(password, 16)
        .then(hashedPasswd => {
            return User.update({   email: email,
                                    username: username,
                                    password: hashedPasswd
                }, {
                where: { id : userId }
                })
            })
     
        .then(updatedUser => {
            res.status(200).json({ message: 'User update successfully'});
        })
        .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
    })

} 

exports.putNewMember = (req, res, next ) => {
    const userId = req.params.userId;
    console.log("user is11111" +userId);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const fname = req.body.fname;
    const lname = req.body.lname;
    const email = req.body.email;
    const phone = req.body.phone;
    const provision = req.body.provision;
    const district = req.body.district;
    const city = req.body.city;

    User.findOne({
        where: {
            id: userId
        }
    })
    .then(user => {
        if( !user) {
            const error = new Error('Unauthorize ');
            error.statusCode = 401;
            throw error;

        }
        Member.findOne({
            where:  { email: email }
        })
        Member.create({
            lname: lname,
            fname :fname,
            email: email, 
            phone: phone        
        },{
            include: [{ model: Address ({provision: provision, district: district,city: city })}]
        })
        .then(result => {
            res.status(200).json({ message: 'Member added successfully',  result });
          })
        
    })
    .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });

}

exports.putMemberUpdate = (req, res, next ) => {
    const userId = req.params.userId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const fname = req.body.fname;
    const lname = req.body.lname;
    const email = req.body.email;
    const phone = req.body.phone;
    const provision = req.body.provision;
    const district = req.body.district;
    const city = req.body.city;

    User.findOne({
        where: {
            id: userId
        }
    })
    .then(user => {
        if( !user) {
            const error = new Error('Unauthorize ');
            error.statusCode = 401;
            throw error;

        }
        Member.update({
            lname: lname,
            fname :fname,
            email: email, 
            phone: phone        
        },{
            include: [{ model: Address ({provision: provision, district: district,city: city })}]
        })
        .then(result => {
            res.status(200).json({ message: 'Member updated successfully',  result });
          })
        
    })
    .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });

}