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

/* Home page */
router.get("/", async function (req, res, next) {
  //console.log(req.oidc.user);
  res.send(
    "Please go to participants/details to see all participants or participants/add to add participants"
  );
});

/* GET All Participants With all details. */
//TODO: add requiresAuth
router.get("/details", async function (req, res, next) {
  //  console.log(req.oidc.user);
  console.log("participants/ details GET request");
  let list = await participants.list();
  res.send(list);
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
        //TODO add fragments
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
router.put("/", async function (req, res, next) {
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
router.delete("/:email", async function (req, res, next) {
  console.log(" A delete request has been made.");
  await participants.delete(req.params.email);
  res.status(200).json({
    message: "Record deleted",
  });
  res.end();
});

router.get("/work", requiresAuth(), function (req, res, next) {
  console.log("participants.get has been called");
});

router.get("/home", requiresAuth(), function (req, res, next) {
  res.render("home", { title: "home" });
});

module.exports = router;
