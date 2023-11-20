app.get('/fileMenager', (req, res) => {
    if (req.user) {
        res.render('fileMenager.ejs', { name: req.user.username});
    } else {
        res.redirect('login');
    }
})