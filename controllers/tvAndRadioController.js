const TvAndRadio = require("../models/tvAndRadio");

// Create
exports.createTvAndRadio = async (req, res) => {
  try {
    const newRecord = new TvAndRadio(req.body);
    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all
exports.getAllTvAndRadio = async (req, res) => {
  try {
    const records = await TvAndRadio.find().populate("artists userId");
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by ID
exports.getTvAndRadioById = async (req, res) => {
  try {
    const record = await TvAndRadio.findById(req.params.id).populate(
      "artists userId"
    );
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
exports.updateTvAndRadio = async (req, res) => {
  try {
    console.log("Request Body:", req.body, "id:", req.params.id);

    const record = await TvAndRadio.findOne({ _id: req.params.id });
    if (!record) return res.status(404).json({ error: "Record not found" });
    Object.assign(record, req.body);
    await record.save();

    console.log("Updated Record:", record);
    res.status(200).json(record);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Delete
exports.deleteTvAndRadio = async (req, res) => {
  try {
    const deletedRecord = await TvAndRadio.findByIdAndDelete(req.params.id);
    if (!deletedRecord)
      return res.status(404).json({ error: "Record not found" });
    res.status(200).json(deletedRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
