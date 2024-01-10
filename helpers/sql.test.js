"use strict";

const { sqlForPartialUpdate }= require("./sql");
const { BadRequestError } = require("../expressError");

// things to test for
// works with partial that is valid
// works with full data that is valid
// does not work with empty data and error
// does not pass for partial data that is invalid

describe("sqlForPartialUpdate", function () {
  test("works with partial data that is valid", function () {
    const { setCols, values } = sqlForPartialUpdate(
      {
        "firstName": "Bob",
        "lastName": "Laster"
      },
      {
        firstName: "first_name",
        lastName: "last_name",
      });

    console.log("***setCols:", setCols);
    console.log("***values:", values);

    expect(setCols).toEqual('"first_name"=$1, "last_name"=$2');
    expect(values).toEqual(["Bob", "Laster"]);
  });

  // test("works: no header", function () {
  //   const req = {};
  //   const res = { locals: {} };
  //   authenticateJWT(req, res, next);
  //   expect(res.locals).toEqual({});
  // });

  // test("works: invalid token", function () {
  //   const req = { headers: { authorization: `Bearer ${badJwt}` } };
  //   const res = { locals: {} };
  //   authenticateJWT(req, res, next);
  //   expect(res.locals).toEqual({});
  // });
});