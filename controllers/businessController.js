const Business = require("../models/Business")

//CREATE BUSINESS

exports.createBusiness = async (req, res) => {
  try {
    const { businessName, gstNumber, phone, address, state } = req.body

    const business = await Business.create({
      user: req.user.id,
      businessName,
      gstNumber,
      phone,
      address,
      state
    })

    res.status(201).json({ success: true, business })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }

}


//GET BUSINESS

exports.getBusiness = async (req, res) => {
  try {
    const businesses = await Business.find({ user: req.user.id })

    res.json(businesses)

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


// UPDATE BUSINESS

exports.updateBusiness = async (req, res) => {
  try {

    const { id } = req.params;
    const { businessName, gstNumber, phone, address } = req.body;

    const business = await Business.findOne({ _id: id, user: req.user.id });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (businessName) business.businessName = businessName;
    if (gstNumber) business.gstNumber = gstNumber;
    if (phone) business.phone = phone;
    if (address) business.address = address;
    if (state) business.state = state;

    const updatedBusiness = await business.save();

    res.json({
      message: "Business updated successfully",
      business: updatedBusiness
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// DELETE BUSINESS

exports.deleteBusiness = async (req, res) => {
  try {

    const { id } = req.params;

    const business = await Business.findOneAndDelete({
      _id: id,
      user: req.user.id
    });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json({
      message: "Business deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};