const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Creation d'un schema pour les users sur la base du model attendu par le frontend
const userSchema = mongoose.Schema({
    email : {type: String, required: true, unique: true},
    password : {type: String, required: true}
});

// Ajout du plugin pour etre sur qu'il ne peux pas y avoir plus d'une fois le meme email
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);