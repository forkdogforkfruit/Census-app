var express = require("express");
var router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
let participants = db.collection("participants");

//Used to save requests(?) on S3
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

let Validator = require("validatorjs");
let validator = require("../middleware/validate");

let rules = {
  email: "required|email",
  firstName: "required|string",
  lastName: "required|string",
  dob: "required|date",
  active: "required|boolean",
  companyname: "string",
};
const { requiresAuth } = require("express-openid-connect");

/* GET a list of all participants. Shows only keys */
//TODO: add requiresAuth
router.get("/", async function (req, res, next) {
  //  console.log(req.oidc.user);
  console.log("GET request for all participants made to /participants");
  let list = await participants.list();
  res.send(list);
});

//TODO:get all details of all participants
router.get("/details", async function (req, res, next) {
  //console.log(req.oidc.user);
  let list = await participants.list();
  let results = list.results[0];
  //console.log(list);
  res.send(results);
});

router.get("/details/deleted", async function (req, res, next) {
  //TODO: need to show only inactive participants here.
});

//GET a specific record with use of a key (email)
//TODO: add requiresAuth
router.get("/details/:key", async function (req, res, next) {
  console.log("a record detail has been requested");
  let item = await participants.get(req.params.key);
  res.send(item);
});

// POST a new record at /add
//TODO: add requiresAuth
router.post("/add", validator, async function (req, res, next) {
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
  } = req.body;

  let validation = new Validator(
    req.body,
    //{ email, firstName, lastName, dob, active },
    rules
  );
  if (validation.passes()) {
    await participants.set(
      email,
      {
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        active: active,
        //TODO: add fragments
      }
        .fragment("work")
        .set({
          companyname: companyname,
          salary: salary,
          currency: currency,
        })
    );
    res.status(200).json({
      message: "Added record",
    });
  } else {
    res.status(400).json({
      message: "Incorrect information given",
    });
  }
});

//Updates a record
//TODO: add requiresAuth
router.put("/:email", async function (req, res, next) {
  console.log("put request made.");
  const { email, firstName, lastName, dob, active } = req.body;

  let validation = new Validator(
    req.body,
    //{ email, firstName, lastName, dob, active },
    rules
  );
  if (validation.passes()) {
    await participants.set(email, {
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      active: active,
      //TODO add fragments
    });
    res.status(200).json({
      message: "Record updated",
    });
  } else {
    res.status(400).json({
      message: "Failed to update record",
    });
  }
});

//DELETES a record
//TODO: add requiresAuth
//TODO: change so that does not delete but changes from active to inactive
router.delete("/details/:email", async function (req, res, next) {
  console.log(" A delete request has been made.");
  await participants.delete(req.params.email);
  res.status(200).json({
    message: "Record deleted",
  });
  res.end();
});

//TODO: add requiresAuth
router.get("/work/:email", async function (req, res, next) {
  let item = await participants.get(req.params.email);
  //TODO: need to return only work details not entire participant
  res.send(item);
});

//TODO: add requiresAuth
router.get("/home/:email", async function (req, res, next) {
  let item = await participants.get(req.params.email);
  //TODO: need to return only home details not entire participant
  res.send(item);
});

module.exports = router;
