const API_BASE_URL = import.meta.env.VITE_API_URL
  .replace(/\/api\/?$/, "");

const EventCard = ({ event }) => {

  const imageUrl = event.image
    ? event.image.startsWith("http")
      ? event.image
      : `${API_BASE_URL}${event.image}`
    : null;

  const formatDate = (date) => {
    return new Date(date + "T00:00:00").toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="event-card">

      {imageUrl && (
        <div className="event-image">
          <img src={imageUrl} alt={event.title} />
        </div>
      )}

      <div className="event-content">

        <span className={`event-mode ${event.mode}`}>
          {event.mode}
        </span>

        <h3>{event.title}</h3>

        <p className="event-description">
          {event.description || "No description available"}
        </p>

        <div className="event-details">

          <p>
            <strong>Date:</strong>{" "}
            {formatDate(event.event_date)}
          </p>

          <p>
            <strong>Time:</strong>{" "}
            {formatTime(event.start_time)} -{" "}
            {formatTime(event.end_time)}
          </p>

          {event.venue && (
            <p>
              <strong>Venue:</strong> {event.venue}
            </p>
          )}

        </div>

      </div>

    </div>
  );
};

export default EventCard;