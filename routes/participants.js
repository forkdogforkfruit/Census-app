var express = require("express");
var router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
let participants = db.collection("participants");

/* GET All Participants. */
router.get("/", async function (req, res, next) {
  let list = await participants.list();
  res.send(list);
  //res.render("home", { title: " Participants" });
});

//GET Participants With a Key
router.get("/:key", async function (req, res, next) {
  let item = await participants.get(req.params.key);
  res.send(item);
});

router.post("/", async function (req, res, next) {
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

router.get("/details", function (req, res, next) {
  res.render("details", { title: "Details" });
});

router.get("/work", function (req, res, next) {
  res.render("work", { title: "work" });
});

router.get("/home", function (req, res, next) {
  res.render("home", { title: "home" });
});

module.exports = router;
