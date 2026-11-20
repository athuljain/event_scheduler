import { useEffect, useState } from "react";

import api from "../services/api";
import EventCard from "../components/EventCard";

const Home = () => {

  const [events, setEvents] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch events
  const fetchEvents = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/events", {
        params: filters,
      });

      setEvents(response.data.events);

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to load events"
      );

    } finally {
      setLoading(false);
    }
  };

  // Initial event loading
  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events
  const handleFilter = (e) => {
    e.preventDefault();

    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date");
      return;
    }

    fetchEvents({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
  };

  // Clear filters
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");

    fetchEvents();
  };

  return (
    <div className="home-page">

      <section className="hero-section">

        <div className="hero-content">

          <span className="hero-label">
            Discover What's Happening
          </span>

          <h1>
            Find Your Next
            <span> Event</span>
          </h1>

          <p>
            Explore upcoming workshops, sessions,
            meetings and exciting events.
          </p>

        </div>

      </section>


      <section className="events-section">

        <div className="section-heading">

          <div>
            <h2>Upcoming Events</h2>

            <p>
              Explore all scheduled events
            </p>
          </div>

          <span className="event-count">
            {events.length} Events
          </span>

        </div>


        {/* Date Filter */}

        <form
          className="filter-form"
          onSubmit={handleFilter}
        >

          <div className="filter-group">

            <label>Start Date</label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
            />

          </div>


          <div className="filter-group">

            <label>End Date</label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
              min={startDate || undefined}
            />

          </div>


          <button type="submit" className="filter-btn">
            Apply Filter
          </button>

          <button
            type="button"
            className="clear-btn"
            onClick={clearFilters}
          >
            Clear
          </button>

        </form>


        {/* Events */}

        {loading ? (

          <div className="status-message">
            Loading events...
          </div>

        ) : error ? (

          <div className="error-message">
            {error}
          </div>

        ) : events.length === 0 ? (

          <div className="empty-message">
            <h3>No events found</h3>
            <p>Try changing your date filters.</p>
          </div>

        ) : (

          <div className="events-grid">

            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}

          </div>

        )}

      </section>

    </div>
  );
};

export default Home;