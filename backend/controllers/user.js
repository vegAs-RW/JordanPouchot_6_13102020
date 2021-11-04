const User = require('../models/User');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// Enregistrement d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // On hash le mdp grace au package bcrypt
    .then(hash => {
        const user = new User ({
            email : req.body.email,
            password : hash
        });
        user.save()
        .then(() => res.status(201).json({ message : 'Utilisateur créé'}))
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json ({ error }));
};

// Connexion d'un utilisateur existant
exports.login = (req, res, next) => {
    User.findOne({ email : req.body.email})
    .then(user => {
        if (!user) {
            return res.status(401).json({message: 'Utilisateur non trouvé'});
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if(!valid){
                return res.status(401).json({message: 'Mot de passe incorrect'});
            }
            res.status(201).json({
                userId: user._id,
                token: jwt.sign( // On attribu un Token d'identification avec le package JWT
                    { userId: user._id },
                    process.env.SECRET_TOKEN,
                    { expiresIn: '24h' }
                  )
            });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json ({ error }));
};