const app = require('./app');


app.listen(app.get('port'), () => {
    console.log("servidor escuchando en el puerto", app.get("port"));
});