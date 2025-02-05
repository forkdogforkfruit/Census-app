var express = require("express");
var router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
let participants = db.collection("participants");

let Validator = require("validatorjs");

let rules = {
  email: "required|email",
  firstName: "required|string",
  lastName: "required|string",
  dob: "required|date",
  active: "required|boolean",
  companyname: "string",
  salary: "integer",
  currency: "integer",
  country: "string",
  city: "string",
};

async function getDetail(key) {
  console.log("getDetail:", key);
  let item = await participants.get(key);
  let result = {
    active: item.props.active,
    lastName: item.props.lastName,
    dob: item.props.dob,
    created: item.props.created,
    firstName: item.props.firstName,
  };
  let work = await participants.item(key).fragment("work").get();
  if (work.length > 0)
    result.work = {
      companyname: work[0].props.companyname,
      salary: work[0].props.salary,
      currency: work[0].props.currency,
    };
  let home = await participants.item(key).fragment("home").get();
  if (home.length > 0)
    result.home = {
      country: home[0].props.country,
      city: home[0].props.city,
    };
  console.log("result", JSON.stringify(result));
  return result;
}

/* GET a list of all participants. Shows only keys */
router.get("/", async function (req, res, next) {
  console.log(req.oidc.user);
  console.log("GET request for all participants made to /participants");
  let list = await participants.list();
  let result = list.results.map((element) => ({ email: element.key }));
  res.send(result);
});

//get all details of all active participants
router.get("/details", async function (req, res, next) {
  //console.log(req.oidc.user);
  let list = await participants.list();
  let listWithDetails = (
    await Promise.all(
      list.results.map(async (element) => await getDetail(element.key))
    )
  ).filter((element) => element.active);
  res.send(listWithDetails);
});

// list inactive participants
router.get("/details/deleted", async function (req, res, next) {
  let list = await participants.list();
  let listWithDetails = (
    await Promise.all(
      list.results.map(async (element) => await getDetail(element.key))
    )
  ).filter((element) => !element.active);
  res.send(listWithDetails);
});

//GET a specific record with use of a key (email)
router.get("/details/:key", async function (req, res, next) {
  console.log("a record detail has been requested");
  const participant = await getDetail(req.params.key);
  if (participant.active) {
    res.send(participant);
  } else {
    res.status(404).json({
      message: "Participant is inactive",
    });
  }
});

// POST a new record at /add
router.post("/add", async function (req, res, next) {
  console.log("post request made to participants/add");
  const {
    email,
    firstName,
    lastName,
    dob,
    active,
    companyname,
    salary,
    currency,
    country,
    city,
  } = req.body;

  let validation = new Validator(req.body, rules);
  if (validation.passes()) {
    await participants.set(email, {
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      active: active,
    });
    await participants.item(email).fragment("work").set({
      companyname: companyname,
      salary: salary,
      currency: currency,
    });
    await participants.item(email).fragment("home").set({
      country: country,
      city: city,
    });

    res.status(200).json({
      message: "Added record",
    });
  } else {
    res.status(400).json({
      message: "Incorrect information given",
      errors: validation.errors.errors,
    });
  }
});

//Updates a record
router.put("/:email", async function (req, res, next) {
  console.log("put request made.");
  const {
    email,
    firstName,
    lastName,
    dob,
    active,
    companyname,
    salary,
    currency,
    country,
    city,
  } = req.body;

  let validation = new Validator(req.body, rules);
  if (validation.passes()) {
    await participants.set(email, {
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      active: active,
    });
    await participants.item(email).fragment("work").set({
      companyname: companyname,
      salary: salary,
      currency: currency,
    });
    await participants.item(email).fragment("home").set({
      country: country,
      city: city,
    });
    res.status(200).json({
      message: "Record updated",
    });
  } else {
    res.status(400).json({
      message: "Failed to update record",
      errors: validation.errors.errors,
    });
  }
});

//DELETES a record
router.delete("/details/:email", async function (req, res, next) {
  console.log("A delete request has been made.");
  const { email } = req.params;
  console.log("email: ", email);
  await participants.set(email, {
    active: false,
  });
  res.status(200).json({
    message: "Record deleted",
  });
  res.end();
});

//GET specific work details by a key
router.get("/work/:email", async function (req, res, next) {
  console.log("Get request for /work/:email");
  const participant = await getDetail(req.params.email);
  if (participant.active) {
    res.send({ work: participant.work });
  } else {
    res.status(404).json({
      message: "Participant is inactive",
    });
  }
});

//GET specific work details by a key
router.get("/home/:email", async function (req, res, next) {
  console.log("Get request for /home/:email");
  const participant = await getDetail(req.params.email);
  if (participant.active) {
    res.send({ home: participant.home });
  } else {
    res.status(404).json({
      message: "Participant is inactive",
    });
  }
});

module.exports = router;
