const pool = require("../config/db");

// CREATE EVENT
const createEvent = async (req, res) => {
  try {
    const {
      title,
      event_date,
      start_time,
      end_time,
      description,
      venue,
      mode,
    } = req.body;

    // Validate required fields
    if (!title || !event_date || !start_time || !end_time) {
      return res.status(400).json({
        message: "Title, date, start time and end time are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Event image is required",
      });
    }

    if (end_time <= start_time) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    if (mode && !["online", "offline"].includes(mode)) {
      return res.status(400).json({
        message: "Mode must be online or offline",
      });
    }

    const image = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO events
      (
        title,
        event_date,
        start_time,
        end_time,
        image,
        description,
        venue,
        mode
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        title,
        event_date,
        start_time,
        end_time,
        image,
        description || null,
        venue || null,
        mode || "offline",
      ]
    );

    res.status(201).json({
      message: "Event created successfully",
      event: result.rows[0],
    });

  } catch (error) {
    console.error("Create Event Error:", error);

    if (error.code === "23P01") {
      return res.status(409).json({
        message: "Another event already exists in this time slot",
      });
    }

    res.status(500).json({
      message: "Failed to create event",
    });
  }
};


// GET ALL EVENTS + DATE FILTER
const getEvents = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        message: "Start date cannot be after end date",
      });
    }

    let query = "SELECT * FROM events WHERE 1=1";
    const values = [];

    if (startDate) {
      values.push(startDate);
      query += ` AND event_date >= $${values.length}`;
    }

    if (endDate) {
      values.push(endDate);
      query += ` AND event_date <= $${values.length}`;
    }

    query += " ORDER BY event_date ASC, start_time ASC";

    const result = await pool.query(query, values);

    res.status(200).json({
      count: result.rows.length,
      events: result.rows,
    });

  } catch (error) {
    console.error("Get Events Error:", error);

    res.status(500).json({
      message: "Failed to fetch events",
    });
  }
};


// GET SINGLE EVENT
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const result = await pool.query(
      "SELECT * FROM events WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.status(200).json({
      event: result.rows[0],
    });

  } catch (error) {
    console.error("Get Event Error:", error);

    res.status(500).json({
      message: "Failed to fetch event",
    });
  }
};


// UPDATE EVENT
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      event_date,
      start_time,
      end_time,
      description,
      venue,
      mode,
    } = req.body;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const existing = await pool.query(
      "SELECT * FROM events WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const oldEvent = existing.rows[0];

    // Keep old image if a new one is not uploaded
    const image = req.file
      ? `/uploads/${req.file.filename}`
      : oldEvent.image;

    const updatedTitle = title ?? oldEvent.title;
    const updatedDate = event_date ?? oldEvent.event_date;
    const updatedStart = start_time ?? oldEvent.start_time;
    const updatedEnd = end_time ?? oldEvent.end_time;
    const updatedMode = mode ?? oldEvent.mode;

    if (
      !updatedTitle ||
      !updatedDate ||
      !updatedStart ||
      !updatedEnd
    ) {
      return res.status(400).json({
        message: "Required event fields are missing",
      });
    }

    if (updatedEnd <= updatedStart) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    if (!["online", "offline"].includes(updatedMode)) {
      return res.status(400).json({
        message: "Mode must be online or offline",
      });
    }

    const result = await pool.query(
      `UPDATE events SET
        title = $1,
        event_date = $2,
        start_time = $3,
        end_time = $4,
        image = $5,
        description = $6,
        venue = $7,
        mode = $8,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        updatedTitle,
        updatedDate,
        updatedStart,
        updatedEnd,
        image,
        description ?? oldEvent.description,
        venue ?? oldEvent.venue,
        updatedMode,
        id,
      ]
    );

    res.status(200).json({
      message: "Event updated successfully",
      event: result.rows[0],
    });

  } catch (error) {
    console.error("Update Event Error:", error);

    if (error.code === "23P01") {
      return res.status(409).json({
        message: "Another event already exists in this time slot",
      });
    }

    res.status(500).json({
      message: "Failed to update event",
    });
  }
};


// DELETE EVENT
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const result = await pool.query(
      "DELETE FROM events WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.status(200).json({
      message: "Event deleted successfully",
    });

  } catch (error) {
    console.error("Delete Event Error:", error);

    res.status(500).json({
      message: "Failed to delete event",
    });
  }
};


module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};