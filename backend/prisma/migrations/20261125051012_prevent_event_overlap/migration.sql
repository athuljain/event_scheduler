ALTER TABLE "events"
ADD CONSTRAINT "prevent_event_overlap"
EXCLUDE USING gist (
  tsrange(
    "event_date" + "start_time",
    "event_date" + "end_time",
    '[)'
  ) WITH &&
);