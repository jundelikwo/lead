const { getTrips, getDriver, getVehicle } = require('api');
const { normalizeAmount } = require('./utils');

/**
 * This function should return the data for drivers in the specified format
 *
 * @returns {any} tripDriver report data
 */
async function driverReport() {
    let drivers = {};
    
    const trips = await getTrips();

    trips.forEach(async (trip) => {
        const normalizedTripAmount = normalizeAmount(trip.billedAmount);

        let driver;
        // Checks to see if we have already come across this driver
        if(drivers.hasOwnProperty(trip.driverID)) {
            // We already have details about this driver in memory
            // Increment the driver noOfTrips and earning

            driver = drivers[trip.driverID];
            driver.noOfTrips++;
            driver.totalAmountEarned += normalizedTripAmount;
        } else {
            // First time seeing this driver
            // Create a new record for them

            driver = {
                id: trip.driverID,
                noOfTrips: 1,
                noOfCashTrips: 0,
                noOfNonCashTrips: 0,
                totalCashAmount: 0,
                totalNonCashAmount: 0,
                totalAmountEarned: normalizedTripAmount,
                trips: [],
                vehicles: [],
            };

            drivers[trip.driverID] = driver;
        }

        if(trip.isCash) {
            driver.noOfCashTrips++;
            driver.totalCashAmount += normalizedTripAmount;
        } else {
            driver.noOfNonCashTrips++;
            driver.totalNonCashAmount += normalizedTripAmount;
        }

        // Store details of the current trip into the driver object
        driver.trips.push({
            user: trip.user.name,
            created: trip.created,
            pickup: trip.pickup.address,
            destination: trip.destination.address,
            billed: normalizedTripAmount,
            isCash: trip.isCash
        })
    });

    const driversArray = await Promise.all(Object.values(drivers).map(async (item) => {
        item.totalAmountEarned = Number(item.totalAmountEarned.toFixed(2));
        item.totalCashAmount = Number(item.totalCashAmount.toFixed(2));
        item.totalNonCashAmount = Number(item.totalNonCashAmount.toFixed(2));

        try {
            const driver = await getDriver(item.id);
            item.fullName = driver.name;
            item.phone = driver.phone;

            for (let vehicleId of driver.vehicleID) {
                const vehicle = await getVehicle(vehicleId);
                item.vehicles.push({plate: vehicle.plate, manufacturer: vehicle.manufacturer});
            }
        } catch (error) {}

        return item;
    }))
    return driversArray;
}

module.exports = driverReport;
driverReport();