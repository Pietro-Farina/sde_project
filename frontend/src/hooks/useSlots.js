import data from "../mocks/slots.week.json"
import bookingData from "../mocks/bookings.json"

export function useSlots() {
  // Later this will become a fetch or RTK Query call
  return data
}

export function useBookings() {
  // Later this will become a fetch or RTK Query call   
    return bookingData
}

