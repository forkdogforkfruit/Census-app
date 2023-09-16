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
  active: "boolean",
};
const { requiresAuth } = require("express-openid-connect");

/* GET All Participants records listed ONLY by key (email). */
router.get("/", async function (req, res, next) {
  //console.log(req.oidc.user);
  res.send(
    "Please go to participants/details to see all participants or participants/add to add participants"
  );
});

// POST a new record at /add
router.post("/add", validator, async function (req, res, next) {
  console.log("post request made to participants/add");
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
      message: "Added record",
    });
  } else {
    res.status(400).json({
      message: "Incorrect information given",
    });
  }
  //validation.fails();
  /* const { email, firstName, lastName, dob, active } = req.body;
  if (req.body == null && req.body.email != "xxxxx") {
    await participants.set(email, {
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      active: active,
      //TODO add fragments
    });

    res.status(200).json({
      message: "Added record",
    });
  } else {
    res.status(400).json({
      message: "Incorrect information given",
    });
  } */
});

/* GET All Participants With all details. */
router.get("/details", async function (req, res, next) {
  console.log("participants/ details GET request");
  let list = await participants.list();
  res.send(list);

  //  console.log(req.oidc.user);
  /* var params = {
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Delimiter: "/",
    // prefix to be added when added auth oidc
    //Prefix: "/",
  };
  //lists all participant
  var allObjects = await s3.listObjects(params).promise();
  let keys = allObjects?.Contents.map((x) => x.Key);
  console.log();

  const participants = await Promise.all(
    keys.map(async (key) => {
      let list = await s3
        .getObject({
          Bucket: process.env.CYCLIC_BUCKET_NAME,
          Key: key,
        })
        .promise();
      return {
        id: key.split("/").pop(),
        email: key,
      };
    })
  );

  res.send(participants); */
});

//GET a specific record with use of a key (email)
router.get("/details/:key", async function (req, res, next) {
  console.log("a record detail has been requested");
  let item = await participants.get(req.params.key);
  res.send(item);
});

//Updates a record
router.put("/", async function (req, res, next) {
  const { email, firstName, lastName, dob, active } = req.body;
  await participants.set(email, {
    firstName: firstName,
    lastName: lastName,
    dob: dob,
    active: active,
    //TODO add fragments
  });
  res.end();
});

router.delete("/:email", async function (req, res, next) {
  console.log(" A delete request has been made.");
  await participants.delete(req.params.email);
  res.end();
});

router.get("/work", requiresAuth(), function (req, res, next) {
  res.render("work", { title: "work" });
});

router.get("/home", requiresAuth(), function (req, res, next) {
  res.render("home", { title: "home" });
});

module.exports = router;

//Not needed as wrote a new post/add handler
/* router.post("/add", async function (req, res, next) {
  const participant = req.body;
  console.log(req.body);
  await s3
    .putObject({
      Body: participant.data,
      Bucket: process.env.CYCLIC_BUCKET_NAME,
      Key: participant.email,
    })
    .promise();

  const { email, firstName, lastName, dob, active } = req.body;
  if (email != { type: "string", format: "email" }) {
    console.log("incorrect format for email. Must be xxx@xxx.com");
    res.end();
  } else {
    await participants.set(email, {
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      active: active,
      //TODO add fragments
    });
    res.end();
  }
}); */

//This was part of get "/"
/* var params = {
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Delimiter: "/",
    firstName: req.body.firstName,
    // prefix when added auth oidc
    //Prefix: 'public/'
  };
  //lists all participant
  var allObjects = await s3.listObjects(params).promise();
  let keys = allObjects?.Contents.map((x) => x.Key);

  const participants = await Promise.all(
    keys.map(async (key) => {
      let list = await s3
        .getObject({
          Bucket: process.env.CYCLIC_BUCKET_NAME,
          Key: key,
          firstName: req.body.firstName,
        })
        .promise();
      return {
        id: key.split("/").pop(),
        firstName: key.firstName,
      };
    })
  );

  res.send(participants); */
