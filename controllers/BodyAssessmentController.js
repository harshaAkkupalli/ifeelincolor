const BodyAssessment = require("../models/BodyAssessment");
const Color = require("../models/Color");
const FeelingNode = require("../models/feelingsWheel");
const FeelingFormMeta = require("../models/FeelingFormMeta");

// Create a body assessment
const createBodyAssessment = async (req, res) => {
  try {
    const { question, answer, type, score, mcqOptions, part } = req.body;

    // Ensure mcqOptions have the required structure with a color reference
    const formattedMcqOptions = mcqOptions.map((option) => ({
      text: option.text,
      color: option.color,
    }));

    const newBodyAssessment = new BodyAssessment({
      question,
      answer,
      type,
      score,
      part,
      mcqOptions: type === "mcq" ? formattedMcqOptions : [],
    });

    await newBodyAssessment.save();

    res.status(201).json({
      status: "success",
      body: newBodyAssessment,
      message: "Body Assessment created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      body: null,
      message: "An error occurred while creating the body assessment",
    });
  }
};

// Update a body assessment
const updateBodyAssessment = async (req, res) => {
  try {
    const { mcqOptions, ...restBody } = req.body;

    // Format mcqOptions with color reference if provided
    const formattedMcqOptions = mcqOptions
      ? mcqOptions.map((option) => ({
          text: option.text,
          color: option.color,
        }))
      : undefined;

    const updatedData = { ...restBody };
    if (formattedMcqOptions) {
      updatedData.mcqOptions = formattedMcqOptions;
    }

    const updatedBodyAssessment = await BodyAssessment.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true },
    );

    if (!updatedBodyAssessment) {
      return res.status(404).json({
        status: "error",
        body: null,
        message: "Body Assessment not found",
      });
    }

    res.json({
      status: "success",
      body: updatedBodyAssessment,
      message: "Body Assessment updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      body: null,
      message: "An error occurred while updating the body assessment",
    });
  }
};

// Fetch body assessment by ID
const getBodyAssessmentById = async (req, res) => {
  try {
    const bodyAssessment = await BodyAssessment.findById(req.params.id);
    if (!bodyAssessment) {
      return res.status(404).json({
        status: "error",
        body: null,
        message: "Body Assessment not found",
      });
    }
    res.json({
      status: "success",
      body: bodyAssessment,
      message: "Body Assessment retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      body: null,
      message: "An error occurred while retrieving the body assessment",
    });
  }
};

// Delete a body assessment
const deleteBodyAssessment = async (req, res) => {
  try {
    const bodyAssessment = await BodyAssessment.findById(req.params.id);
    if (!bodyAssessment) {
      return res.status(404).json({
        status: "error",
        body: null,
        message: "Body Assessment not found",
      });
    }

    // Delete the body assessment
    await bodyAssessment.deleteOne();

    res.json({
      status: "success",
      body: null,
      message: "Body Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting body assessment:", error);
    res.status(500).json({
      status: "error",
      body: null,
      message: "An error occurred while deleting the body assessment",
    });
  }
};

// Get all body assessments
const getAllBodyAssessments = async (req, res) => {
  try {
    const bodyAssessments = await BodyAssessment.find({});
    res.json({
      status: "success",
      body: bodyAssessments,
      message: "Body Assessments retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      body: null,
      message: "An error occurred while retrieving the body assessments",
    });
  }
};

// Example endpoint to fetch body assessments based on category
const getBodyAssessmentsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const bodyAssessments = await BodyAssessment.find({ category: categoryId });
    if (!bodyAssessments.length) {
      return res.status(404).json({
        status: "error",
        body: null,
        message: "No body assessments found for this category",
      });
    }
    res.json({
      status: "success",
      body: bodyAssessments,
      message: "Body Assessments retrieved successfully by category",
    });
  } catch (error) {
    console.error("Error fetching body assessments by category:", error);
    res.status(500).json({
      status: "error",
      body: null,
      message:
        "An error occurred while retrieving body assessments by category",
    });
  }
};

