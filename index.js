const csvToJson = require("convert-csv-to-json");
const fs = require("fs-extra");
const _ = require("lodash");
const mkdirp = require("mkdirp");

const restaurantsInput = "./csv/restaurants.csv";
const restaurantsOutput = "./json/restaurants.json";
const cuisinesInput = "./csv/cuisines.csv";
const cuisinesOutput = "./json/cuisines.json";

let restaurants = {};
let cuisineReverseLookUp = {};
let allCuisines = {};

const generateJsonData = (inputPath, outputPath) => {
  csvToJson.fieldDelimiter(",").generateJsonFileFromCsv(inputPath, outputPath);
};

const checkArguments = (userInput) => {
  if (
    Object.keys(userInput).some(
      (inputName) => typeof userInput[inputName] !== "string"
    )
  ) {
    throw "Error: Please enter a valid input";
  }
};

const readCuisineData = async () => {
  try {
    const cuisines = await fs.readJson(cuisinesOutput);
    allCuisines = cuisines;

    cuisines.forEach((cuisine) => {
      const cuisineName = cuisine["name"].toLowerCase();
      cuisineReverseLookUp[cuisineName] = cuisine.id;
    });
  } catch (e) {
    throw e;
  }
};

const readRestaurantData = async () => {
  try {
    const readRestaurants = await fs.readJson(restaurantsOutput);
    restaurants = readRestaurants;
  } catch (e) {
    throw e;
  }
};

const init = async (userInput) => {
  try {
    checkArguments(userInput);

    if (!fs.pathExistsSync("./json")) {
      await mkdirp("./json");
    }

    if (!fs.pathExistsSync(restaurantsOutput)) {
      generateJsonData(restaurantsInput, restaurantsOutput);
    }

    if (!fs.pathExistsSync(cuisinesOutput)) {
      generateJsonData(cuisinesInput, cuisinesOutput);
    }

    if (_.isEmpty(cuisineReverseLookUp) || _.isEmpty(allCuisines)) {
      await readCuisineData();
    }

    if (_.isEmpty(restaurants)) {
      await readRestaurantData();
    }
  } catch (e) {
    throw e;
  }
};

const sortRestaurants = (restaurantArray) => {
  return restaurantArray.sort((a, b) => {
    return (
      parseInt(a.distance) - parseInt(b.distance) ||
      parseInt(b.customer_rating) - parseInt(a.customer_rating) ||
      parseInt(a.price) - parseInt(b.price)
    );
  });
};

const filterByRestaurantNames = (filteredRestaurants, restaurantName) => {
  return filteredRestaurants.filter((restaurant) => {
    return restaurant.name.toLowerCase().includes(restaurantName.toLowerCase());
  });
};

const filterByCustomerRating = (filteredRestaurants, customerRating) => {
  return filteredRestaurants.filter((restaurant) => {
    return parseInt(restaurant.customer_rating) >= parseInt(customerRating);
  });
};

const filterByCustomerDistance = (filteredRestaurants, distance) => {
  return filteredRestaurants.filter((restaurant) => {
    return parseInt(restaurant.distance) <= parseInt(distance);
  });
};

const filterByPrice = (filteredRestaurants, price) => {
  return filteredRestaurants.filter((restaurant) => {
    return parseInt(restaurant.price) <= parseInt(price);
  });
};

const filterByCuisine = (filteredRestaurants, cuisine) => {
  const lowerCaseUserCuisine = cuisine.toLowerCase();
  const cuisineNames = Object.keys(cuisineReverseLookUp);
  const findCuisineName = cuisineNames.filter((cuisineName) =>
    cuisineName.startsWith(lowerCaseUserCuisine)
  )[0];

  if (findCuisineName) {
    return filteredRestaurants.filter((restaurant) => {
      return restaurant.cuisine_id === cuisineReverseLookUp[findCuisineName];
    });
  }
};

const restaurantSearcher = async (userInput) => {
  try {
    const {
      restaurantName = "",
      customerRating = "",
      distance = "",
      price = "",
      cuisine = "",
    } = userInput;

    await init(userInput);

    let filteredRestaurants = [...restaurants];

    if (restaurantName) {
      filteredRestaurants = filterByRestaurantNames(
        filteredRestaurants,
        restaurantName.trim()
      );
    }

    if (customerRating) {
      filteredRestaurants = filterByCustomerRating(
        filteredRestaurants,
        customerRating.trim()
      );
    }

    if (distance) {
      filteredRestaurants = filterByCustomerDistance(
        filteredRestaurants,
        distance.trim()
      );
    }

    if (price) {
      filteredRestaurants = filterByPrice(filteredRestaurants, price.trim());
    }

    if (cuisine) {
      filteredRestaurants = filterByCuisine(
        filteredRestaurants,
        cuisine.trim()
      );
    }

    if (restaurants.length === filteredRestaurants.length) return [];

    const sortedTopRestaurants = sortRestaurants(filteredRestaurants).slice(
      0,
      5
    );

    console.table(sortedTopRestaurants);
  } catch (e) {
    console.error(e);
  }
};

const runExamples = async () => {
  console.log("Search by cuisine");
  await restaurantSearcher({
    cuisine: "cHi ",
  });

  console.log("Search by partial restaurant name");
  await restaurantSearcher({
    restaurantName: "del ",
  });

  console.log("Search by full restaurant name");
  await restaurantSearcher({
    restaurantName: "Deliciouszilla ",
  });

  console.log("Search by customer rating");
  await restaurantSearcher({
    customerRating: "3",
  });

  console.log("Search by distance");
  await restaurantSearcher({
    distance: "1",
  });

  console.log("Search by price");
  await restaurantSearcher({
    price: "10",
  });

  console.log("Search by name and short distance");
  await restaurantSearcher({
    restaurantName: "del",
    distance: "1",
  });

  console.log("Search by name and long distance");
  await restaurantSearcher({
    restaurantName: "del",
    distance: "10",
  });

  console.log("Search with all properties");
  await restaurantSearcher({
    restaurantName: "Del",
    distance: "10",
    price: "20",
    cuisine: "Chinese",
  });

  console.log("no matches");
  await restaurantSearcher({
    restaurantName: "McDonalds",
  });

  console.log("Invalid input");
  await restaurantSearcher({
    restaurantName: 3,
  });
};

runExamples();
