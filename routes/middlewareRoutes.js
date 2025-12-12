//Middleware para ver si el usuario esta logueado
const isAuth = (req, res, next) => {
  if(req.session.user){
    next();
  }
  else{
    res.redirect('/login');
  }
};

//Middleware para ver si el usuario es admin
const isAdmin = (req, res, next) => {
  if(req.session.user && req.session.user.rol === 'admin'){
    next();
  }
  else{
    res.status(403).send('Acceso denegado. No tienes permisos de administrador.')
  }
}

module.exports = {isAuth, isAdmin};