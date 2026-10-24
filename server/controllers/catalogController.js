/*=========================================
  CATALOG CONTROLLER  -  lists for the booking form
=========================================*/
const catalog = require("../catalog");

const destinations = () => ({ data: { destinations: catalog.destinations } });
const packages = () => ({ data: { packages: catalog.packages, travelTypes: catalog.travelTypes } });

module.exports = { destinations, packages };
