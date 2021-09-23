const db = require('../models')
const User = db.User
const Tweet = db.Tweet

const helpers = require('../_helpers')

const userService = {
  getPopular: async (req, res) => {
    try {
      const userself = req.user
      const users = await User.findAll({
        where: { role: 'user' },
        order: [['createdAt', 'DESC']],
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      })

      let popularUser = []
      popularUser = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))

      helpers.removeUser(popularUser, userself.id)
      popularUser = popularUser.sort( (a, b) => b.FollowerCount - a.FollowerCount)
      popularUser = popularUser.slice(0,10)
      
      return popularUser
    } catch (err) {
      console.log(err)
    }
  },
  getProfileUser: async (req, res) => {
    try {
      const userId = req.params.userId
      let profileUser = await User.findOne({
        where: { id: userId, role: 0 },
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Tweet, attributes: ['id'] }
        ]
      })
      if (profileUser.introduction) {
         profileUser.introduction = profileUser.introduction.length < 50
          ? profileUser.introduction
          : profileUser.introduction.substring(0, 50) + '...'
      }
      profileUser.followerLength = profileUser.Followers.length
      profileUser.followingLength = profileUser.Followings.length
      profileUser.tweetLength = profileUser.Tweets.length
      profileUser.isFollowed = req.user.Followings.map(d => d.id).includes(
        Number(userId))

      return profileUser
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = userService
