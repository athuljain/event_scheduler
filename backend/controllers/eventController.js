
const prisma = require("../config/db");

// Convert Prisma Date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().slice(0, 10);
};

// Convert Prisma Time to HH:mm:ss
const formatTime = (time) => {
  return time.toISOString().slice(11, 19);
};

// Format event before sending JSON response
const formatEvent = (event) => ({
  ...event,
  event_date: formatDate(event.eventDate),
  start_time: formatTime(event.startTime),
  end_time: formatTime(event.endTime),
  image: event.image,
  description: event.description,
  venue: event.venue,
  mode: event.mode,
});

// Convert incoming strings to Prisma Date values
const toDate = (date) =>
  new Date(`${date}T00:00:00.000Z`);

const toTime = (time) =>
  new Date(`1970-01-01T${time}Z`);

const isOverlapError = (error) => {
  const errorMessage = String(error.message || "");

  return (
    error.code === "23P01" ||
    error.code === "P2004" ||
    errorMessage.includes("23P01") ||
    errorMessage.includes("prevent_event_overlap")
  );
};

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

    const event = await prisma.event.create({
      data: {
        title,
        eventDate: toDate(event_date),
        startTime: toTime(start_time),
        endTime: toTime(end_time),
        image,
        description: description || null,
        venue: venue || null,
        mode: mode || "offline",
      },
    });

    res.status(201).json({
      message: "Event created successfully",
      event: formatEvent(event),
    });

  } catch (error) {
    console.error("Create Event Error:", error);

    if (isOverlapError(error)) {
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

    const where = {};

    if (startDate || endDate) {
      where.eventDate = {};

      if (startDate) {
        where.eventDate.gte = toDate(startDate);
      }

      if (endDate) {
        where.eventDate.lte = toDate(endDate);
      }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: [
        { eventDate: "asc" },
        { startTime: "asc" },
      ],
    });

    res.status(200).json({
      count: events.length,
      events: events.map(formatEvent),
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
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.status(200).json({
      event: formatEvent(event),
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
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const oldEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!oldEvent) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const {
      title,
      event_date,
      start_time,
      end_time,
      description,
      venue,
      mode,
    } = req.body;

    const updatedTitle = title ?? oldEvent.title;

    const updatedDate = event_date
      ? toDate(event_date)
      : oldEvent.eventDate;

    const updatedStart = start_time
      ? toTime(start_time)
      : oldEvent.startTime;

    const updatedEnd = end_time
      ? toTime(end_time)
      : oldEvent.endTime;

    const updatedMode = mode ?? oldEvent.mode;

    if (!updatedTitle) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (
      updatedEnd.getTime() <= updatedStart.getTime()
    ) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    if (!["online", "offline"].includes(updatedMode)) {
      return res.status(400).json({
        message: "Mode must be online or offline",
      });
    }

    const image = req.file
      ? `/uploads/${req.file.filename}`
      : oldEvent.image;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: updatedTitle,
        eventDate: updatedDate,
        startTime: updatedStart,
        endTime: updatedEnd,
        image,
        description: description ?? oldEvent.description,
        venue: venue ?? oldEvent.venue,
        mode: updatedMode,
      },
    });

    res.status(200).json({
      message: "Event updated successfully",
      event: formatEvent(updatedEvent),
    });

  } catch (error) {
    console.error("Update Event Error:", error);

    if (isOverlapError(error)) {
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
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    await prisma.event.delete({
      where: { id },
    });

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
