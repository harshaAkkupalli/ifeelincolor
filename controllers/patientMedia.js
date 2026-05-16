const s3Util = require("../utils/s3Util");
const Patient = require("../models/patient");

// const uploadPatientImage = async (req, res) => {
//     const patientId = req.patient._id;
//     const fileContent = req.file.buffer;
//     const fileExtension = req.file.mimetype.split('/')[1];
//     const key = `patients/${patientId}.${fileExtension}`;

//     try {
//         const imageUrl = await s3Util.uploadFile(fileContent, key, req.file.mimetype);
//         await Patient.findByIdAndUpdate(patientId, { image: imageUrl });
//         res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
//     } catch (err) {
//         res.status(500).json({ error: 'Error uploading image', details: err.message });
//     }
// };

const uploadPatientImage = async (req, res) => {
  try {
    console.log("========== UPLOAD PATIENT IMAGE ==========");

    console.log("REQ.PATIENT:", req.patient);

    console.log("REQ.FILE:", req.file);

    // Check patient
    if (!req.patient) {
      return res.status(401).json({
        error: "Patient not authenticated",
      });
    }

    // Check file
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const patientId = req.patient._id;

    const fileContent = req.file.buffer;

    const fileExtension = req.file.mimetype.split("/")[1];

    const key = `patients/${patientId}.${fileExtension}`;

    console.log("PATIENT ID:", patientId);

    console.log("FILE KEY:", key);

    console.log("MIME TYPE:", req.file.mimetype);

    // Upload to S3
    const imageUrl = await s3Util.uploadFile(
      fileContent,
      key,
      req.file.mimetype,
    );

    console.log("IMAGE URL:", imageUrl);

    // Update patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      {
        image: imageUrl,
      },
      { new: true },
    );

    console.log("UPDATED PATIENT:", updatedPatient);

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl,
      patient: updatedPatient,
    });
  } catch (err) {
    console.log("UPLOAD ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Error uploading image",
      details: err.message,
    });
  }
};
const fetchPatientImage = async (req, res) => {
  const patientId = req.patient._id;

  try {
    const patient = await Patient.findById(patientId);
    if (!patient || !patient.image) {
      return res.status(404).json({ error: "Patient or image not found" });
    }

    res.status(200).json({ imageUrl: patient.image });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching image", details: err.message });
  }
};

const deletePatientImage = async (req, res) => {
  const patientId = req.patient._id;

  try {
    const patient = await Patient.findById(patientId);
    if (!patient || !patient.image) {
      return res.status(404).json({ error: "Patient or image not found" });
    }

    const key = patient.image.split("/").pop();
    await s3Util.deleteFile(`patients/${key}`);
    await Patient.findByIdAndUpdate(patientId, { image: null });

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting image", details: err.message });
  }
};

const updatePatientImage = async (req, res) => {
  const patientId = req.patient._id;
  const fileContent = req.file.buffer;
  const fileExtension = req.file.mimetype.split("/")[1];
  const newKey = `patients/${patientId}.${fileExtension}`;

  try {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    /*
        if (patient.image) {
            const existingKey = patient.image.split('/').pop();
            await s3Util.deleteFile(`patients/${existingKey}`);
        }
            */

    const newImageUrl = await s3Util.uploadFile(
      fileContent,
      newKey,
      req.file.mimetype,
    );
    patient.image = newImageUrl;
    await patient.save();

    res
      .status(200)
      .json({ message: "Image updated successfully", imageUrl: newImageUrl });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error updating image", details: err.message });
  }
};

module.exports = {
  updatePatientImage,
  uploadPatientImage,
  fetchPatientImage,
  deletePatientImage,
};
