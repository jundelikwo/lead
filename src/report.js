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

        let tripDriver;
        if(drivers.hasOwnProperty(trip.driverID)) {
            tripDriver = drivers[trip.driverID];
            tripDriver.noOfTrips++;
            tripDriver.totalAmountEarned += normalizedTripAmount;
        } else {
            tripDriver = {
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

            drivers[trip.driverID] = tripDriver;
        }

        if(trip.isCash) {
            tripDriver.noOfCashTrips++;
            tripDriver.totalCashAmount += normalizedTripAmount;
        } else {
            tripDriver.noOfNonCashTrips++;
            tripDriver.totalNonCashAmount += normalizedTripAmount;
        }

        tripDriver.trips.push({
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

            await Promise.all(driver.vehicleID.map(async (vehicleId) => {
                const vehicle = await getVehicle(vehicleId);
                item.vehicles.push({plate: vehicle.plate, manufacturer: vehicle.manufacturer});
            }))
        } catch (error) {}

        return item;
    }))
    console.log(driversArray)
    return driversArray;
}

module.exports = driverReport;
driverReport();