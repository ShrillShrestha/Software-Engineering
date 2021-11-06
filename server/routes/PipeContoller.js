const pipeQueries = require('../sql_queries/pipeQueries');
const { client } = require('../utils/databaseConnection');
const { getRandomString } = require('../utils/otherUtils');

const getSchedule = async (schedule, diameter) => {
  try {
    const breakSchedule = schedule.split('-');
    schedule = breakSchedule[0].trim();
    const wallThick = breakSchedule[1].trim();

    let schedule_class = await client.query(
      `SELECT piperefid FROM piperef WHERE (diameter = $1 AND schedule = $2 AND thickness = $3)`,
      [diameter, schedule, wallThick]
    );

    return schedule_class.rows[0].piperefid;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const addPipe = async (req, res, next) => {
  let {
    coating,
    coil_no,
    comments,
    diameter,
    grade,
    heat_no,
    length,
    location,
    material_type,
    po_number,
    schedule,
    isVoid,
    id,
    manufacturer,
  } = req.body;

  try {
    // USER AUTHENTICATION
    // if (!req.userEmail) throw { status: 400, message: 'Invalid Token!' };

    // let user = await client.query(
    //   `SELECT * FROM USERS WHERE email = '${req.userEmail}'`
    // );
    // user = user.rows[0].id;

    let pipeRefId = await getSchedule(schedule, diameter);

    let pipeHeat = await client.query(
      'SELECT * FROM pipeHeat WHERE heatNumber = $1',
      [heat_no]
    );

    console.log(pipeHeat);

    if (pipeHeat.rows.length == 0) {
      await client.query(pipeQueries.addPipeHeat, [heat_no, manufacturer]);
      pipeHeat = await client.query(
        'SELECT * FROM pipeHeat WHERE heatNumber = $1',
        [heat_no]
      );
    } else if (pipeHeat.rows[0].manufacture != manufacturer) {
      throw {
        status: 400,
        message:
          'Same Heat Number with a different manufacturer exists. Please consult admin to verify correct manufacturer. You can also leave a comment on the pipe.',
      };
    }
    pipeHeat = pipeHeat.rows[0].pipeheatid;

    let sharedRef = getRandomString(30);
    await client.query(pipeQueries.addPipeSharedInfo, [
      sharedRef,
      coating,
      grade,
      pipeHeat,
      pipeRefId,
      po_number,
      material_type,
      'user', // replace this later
    ]);

    await client.query(pipeQueries.addPipe, [
      id,
      sharedRef,
      length,
      'user',
      location,
      coil_no,
      comments,
      isVoid,
      false,
      null,
    ]);

    return res.status(201).send({
      success: true,
      message: 'Pipe Added!',
      // user: user,
    });
  } catch (error) {
    console.log(error);
    next({ status: 500, message: 'Something went wrong!' });
  }
};

const allPipes = (req, res, next) => {
  client
    .query(pipeQueries.allPipes)
    .then((response) => {
      return res.status(200).send({ success: true, pipes: response.rows });
    })
    .catch((err) => {
      console.log(err);
      next({ status: 500, message: 'Something went wrong!' });
    });
};

const deletePipe = async (req, res, next) => {
  let { pipeID } = req.params;

  try {
    await client.query(`DELETE FROM pipes WHERE pipe_id = ${pipeID}`);

    return res.status(204).send({ success: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getStringingInfo = async (req, res, next) => {
  try {
    let info = await client.query(
      'SELECT * FROM STATIONS order by(station, id)'
    );

    return res.status(200).send(info.rows);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updatePipeSchedule = async (schedule, diameter, pipeSharedId) => {
  try {
    let pipeRefId = await getSchedule(schedule, diameter);

    await client.query(
      'UPDATE pipesharedinfo set piperefid = $1 where pipesharedid = $2',
      [pipeRefId, pipeSharedId]
    );

    return;
  } catch (err) {
    console.log(err);
    throw {
      status: 400,
      message: 'Invalid Pipe Schedule-class-thickness update.',
    };
  }
};

const editPipe = async (req, res, next) => {
  let { oldData, newData } = req.body;

  let {
    coating,
    coil_no,
    comments,
    grade,
    heat_no,
    length,
    location,
    material_type,
    po_number,
    isVoid,
    id,
  } = newData;

  //handle heat no change after asking todd

  try {
    let _ = await client.query('SELECT pipeSharedId FROM pipe where id = $1', [
      oldData.id,
    ]);

    let pipeSharedId = _.rows[0].pipesharedid;

    if (
      newData.diameter != oldData.diameter ||
      newData.wall_thickness != oldData.wall_thickness ||
      newData.schedule != oldData.schedule
    ) {
      updatePipeSchedule(
        `${newData.schedule} - ${newData.wall_thickness}`,
        newData.diameter,
        pipeSharedId
      );
    }

    await client.query(pipeQueries.updatePipeSharedInfo, [
      coating,
      grade,
      po_number,
      material_type,
      pipeSharedId,
    ]);

    await client.query(pipeQueries.updatePipe, [
      id,
      length,
      'user',
      location,
      coil_no,
      comments,
      isVoid,
      new Date().toISOString(),
      oldData.id,
    ]);

    return res.status(200).send({ success: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateStrung = async (req, res, next) => {
  let { pipe_id, curr_id, curr_station, left_of_target } = req.body;
  try {
    let pipe_length = await deleteFromString(pipe_id, curr_id, curr_station);

    var new_station_id = 0;

    if (left_of_target) {
      let left_pipe = await client.query(
        `SELECT * from stations where pipe_id = ${left_of_target}`
      );

      let left_pipe_station = left_pipe.rows[0]['station'];

      if (left_pipe_station == curr_station) {
        let left_pipe_details = await client.query(
          `SELECT pipe_length from pipes where pipe_id = ${left_of_target}`
        );

        new_station_id =
          Number(left_pipe.rows[0]['id']) +
          Number(left_pipe_details.rows[0]['pipe_length']);
      }
    }

    await client.query(
      `UPDATE STATIONS SET id = id + ${pipe_length} where id >= ${new_station_id} and station = ${curr_station}`
    );

    await client.query(
      `INSERT INTO STATIONS(station, id, pipe_id) VALUES(${curr_station}, ${new_station_id}, ${pipe_id})`
    );

    res.status(200).send({ success: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteFromString = async (pipe_id, curr_id, curr_station) => {
  try {
    await client.query(`DELETE FROM STATIONS WHERE pipe_id = ${pipe_id}`);

    let pipe_length = await client.query(
      `SELECT pipe_length from pipes where pipe_id = ${pipe_id}`
    );

    pipe_length = pipe_length.rows[0]['pipe_length'];

    await client.query(
      `UPDATE stations set id = id - ${pipe_length} where station = ${curr_station} and id > ${curr_id}`
    );

    return pipe_length;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getOptions = async (req, res, next) => {
  try {
    let grades = await client.query('SELECT grade FROM pipeGrade;');
    grades = grades.rows.map((data) => data.grade);

    // let materials = await client.query('SELECT material_name FROM material;');
    // materials = materials.rows.map((data) => data.material_name);

    let po_numbers = await client.query('SELECT poNumber FROM purchasenumber;');
    po_numbers = po_numbers.rows.map((data) => data.ponumber);

    let heat_numbers = await client.query('SELECT heatnumber FROM pipeheat;');

    heat_numbers = heat_numbers.rows.map((data) => data.heatnumber);

    let coatings = await client.query('SELECT coat, color FROM pipecoat;');
    // let coating_color = await client.query('SELECT color FROM pipe_coating;');

    let coating_return = {};
    coatings.rows.forEach((data) => {
      coating_return[data.coat] = data.color;
    });

    res.status(200).send({
      success: true,
      grades,
      coatings: coating_return,
      // materials,
      po_numbers,
      heat_numbers,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = {
  addPipe,
  allPipes,
  deletePipe,
  updateStrung,
  deleteFromString,
  getStringingInfo,
  getOptions,
  editPipe,
  updatePipeSchedule,
};
