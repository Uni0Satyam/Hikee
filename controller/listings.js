const mapApiKey = process.env.MAP_API_KEY;

const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  try {
    let category = req.query.category;
    let q = req.query.q;
    let key = req.query.key;

    let resListings;
    if (category) {
      resListings = await Listing.find({ category });
    } else if (q && key) {
      if (q === "city") {
        resListings = await Listing.find({ location: key });
      } else if (q === "country") {
        resListings = await Listing.find({ country: key });
      } else if (q === "title") {
        resListings = await Listing.find({ title: key });
      }
    }
    else {
      resListings = await Listing.find({});
    }
    const listingLength = (await Listing.find({})).length;

    res.render("listings/index.ejs", { resListings, listingLength });
  } catch (err) {
    console.error("Error filtering listings:", err);
    req.flash("error", "Unable to load listings.");
    res.redirect("/listings");
  }
};

module.exports.new = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
  try {
    const url = req.file.path;
    const filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    const location = newListing.location;
    const country = newListing.country;

    // Fetch coordinates
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${location}&country=${country}&format=json&apiKey=${mapApiKey}`
    );
    const result = await response.json();

    if (result.results && result.results.length > 0) {
      const lat = result.results[0].lat;
      const lon = result.results[0].lon;

      newListing.coordinates = {
        latitude: lat,
        longitude: lon
      };
    } else {
      console.log("No results found for given location");
      newListing.coordinates = { latitude: null, longitude: null };
    }

    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");

  } catch (error) {
    console.error("Error creating listing:", error);
    next(error);
  }
};


module.exports.show = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.renderEditPage = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.edit = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);

  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to edit the post");
    res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true, runValidators: true });

  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!")
  res.redirect("/listings");
};