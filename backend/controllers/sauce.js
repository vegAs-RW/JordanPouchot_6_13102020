const Sauce = require('../models/Sauce');
const fs = require('fs');

// Creation de nouvelle sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `http://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [' '],
        usersdisLiked: [' '],
    });
    sauce.save()
    .then(() => res.status(201).json({ message : 'Nouvelle sauce enregistrée'}))
    .catch(error => res.status(400).json ({ error }));
}

// Modification de sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl : `http://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
      .catch(error => res.status(400).json({ error }));
}

// Suppression de sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({_id: req.params.id})
            .then(() => res.status(200).json({message: 'Sauce supprimée'}))
            .catch(error => res.status(400).json({ error }));
        });
    })
    .catch(error => res.status(500).json({ error }));
}


// Recuperation d'une seule sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
}

// Recuperation de toute les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}

// Incrementation des likes/dislikes
exports.likeDislikeSauce = (req, res, next) => {
    let like = req.body.like
    let userId = req.body.userId
    let sauceId = req.params.id
    
    switch (like) {
        case 1 : // Ajout d'un like
            Sauce.updateOne(
                { _id: sauceId },
                { $push: { usersLiked: userId }, // On ajoute le user au tableau usersLiked
                  $inc: { likes: +1 }}) // On incremente un like
                .then(() => res.status(200).json({ message: 'Vous avez aimé la sauce' }))
                .catch((error) => res.status(400).json({ error }))
              
        break;
  
        case 0 : // Suppression d'un like ou d'un dislike
            Sauce.findOne(
                { _id: sauceId })
                .then((sauce) => {
                if (sauce.usersLiked.includes(userId)) { 
                    Sauce.updateOne(
                        { _id: sauceId },
                        { $pull: { usersLiked: userId }, // On retire le user du tableau
                          $inc: { likes: -1 }}) // On decremente un like
                    .then(() => res.status(200).json({ message: 'Par défaut' }))
                    .catch((error) => res.status(400).json({ error }))
                }
                if (sauce.usersDisliked.includes(userId)) { 
                    Sauce.updateOne(
                        { _id: sauceId },
                        { $pull: { usersDisliked: userId }, // On retire le user du tableau
                          $inc: { dislikes: -1 }}) // On decremente un dislike
                    .then(() => res.status(200).json({ message: 'Par défaut' }))
                    .catch((error) => res.status(400).json({ error }))
                }
                })
                .catch((error) => res.status(404).json({ error }))
        break;
  
        case -1 : // Ajout d'un dislike
            Sauce.updateOne(
                { _id: sauceId },
                { $push: { usersDisliked: userId }, // On ajoute le user au tableau usersDisliked
                  $inc: { dislikes: +1 }}) // On incremente un like
                .then(() => { res.status(200).json({ message: `Vous n'avez pas aimé la sauce` }) })
                .catch((error) => res.status(400).json({ error }))
        break;
        
        default:
            console.log(error);
    }
}