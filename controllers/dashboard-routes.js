const router = require('express').Router();
const sequalize = require('../config/connection');
const { Post, User, Comment } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', withAuth, (req, res) => {

    Post.findAll({
        where: {
            user_id: req.session.user_id
    },
    attributes: [
        'id',
        'content',
        'title',
        'created_at'
    ],
    include: [
        {
            model: Comment,
            attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
            include: {
                model: User,
                attributes: ['username']
            }
        },
        {
            model: User,
            attributes: ['username']
        }
    ]
})
.then(dbPostData => {
    const posts = dbPostData.map(post => post.get({ plain: true}));
    res.render('dashboard', { posts, username: req.session.username, loggedIn: true });
})
.catch(err => {
    console.log(err);
    res.status(500).json(err);
})

});

router.get('/edit/:id', withAuth, (req, res) => {
    Post.findOne({
        where: {
            id: req.parems.id
        },
        attributes: [
            'id',
            'content',
            'title',
            'created_at'
        ],
        include: [
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
    .then(dbPostaData => {
        if (!dbPostData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }

        const post = dbPostData.get({ plain: true});

        res.render('edit-post', {
            post,
            loggedIn: req.session.loggedIn
        })
    });
})
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });

module.exports = router;

