const { getTrips, getDriver } = require('api');
const { normalizeAmount } = require('./utils');

/**
 * This function should return the trip data analysis
 *
 * @returns {any} Trip data analysis
 */
async function analysis() {
    let noOfCashTrips = 0;
    let noOfNonCashTrips = 0;
    let billedTotal = 0;
    let cashBilledTotal = 0;
    let nonCashBilledTotal = 0;
    let noOfDriversWithMoreThanOneVehicle = 0;
    let mostTripsByDriver, highestEarningDriver;
    let drivers = {};
    
    const trips = await getTrips();

    trips.forEach((trip) => {
        const normalizedTripAmount = normalizeAmount(trip.billedAmount);

        if(trip.isCash) {
            noOfCashTrips++;
            cashBilledTotal += normalizedTripAmount;
        } else {
            noOfNonCashTrips++;
            nonCashBilledTotal += normalizedTripAmount;
        }

        billedTotal += normalizedTripAmount;

        // Checks to see if we have already come across this driver
        if(drivers.hasOwnProperty(trip.driverID)) {
            // We already have details about this driver in memory
            // Increment the driver noOfTrips and earning

            const driver = drivers[trip.driverID];
            driver.noOfTrips++;
            driver.earnings += normalizedTripAmount;
        } else {
            // First time seeing this driver
            // Create a new record for them

            drivers[trip.driverID] = {
                noOfTrips: 1,
                earnings: normalizedTripAmount,
            };
        }
    });

    // This is to ensure that our floating point number have a maximum of 2 decimal places
    // This is necessary due to how computers handle floating point numbers
    billedTotal = normalizeAmount(billedTotal.toFixed(2));
    cashBilledTotal = normalizeAmount(cashBilledTotal.toFixed(2));
    nonCashBilledTotal = normalizeAmount(nonCashBilledTotal.toFixed(2));

    let mostTrips = 0;
    let highestEarnings = 0;
    await Promise.all(Object.keys(drivers).map(async (driverId) => {
        try {
            const driver = await getDriver(driverId);

            if(driver.vehicleID.length > 1) {
                noOfDriversWithMoreThanOneVehicle++;
            }

            const {noOfTrips, earnings} = drivers[driverId];

            // Note in the trips api, two different drivers had the highest number of trips
            if (noOfTrips > mostTrips) {
                mostTrips = noOfTrips;
                mostTripsByDriver = {
                    name: driver.name,
                    email: driver.email,
                    phone: driver.phone,
                    noOfTrips: noOfTrips,
                    totalAmountEarned: earnings,
                };
            }

            if (earnings > highestEarnings) {
                highestEarnings = earnings;
                highestEarningDriver = {
                    name: driver.name,
                    email: driver.email,
                    phone: driver.phone,
                    noOfTrips: noOfTrips,
                    totalAmountEarned: earnings,
                };
            }
        } catch (error) {
            
        }
    }));
    
    const result = {
        noOfCashTrips,
        noOfNonCashTrips,
        billedTotal,
        cashBilledTotal,
        nonCashBilledTotal,
        noOfDriversWithMoreThanOneVehicle,
        mostTripsByDriver,
        highestEarningDriver,
    };

    return result;
}

module.exports = analysis;