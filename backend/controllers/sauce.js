const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    console.log(req.body.sauce);
    req.body.sauce = JSON.parse(req.body.sauce);
    console.log(req.body.sauce);
    if(req.auth.userId != req.body.sauce.userId) {
      return res.status(401).json({
        error: new Error ('UserId incorrect')
      })
    }

      const sauce = new Sauce({
      userId: req.body.sauce.userId,
      name: req.body.sauce.name,
      manufacturer: req.body.sauce.manufacturer,
      description: req.body.sauce.description,
      mainPepper: req.body.sauce.mainPepper,
      imageUrl: url + '/images/' + req.file.filename,
      heat: req.body.sauce.heat,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
       });
      sauce.save().then(
      () => {
        res.status(201).json({
          message: 'Post saved successfully!'
        });
      }
      ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
      );
    
  };

  exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
      (sauces) => {
        res.status(200).json(sauces);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

  exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
      _id: req.params.id
    }).then(
      (sauce) => {
        res.status(200).json(sauce);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  };

  exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
      _id: req.params.id
    }).then(
      (sauce) => {

        if(req.auth.userId != sauce.userId) {
          return res.status(401).json({
            error: new Error ('User is not authorized')
          })
        };

        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink('images/' + filename, () => {
          Sauce.deleteOne({
            _id: req.params.id
          }).then(
            () => {
              res.status(200).json({
                message: 'Deleted!'
              });
            }
          ).catch(
            (error) => {
              res.status(400).json({
                error: error
              });
            }
          );
        });
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    )
  }


  exports.modifySauce = (req, res, next) => {

    let sauce = new Sauce({_id: req.params._id});
      //DELETE OLD IMAGE
    Sauce.findOne({ _id: req.params.id}).then(
      (oldSauce) => {


          if(req.auth.userId !== oldSauce.userId) {
            return res.status(403).json({
              error: new Error ('User is not authorized')
            })
          };

          if (req.file){
            const url = req.protocol + '://' + req.get('host');
            req.body.sauce = JSON.parse(req.body.sauce);
            const filename = oldSauce.imageUrl.split('/images/')[1];
            fs.unlink('images/' + filename, () => {
             console.log('Old image ' + filename + ' deleted');
            });

            sauce = {
              _id: req.params.id,
              userId: oldSauce.userId,
              name: req.body.sauce.name,
              manufacturer: req.body.sauce.manufacturer,
              description: req.body.sauce.description,
              mainPepper: req.body.sauce.mainPepper,
              imageUrl: url + '/images/' + req.file.filename,
              heat: req.body.sauce.heat,
            };
          } else {
            sauce = {
              _id: req.params.id,
              userId: oldSauce.userId,
              name: req.body.name,
              manufacturer: req.body.manufacturer,
              description: req.body.description,
              mainPepper: req.body.mainPepper,
              imageUrl: req.body.imageUrl,
              heat: req.body.heat,
            };
          }
            
      
            Sauce.updateOne({_id: req.params.id}, sauce).then(
              () => {
                res.status(201).json({
                  message: 'Sauce updated successfully!'
                });
              }
            ).catch(
              (error) => {
                res.status(400).json({
                  error: error
                });
              }
            );
      }
    )
  };

  exports.likeSauce = (req, res, next) => {
    Sauce.findOne({
      _id: req.params.id
    }).then(
      (sauce) => {

        let userId = req.body.userId;
        let findLike = sauce.usersLiked.includes(userId);
        let findDislike = sauce.usersDisliked.includes(userId);

        if (req.body.like ===1&&!findLike&&!findDislike) {
          console.log('User liking this sauce');
          sauce.likes++; 
          sauce.usersLiked.push(userId);
          console.log(sauce.usersLiked);
        }

        if (req.body.like ===-1&&!findLike&&!findDislike) {
          console.log('User disliking this sauce');
          sauce.dislikes++; 
          sauce.usersDisliked.push(userId);
          console.log(sauce.usersDisliked);
        }

        if (req.body.like ===0&&findLike){
          console.log('User already liked this sauce and now is neutral');
          sauce.likes--;
          sauce.usersLiked = sauce.usersLiked.filter((id) => id!=userId);
        } else if (req.body.like ===0&&findDislike) {
          console.log('User already disliked this sauce and now is neutral');
          sauce.dislikes--;
          sauce.usersdsliked = sauce.usersLiked.filter((id) => id!=userId);
        }
     
       Sauce.updateOne({_id: req.params.id}, sauce).then(
       () => {
        res.status(201).json({
          message: 'Sauce rating updated successfully!'
        });
      }
       ).catch(
        (error) => {
          res.status(400).json({
            error: error
          });
        }
       );
      }
    )
  }