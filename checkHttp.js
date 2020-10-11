function checkLoadPage(req, res, page, red){
    if(req.session.user)
        res.render(page, {tab: req.session.user})
    else
        res.redirect(red)
}
function checkSessionError(req, res, page, red){
    let tab = null
    if(req.session.error){
        tab = req.session.error
        req.session.error = null
    }
    if(req.session.user)
        res.redirect(red)
    else
        res.render(page, {tab : tab})
}
function checkUser(req, res, tab, red1, red2, error){
    if(tab.success != 'NOK'){
        req.session.user = {id:tab._id,username:tab.username, password:tab.password, email:tab.email}
        res.redirect(red1)
    }
    else{
        req.session.error = error
        res.redirect(red2)
    }
}
module.exports = {
    checkUser : checkUser,
    checkLoadPage : checkLoadPage,
    checkSessionError : checkSessionError
}
