const validator = require('email-validator')

async function checkPerso(req, dbo){
    let tab = req.body
    if(!(req.body.race))
        tab.errorRace = 'choose a race'
    else
        tab.errorRace = 'OK'
    if(!(req.body.gender))
        tab.errorGender ='choose a gender'
    else
        tab.errorGender = 'OK'
    if(await dbo.collection('pseudo').find({pseudo: tab.pseudo}).toArray()=="")
        tab = await checkErrorPseudo(req, tab, dbo)
    else
        tab.errorPseudo ='pseudo already taken'
    return(tab)
}
async function checkInscription(tab, dbo){
    if(await dbo.collection('users').find({username : tab.username}).toArray()==""){
        if(await dbo.collection('users').find({password : tab.email}).toArray()=="")
            tab = await checkError(tab, dbo)
        else
            tab.errorEmail = 'email already taken'
    }
    else
      tab.errorUsername = 'username already taken'
    if(!(tab.success))
        tab.success = 'NOK'
    return(tab)
}
async function checkLogin(tab, dbo){
    tab = await dbo.collection('users').find({username : tab.username, 
        password : tab.password}).toArray()
    if(tab != ''){
        tab = tab[0]
        tab.success = '0K'
    }
    else{
        tab.error = 'Login or email incorrect'
        tab.success = 'NOK'
    }
    return(tab)
}
async function checkError(tab, dbo){
    if(tab.username.length < 5)
        tab.errorUsername = 'username need to have 5 or more character'
    else if(tab.username.length >= 12)
        tab.errorUsername = 'username need to have less than 13 character'
    else
        tab.errorUsername = 'OK'
    if(tab.password.length < 6)
        tab.errorPassword = 'password need to have 6 or more character'
    else if(tab.password.length >= 12)
        tab.errorPassword = 'password need to have less than 13 character'
    else
        tab.errorPassword = 'OK'
    if(!(validator.validate(tab.email)))
        tab.errorEmail = 'email is not conform'
    else
        tab.errorEmail = 'OK'
    if(tab.errorUsername == 'OK' && tab.errorPassword == 'OK' && tab.errorEmail == 'OK'){
        let res = await dbo.collection('users').find().sort({'_id':-1}).limit(1).toArray()
        if(res == '')
            tab._id = 1
        else
            tab._id = res[0]._id + 1
        tab.date = new Date()
        await dbo.collection('users').insertOne(tab)
        tab.success = 'OK'
    }
    else
        tab.success = 'NOK'
    return(tab)
}
async function checkErrorPseudo(req, tab, dbo){
    if(tab.pseudo.length < 5)
        tab.errorPseudo = 'pseudo need to have 5 or more character'
    else if(tab.pseudo.length >= 12)
        tab.errorPseudo = 'pseudo need to have less than 13 character'
    else
        tab.errorPseudo = 'OK'
    if(tab.errorPseudo == 'OK' && tab.errorRace =='OK' && tab.errorGender =='OK'){
        await dbo.collection('pseudo').insertOne({pseudo: tab.pseudo})
        let data = await dbo.collection('perso').find({_id: req.session.user.id}).toArray()   
        if(data == ""){
            data = {}
            data._id = req.session.user.id
            data.perso = [{
                id: 1,
                pseudo: tab.pseudo,
                gender: tab.gender,
                race: tab.race,
                date: new Date(),
                stats: {
                    level: 1,
                    xp: 1,
                    force: 1,
                    agility: 1,
                    dexterity: 1,
                    intelligence: 1,
                    sagesse: 1
                }
            }]
            await dbo.collection('perso').insertOne(data)
        }
        else{
            data = data[0]
            if(data.perso.length > 9)
                tab.errorPerso = 'character is limited to 10'
            else{
                tab.errorPerso = 'OK'
                data.perso.push({
                    id: data.perso.length + 1,
                    pseudo: tab.pseudo,
                    gender: tab.gender,
                    race: tab.race,
                    date: new Date(),
                    stats: {
                        level: 1,
                        xp: 1,
                        force: 1,
                        agility: 1,
                        dexterity: 1,
                        intelligence: 1,
                        sagesse: 1
                    }
                })
                await dbo.collection('perso').updateMany({_id: req.session.user.id},{$set: {perso : data.perso}})
            }
        }
    }
    return(tab)
}

module.exports = {
    checkLogin : checkLogin,
    checkInscription : checkInscription,
    checkPerso : checkPerso
}