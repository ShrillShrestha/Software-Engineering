const { login, signup } = require('./UserController');
const { getScheduleAndThickness } = require('./OtherDataContoller');
const { addPipe } = require('./PipeContoller');

const SetRoutes = (app) => {
  //user routes
  app.post('/signup', signup);
  app.post('/login', login);

  // pipe routes
  app.post('/pipes', addPipe);

  // otherdata
  app.get('/scheduleAndThickness', getScheduleAndThickness);
};

module.exports = { SetRoutes };
