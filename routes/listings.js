const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing, validRole } = require("../middleware.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controller/listings.js");

router.route("/")
    .get(wrapAsync(listingController.index))
    // CREATE ROUTE
    .post(isLoggedIn, upload.single("listing[img]"), validateListing, wrapAsync(listingController.createListing));

// NEW 
router.get("/new", isLoggedIn, validRole("host","admin"), listingController.new);

// Edit get route
router.get("/:id/edit", isLoggedIn, validRole("host","admin"), isOwner, wrapAsync(listingController.renderEditPage));

router.route("/:id")
    // show route
    .get(wrapAsync(listingController.show))
    // Edit put route
    .put(isLoggedIn, isOwner, validRole("host","admin"), upload.single("listing[img]"), validateListing, wrapAsync(listingController.edit))
    // DELETE
    .delete(isLoggedIn, isOwner, validRole("host","admin"), wrapAsync(listingController.delete))


module.exports = router;