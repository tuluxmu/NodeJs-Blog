var User = require('../models/user.js');
var Post = require('../models/post.js');
var passport = require('passport');
var util = require('util');
module.exports = function(app) {
        app.get('/',
        function(req, res) {
                if (!req.query.search) {
                        var page = req.query.p ? parseInt(req.query.p) : 1;
                        Post.getTen(req.session.user, page,
                        function(err, posts, total) {
                                if (err) {
                                        posts = [];
                                }
                                 Post.getTags(function(err, tags) {
                                        res.render('index', {
                                        title: '主页',
                                        css: 'index',
                                        posts: posts,
                                        page: page,
                                        isFirstPage: (page - 1) == 0,
                                        isLastPage: ((page - 1) * 10 + posts.length) == total,
                                        user: req.session.user,
                                        tags: tags
                                });

                                });
                        });
                }
                else {
                        Post.search(req.query.search,
                        function(err, posts) {
                                if (err) {
                                        return res.redirect('/');
                                }
                                Post.getTags(function(err, tags) {
                                res.render('search', {
                                        title: "SEARCH:" + req.query.search,
                                        css: 'search',
                                        posts: posts,
                                        user: req.session.user,
                                        tags:tags
                                });
                        }); 
                        });

                }
                
               


        });
        
        app.get('/login',
        function(req, res) {
                res.render('login', {
                        title: 'login',
                        css: 'login'
                });
        });
        app.post('/login',
        function(req, res) {
                var name = req.body.user,
                password = req.body.password;
                User.get(name,
                function(err, user) {
                        if (!user) {
                                return res.redirect('/login'); //返回注册页
                        } else {
                                req.session.user = user.name; //用户信息存入 session
                                res.redirect('/'); //注册成功后返回主页
                        }
                });
        });
        app.get("/login/github", passport.authenticate("github", {
                session: false
        }));
        app.get("/login/github/callback", passport.authenticate("github", {
                session: false,
                failureRedirect: '/login',
                successFlash: '登陆成功！'
        }),
        function(req, res) {
                req.session.user = {
                        name: req.user.username,
                        head: "https://gravatar.com/avatar/" + req.user._json.gravatar_id + "?s=48"
                };
                res.redirect('/');
        });
        app.get('/reg',
        function(req, res) {
                res.render('reg', {
                        title: 'reg',
                        css: 'reg'
                });
        });
        app.post('/reg',
        function(req, res) {
                var name = req.body.user,
                password = req.body.password,
                password_re = req.body['password-re'];

                if (password_re != password) {
                        return res.redirect('/reg'); //返回主册页
                }
                var newUser = new User({
                        name: name,
                        password: password
                });
                //检查用户名是否已经存在 
                User.get(newUser.name,
                function(err, user) {
                        if (user) {
                                return res.redirect('/reg'); //返回注册页
                        }
                        //如果不存在则新增用户
                        newUser.save(function(err, user) {
                                if (err) {
                                        return res.redirect('/reg'); //注册失败返回主册页
                                }
                                req.session.user = user.ops[0].name; //用户信息存入 session
                                res.redirect('/'); //注册成功后返回主页
                        });
                });
        });
        app.get('/post',
        function(req, res) {
                res.render('post', {
                        title: 'post',
                        css: 'post'
                });
        });
        app.post('/post',
        function(req, res) {
                var currentUser = req.session.user; //userName
                var title = req.body.title,
                tags = [req.body.tag1, req.body.tag2, req.body.tag3],
                post = req.body.post;
                var newPost = new Post({
                        name: currentUser,
                        title: title,
                        tags: tags,
                        post: post
                });
                newPost.save(function(err, post) {
                        if (err) {
                                return res.redirect('/post'); //注册失败返回主册页
                        }
                        res.redirect('/'); //注册成功后返回主页
                });
        });
        app.get('/u/:name/:day/:title',
        function(req, res) {

                Post.getOne(req.params.name, req.params.day, req.params.title,
                function(err, post) {

                        if (err) {
                                return res.redirect('/');
                        }
                        res.render('article', {
                                title: 'req.params.title',
                                css: 'article',
                                post: post,
                                user: req.session.user
                        });
                });
        });
        app.get('/u/:name/',
        function(req, res) {
                res.render('user',{
                    title:'user',
                    css:'user'
                });
                
        });
        app.get('/edit/:name/:day/:title',
        function(req, res) {
                var currentUser = req.session.user;
                Post.edit(currentUser, req.params.day, req.params.title,
                function(err, post) {
                        if (err) {
                                return res.redirect('back');
                        }
                        res.render('edit', {
                                title: '编辑',
                                css: 'edit',
                                post: post,
                                user: req.session.user
                        });
                });
        });
        app.post('/edit/:name/:day/:title',
        function(req, res) {
                var currentUser = req.session.user;
                Post.update(currentUser, req.params.day, req.params.title, req.body.post,
                function(err) {
                        var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
                        if (err) {
                                return res.redirect(url); //出错！返回文章页
                        }
                        res.redirect(url); //成功！返回文章页
                });
        });
        app.get('/remove/:name/:day/:title',
        function(req, res) {
                var currentUser = req.session.user;
                Post.remove(currentUser, req.params.day, req.params.title,
                function(err) {
                        if (err) {
                                return res.redirect('back');
                        }
                        res.redirect('/');
                });
        });
        app.get('/tags/:tags',
        function(req, res) {
                Post.getTag(req.params.tags,
                function(err, docs) {
                        if (err) {
                                res.redirect('/');
                        }

                        res.render('tag', {
                                title: 'tags',
                                css: 'tags',
                                posts: docs,
                                user: req.session.user
                        })
                })
        });
    app.get('/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/');
  });
       
}