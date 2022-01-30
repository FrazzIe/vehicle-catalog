/**
 * 
 *  Waits a minimum amount of time, note that this can be longer, but
 *  it is guaranteed to be atleast the specified amount of time
 *  
 *  Functions that use delay must be declared async.
 * 
 * @param {int} ms 
 * @returns {Promise} promise
 */
function delay(ms) {
	return new Promise(res => setTimeout(res, ms));
}