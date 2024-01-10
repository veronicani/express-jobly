"use strict";

const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");
const { errorMonitor } = require("supertest/lib/test");

// things to test for
// works with partial that is valid
// works with full data that is valid
// does not work with empty data and error
// does not pass for partial data that is invalid
// 

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

    // console.log("***setCols:", setCols);
    // console.log("***values:", values);

    expect(setCols).toEqual('"first_name"=$1, "last_name"=$2');
    expect(values).toEqual(["Bob", "Laster"]);
  });

  test("works with full data that is valid", function () {
    const { setCols, values } = sqlForPartialUpdate(
      {
        "firstName": "Bob",
        "lastName": "Laster",
        "email": "bob@laster.com",
        "isAdmin": true
      },
      {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin"
      });

    expect(setCols)
      .toEqual('"first_name"=$1, "last_name"=$2, "email"=$3, "is_admin"=$4');
    expect(values).toEqual(["Bob", "Laster", "bob@laster.com", true]);
  });
  //TODO: finish implementing


  test("bad request with no data", function () {

    expect(() => sqlForPartialUpdate({},
      {
        firstName: "first_name",
        lastName: "last_name",
      })).toThrow(BadRequestError);
  });
});