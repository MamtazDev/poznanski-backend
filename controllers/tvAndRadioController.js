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

exports.getAllTvAndRadio = async (req, res) => {
  try {
    const {
      sortBy = "createdAt",  // Default sort field
      order = "asc",          // Default order
      page = 1,               // Default page
      limit = 10,             // Default limit
      search,                 // Search query
      startDate,              // Date range filtering start
      endDate,                // Date range filtering end
      type,                   // Filter type (confirmed or proposed)
    } = req.query;

    // Convert pagination and sorting parameters to numbers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    // Build query conditions
    const query = {};

    // Apply search on title, description, tags
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }


    // Apply date range filtering if startDate or endDate is provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch total count for pagination metadata
    const totalRecords = await TvAndRadio.countDocuments(query);

    // Paginate and sort the records
    const records = await TvAndRadio.find(query)
      .populate(["artists", "userId"])
      .sort({ [sortBy]: sortOrder })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return res.status(200).json({
      records,
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
      currentPage: pageNumber,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};;

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
