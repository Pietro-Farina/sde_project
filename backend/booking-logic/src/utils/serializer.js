// serializers/reservationSerializer.js
function serializeReservation(reservation) {
    if (!reservation) return null;
    return {
        id: reservation._id?.toString() || reservation.id,
        courseId: reservation.course?.toString(),
        userId: reservation.user?.toString(),
        slots: reservation.slots || [],
        status: reservation.status,
        expiration: reservation.expiration,
        // only expose price/info needed by client; omit internal fields like __v, audit, internalFlags
    };
}

function serializeBooking(booking) {
    if (!booking) return null;
    return {
        id: booking._id?.toString() || booking.id,
        courseId: booking.course?.toString(),
        userId: booking.user?.toString(),
        slots: booking.slots,
        status: booking.status,
        transactionId: booking.transactionId,
        price: booking.price,
        createdAt: booking.createdAt,
    };
}

function serializeBookings(bookings) {
  return (bookings || []).map(serializeBooking);
}

module.exports = { serializeReservation, serializeBooking, serializeBookings };