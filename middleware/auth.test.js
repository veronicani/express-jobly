"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureAdminOrCorrectUser
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");


function next(err) {
  if (err) throw new Error("Got error from middleware");
}

/************************************** authenticateJWT */

describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

/************************************** ensureLoggedIn */

describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: { } } };
    expect(() => ensureLoggedIn(req, res, next))
        .toThrow(UnauthorizedError);
  });
});

/************************************** ensureAdmin */

describe("ensureAdmin", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "testAdmin", isAdmin: true } } };
    ensureAdmin(req, res, next);
  });

  test("unauth if isAdmin is false", function () {
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    expect(() => ensureAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: { } } };
    expect(() => ensureAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });
  //TODO: test for isAdmin: 'true' instead of true 
});

/************************************** ensureAdminOrCorrectUser */

describe("ensureAdminOrCorrectUser", function () {
  test("works for admin", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "testAdmin", isAdmin: true } } };
    ensureAdminOrCorrectUser(req, res, next);
  });
  //TODO: test for isAdmin: 'true' instead of true 
  test("works for correct user", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    ensureAdminOrCorrectUser(req, res, next);
  });

  test("unauth if non admin user and incorrect user", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test2", isAdmin: false} } };
    expect(() => ensureAdminOrCorrectUser(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth for anon users", function () {
    const req = { params: { username: "test" } };
    const res = { locals: {} };
    expect(() => ensureAdminOrCorrectUser(req, res, next))
        .toThrow(UnauthorizedError);
  });

});