// Fetch questions based on part
const getQuestionsByPart = async (req, res) => {
  try {
    const { partId } = req.params;

    // Validate partId
    if (!partId) {
      return res.status(400).json({
        status: "error",
        body: null,
        message: "Part ID is required",
      });
    }

    // Find questions based on the part ID
    const questions = await BodyAssessment.find({ part: partId });

    if (!questions.length) {
      return res.status(404).json({
        status: "error",
        body: null,
        message: "No questions found for the given part",
      });
    }

    res.json({
      status: "success",
      body: questions,
      message: "Questions retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching questions by part:", error);
    res.status(500).json({
      status: "error",
      body: null,
      message: "An error occurred while fetching questions",
    });
  }
};

// Fetch questions based on part(s)
// const getQuestionsByParts = async (req, res) => {
//     try {
//         const { partIds } = req.body; // partIds should be an array of part IDs

//         // Validate partIds
//         if (!Array.isArray(partIds) || partIds.length === 0) {
//             return res.status(400).json({
//                 status: 'error',
//                 body: null,
//                 message: 'Part IDs are required and should be an array'
//             });
//         }

//         // Find questions that match any of the part IDs
//         const questions = await BodyAssessment.find({ part: { $in: partIds } });

//         if (!questions.length) {
//             return res.status(404).json({
//                 status: 'error',
//                 body: null,
//                 message: 'No questions found for the given parts'
//             });
//         }

//         res.json({
//             status: 'success',
//             body: questions,
//             message: 'Questions retrieved successfully'
//         });
//     } catch (error) {
//         console.error('Error fetching questions by parts:', error);
//         res.status(500).json({
//             status: 'error',
//             body: null,
//             message: 'An error occurred while fetching questions'
//         });
//     }
// };

const getQuestionsByParts = async (req, res) => {
  try {
    const { partIds, bodyPartName } = req.body;

    // 1. Validate input
    if (!Array.isArray(partIds) || partIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "partIds must be a non-empty array",
      });
    }

    // 2. Get meta (question templates)
    const meta = await FeelingFormMeta.getSingleton();

    // 3. Fetch all nodes
    const nodes = await FeelingNode.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    if (!nodes.length) {
      return res.status(404).json({
        status: "error",
        message: "No nodes found",
      });
    }

    // 4. Create lookup maps
    const nodeMap = {};
    const childrenMap = {};

    nodes.forEach((node) => {
      nodeMap[node.key] = node;

      if (node.parentKey) {
        if (!childrenMap[node.parentKey]) {
          childrenMap[node.parentKey] = [];
        }
        childrenMap[node.parentKey].push(node);
      }
    });

    // 5. Recursive builder
    const buildTree = (
      node,
      parentColor = null,
      parentHex = null,
      bodyPartName,
    ) => {
      // ✅ inherit color
      const color = node.colorGroup || parentColor;
      const hex = node.hexCode?.inner ? node.hexCode : parentHex;
      // ✅ get parent label properly
      const parentNode = node.parentKey ? nodeMap[node.parentKey] : null;

      const parentLabel = parentNode ? parentNode.label : "";

      // ✅ build question
      let question = meta.primaryQuestion;

      if (node.type === "secondary") {
        question = meta.secondaryQuestionTemplate.replace(
          "{parent}",
          parentLabel.toLowerCase(),
        );
      }

      if (node.type === "tertiary") {
        question = meta.tertiaryQuestionTemplate.replace(
          "{parent}",
          parentLabel.toLowerCase(),
        );
      }

      // ✅ get children
      const children = childrenMap[node.key] || [];

      return {
        questionId: node._id,
        key: node.key,
        label: node.label,
        type: node.type,
        bodyPartName,
        colorGroup: color,
        hexCode: node.hexCode || {},
        question,
        options: children.map((child) => buildTree(child, color)),
      };
    };

    // 6. Build response
    const result = partIds
      .map((id) => {
        const node = nodeMap[id];
        if (!node) return null;
        return buildTree(node, null, null, bodyPartName); // ✅ pass here
      })
      .filter(Boolean);

    // 7. Response
    return res.status(200).json({
      status: "success",
      count: result.length,
      body: result,
    });
  } catch (error) {
    console.error("Error in getQuestionsByParts:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// const getQuestionsByParts = async (req, res) => {
//   try {
//     const { partId, bodyPartName } = req.body;

//     // 1. Validate input (single key only)
//     if (!partId) {
//       return res.status(400).json({
//         status: "error",
//         message: "partId is required",
//       });
//     }

//     // 2. Get meta questions
//     const meta = await FeelingFormMeta.getSingleton();

//     // 3. Fetch active nodes
//     const nodes = await FeelingNode.find({ isActive: true })
//       .sort({ order: 1 })
//       .lean();

//     if (!nodes.length) {
//       return res.status(404).json({
//         status: "error",
//         message: "No nodes found",
//       });
//     }

//     // 4. Create maps
//     const nodeMap = {};
//     const childrenMap = {};

//     nodes.forEach((node) => {
//       nodeMap[node.key] = node;

//       if (node.parentKey) {
//         if (!childrenMap[node.parentKey]) {
//           childrenMap[node.parentKey] = [];
//         }

//         childrenMap[node.parentKey].push(node);
//       }
//     });

//     // 5. Find selected node
//     const selectedNode = nodeMap[partId];

//     if (!selectedNode) {
//       return res.status(404).json({
//         status: "error",
//         message: `Node '${partId}' not found`,
//       });
//     }

//     // 6. Recursive tree builder
//     const buildTree = (
//       node,
//       parentColor = null,
//       parentHex = null,
//       bodyPartName,
//     ) => {
//       const color = node.colorGroup || parentColor;
//       const hex =
//         node.hexCode?.inner || node.hexCode?.middle || node.hexCode?.outer
//           ? node.hexCode
//           : parentHex;

//       const parentNode = node.parentKey ? nodeMap[node.parentKey] : null;
//       const parentLabel = parentNode ? parentNode.label : "";

//       let question = meta.primaryQuestion;

//       if (node.type === "secondary") {
//         question = meta.secondaryQuestionTemplate.replace(
//           "{parent}",
//           parentLabel.toLowerCase(),
//         );
//       }

//       if (node.type === "tertiary") {
//         question = meta.tertiaryQuestionTemplate.replace(
//           "{parent}",
//           parentLabel.toLowerCase(),
//         );
//       }

//       const children = childrenMap[node.key] || [];

//       return {
//         questionId: node._id,
//         key: node.key,
//         label: node.label,
//         type: node.type,
//         bodyPartName,
//         colorGroup: color,
//         hexCode: hex,
//         question,
//         options: children.map((child) =>
//           buildTree(child, color, hex, bodyPartName),
//         ),
//       };
//     };

//     // 7. Build single result
//     const result = buildTree(selectedNode, null, null, bodyPartName);

//     // 8. Response
//     return res.status(200).json({
//       status: "success",
//       body: result,
//     });
//   } catch (error) {
//     console.error("Error in getQuestionsByParts:", error);

//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// const getQuestionsByParts = async (req, res) => {
//   try {
//     const { partId = null, bodyPartName = "" } = req.body;

//     // ==========================================
//     // 1. GET META
//     // ==========================================
//     const meta = await FeelingFormMeta.getSingleton();

//     // ==========================================
//     // 2. FETCH ALL ACTIVE NODES
//     // ==========================================
//     const nodes = await FeelingNode.find({ isActive: true })
//       .sort({ order: 1, label: 1 })
//       .lean();

//     if (!nodes.length) {
//       return res.status(404).json({
//         status: "error",
//         message: "No nodes found",
//       });
//     }

//     // ==========================================
//     // 3. CREATE MAPS
//     // ==========================================
//     const nodeMap = {};
//     const childrenMap = {};

//     nodes.forEach((node) => {
//       nodeMap[node.key] = node;

//       if (!childrenMap[node.parentKey]) {
//         childrenMap[node.parentKey] = [];
//       }

//       childrenMap[node.parentKey].push(node);
//     });

//     // ==========================================
//     // 4. FIRST LOAD => RETURN PRIMARY FEELINGS
//     // ==========================================
//     if (!partId) {
//       const primaryNodes = childrenMap[null] || [];

//       return res.status(200).json({
//         status: "success",
//         step: "primary",
//         question: meta.primaryQuestion,
//         body: primaryNodes.map((node) => ({
//           questionId: node._id,
//           key: node.key,
//           label: node.label,
//           type: node.type,
//           colorGroup: node.colorGroup,
//           hexCode: node.hexCode,
//         })),
//       });
//     }

//     // ==========================================
//     // 5. SELECTED NODE CHECK
//     // ==========================================
//     const selectedNode = nodeMap[partId];

//     if (!selectedNode) {
//       return res.status(404).json({
//         status: "error",
//         message: `Node '${partId}' not found`,
//       });
//     }

//     // ==========================================
//     // 6. CHILDREN OF SELECTED NODE
//     // ==========================================
//     const childNodes = childrenMap[selectedNode.key] || [];

//     const parentNode = selectedNode.parentKey
//       ? nodeMap[selectedNode.parentKey]
//       : null;

//     let question = meta.primaryQuestion;

//     if (selectedNode.type === "primary") {
//       question = meta.secondaryQuestionTemplate.replace(
//         "{parent}",
//         selectedNode.label.toLowerCase(),
//       );
//     }

//     if (selectedNode.type === "secondary") {
//       question = meta.tertiaryQuestionTemplate.replace(
//         "{parent}",
//         selectedNode.label.toLowerCase(),
//       );
//     }

//     // ==========================================
//     // 7. IF NO CHILDREN => FINISH
//     // ==========================================
//     if (!childNodes.length) {
//       return res.status(200).json({
//         status: "success",
//         step: "finish",
//         question: null,
//         body: {
//           questionId: selectedNode._id,
//           key: selectedNode.key,
//           label: selectedNode.label,
//           type: selectedNode.type,
//           bodyPartName,
//           colorGroup: selectedNode.colorGroup || parentNode?.colorGroup || null,
//           hexCode: selectedNode.hexCode?.inner
//             ? selectedNode.hexCode
//             : parentNode?.hexCode || {},
//         },
//       });
//     }

//     // ==========================================
//     // 8. RETURN NEXT STEP OPTIONS
//     // ==========================================
//     return res.status(200).json({
//       status: "success",
//       step: selectedNode.type === "primary" ? "secondary" : "tertiary",
//       question,
//       body: childNodes.map((node) => ({
//         questionId: node._id,
//         key: node.key,
//         label: node.label,
//         type: node.type,
//         bodyPartName,
//         colorGroup: node.colorGroup || selectedNode.colorGroup,
//         hexCode: node.hexCode?.inner ? node.hexCode : selectedNode.hexCode,
//       })),
//     });
//   } catch (error) {
//     console.error("Error in getQuestionsByParts:", error);

//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// const savePatientFeelingAnswers = async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     const { partId, partName, answers = [] } = req.body;

//     // ===============================
//     // VALIDATION
//     // ===============================
//     if (!patientId) {
//       return res.status(400).json({
//         status: "error",
//         message: "patientId is required",
//       });
//     }

//     if (!partId || !partName) {
//       return res.status(400).json({
//         status: "error",
//         message: "partId and partName are required",
//       });
//     }

//     if (!Array.isArray(answers) || answers.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "answers are required",
//       });
//     }

//     // ===============================
//     // SAVE
//     // ===============================
//     const saved = await PatientFeelingAnswers.findOneAndUpdate(
//       { patientId },
//       {
//         patientId,
//         bodyPartName: partName,
//         selectedParts: [
//           {
//             partId,
//             partName,
//           },
//         ],
//         answers,
//       },
//       {
//         new: true,
//         upsert: true,
//       }
//     );

//     return res.status(200).json({
//       status: "success",
//       body: saved,
//       message: "Saved successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };
// Take a Body Assessment
const takeBodyAssessment = async (req, res) => {
  try {
    const { answers } = req.body; // answers should be an array of objects { questionId, answer }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        status: "error",
        body: null,
        message: "Answers are required",
      });
    }

    const assessments = await BodyAssessment.find({}).populate(
      "mcqOptions.color",
    ); // Populate color for mcqOptions
    const colorTally = {};
    let totalScore = 0;
    let correctAnswers = 0;

    for (const answer of answers) {
      const assessment = assessments.find(
        (a) => a._id.toString() === answer.questionId,
      );
      if (!assessment) continue;

      if (assessment.type === "mcq") {
        const selectedOption = assessment.mcqOptions.find(
          (option) => option.text === answer.answer,
        );
        if (selectedOption) {
          totalScore += assessment.score; // Since all options are correct, add score for any selection
          correctAnswers++;

          // Track the color frequency in the answers
          const colorId = selectedOption.color._id.toString();
          colorTally[colorId] = (colorTally[colorId] || 0) + 1;
        }
      } else if (assessment.type === "blanks") {
        if (assessment.answer === answer.answer) {
          totalScore += assessment.score;
          correctAnswers++;
        }
      }
    }

    // Find the most selected color (max category)
    const maxCategoryId = Object.entries(colorTally).reduce(
      (max, entry) => (entry[1] > max[1] ? entry : max),
      ["", 0],
    )[0];

    // Fetch the full details of the most selected category (color)
    let maxCategoryDetails = null;
    if (maxCategoryId) {
      maxCategoryDetails = await Color.findById(maxCategoryId);
    }

    res.json({
      status: "success",
      body: {
        totalScore,
        correctAnswers,
        maxCategory: maxCategoryId,
        maxCategoryDetails, // Return the full details of the most selected category (color)
      },
      message: "Body Assessment taken successfully",
    });
  } catch (error) {
    console.error("Error taking body assessment:", error);
    res.status(500).json({
      status: "error",
      body: null,
      message: "An error occurred while taking the body assessment",
    });
  }
};

module.exports = {
  createBodyAssessment,
  getAllBodyAssessments,
  getBodyAssessmentById,
  updateBodyAssessment,
  deleteBodyAssessment,
  getBodyAssessmentsByCategory,
  takeBodyAssessment,
  getQuestionsByPart,
  getQuestionsByParts,
};
