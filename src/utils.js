/**
 * This function should convert all strings to numbers
 *
 * @returns {number} normalize amount
 */
function normalizeAmount(input) {
    if (typeof input === 'number') {
        return input;
    }
    return Number(input.replace(/[^\d.-]/g,''));
}

module.exports = {
    normalizeAmount
};