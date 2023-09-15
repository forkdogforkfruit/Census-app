var express = require("express");
var router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
let participants = db.collection("participants");

//Used to save requests(?) on S3
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const { requiresAuth } = require("express-openid-connect");

/* GET All Participants ONLY LISTING KEY. */
router.get("/", async function (req, res, next) {
  //console.log(req.oidc.user);
  res.send(
    "Please go to /details to see all participants or /add to add participants"
  );

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
});

// POST  a new record at /add
router.post("/add", async function (req, res, next) {
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

//GET Participants With a Key
router.get("/details/:key", async function (req, res, next) {
  //let item = await participants.get(req.params.firstName);
  console.log("an item has been requested");
  let item = await participants.get(req.params.key);
  res.send(item);
});

//Made it to here!!!! Keep going in the morning,
router.post("/", async function (req, res, next) {
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
});

router.put("/", requiresAuth(), async function (req, res, next) {
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

router.get("/work", requiresAuth(), function (req, res, next) {
  res.render("work", { title: "work" });
});

router.get("/home", requiresAuth(), function (req, res, next) {
  res.render("home", { title: "home" });
});

module.exports = router;
