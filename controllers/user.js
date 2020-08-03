const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');


const User = require('../models/user');
const Member = require('../models/member');
const Address = require('../models/address');



exports.getUserDetail = (req, res, next ) => {application

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
    const userId = req.userId.toString();
    
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
   
        
    Member.findOne({
            where:  { email: email }
        })
        .then(member => {
            if (member ) {
                const error = new Error('Member already exist ');
                error.statusCode = 203;
                throw error;

            }
        return Address.create({
            provision: provision,
            district: district,
            city: city 

            })
        })
        .then(addres => {
            return Member.create({
                id: 5,
                lname: lname,
                fname :fname,
                email: email, 
                phone: phone,
                addressId : addres.id,
                userId :   userId
            })
     
    })
    .then(result => {
            res.status(200).json({ message: 'Member added successfully',  result });
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

exports.deleteMember = (req, res, next )=> {
    const userId = req.params.userId;
    const memberId = req.params.memberId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
  }
  User.findOne({ 
      where: { id : userId }
  })
  .then(user => {
    if( !user) {
        const error = new Error('Unauthorize user');
        error.statusCode = 401;
        throw error;

    }
    return Member.findOne({
        where: { id : memberId }
    })

    })
    .then(member => {
        if( !member) {
            const error = new Error('Member does not exist');
            error.statusCode = 502;
            throw error;
    
        }
        return Member.destory({
            where: { id: memberId}
        })

    })
    .then(result => {
        console.log(result);
        res.status(200).json({ message: 'Deleted member' });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });


}

exports.getAllMembers = (req, res, next ) => {
    const userId = req.params.userId;
    const errors = validationResult(req);
     if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
     }


     User.findOne({
         where: {
             id: userId }
     })
     .then(user => {
        if ( !user ) {
            const error = new Error('Unauthorized user ');
            error.statusCode = 401;
            throw error;
          }
          Member.findAll({
              where: { user_id : userId }
          })
          .then(members => {
              if(!members ){
                const error = new Error('User does not have any member');
                error.statusCode = 200;
                throw error;

              }
            res.status(200).json({ message: 'member loaded sussfully', members: members});
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });

     })

}