const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { required } = require("joi");


const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: {
        type: Number,
        min: [500,"Should be at least 500"],
    },
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner : {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        }
    },
    category: {
        type: [String],
        enum : ["TRENDING","ROOMS", "ICONIC CITIES", "AMAZING VIEWS", "CASTLES", "AMAZING POOLS", "CAMPING", "FARMS", "ARCTIC"],
        required: true,
        default: ["OTHER"],
    },
});

listingSchema.index({
    category: 1,
    _id: -1
 });

listingSchema.post("findOneAndDelete",async(listing)=> {
    if(listing){
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;