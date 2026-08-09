/**
 * Wraps navigator.geolocation.getCurrentPosition() in a promise with
 * friendly error messages, since this is what actually verifies "you are
 * in the room" for attendance — it must be real device GPS, never a
 * hardcoded fallback coordinate.
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('This device/browser does not support location services.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission was denied. Enable location access to check in.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Your location could not be determined. Move to an open area and try again.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Getting your location timed out. Please try again.'));
            break;
          default:
            reject(new Error('Unable to get your location.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  });
}
